export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Supabase-like types for backward compatibility
export interface SupabaseAuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

export interface SupabaseQueryResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}

export interface SupabaseInsertResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}

export interface SupabaseUpdateResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}

export interface SupabaseDeleteResponse {
  error: AuthError | null;
}
