// src/integrations/supabase/client.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ----------------------
// Types
// ----------------------
export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
};

export type AuthError = {
  code: string;
  message: string;
};

export type SupabaseAuthResponse = {
  data: { user: User | null; session: any | null };
  error: AuthError | null;
};

export type SupabaseQueryResponse<T> = {
  data: T[] | null;
  error: AuthError | null;
};

// ----------------------
// Firebase config
// ----------------------
const firebaseConfig = {
  apiKey: "AIzaSyCqv-52p8OEvHRkLq7GuKOzL1rY6SUOin0",
  authDomain: "edueval-41523.firebaseapp.com",
  projectId: "edueval-41523",
  storageBucket: "edueval-41523.appspot.com",
  messagingSenderId: "977362663295",
  appId: "1:977362663295:web:bf523dae0cd956188c8c4a",
  measurementId: "G-231CT0SBES",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ----------------------
// Supabase-like Wrapper
// ----------------------
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }): Promise<SupabaseAuthResponse> => {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = mapFirebaseUser(result.user);
        const session = await mapSession(result.user);
        return { data: { user, session }, error: null };
      } catch (err: unknown) {
        return { data: { user: null, session: null }, error: mapAuthError(err) };
      }
    },

    signUp: async ({ email, password }: { email: string; password: string }): Promise<SupabaseAuthResponse> => {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = mapFirebaseUser(result.user);
        const session = await mapSession(result.user);
        return { data: { user, session }, error: null };
      } catch (err: unknown) {
        return { data: { user: null, session: null }, error: mapAuthError(err) };
      }
    },

    signOut: async (): Promise<{ error: AuthError | null }> => {
      try {
        await auth.signOut();
        return { error: null };
      } catch (err: unknown) {
        return { error: mapAuthError(err) };
      }
    },

    getUser: async (): Promise<SupabaseAuthResponse> => {
      const currentUser = auth.currentUser;
      if (!currentUser) return { data: { user: null, session: null }, error: null };
      const user = mapFirebaseUser(currentUser);
      const session = await mapSession(currentUser);
      return { data: { user, session }, error: null };
    },
  },

  from: <T extends Record<string, any> = Record<string, any>>(collectionName: string) => ({
    select: async () => {
      const snapshot = await getDocs(query(collection(db, collectionName)));
      const data: T[] = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as T) }));

      return {
        data,
        error: null,
        eq: (column: keyof T, value: unknown) => ({
          single: async () => ({ data: data.find(item => item[column] === value) || null, error: null }),
          execute: async () => ({ data: data.filter(item => item[column] === value), error: null }),
        }),
        execute: async () => ({ data, error: null }),
      };
    },

    insert: async (data: T) => {
      try {
        const docRef = await addDoc(collection(db, collectionName), data);
        return { data: { id: docRef.id, ...data }, error: null };
      } catch (err: unknown) {
        return { data: null, error: mapAuthError(err, "insert_error", "Insert failed") };
      }
    },

    update: (data: Partial<T>) => ({
      eq: (column: keyof T, value: unknown) => ({
        select: async () => {
          const snapshot = await getDocs(query(collection(db, collectionName), where(column as string, "==", value)));
          if (snapshot.empty) return { data: null, error: { code: "not_found", message: "Document not found" } };
          await updateDoc(snapshot.docs[0].ref, data);
          return { data: { id: snapshot.docs[0].id, ...data }, error: null };
        },
      }),
    }),

    delete: () => ({
      eq: (column: keyof T, value: unknown) => ({
        execute: async () => {
          const snapshot = await getDocs(query(collection(db, collectionName), where(column as string, "==", value)));
          if (snapshot.empty) return { error: { code: "not_found", message: "Document not found" } };
          await deleteDoc(snapshot.docs[0].ref);
          return { error: null };
        },
      }),
    }),
  }),
};

// ----------------------
// Helpers
// ----------------------
const mapFirebaseUser = (user: FirebaseUser): User => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
});

const mapSession = async (user: FirebaseUser) => ({
  access_token: await user.getIdToken(),
  refresh_token: user.refreshToken,
  user: mapFirebaseUser(user),
});

const mapAuthError = (err: unknown, defaultCode = "unknown", defaultMessage = "Unknown error"): AuthError => {
  const error = err as any;
  return {
    code: error?.code || defaultCode,
    message: error?.message || defaultMessage,
  };
};

export default app;