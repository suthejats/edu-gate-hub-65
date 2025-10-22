// Firebase types for the application
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  email: string;
  logo?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  approved_at?: Date;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  subject: string;
  teacher_id: string;
  institution_id: string;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  approved_at?: Date;
  approved_by?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  role: 'admin' | 'teacher' | 'institution';
  institution_id?: string;
  full_name?: string;
  created_at: Date;
}
