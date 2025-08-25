"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  Bell, 
  Shield, 
  User, 
  Lock, 
  Globe, 
  Palette,
  Save,
  X,
  Check
} from "lucide-react";

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(false);

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    newsletter: true
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowComments: true
  });

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    language: "en",
    fontSize: "medium"
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isAuthenticated, router]);

  const handleAccountSettingChange = (key: string, value: boolean) => {
    setAccountSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrivacySettingChange = (key: string, value: string | boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAppearanceSettingChange = (key: string, value: string) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Here you would typically save settings to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log("Settings saved:", { accountSettings, privacySettings, appearanceSettings });
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-xl text-gray-600">Manage your account preferences and privacy settings.</p>
            </div>
            <button
              onClick={saveSettings}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-6 px-1 border-b-2 font-semibold text-lg flex items-center space-x-3 transition-all duration-200 ${
                      activeTab === tab.id
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            {/* Account Settings */}
            {activeTab === "account" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <User className="w-6 h-6 mr-3 text-orange-500" />
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                      <input
                        type="email"
                        value={user.email || ""}
                        disabled
                        className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Username</label>
                      <input
                        type="text"
                        value={user.firstName || ""}
                        disabled
                        className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Lock className="w-6 h-6 mr-3 text-orange-500" />
                    Account Actions
                  </h3>
                  <div className="space-y-4">
                    <button className="w-full text-left p-6 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-gray-900 mb-2">Change Password</p>
                          <p className="text-gray-600">Update your account password</p>
                        </div>
                        <Lock className="w-6 h-6 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" />
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-6 border-2 border-gray-200 rounded-2xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-gray-900 mb-2">Delete Account</p>
                          <p className="text-gray-600">Permanently remove your account and data</p>
                        </div>
                        <X className="w-6 h-6 text-red-400 group-hover:text-red-600 transition-colors duration-200" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-orange-500" />
                    Profile Visibility
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Visibility</label>
                      <select
                        value={privacySettings.profileVisibility}
                        onChange={(e) => handlePrivacySettingChange("profileVisibility", e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg"
                      >
                        <option value="public">Public - Anyone can view</option>
                        <option value="friends">Friends Only - Only friends can view</option>
                        <option value="private">Private - Only you can view</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.showEmail}
                          onChange={(e) => handlePrivacySettingChange("showEmail", e.target.checked)}
                          className="w-5 h-5 text-orange-500 bg-white border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="ml-4 text-gray-700 font-medium">Show email address on profile</span>
                      </label>

                      <label className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.showPhone}
                          onChange={(e) => handlePrivacySettingChange("showPhone", e.target.checked)}
                          className="w-5 h-5 text-orange-500 bg-white border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="ml-4 text-gray-700 font-medium">Show phone number on profile</span>
                      </label>

                      <label className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allowMessages}
                          onChange={(e) => handlePrivacySettingChange("allowMessages", e.target.checked)}
                          className="w-5 h-5 text-orange-500 bg-white border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="ml-4 text-gray-700 font-medium">Allow direct messages from other users</span>
                      </label>

                      <label className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allowComments}
                          onChange={(e) => handlePrivacySettingChange("allowComments", e.target.checked)}
                          className="w-5 h-5 text-orange-500 bg-white border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="ml-4 text-gray-700 font-medium">Allow comments on my content</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Bell className="w-6 h-6 mr-3 text-orange-500" />
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={accountSettings.emailNotifications}
                        onChange={(e) => handleAccountSettingChange("emailNotifications", e.target.checked)}
                        className="w-5 h-5 text-orange-500 bg-white border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="ml-4 text-gray-700 font-medium">Receive email notifications</span>
                    </label>

                    <label className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={accountSettings.marketingEmails}
                        onChange={(e) => handleAccountSettingChange("marketingEmails", e.target.checked)}
                        className="w-5 h-5 text-orange-500 bg-white border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="ml-4 text-gray-700 font-medium">Receive marketing emails</span>
                    </label>

                    <label className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={accountSettings.newsletter}
                        onChange={(e) => handleAccountSettingChange("newsletter", e.target.checked)}
                        className="w-5 h-5 text-orange-500 bg-white border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="ml-4 text-gray-700 font-medium">Subscribe to newsletter</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Bell className="w-6 h-6 mr-3 text-orange-500" />
                    Push Notifications
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={accountSettings.pushNotifications}
                        onChange={(e) => handleAccountSettingChange("pushNotifications", e.target.checked)}
                        className="w-5 h-5 text-orange-500 bg-white border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="ml-4 text-gray-700 font-medium">Enable push notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Palette className="w-6 h-6 mr-3 text-orange-500" />
                    Theme & Display
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Theme</label>
                      <select
                        value={appearanceSettings.theme}
                        onChange={(e) => handleAppearanceSettingChange("theme", e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
                      <select
                        value={appearanceSettings.language}
                        onChange={(e) => handleAppearanceSettingChange("language", e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg"
                      >
                        <option value="en">English</option>
                        <option value="rw">Kinyarwanda</option>
                        <option value="fr">French</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Font Size</label>
                      <select
                        value={appearanceSettings.fontSize}
                        onChange={(e) => handleAppearanceSettingChange("fontSize", e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
