import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// For backward compatibility with Supabase usage
export const supabase = {
  auth: {
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      const result = await auth.signInWithEmailAndPassword(credentials.email, credentials.password);
      return {
        data: {
          user: result.user,
          session: {
            access_token: await result.user.getIdToken(),
            refresh_token: result.user.refreshToken,
          },
        },
        error: null,
      };
    },
    signUp: async (credentials: { email: string; password: string }) => {
      const result = await auth.createUserWithEmailAndPassword(credentials.email, credentials.password);
      return {
        data: {
          user: result.user,
          session: {
            access_token: await result.user.getIdToken(),
            refresh_token: result.user.refreshToken,
          },
        },
        error: null,
      };
    },
    signOut: async () => {
      await auth.signOut();
      return { error: null };
    },
    getUser: async () => {
      const user = auth.currentUser;
      return {
        data: { user },
        error: null,
      };
    },
  },
  from: (collection: string) => ({
    select: (fields?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          // This is a simplified implementation
          // In a real app, you'd use Firestore queries
          return {
            data: null,
            error: null,
          };
        },
        execute: async () => {
          return {
            data: [],
            error: null,
          };
        },
      }),
      execute: async () => {
        return {
          data: [],
          error: null,
        };
      },
    }),
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          return {
            data: data,
            error: null,
          };
        },
      }),
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: async () => {
            return {
              data: data,
              error: null,
            };
          },
        }),
      }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        execute: async () => {
          return {
            error: null,
          };
        },
      }),
    }),
  }),
};

export default app;
