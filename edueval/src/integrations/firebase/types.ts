// Firebase types for the application
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

export interface Institution {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  institutionId: string;
  subject?: string;
  qualification?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsData {
  totalInstitutions: number;
  totalTeachers: number;
  pendingApprovals: number;
  approvedInstitutions: number;
  approvedTeachers: number;
  monthlyGrowth: {
    institutions: number;
    teachers: number;
  };
}
