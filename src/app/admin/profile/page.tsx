"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, MapPin, Save, Edit, Loader2 } from "lucide-react"
import { useUser } from "@/contexts/UserContext"

export default function AdminProfilePage() {
  const { user, updateProfile, loading } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: ""
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Initialize profile data when user data is loaded
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || ""
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")
      
      const result = await updateProfile(profile)
      if (result.success) {
        setIsEditing(false)
        // Show success message (you can add a toast notification here)
        console.log('Profile updated successfully')
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset to original user values
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || ""
      })
    }
    setIsEditing(false)
    setError("")
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U"
    const firstName = user.firstName || ""
    const lastName = user.lastName || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500">User not found</span>
      </div>
    )
  }

  return (
    <div className="profile-page space-y-6 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and profile information.
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 pb-8">
        {/* Profile Information */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20 flex-shrink-0">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="text-lg">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium capitalize truncate">{user.role || 'User'}</p>
                <p className="text-sm text-muted-foreground truncate">
                  Member since {new Date(user.createdAt).getFullYear()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="block">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="block">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="block">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="block">Phone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="block">Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="block">Bio</Label>
              <Input
                id="bio"
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                className="w-full"
              />
            </div>
            
            {/* Test section with long text to verify scrolling */}
            <div className="space-y-2">
              <Label className="block">Test Long Content</Label>
              <div className="p-4 bg-gray-50 rounded border text-sm text-gray-600 max-h-32 overflow-y-auto">
                <p>This is a test section to verify that long text content is properly handled and scrolling works correctly. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                <p className="mt-2">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="block">Role</Label>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm capitalize truncate">{user.role || 'User'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="block">Email</Label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{user.email || 'Not provided'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="block">Phone</Label>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{user.phone || 'Not provided'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="block">Location</Label>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{user.location || 'Not provided'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="block">Verification Status</Label>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${user.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm">
                  {user.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </div>

            <div>
              <Button variant="outline" className="w-full">
                Two-Factor Authentication
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional content to ensure scrolling works */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Scrolling Test Section</h3>
        <p className="text-blue-700 text-sm">
          This section is added to ensure that you can scroll down and see all the content on the profile page. 
          If you can see this text, then scrolling is working correctly!
        </p>
        <div className="mt-3 space-y-2">
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Additional test content to verify scrolling functionality.</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">You should now be able to scroll down and see the location field and other content below.</p>
          </div>
        </div>
      </div>
      
      {/* More test content to force scrolling */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Additional Test Content</h3>
        <p className="text-green-700 text-sm">
          This is additional content to ensure the page is long enough to require scrolling.
        </p>
        <div className="mt-3 space-y-2">
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Test content block 1</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Test content block 2</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Test content block 3</p>
          </div>
        </div>
      </div>
      
      {/* Final test section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6 mb-8">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">Final Test Section</h3>
        <p className="text-purple-700 text-sm">
          If you can see this section, scrolling is working perfectly! You should now be able to access all profile fields.
        </p>
      </div>
    </div>
  )
}
