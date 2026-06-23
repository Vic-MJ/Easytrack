
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    try {
        console.log("Adding 'ubicacion' column to 'reposition_contrast_fabrics'...");

        await db.execute(sql`
      ALTER TABLE reposition_contrast_fabrics 
      ADD COLUMN IF NOT EXISTS ubicacion TEXT NOT NULL DEFAULT '';
    `);

        console.log("Column added successfully or already exists.");

        // Verify
        const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reposition_contrast_fabrics' 
      AND column_name = 'ubicacion';
    `);

        if (result.rows.length > 0) {
            console.log("VERIFICATION SUCCESS: Column 'ubicacion' exists.");
        } else {
            console.error("VERIFICATION FAILED: Column 'ubicacion' NOT found.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error fixing schema:", error);
        process.exit(1);
    }
}

main();
