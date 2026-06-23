import { db } from '../server/db';
import { repositions, users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const rejected = await db.select({
    id: repositions.id,
    folio: repositions.folio,
    status: repositions.status,
    createdBy: repositions.createdBy,
    creatorName: users.name,
    creatorArea: users.area,
  })
  .from(repositions)
  .leftJoin(users, eq(repositions.createdBy, users.id))
  .where(eq(repositions.status, 'rechazado'));

  console.log(JSON.stringify(rejected, null, 2));
  process.exit(0);
}

main().catch(console.error);
