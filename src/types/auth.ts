export type UserRole = 'ceo' | 'manager' | 'supervisor' | 'worker' | 'accountant';
export type EmploymentType = 'permanent' | 'temporary';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  employment_type: EmploymentType;
  supervisor_id: string | null;
  avatar_url: string | null;
  location: string | null;
  hourly_rate: number;
  account_status: ApprovalStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface AuthState {
  user: UserProfile | null;
  roles: UserRole[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isApproved: boolean;
  isEmailVerified: boolean;
}
