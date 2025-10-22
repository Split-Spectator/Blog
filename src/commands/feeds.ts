import { XMLParser } from "fast-xml-parser";
import { readConfig } from "../config";
import { User, Feed } from "src/lib/db/schema";
import { createFeed, getFeeds } from "../lib/db/queries/feeds";
import { getUserById, getUserByName } from "../lib/db/queries/users";

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

  export async function handlerAddFeed(cmdName: string, ...args: string[]) {
    if (args.length !== 2) {
        throw new Error(`usage: ${cmdName} <feed_name> <url>`);
    }
    const config = readConfig();
    const user = await getUserByName(config.currentUserName!);
    if (!user) {
        throw new Error(`User ${config.currentUserName} not found`);
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