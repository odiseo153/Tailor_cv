"use client"

import React, { useState, useCallback, useEffect, memo } from "react";
import { useSession } from "next-auth/react";
import { Session } from "@/app/api/auth/[...nextauth]/route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useI18n } from "@/app/context/I18nContext";
import { Message } from "@/app/utils/Message";
import { User as UserType, LoadingState } from '@/app/types/profile';
import { updateProfile, handleApiError } from '@/app/utils/profile';
import ProfileView from './ProfileView';
import ProfileEditForm from './ProfileEditForm';
import { cn } from "@/lib/utils";

interface PersonalInfoProps {
  className?: string;
}

// Memoized LoadingCard component
const LoadingCard = memo<{ title: string }>(({ title }) => (
  <Card className="transition-all duration-300 bg-card border hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </CardContent>
  </Card>
));

LoadingCard.displayName = 'LoadingCard';

// Memoized ErrorCard component
const ErrorCard = memo<{ title: string; error: string; onRetry?: () => void }>(({
  title,
  error,
  onRetry
}) => (
  <Card className="transition-all duration-300 bg-card border hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm underline hover:no-underline"
            >
              Retry
            </button>
          )}
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
));

ErrorCard.displayName = 'ErrorCard';

// Main PersonalInfo component with comprehensive optimizations
const PersonalInfo = memo<PersonalInfoProps>(({ className }) => {
  const { t } = useI18n();
  const { data: session, update, status } = useSession() as {
    data: Session | null;
    update: (data: Partial<Session["user"]> | { user: Partial<Session["user"]> }) => Promise<Session | null>;
    status: "loading" | "authenticated" | "unauthenticated";
  };

  // Component state
  const [isEditing, setIsEditing] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [optimisticUser, setOptimisticUser] = useState<UserType | null>(null);

  const user = session?.user;
  const currentUser = optimisticUser || user;

  // Update optimistic user when session changes
  useEffect(() => {
    if (user && status === "authenticated") {
      setOptimisticUser(user as UserType);
      setError(null);
    }
  }, [user, status]);

  // Optimized edit handler
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setError(null);
  }, []);

  // Optimized cancel handler
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setError(null);
    setLoadingState('idle');
    // Reset optimistic updates
    if (user) {
      setOptimisticUser(user as UserType);
    }
  }, [user]);

  // Optimized save handler with proper error handling and optimistic updates
  const handleSave = useCallback(async (userData: any) => {
    if (!currentUser) return;

    setLoadingState('submitting');
    setError(null);

    // Optimistic update
    const optimisticData = {
      ...currentUser,
      ...userData,
    };
    setOptimisticUser(optimisticData);

    try {
      // Use the new /api/profile endpoint
      const updatedUser = await updateProfile(userData);

      // Update session with new data
      await update({
        user: {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          location: updatedUser.location,
          profilePicture: updatedUser.profilePicture
        }
      });

      // Update optimistic state with server response
      setOptimisticUser(updatedUser);
      setLoadingState('success');
      setIsEditing(false);

      // Show success message
      Message.successMessage(t('profile.personal_info.success'));

    } catch (error) {
      console.error('Profile update error:', error);
      setLoadingState('error');

      // Revert optimistic update
      setOptimisticUser(user as UserType);

      const errorMessage = handleApiError(error);
      setError(errorMessage);
      Message.errorMessage(errorMessage);
    }
  }, [currentUser, user, update, t]);

  // Retry handler for error recovery
  const handleRetry = useCallback(() => {
    setError(null);
    setLoadingState('idle');
    if (user) {
      setOptimisticUser(user as UserType);
    }
  }, [user]);

  // Loading state
  if (status === "loading" || !currentUser) {
    return (
      <LoadingCard
        title={t('profile.personal_info.title')}
      />
    );
  }

  // Error state with retry option
  if (error && !isEditing) {
    return (
      <ErrorCard
        title={t('profile.personal_info.title')}
        error={error}
        onRetry={handleRetry}
      />
    );
  }

  // Render appropriate component based on editing state
  return (
    <div className={cn("space-y-4", className)}>
      {isEditing ? (
        <ProfileEditForm
          user={currentUser}
          onSave={handleSave}
          onCancel={handleCancel}
          className="transition-all duration-300"
        />
      ) : (
        <ProfileView
          user={currentUser}
          onEdit={handleEdit}
          className="transition-all duration-300"
        />
      )}

      {/* Loading overlay during save operations */}
      {loadingState === 'submitting' && !isEditing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex items-center gap-2 bg-card p-4 rounded-lg border shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Updating profile...</span>
          </div>
        </div>
      )}
    </div>
  );
});

PersonalInfo.displayName = 'PersonalInfo';

export default PersonalInfo;