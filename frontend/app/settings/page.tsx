'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api-client'
import { User, Lock, Upload, Trash2, Globe, DollarSign } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Kolkata', 'Australia/Sydney'
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD']

export default function SettingsPage() {
  const { user, refreshUserPreferences } = useAuth()
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [timezone, setTimezone] = useState('UTC')
  const [currency, setCurrency] = useState('USD')
  const [savingPreferences, setSavingPreferences] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserPreferences()
      fetchProfileImage()
    }
  }, [user])

  const fetchProfileImage = async () => {
    if (!user?.email) return
    try {
      const response = await apiClient.getProfileImage(user.email)
      if (response?.response) {
        setProfileImage(`data:image/jpeg;base64,${response.response}`)
      }
    } catch (error) {
      setProfileImage(null)
    }
  }

  const fetchUserPreferences = async () => {
    if (!user) return
    try {
      const response = await apiClient.getUserPreferences(user.email)
      if (response?.response) {
        setTimezone(response.response.timezone || 'UTC')
        setCurrency(response.response.currency || 'USD')
      }
    } catch (error) {
      // Use defaults if fetch fails
      setTimezone('UTC')
      setCurrency('USD')
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!user) return

    setChangingPassword(true)
    try {
      await apiClient.changePassword({
        email: user.email,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success('Password changed successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, JPEG, or PNG image')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setUploadingImage(true)
    try {
      await apiClient.uploadProfileImage(user.email, file)
      await fetchProfileImage()
      toast.success('Profile image uploaded successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageDelete = async () => {
    if (!user) return

    try {
      await apiClient.deleteProfileImage(user.email)
      setProfileImage(null)
      toast.success('Profile image removed successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove image')
    }
  }

  const handleSavePreferences = async () => {
    if (!user) return

    setSavingPreferences(true)
    try {
      await apiClient.updateUserPreferences({
        email: user.email,
        timezone,
        currency
      })
      // Refresh user preferences in auth context
      await refreshUserPreferences()
      toast.success('Preferences updated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update preferences')
    } finally {
      setSavingPreferences(false)
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Username</Label>
              <p className="mt-1 text-lg font-medium">{user?.username}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="mt-1 text-lg font-medium">{user?.email}</p>
            </div>
            <div>
              <Label>Role</Label>
              <p className="mt-1 text-lg font-medium">
                {user?.roles?.includes('ROLE_ADMIN') ? 'Administrator' : 'User'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Manage your currency and timezone settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={(value: string) => setCurrency(value)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(curr => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={(value: string) => setTimezone(value)}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleSavePreferences} disabled={savingPreferences}>
              <DollarSign className="mr-2 h-4 w-4" />
              {savingPreferences ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>

        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Profile Picture
            </CardTitle>
            <CardDescription>
              Upload a profile picture (JPG, JPEG, or PNG, max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              {/* Profile Picture Preview */}
              {profileImage ? (
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold shadow-lg">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="profile-image"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById('profile-image')?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </Button>
                <Button variant="outline" onClick={handleImageDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Image
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
