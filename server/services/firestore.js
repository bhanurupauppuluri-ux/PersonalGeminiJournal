import admin from 'firebase-admin';

let db = null;
let isInitialized = false;

// In-memory fallback database for local dev/mock mode when Firebase Admin credentials are not attached
const inMemoryStores = new Map(); // uid -> Map(journalId -> document)

export function initFirebaseAdmin() {
  if (isInitialized) return { db, isInitialized };

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      db = admin.firestore();
      isInitialized = true;
      console.log('[Firestore] Initialized with Service Account JSON');
    } else if (process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT
      });
      db = admin.firestore();
      isInitialized = true;
      console.log('[Firestore] Initialized with Default Credentials / Project ID');
    } else {
      console.warn('[Firestore] No Firebase Service Account or Project ID supplied. Operating in safe local in-memory isolation mode.');
    }
  } catch (err) {
    console.warn(`[Firestore] Admin initialization note: ${err.message}. Using safe isolation fallback.`);
  }

  return { db, isInitialized };
}

initFirebaseAdmin();

export function getFirestoreDb() {
  return db;
}

/**
 * Saves a journal entry under strict data isolation path: /users/{userId}/journals/{journalId}
 */
export async function saveJournalEntry(userId, entryData) {
  if (!userId) throw new Error('User ID is required for data isolation path /users/{userId}/journals');

  const timestamp = new Date().toISOString();
  const document = {
    id: entryData.id || `journal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    content: entryData.content,
    summary: entryData.summary || '',
    keyTakeaways: entryData.keyTakeaways || [],
    emotionalTone: entryData.emotionalTone || {},
    createdAt: timestamp,
    updatedAt: timestamp
  };

  if (db) {
    // Firestore Path: /users/{userId}/journals/{journalId}
    const journalRef = db.collection('users').doc(userId).collection('journals').doc(document.id);
    await journalRef.set({
      ...document,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } else {
    // In-memory isolated store per user ID
    if (!inMemoryStores.has(userId)) {
      inMemoryStores.set(userId, new Map());
    }
    inMemoryStores.get(userId).set(document.id, document);
  }

  return document;
}

/**
 * Fetches journal entries for a given user UID from path: /users/{userId}/journals
 */
export async function getUserJournalEntries(userId) {
  if (!userId) throw new Error('User ID is required for data isolation path /users/{userId}/journals');

  if (db) {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('journals')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt
    }));
  } else {
    const userStore = inMemoryStores.get(userId);
    if (!userStore) return [];
    return Array.from(userStore.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}
