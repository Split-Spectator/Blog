import { eq } from "drizzle-orm";
import { db } from "..";
import { feeds } from "../schema";

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

