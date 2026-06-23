
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    try {
        console.log("Creating 'reposition_folio_counters' table...");

        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reposition_folio_counters (
        month_year VARCHAR(5) PRIMARY KEY,
        current_value INTEGER NOT NULL DEFAULT 0
      );
    `);

        console.log("Table created.");

        // Initialize with current max counters
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const yearStr = year.toString();
        const monthStr = String(month).padStart(2, '0');
        const folioPrefix = `JN-REQ-${monthStr}-${yearStr.slice(-2)}-`;
        const monthYear = `${monthStr}-${yearStr.slice(-2)}`;

        console.log(`Initializing counter for ${monthYear} based on prefix ${folioPrefix}...`);

        // Get all repositions to find max for this month
        // Note: We're doing this manually because Drizzle might not have the table definition yet typesafe
        // and we want to use raw SQL for speed in this migration script.

        const result = await db.execute(sql`
        SELECT folio FROM repositions WHERE folio LIKE ${folioPrefix + '%'}
    `);

        let maxCounter = 0;
        for (const row of result.rows) {
            const folio = row.folio as string;
            const parts = folio.split('-');
            if (parts.length >= 5) {
                const counter = parseInt(parts[4], 10);
                if (!isNaN(counter) && counter > maxCounter) {
                    maxCounter = counter;
                }
            }
        }

        console.log(`Max counter found: ${maxCounter}`);

        await db.execute(sql`
        INSERT INTO reposition_folio_counters (month_year, current_value)
        VALUES (${monthYear}, ${maxCounter})
        ON CONFLICT (month_year) DO UPDATE SET current_value = GREATEST(reposition_folio_counters.current_value, ${maxCounter})
    `);

        console.log(`Counter initialized to ${maxCounter}.`);

        // Verify
        const verify = await db.execute(sql`SELECT * FROM reposition_folio_counters WHERE month_year = ${monthYear}`);
        console.log("Verification:", verify.rows);

        process.exit(0);
    } catch (error) {
        console.error("Error running migration:", error);
        process.exit(1);
    }
}

main();
