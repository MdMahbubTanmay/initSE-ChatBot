import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebaseService';

interface UserUsageData {
  count: number;
  lastReset: Timestamp;
}

const DAILY_LIMIT = 10; 
const ROLLING_WINDOW_MS = 24 * 60 * 60 * 1000;


export async function checkAndUpdateUsageLimit(uid: string): Promise<boolean> {
  if (!uid) {
    throw new Error('A valid UID must be provided.');
  }

  const userRef = doc(db, 'user_limits', uid);
  const now = Date.now();

  try {
    const userDoc = await getDoc(userRef);

   
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        count: 1,
        lastReset: Timestamp.fromMillis(now),
      });
      return true;
    }

    const data = userDoc.data() as UserUsageData;
    const lastResetTime = data.lastReset.toMillis();
    const timeDifference = now - lastResetTime;

  
    if (timeDifference >= ROLLING_WINDOW_MS) {
      await updateDoc(userRef, {
        count: 1,
        lastReset: Timestamp.fromMillis(now),
      });
      return true;
    }

   
    if (data.count < DAILY_LIMIT) {
      await updateDoc(userRef, {
        count: data.count + 1,
      });
      return true;
    }


    return false;

  } catch (error) {
    console.error('Error checking usage limit:', error);
   
    return false;
  }
}