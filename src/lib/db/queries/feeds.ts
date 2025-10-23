import { and, eq, sql } from "drizzle-orm";
import { db } from "..";
import { feeds, feedFollows, users} from "../schema";

export async function createFeed(
    feedName: string,
    url: string,
    userID: string,
) {
    try {
        const result = await db
            .insert(feeds)
            .values({
                name: feedName,
                url,
                userID,
            })
            .returning();
        return result;
    } catch (error) {
        console.error('Database error details:', error);
        throw error;
    }

}

export async function getFeeds() {
    try {
        return await db
            .select()
            .from(feeds)
    } catch (error) {
       console.error('Database error details:', error);
        throw error;
    }
}

export async function createFeedFollow(userId: string, feedId: string) {
    try {
        const [newFeedFollow] = await db.insert(feedFollows)
            .values({
                userId: userId,
                feedId: feedId,
            })
            .returning();
        const result = await db
            .select({
                id: feedFollows.id,
                createdAt: feedFollows.createdAt,
                updatedAt: feedFollows.updatedAt,
                userId: feedFollows.userId,
                feedId: feedFollows.feedId,
                feedName: feeds.name,
                userName: users.name,
            })
            .from(feedFollows)
            .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
            .innerJoin(users, eq(feedFollows.userId, users.id))
            .where(eq(feedFollows.id, newFeedFollow.id));
        return result[0];
    } catch (error) {
        console.error('Database error details:', error);
        throw error;
    }
}

export async function getFeedFollowsForUser(userId: string) {
    const results = await db.select({
            id: feedFollows.id,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            userId: feedFollows.userId,
            feedId: feedFollows.feedId,
            feedName: feeds.name,
            userName: users.name,
        })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.userId, userId));
    return results;
  }

  export async function getFeedByUrl(url: string) {
    const matchingFeeds = await db.select().from(feeds).where(eq(feeds.url, url));
    if (matchingFeeds.length === 0) {
        return null;
    }
    return matchingFeeds[0];
}


export async function deleteFeedFollow(userId: string, url: string) {
    try {
        const [feed] = await db.select({feedId: feeds.id}).from(feeds).where(eq(feeds.url, url));
        if (!feed) {
            console.log(`feed with url ${url} doesn't exist in database`)
            return null;
        }
        const result = await db.delete(feedFollows).where(and(eq(feedFollows.feedId, feed.feedId),eq(feedFollows.userId, userId))).returning();
        return result[0];
    } catch (error) {
        console.error('Database error details:', error);
        throw error;
    }
}

export async function markFeedFetched(feedId: string) {
    const result = await db
        .update(feeds)
        .set({
            lastFetchAt: new Date(),
        })
        .where(eq(feeds.id, feedId))
        .returning();
    return result;
}

export async function getNextFeedToFetch() {
    const result = await db
        .select()
        .from(feeds)
        .orderBy(sql`${feeds.lastFetchAt} desc nulls first`)
        .limit(1);
    return  result;
}