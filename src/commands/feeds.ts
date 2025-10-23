import { XMLParser } from "fast-xml-parser";
import { readConfig } from "../config";
import { User, Feed } from "src/lib/db/schema";
import { getUserById, getUserByName } from "../lib/db/queries/users";
import { 
    createFeed, 
    createFeedFollow, 
    getFeedByUrl, 
    getFeedFollowsForUser,  
    getFeeds,
    deleteFeedFollow
 } from "../lib/db/queries/feeds";


export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    const UA = "gator";
    const rssItems: RSSItem[] = [];

    const response = await fetch(feedURL, {
        headers: {
        "User-Agent": UA,
        accept: "application/rss+xml",
        }
      });
    if (!response.ok){
        throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
    }
    const xml = await response.text();
    const parser = new XMLParser();
    let result = parser.parse(xml);

    const channel = result.rss?.channel;
    if (!channel) {
        throw new Error("Failed to parse channel");
    }
    if (
        !channel ||
        !channel.title ||
        !channel.link ||
        !channel.description ||
        !channel.item
    ) {
        throw new Error("failed to parse channel");
    }
     
    const itemsRaw = Array.isArray(channel.item) ? channel.item : (channel.item ? [channel.item] : []);
 
    for (const it of itemsRaw) {
      const { title, link, description, pubDate } = it ?? {};
      if ([title, link, description, pubDate].every(v => typeof v === "string" && v.trim().length > 0)) {
        rssItems.push({ title, link, description, pubDate });
      }
    }
  
    const rss: RSSFeed = {
        channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: rssItems,
        },
    };
    return rss;
}

 export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
  };

  export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 2) {
        throw new Error(`usage: ${cmdName} <feed_name> <url>`);
    }
 
    const feedName = args[0];
    const url = args[1];
    const rows = await createFeed(feedName, url, user.id);
    const feed = rows[0];
    if (!feed) {
        throw new Error(`Failed to create feed`);
    }
    
    console.log("Feed created successfully:");
    printFeed(feed, user);

    const feedFollow = await createFeedFollow(user.id, feed.id);
    console.log(`User ${feedFollow.userName} is now following feed ${feedFollow.feedName}`);
}

export async function handlerFeeds(_: string) {
    const feeds = await getFeeds();
    if (feeds.length === 0) {
        console.log(`No feeds found.`);
        return;
    }
    console.log(`Found %d feeds:\n`, feeds.length);
    for (let feed of feeds) {
        const row = await getUserById(feed.userID);
        if (!row) {
            throw new Error(`Failed to find user for feed ${feed.id}`);
        }
        const user = row[0]
        printFeed(feed, user);
        console.log(`===================================`);
    }
}


function printFeed(feed: Feed, user: User) {
    console.log(`* ID:            ${feed.id}`);
    console.log(`* Created:       ${feed.createdAt}`);
    console.log(`* Updated:       ${feed.updatedAt}`);
    console.log(`* name:          ${feed.name}`);
    console.log(`* URL:           ${feed.url}`);
    console.log(`* User:          ${user.name}`);
}


export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <follow_<url>`);
    }
 
    const url = args[0];
    const feed = await getFeedByUrl(url);
    if (!feed) {
        throw new Error(`feed not found for URL: ${url}`);
    }
    const feedFollow = await createFeedFollow(user.id, feed.id);
    console.log(`User ${feedFollow.userName} is now following feed ${feedFollow.feedName}`);
}


export async function handlerListFollowing(cmdName: string, user: User, ..._args: string[]) {
  
    const feedFollows = await getFeedFollowsForUser(user.id);
    if (feedFollows.length === 0) {
        console.log("You are not following any feeds yet.");
        return;
    }
    for (const feedFollow of feedFollows) {
        console.log(feedFollow.feedName);
    }
}

export async function handlerUnfollow(cmdName: string, user: User,...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <follow_<url>`);
    }
    const url = args[0];
    await deleteFeedFollow(user.id, url);
}
 