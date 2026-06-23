import { db } from '../server/db';
import { repositions } from '../shared/schema';
import { eq, desc, and } from 'drizzle-orm';

async function main() {
  const [latest] = await db.select()
    .from(repositions)
    .where(eq(repositions.createdBy, 11))
    .orderBy(desc(repositions.id))
    .limit(1);

  if (latest) {
    await db.update(repositions)
      .set({ status: 'rechazado' })
      .where(eq(repositions.id, latest.id));
    console.log(`Updated reposition ${latest.id} (${latest.folio}) to 'rechazado'`);
  } else {
    console.log("No repositions found for Yolanda.");
  }
  process.exit(0);
}

main().catch(console.error);
