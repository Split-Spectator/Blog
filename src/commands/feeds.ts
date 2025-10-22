import { XMLParser } from "fast-xml-parser";

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