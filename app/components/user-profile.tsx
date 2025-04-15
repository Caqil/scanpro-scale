"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, KeyRound, UserIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useLanguageStore } from "@/src/store/store";

interface UserProfileProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: Date;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const { t } = useLanguageStore();
  const [name, setName] = useState(user.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const router = useRouter();
  
  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;
    
    // Contains numbers or special characters
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 25;
    
    return strength;
  };
  
  // Get password strength description
  const getPasswordStrengthDescription = (strength: number) => {
    if (strength <= 25) return t('profile.passwordWeak') || "Weak";
    if (strength <= 50) return t('profile.passwordFair') || "Fair";
    if (strength <= 75) return t('profile.passwordGood') || "Good";
    return t('profile.passwordStrong') || "Strong";
  };
  
  // Handle password strength change
  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
    setPasswordError(null);
  };
  
  // Update profile information
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || t('profile.updateFailed') || 'Failed to update profile');
      }
      
      setSuccess(t('profile.updateSuccess') || 'Profile updated successfully');
      toast.success(t('profile.updateSuccess') || 'Profile updated successfully');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : t('profile.updateError') || 'An error occurred');
      toast.error(error instanceof Error ? error.message : t('profile.updateError') || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Update password
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setSuccess(null);
    setLoading(true);
    
    // Validate password
    if (newPassword !== confirmPassword) {
      setPasswordError(t('profile.passwordMismatch') || 'New passwords do not match');
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError(t('profile.passwordLength') || 'Password must be at least 8 characters');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || t('profile.passwordUpdateFailed') || 'Failed to update password');
      }
      
      setSuccess(t('profile.passwordUpdateSuccess') || 'Password updated successfully');
      toast.success(t('profile.passwordUpdateSuccess') || 'Password updated successfully');
      
      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(0);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : t('profile.passwordUpdateError') || 'An error occurred');
      toast.error(error instanceof Error ? error.message : t('profile.passwordUpdateError') || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              {t('profile.personalInfo') || 'Personal Information'}
            </CardTitle>
            <CardDescription>
              {t('profile.updatePersonalInfo') || 'Update your personal information'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                {success}
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('profile.name') || 'Name'}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder={t('profile.namePlaceholder') || 'Enter your full name'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.email') || 'Email'}</Label>
              <Input
                id="email"
                value={user.email || ""}
                disabled
                className="bg-muted/30"
              />
              <p className="text-xs text-muted-foreground">
                {t('profile.emailUnchangeable') || 'Email cannot be changed'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>{t('profile.memberSince') || 'Member Since'}</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || name.trim() === (user.name || '')}
              className="w-full"
            >
              {loading ? t('profile.updating') || "Updating..." : t('profile.updateProfile') || "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Password Update */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              {t('profile.changePassword') || 'Change Password'}
            </CardTitle>
            <CardDescription>
              {t('profile.updatePasswordDesc') || 'Update your account password'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {passwordError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t('profile.currentPassword') || 'Current Password'}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                placeholder={t('profile.currentPasswordPlaceholder') || 'Enter your current password'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('profile.newPassword') || 'New Password'}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                disabled={loading}
                minLength={8}
                placeholder={t('profile.newPasswordPlaceholder') || 'Enter a new password'}
              />
              {newPassword && (
                <div className="mt-1">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        passwordStrength <= 25 ? 'bg-red-500' :
                        passwordStrength <= 50 ? 'bg-orange-500' :
                        passwordStrength <= 75 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {t('profile.passwordStrength') || 'Password Strength'}: {getPasswordStrengthDescription(passwordStrength)}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('profile.confirmPassword') || 'Confirm New Password'}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                minLength={8}
                placeholder={t('profile.confirmPasswordPlaceholder') || 'Confirm your new password'}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            >
              {loading ? t('profile.changingPassword') || "Changing..." : t('profile.changePassword') || "Change Password"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              {t('profile.passwordTips') || 'For security, choose a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.'}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}