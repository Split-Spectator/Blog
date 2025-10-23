import { getNextFeedToFetch, markFeedFetched } from "src/lib/db/queries/feeds";
import {fetchFeed } from "./feeds";
import { Feed, NewPost } from "src/lib/db/schema";
import { createPost } from "src/lib/db/queries/posts";
 
async function scrapeFeeds() {
    const row = await getNextFeedToFetch();
    const feed = row[0]
    if (!feed) {
        console.log(`No feeds to fetch.`);
        return;
    }
    console.log(`Found a feed to fetch!`);
    scrapeFeed(feed);
   }

async function scrapeFeed(feed: Feed) {
    await markFeedFetched(feed.id);
    const feedData = await fetchFeed(feed.url);
    for (let item of feedData.channel.item) {
        console.log(`Found post: %s`, item.title);
        const now = new Date();
        await createPost({
            url: item.link,
            feedId: feed.id,
            title: item.title,
            createdAt: now,
            updatedAt: now,
            description: item.description,
            publishedAt: new Date(item.pubDate),
        } satisfies NewPost);
    }
}

export async function handlerAgg(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <time_between_reqs>`);
    }
    const timeArg = args[0];
    const timeBetweenRequests = parseDuration(timeArg);
    if (!timeBetweenRequests) {
        throw new Error(
            `invalid duration: ${timeArg} — use format 1h 30m 15s or 3500ms`,
        );
    }
    console.log(`Collecting feeds every ${timeArg}...`);
    scrapeFeeds().catch(handleError);
    const interval = setInterval(() => {
        scrapeFeeds().catch(handleError);
    }, timeBetweenRequests);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("losing down feed aggregator...");
            clearInterval(interval);
            resolve();
        });

    });
}

function handleError(err: unknown) {
    console.error(
        `Error scraping feeds: ${err instanceof Error ? err.message : err}`,
    );
}

function parseDuration(durationStr: string) {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    if (!match) return;
    if (match.length !== 3) return;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case "ms":
            return value;
        case "s":
            return value * 1000;
        case "m":
            return value * 60 * 1000;
        case "h":
            return value * 60 * 60 * 1000;
        default:
            return;
    }
}
    