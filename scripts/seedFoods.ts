/**
 * One-off admin script: upload all FoodItems to Firestore foods/{item.id}
 *
 * Usage (run from project root):
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json npx ts-node scripts/seedFoods.ts
 *
 * Requires:
 *   npm install --save-dev firebase-admin ts-node @types/node
 *
 * The script is idempotent — re-running overwrites existing documents.
 */

import * as admin from 'firebase-admin';
import { FOODS } from '../src/data/foods';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'eatmypack',
});

const db = admin.firestore();

async function seedFoods(): Promise<void> {
  console.log(`Seeding ${FOODS.length} foods to Firestore...`);

  const batch = db.batch();

  for (const food of FOODS) {
    const ref = db.collection('foods').doc(food.id);
    batch.set(ref, food);
  }

  await batch.commit();
  console.log(`Done. ${FOODS.length} documents written to foods/ collection.`);
}

seedFoods().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
