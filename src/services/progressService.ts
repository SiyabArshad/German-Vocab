import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { WordReviewData } from '../data/types';

// Storage keys isolated per user (or guest)
export function getUserMasteredStorageKey(userId: string | null): string {
  return userId ? `german_mastered_${userId}` : 'german_mastered_guest';
}

export function getUserReviewsStorageKey(userId: string | null): string {
  return userId ? `german_reviews_${userId}` : 'german_reviews_guest';
}

/**
 * Get locally stored mastered word IDs for a specific user (or guest)
 */
export function getLocalMasteredIds(userId: string | null = null): Set<string> {
  try {
    const key = getUserMasteredStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }

    // One-time fallback for existing data under legacy keys
    if (userId) {
      const legacyV2 = localStorage.getItem('german_mastered_word_ids_v2');
      if (legacyV2) {
        const arr = JSON.parse(legacyV2);
        if (Array.isArray(arr) && arr.length > 0) {
          const s = new Set<string>(arr);
          saveLocalMasteredIds(s, userId);
          return s;
        }
      }
    } else {
      const legacyGuest = localStorage.getItem('german_mastered_word_ids_v2') || localStorage.getItem('german_mastered_ids');
      if (legacyGuest) {
        const arr = JSON.parse(legacyGuest);
        if (Array.isArray(arr) && arr.length > 0) {
          return new Set<string>(arr);
        }
      }
    }
  } catch (err) {
    console.error('Error loading local mastered IDs:', err);
  }
  return new Set();
}

/**
 * Save mastered word IDs locally for a specific user (or guest)
 */
export function saveLocalMasteredIds(ids: Set<string>, userId: string | null = null): void {
  try {
    const key = getUserMasteredStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(Array.from(ids)));
  } catch (err) {
    console.error('Error saving local mastered IDs:', err);
  }
}

/**
 * Get locally stored review history for a specific user (or guest)
 */
export function getLocalReviews(userId: string | null = null): Record<string, WordReviewData> {
  try {
    const key = getUserReviewsStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);

    // Legacy fallback
    const legacy = localStorage.getItem('german_word_reviews_v2');
    if (legacy) return JSON.parse(legacy);
  } catch (err) {
    console.error('Error loading local reviews:', err);
  }
  return {};
}

/**
 * Save review history locally for a specific user (or guest)
 */
export function saveLocalReviews(reviews: Record<string, WordReviewData>, userId: string | null = null): void {
  try {
    const key = getUserReviewsStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(reviews));
  } catch (err) {
    console.error('Error saving local reviews:', err);
  }
}

/**
 * Subscribe to cloud progress updates from Firestore for a specific user.
 * Each user's data is stored under /users/{userId} document.
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
        const cloudSet = new Set<string>(
          Array.isArray(rawMastered) ? rawMastered : Object.keys(data.mastered || {})
        );
        const cloudReviews = (data.reviews as Record<string, WordReviewData>) || {};

        // Merge any offline additions from this device for this user
        const localSet = getLocalMasteredIds(userId);
        let changed = false;
        localSet.forEach(id => {
          if (!cloudSet.has(id)) {
            cloudSet.add(id);
            changed = true;
          }
        });

        // Save isolated to this user's storage
        saveLocalMasteredIds(cloudSet, userId);
        const mergedReviews = { ...getLocalReviews(userId), ...cloudReviews };
        saveLocalReviews(mergedReviews, userId);

        if (changed) {
          setDoc(
            userRef,
            {
              masteredIds: Array.from(cloudSet),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          ).catch(e => {
            console.warn('Firestore write failed (check Security Rules):', e);
          });
        }

        onUpdate(cloudSet, mergedReviews);
      } else {
        // Document doesn't exist yet for this user in Firestore
        // Initial setup for this user: use any existing offline progress for this user
        const localSet = getLocalMasteredIds(userId);
        const localReviews = getLocalReviews(userId);

        setDoc(
          userRef,
          {
            masteredIds: Array.from(localSet),
            reviews: localReviews,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch(e => {
          console.warn('Firestore initial document creation failed (check Security Rules):', e);
        });

        saveLocalMasteredIds(localSet, userId);
        onUpdate(localSet, localReviews);
      }
    },
    (error) => {
      console.warn('Firestore subscription error (check Firestore Security Rules):', error);
      // Fallback to this user's local cache
      onUpdate(getLocalMasteredIds(userId), getLocalReviews(userId));
    }
  );
}

/**
 * Toggle or set a word as remembered in Cloud & Local for a specific user
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

  // Save to this user's local storage immediately
  saveLocalMasteredIds(nextSet, userId);

  // If user is logged in, sync to Firestore collection 'users'
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
      console.warn('Failed to sync word status to Firestore (check Security Rules):', err);
    }
  }

  return nextSet;
}

/**
 * Record a test / quiz result for retention tracking for a specific user
 */
export async function recordQuizResult(
  userId: string | null,
  wordId: string,
  passed: boolean
): Promise<void> {
  const localReviews = getLocalReviews(userId);
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
  saveLocalReviews(localReviews, userId);

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
      console.warn('Failed to sync quiz result to Firestore (check Security Rules):', err);
    }
  }
}

/**
 * Reset all progress for a specific user
 */
export async function resetAllUserProgress(userId: string | null): Promise<void> {
  saveLocalMasteredIds(new Set(), userId);
  saveLocalReviews({}, userId);

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
      console.warn('Failed to reset Firestore user progress (check Security Rules):', err);
    }
  }
}
