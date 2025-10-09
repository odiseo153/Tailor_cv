// User Profile Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profilePicture?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Profile Update Request
export interface ProfileUpdateRequest {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  profilePicture?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ProfileApiResponse extends ApiResponse<User> {}

// Form State Types
export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface ProfileFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  general?: string;
}

// Component Props Types
export interface ProfileViewProps {
  user: User;
  className?: string;
}

export interface ProfileEditFormProps {
  user: User;
  onSave: (userData: ProfileUpdateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

// Hook Types
export interface UseProfileReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: ProfileUpdateRequest) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

// Form Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ProfileFormErrors;
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'submitting' | 'success' | 'error';

// Error Types
export interface ProfileError extends Error {
  code?: string;
  statusCode?: number;
} 