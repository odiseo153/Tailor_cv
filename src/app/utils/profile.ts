import { 
  ProfileFormData, 
  ProfileFormErrors, 
  ProfileUpdateRequest, 
  ValidationResult,
  ProfileApiResponse,
  User
} from '@/app/types/profile';

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateProfileForm = (data: ProfileFormData): ValidationResult => {
  const errors: ProfileFormErrors = {};

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone validation (optional)
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// API utilities
export const fetchProfile = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`/api/profile?id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: ProfileApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch profile');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (profileData: ProfileUpdateRequest): Promise<User> => {
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data: ProfileApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to update profile');
    }

    return data.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Form utilities
export const createProfileFormData = (user: User): ProfileFormData => ({
  name: user.name || '',
  email: user.email || '',
  phone: user.phone || '',
  location: user.location || '',
});

export const createUpdateRequest = (
  userId: string, 
  formData: ProfileFormData, 
  profilePicture?: string
): ProfileUpdateRequest => ({
  id: userId,
  name: formData.name.trim(),
  email: formData.email.trim(),
  phone: formData.phone.trim() || undefined,
  location: formData.location.trim() || undefined,
  profilePicture,
});

// Debounce utility for API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Error handling utility
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}; 