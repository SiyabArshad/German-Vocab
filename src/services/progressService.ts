import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { WordReviewData } from '../data/types';

const LOCAL_STORAGE_KEY = 'german_mastered_word_ids_v2';
const LOCAL_STORAGE_REVIEWS_KEY = 'german_word_reviews_v2';

/**
 * Get locally stored mastered word IDs
 */
export function getLocalMasteredIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (err) {
    console.error('Error loading local mastered IDs:', err);
  }
  return new Set();
}

/**
 * Save mastered word IDs locally
 */
export function saveLocalMasteredIds(ids: Set<string>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch (err) {
    console.error('Error saving local mastered IDs:', err);
  }
}

/**
 * Get locally stored review history
 */
export function getLocalReviews(): Record<string, WordReviewData> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading local reviews:', err);
  }
  return {};
}

/**
 * Save review history locally
 */
export function saveLocalReviews(reviews: Record<string, WordReviewData>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.error('Error saving local reviews:', err);
  }
}

/**
 * Subscribe to cloud progress updates from Firestore
 */
export function subscribeToCloudProgress(
  userId: string,
  onUpdate: (masteredIds: Set<string>, reviews: Record<string, WordReviewData>) => void
): () => void {
  const userRef = doc(db, 'users', userId);

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const rawMastered = data.masteredIds || [];
        const cloudSet = new Set<string>(Array.isArray(rawMastered) ? rawMastered : Object.keys(data.mastered || {}));
        const cloudReviews = data.reviews || {};

        // Merge with local storage
        const localSet = getLocalMasteredIds();
        let changed = false;
        localSet.forEach(id => {
          if (!cloudSet.has(id)) {
            cloudSet.add(id);
            changed = true;
          }
        });

        // Save merged set back to local storage
        saveLocalMasteredIds(cloudSet);
        saveLocalReviews({ ...getLocalReviews(), ...cloudReviews });

        // If local had unsynced items, sync up to Firestore
        if (changed) {
          setDoc(
            userRef,
            {
              masteredIds: Array.from(cloudSet),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          ).catch(e => console.warn('Sync merge failed:', e));
        }

        onUpdate(cloudSet, cloudReviews);
      } else {
        // Document doesn't exist yet, push local progress to Firestore
        const localSet = getLocalMasteredIds();
        const localReviews = getLocalReviews();
        setDoc(
          userRef,
          {
            masteredIds: Array.from(localSet),
            reviews: localReviews,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch(e => console.warn('Initial cloud creation failed:', e));

        onUpdate(localSet, localReviews);
      }
    },
    (error) => {
      console.warn('Firestore subscription warning (offline or permissions):', error);
      // Fallback to local
      onUpdate(getLocalMasteredIds(), getLocalReviews());
    }
  );
}

/**
 * Toggle or set a word as remembered in Cloud & Local
 */
export async function syncWordRemembered(
  userId: string | null,
  wordId: string,
  isRemembered: boolean,
  currentMastered: Set<string>
): Promise<Set<string>> {
  const nextSet = new Set(currentMastered);
  if (isRemembered) {
    nextSet.add(wordId);
  } else {
    nextSet.delete(wordId);
  }

  // Save to local storage immediately
  saveLocalMasteredIds(nextSet);

  // If user is logged in, sync to Firestore
  if (userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        {
          masteredIds: Array.from(nextSet),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Failed to sync word status to Firestore:', err);
    }
  }

  return nextSet;
}

/**
 * Record a test / quiz result for retention tracking
 */
export async function recordQuizResult(
  userId: string | null,
  wordId: string,
  passed: boolean
): Promise<void> {
  const localReviews = getLocalReviews();
  const current = localReviews[wordId] || {
    remembered: true,
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
  };

  current.reviewCount = (current.reviewCount || 0) + 1;
  current.lastReviewedAt = Date.now();
  if (passed) {
    current.correctCount = (current.correctCount || 0) + 1;
    current.retentionStreak = (current.retentionStreak || 0) + 1;
  } else {
    current.incorrectCount = (current.incorrectCount || 0) + 1;
    current.retentionStreak = 0;
  }

  localReviews[wordId] = current;
  saveLocalReviews(localReviews);

  if (userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        {
          [`reviews.${wordId}`]: current,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Failed to sync quiz result to Firestore:', err);
    }
  }
}

/**
 * Reset all progress for a user
 */
export async function resetAllUserProgress(userId: string | null): Promise<void> {
  saveLocalMasteredIds(new Set());
  saveLocalReviews({});

  if (userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        {
          masteredIds: [],
          reviews: {},
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Failed to reset Firestore user progress:', err);
    }
  }
}
