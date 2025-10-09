"use client"

import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PencilIcon, Mail, Phone, MapPin, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User as UserType } from '@/app/types/profile';
import { cn } from "@/lib/utils";

interface ProfileViewProps {
  user: any;
  onEdit?: () => void;
  className?: string;
  showEditButton?: boolean;
}

interface ProfileFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
  placeholder?: string;
  className?: string;
}

// Memoized ProfileField component to prevent unnecessary re-renders
const ProfileField = memo<ProfileFieldProps>(({ 
  icon, 
  label, 
  value, 
  placeholder = "Not specified",
  className 
}) => (
  <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/30", className)}>
    <div className="flex-shrink-0 text-muted-foreground">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={cn(
        "text-base truncate",
        value ? "text-foreground" : "text-muted-foreground italic"
      )}>
        {value || placeholder}
      </p>
    </div>
  </div>
));

ProfileField.displayName = 'ProfileField';

// Memoized UserAvatar component
const UserAvatar = memo<{ user: UserType; size?: 'sm' | 'md' | 'lg' }>(({ 
  user, 
  size = 'lg' 
}) => {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16', 
    lg: 'h-24 w-24'
  };
  
  const fallbackSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <Avatar className={cn(
      sizeClasses[size],
      "border-2 border-primary/20 transition-all duration-300 hover:border-primary/40"
    )}>
      <AvatarImage 
        src={user.profilePicture || user.image || ""} 
        alt={user.name} 
        loading="lazy"
      />
      <AvatarFallback className={cn(
        fallbackSizeClasses[size],
        "bg-primary/10 text-primary font-semibold"
      )}>
        {user.name?.charAt(0)?.toUpperCase() || "U"}
      </AvatarFallback>
    </Avatar>
  );
});

UserAvatar.displayName = 'UserAvatar';

// Main ProfileView component with React.memo for performance
const ProfileView = memo<ProfileViewProps>(({ 
  user, 
  onEdit, 
  className,
  showEditButton = true
}) => {
  // Early return if no user data
  if (!user) {
    return (
      <Card className={cn("transition-all duration-300 bg-card border hover:shadow-md", className)}>
        <CardContent className="flex justify-center py-8">
          <p className="text-muted-foreground">No profile data available</p>
        </CardContent>
      </Card>
    );
  }

  const profileFields = [
    {
      icon: <Mail className="h-4 w-4" />,
      label: "Email",
      value: user.email
    },
    {
      icon: <Phone className="h-4 w-4" />,
      label: "Phone",
      value: user.phone,
      placeholder: "No phone number"
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      label: "Location", 
      value: user.location,
      placeholder: "No location specified"
    }
  ];

  return (
    <Card className={cn(
      "transition-all duration-300 bg-card border hover:shadow-md",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Profile Information</CardTitle>
        </div>
        
        {showEditButton && onEdit && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onEdit} 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-primary/10"
                  aria-label="Edit profile"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* User Header */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <UserAvatar user={user} size="lg" />
          </div>
          
          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">
                {user.name}
              </h2>
              {user.email && (
                <Badge variant="secondary" className="text-xs">
                  Verified Account
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : 'Unknown'}
            </p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="space-y-3">
          {profileFields.map((field, index) => (
            <ProfileField
              key={`${field.label}-${index}`}
              icon={field.icon}
              label={field.label}
              value={field.value}
              placeholder={field.placeholder}
            />
          ))}
        </div>

        {/* Additional Information */}
        {(user.profilePicture || user.image) && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Profile picture: {user.profilePicture ? 'Custom' : 'Default'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ProfileView.displayName = 'ProfileView';

export default ProfileView; 