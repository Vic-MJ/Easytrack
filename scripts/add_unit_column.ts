
import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { repositionPieces } from '../shared/schema';

async function migrate() {
    console.log('Adding unit column to reposition_pieces table...');
    try {
        await db.execute(sql`
      ALTER TABLE reposition_pieces 
      ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'piezas';
    `);
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
    process.exit(0);
}

migrate();
