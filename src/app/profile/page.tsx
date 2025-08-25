"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Camera,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Music
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    dateOfBirth: "",
    gender: "PREFER_NOT_TO_SAY"
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        location: user.location || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        gender: user.gender || "PREFER_NOT_TO_SAY"
      });
    }
  }, [user, isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      location: user?.location || "",
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      gender: user?.gender || "PREFER_NOT_TO_SAY"
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl group-hover:shadow-orange-200 transition-all duration-300">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-200 shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.firstName} {user.lastName}</h1>
                <p className="text-gray-600 text-lg mb-3">{user.email}</p>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${
                    user.role === "ADMIN" ? "bg-red-100 text-red-800 border-red-300" :
                    user.role === "CREATOR" ? "bg-purple-100 text-purple-800 border-purple-300" :
                    "bg-blue-100 text-blue-800 border-blue-300"
                  }`}>
                    {user.role}
                  </span>
                  {user.isVerified && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 border-2 border-green-300">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              <span className="font-semibold">{isEditing ? "Cancel" : "Edit Profile"}</span>
            </button>
          </div>

          {/* Bio */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Bio</h3>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 resize-none"
                rows={3}
              />
            ) : (
              <p className="text-gray-700 text-lg leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {user.bio || "No bio added yet. Click 'Edit Profile' to add your bio."}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 group-hover:border-blue-300 transition-all duration-200">
                <p className="text-3xl font-bold text-blue-600 mb-2">{user.stats?.totalContent || 0}</p>
                <p className="text-sm text-blue-700 font-semibold">Content</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 group-hover:border-green-300 transition-all duration-200">
                <p className="text-3xl font-bold text-green-600 mb-2">{user.stats?.totalViews || 0}</p>
                <p className="text-sm text-green-700 font-semibold">Views</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border-2 border-red-200 group-hover:border-red-300 transition-all duration-200">
                <p className="text-3xl font-bold text-red-600 mb-2">{user.stats?.totalLikes || 0}</p>
                <p className="text-sm text-red-700 font-semibold">Likes</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200 group-hover:border-purple-300 transition-all duration-200">
                <p className="text-3xl font-bold text-purple-600 mb-2">{user.stats?.totalShares || 0}</p>
                <p className="text-sm text-purple-700 font-semibold">Shares</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <User className="w-6 h-6 mr-3 text-orange-500" />
            Profile Information
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* First Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <User className="inline w-4 h-4 mr-2 text-orange-500" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg"
                    required
                  />
                ) : (
                  <p className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-900 text-lg border-2 border-gray-200">{user.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <User className="inline w-4 h-4 mr-2 text-orange-500" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg"
                    required
                  />
                ) : (
                  <p className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-900 text-lg border-2 border-gray-200">{user.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Mail className="inline w-4 h-4 mr-2 text-orange-500" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg"
                    required
                  />
                ) : (
                  <p className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-900 text-lg border-2 border-gray-200">{user.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Phone className="inline w-4 h-4 mr-2 text-orange-500" />
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg"
                  />
                ) : (
                  <p className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-900 text-lg border-2 border-gray-200">{user.phone || "Not provided"}</p>
                )}
              </div>

              {/* Location */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <MapPin className="inline w-4 h-4 mr-2 text-orange-500" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg"
                    placeholder="City, Country"
                  />
                ) : (
                  <p className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-900 text-lg border-2 border-gray-200">{user.location || "Not specified"}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Calendar className="inline w-4 h-4 mr-2 text-orange-500" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg"
                  />
                ) : (
                  <p className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-900 text-lg border-2 border-gray-200">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not specified"}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Gender</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-900 text-lg border-2 border-gray-200">{user.gender}</p>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-6 h-6 mr-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">#</span>
                </div>
                Social Links
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[
                  { name: "Instagram", icon: Instagram, color: "text-pink-500", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
                  { name: "Twitter", icon: Twitter, color: "text-blue-400", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
                  { name: "Facebook", icon: Facebook, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
                  { name: "YouTube", icon: Youtube, color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" },
                  { name: "Music", icon: Music, color: "text-black", bgColor: "bg-gray-50", borderColor: "border-gray-200" }
                ].map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <div key={social.name} className="text-center group">
                      <div className={`w-16 h-16 mx-auto rounded-2xl ${social.bgColor} border-2 ${social.borderColor} flex items-center justify-center ${social.color} hover:scale-110 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <p className="text-sm text-gray-600 mt-3 font-medium">{social.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-4 pt-8 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
