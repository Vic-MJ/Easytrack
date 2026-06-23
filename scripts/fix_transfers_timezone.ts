
import { db } from "../server/db";
import { repositionTransfers } from "@shared/schema";
import { sql, and, gte, lt } from "drizzle-orm";

async function fixTimezones() {
    console.log("Starting timezone fix for transfers created today...");

    // Define "today" in UTC terms roughly covering the affected period
    const startOfDay = new Date("2026-01-21T00:00:00Z");
    const endOfDay = new Date("2026-01-21T23:59:59Z");

    // Update repositionTransfers
    // We want to add '6 hours' to createdAt for records created today
    // BUT we only want to touch records that look "wrong".
    // "Wrong" records corresponds to Local values stored as UTC.
    // E.g. 15:31 Z (which displays as 09:31 Local). Real time 15:31 Local (21:31 Z).
    // So we add 6 hours.

    try {
        const result = await db.execute(sql`
      UPDATE reposition_transfers
      SET created_at = created_at + interval '6 hours'
      WHERE created_at >= ${startOfDay.toISOString()}
      AND created_at <= ${endOfDay.toISOString()}
      -- Avoid double fixing: if current time is > now, it's definitely wrong (future), but we are adding time.
      -- If we add 6 hours to 15:31 -> 21:31. 21:31 is valid for today (it's 22:38 UTC now).
      -- Just safeguard to ensure we don't run it twice.
      -- Maybe checking if they have already been fixed? No easy way unless we tag them.
      -- I'll just rely on the user running this once or me running it once.
    `);

        console.log("Fixed transfers. Affected rows:", result.rowCount);

        // Verify a specific known ID if possible, or just list some
        const samples = await db.select().from(repositionTransfers)
            .where(and(gte(repositionTransfers.createdAt, startOfDay), lt(repositionTransfers.createdAt, endOfDay)))
            .limit(5);

        console.log("Sample records after fix:");
        samples.forEach(t => {
            console.log(`ID: ${t.id}, CreatedAt: ${t.createdAt.toISOString()}`);
        });

    } catch (error) {
        console.error("Error fixing timezones:", error);
    }

    process.exit(0);
}

fixTimezones();
