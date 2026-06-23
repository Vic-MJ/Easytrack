
import { db } from "../server/db";
import { notifications } from "@shared/schema";
import { sql, and, gte, lt } from "drizzle-orm";

async function fixNotificationTimezones() {
    console.log("Starting timezone fix for notifications created today...");

    // Define "today" in UTC terms roughly covering the affected period
    // We want to target the same window as the previous fix
    const startOfDay = new Date("2026-01-21T00:00:00Z");
    const endOfDay = new Date("2026-01-21T23:59:59Z");

    try {
        const result = await db.execute(sql`
      UPDATE notifications
      SET created_at = created_at + interval '6 hours'
      WHERE created_at >= ${startOfDay.toISOString()}
      AND created_at <= ${endOfDay.toISOString()}
    `);

        console.log("Fixed notifications. Affected rows:", result.rowCount);

        // Verify samples
        const samples = await db.select().from(notifications)
            .where(and(gte(notifications.createdAt, startOfDay), lt(notifications.createdAt, endOfDay)))
            .limit(5);

        console.log("Sample notifications after fix:");
        samples.forEach(n => {
            console.log(`ID: ${n.id}, CreatedAt: ${n.createdAt.toISOString()}, Title: ${n.title}`);
        });

    } catch (error) {
        console.error("Error fixing notification timezones:", error);
    }

    process.exit(0);
}

fixNotificationTimezones();
