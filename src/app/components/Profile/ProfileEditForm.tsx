"use client"

import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckIcon, X, Loader2, User, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User as UserType, ProfileFormData, ProfileFormErrors, LoadingState } from '@/app/types/profile';
import { validateProfileForm, createProfileFormData, createUpdateRequest, handleApiError } from '@/app/utils/profile';
import { cn } from "@/lib/utils";

interface ProfileEditFormProps {
  user: any;
  onSave: (userData: any) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

interface FormFieldProps {
  id: string;
  name: keyof ProfileFormData;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
}

// Memoized FormField component to prevent unnecessary re-renders
const FormField = memo<FormFieldProps>(({
  id,
  name,
  label,
  type = "text",
  placeholder,
  value,
  error,
  disabled = false,
  required = false,
  onChange,
  onBlur,
  className
}) => {
  // Use a stable key to prevent input remounting
  const stableKey = `${name}-${id}`;
  
  return (
    <div className={cn("space-y-2", className)} key={stableKey}>
      <Label 
        htmlFor={id} 
        className={cn(
          "text-sm font-medium transition-colors duration-200",
          error ? "text-destructive" : "text-foreground",
          required && "after:content-['*'] after:ml-1 after:text-destructive"
        )}
      >
        {label}
      </Label>
      <Input 
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "transition-all duration-200",
          error ? "border-destructive ring-destructive focus:border-destructive focus:ring-destructive" : "",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p 
          id={`${id}-error`}
          className="text-destructive text-sm mt-1 animate-in slide-in-from-top-1 duration-200"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

// Memoized LoadingOverlay component
const LoadingOverlay = memo<{ isVisible: boolean; message?: string }>(({ 
  isVisible, 
  message = "Saving..." 
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="flex items-center gap-2 text-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

// Main ProfileEditForm component with comprehensive optimizations
const ProfileEditForm = memo<ProfileEditFormProps>(({
  user,
  onSave,
  onCancel,
  className
}) => {
  // Form state with stable initial values
  const initialFormData = useMemo(() => createProfileFormData(user), [user]);
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Refs for form management
  const formRef = useRef<HTMLFormElement>(null);
  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  // Reset form data when user changes
  useEffect(() => {
    const newFormData = createProfileFormData(user);
    setFormData(newFormData);
    setErrors({});
  }, [user]);

  // Success state management
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Memoized validation function
  const validationResult = useMemo(() => {
    return validateProfileForm(formData);
  }, [formData]);

  // Optimized input change handler with useCallback
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof ProfileFormData;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear field-specific error
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  // Optimized blur handler for real-time validation
  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const fieldName = name as keyof ProfileFormData;
    
    // Validate single field on blur
    const fieldValidation = validateProfileForm(formData);
    if (fieldValidation.errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldValidation.errors[fieldName]
      }));
    }
  }, [formData]);

  // Optimized form submission handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    if (!hasChanges) {
      onCancel();
      return;
    }

    setLoadingState('submitting');
    setErrors({});
    setSaveSuccess(false);
    
    try {
      const updateRequest = createUpdateRequest(
        user.id,
        formData,
        user.profilePicture || user.image
      );
      
      await onSave(updateRequest);
      
      setLoadingState('success');
      setSaveSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onCancel();
      }, 1500);
      
    } catch (error) {
      console.error('Profile update error:', error);
      setLoadingState('error');
      setErrors({
        general: handleApiError(error)
      });
    }
  }, [validationResult, hasChanges, formData, user, onSave, onCancel]);

  // Optimized cancel handler
  const handleCancel = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setLoadingState('idle');
    setSaveSuccess(false);
    onCancel();
  }, [initialFormData, onCancel]);

  // Memoized form fields configuration
  const formFields = useMemo(() => [
    {
      id: "name",
      name: "name" as const,
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
      value: formData.name,
      error: errors.name
    },
    {
      id: "email",
      name: "email" as const,
      label: "Email Address",
      type: "email",
      placeholder: "Enter your email address",
      required: true,
      value: formData.email,
      error: errors.email
    },
    {
      id: "phone",
      name: "phone" as const,
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter your phone number",
      value: formData.phone,
      error: errors.phone
    },
    {
      id: "location",
      name: "location" as const,
      label: "Location",
      placeholder: "Enter your location",
      value: formData.location,
      error: errors.location
    }
  ], [formData, errors]);

  const isLoading = loadingState === 'submitting';
  const isDisabled = isLoading || loadingState === 'success';

  return (
    <Card className={cn(
      "relative transition-all duration-300 bg-card border hover:shadow-md",
      className
    )}>
      <LoadingOverlay isVisible={isLoading} message="Updating profile..." />
      
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Edit Profile</CardTitle>
        </div>
        
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleCancel} 
                  variant="outline" 
                  size="icon"
                  disabled={isDisabled}
                  className="hover:bg-destructive/10"
                  aria-label="Cancel editing"
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cancel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleSubmit} 
                  variant="outline" 
                  size="icon"
                  disabled={isDisabled || !validationResult.isValid || !hasChanges}
                  className={cn(
                    "hover:bg-green-100",
                    saveSuccess && "bg-green-100"
                  )}
                  aria-label="Save changes"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saveSuccess ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save Changes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* General Error Message */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}
          
          {/* User Avatar Section */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 flex justify-center md:justify-start">
              <Avatar className="h-24 w-24 border-2 border-primary/20 transition-all duration-300">
                <AvatarImage 
                  src={user.profilePicture || user.image || ""} 
                  alt={user.name} 
                  loading="lazy"
                />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              {formFields.map((field) => (
                <FormField
                  key={field.id}
                  id={field.id}
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={field.value}
                  error={field.error}
                  required={field.required}
                  disabled={isDisabled}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                />
              ))}
            </div>
          </div>
          
          {/* Mobile Action Buttons */}
          <div className="flex justify-end mt-6 space-x-2 md:hidden">
            <Button 
              type="button" 
              onClick={handleCancel} 
              variant="outline" 
              size="sm"
              disabled={isDisabled}
              className="w-full md:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isDisabled || !validationResult.isValid || !hasChanges} 
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

ProfileEditForm.displayName = 'ProfileEditForm';

export default ProfileEditForm; 