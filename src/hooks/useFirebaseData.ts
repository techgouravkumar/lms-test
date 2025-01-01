import { useEffect, useState } from "react";
import { ref, onValue, off, set, push, DataSnapshot } from "firebase/database";
import { db } from "@/lib/firebase";

interface Comment {
  id: string;
  user: string;
  content: string;
  timestamp: string; 
}

interface UseFirebaseDataReturn {
  data: Comment[] | null;
  loading: boolean;
  error: Error | null;
  updateData: (newData: any) => Promise<boolean>;
  pushData: (newData: Comment) => Promise<string | null>;
}

export function useFirebaseData(path: string): UseFirebaseDataReturn {
  const [data, setData] = useState<Comment[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const dbRef = ref(db, path);

    const handleData = (snapshot: DataSnapshot) => {
      const commentsData = snapshot.val();
      if (commentsData) {
        const comments = Object.keys(commentsData).map((key) => ({
          id: key,
          ...commentsData[key],
        }));

        // Sort comments by timestamp (latest first)
        const sortedComments = comments.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeB - timeA; // descending order
        });

        setData(sortedComments);
      } else {
        setData([]);
      }
      setLoading(false);
    };

    const handleError = (err: Error) => {
      setError(err);
      setLoading(false);
    };

    // Subscribe to changes
    onValue(dbRef, handleData, handleError);

    // Cleanup subscription
    return () => off(dbRef);
  }, [path]);

  const updateData = async (newData: any): Promise<boolean> => {
    try {
      await set(ref(db, path), newData);
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };

  const pushData = async (newData: Comment): Promise<string | null> => {
    try {
      const newRef = push(ref(db, path));
      await set(newRef, newData);
      return newRef.key;
    } catch (err: any) {
      setError(err);
      return null;
    }
  };

  return { data, loading, error, updateData, pushData };
}
