"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  ChevronDown, 
  BookOpen, 
  Mic, 
  Heart,
  MessageSquare,
  Crown
} from "lucide-react";

interface UserProfileDropdownProps {
  user: any;
}

export default function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      USER: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: User },
      CREATOR: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Mic },
      ADMIN: { color: "bg-red-100 text-red-800 border-red-200", icon: Crown },
      MODERATOR: { color: "bg-green-100 text-green-800 border-green-200", icon: Crown }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color} shadow-sm`}>
        <IconComponent className="w-3 h-3" />
        {role}
      </span>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notifications Button */}
      <div className="relative inline-block mr-4">
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative p-2.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-200 ease-in-out group"
        >
          <Bell className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          {/* Notification Badge */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse shadow-sm"></span>
        </button>

        {/* Notifications Dropdown */}
        {notificationsOpen && (
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                <button className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200">
                  Mark all as read
                </button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {/* Sample notifications */}
                <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors duration-200">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full mt-2 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Your poem "Rwanda's Heart" has been featured!</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New comment on your story</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Welcome to Talenta! Start exploring content.</p>
                    <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-gray-100">
                <Link 
                  href="/notifications" 
                  className="block text-center text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors duration-200 hover:bg-orange-50 py-2 rounded-lg"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Button */}
      <button
        onClick={() => {
          console.log('Profile button clicked, current state:', isOpen);
          setIsOpen(!isOpen);
        }}
        className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200 ease-in-out group"
      >
        {/* Profile Picture or Initials */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
          {user.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt="Profile" 
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            getInitials(user.firstName, user.lastName)
          )}
        </div>
        
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-200">{user.firstName} {user.lastName}</p>
          {getRoleBadge(user.role)}
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-all duration-200 ${isOpen ? "rotate-180 text-orange-500" : "group-hover:text-gray-700"}`} />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-[9999] animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-hidden">
          <div className="p-5 max-h-[calc(80vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent relative">
            {/* User Info Header */}
            <div className="flex items-center space-x-4 pb-5 border-b border-gray-100 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.firstName, user.lastName)
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                {getRoleBadge(user.role)}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-100">
              <div className="text-center group">
                <p className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">{user.stats?.totalContent || 0}</p>
                <p className="text-xs text-gray-500 font-medium">Content</p>
              </div>
              <div className="text-center group">
                <p className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">{user.stats?.totalViews || 0}</p>
                <p className="text-xs text-gray-500 font-medium">Views</p>
              </div>
              <div className="text-center group">
                <p className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">{user.stats?.totalLikes || 0}</p>
                <p className="text-xs text-gray-500 font-medium">Likes</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              <Link
                href="/profile"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200 group"
              >
                <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">View Profile</span>
              </Link>
              
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200 group"
              >
                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">My Dashboard</span>
              </Link>
              
              <Link
                href="/my-content"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200 group"
              >
                <Mic className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">My Content</span>
              </Link>
              
              <Link
                href="/favorites"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200 group"
              >
                <Heart className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Favorites</span>
              </Link>
              
              <Link
                href="/messages"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200 group"
              >
                <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Messages</span>
              </Link>
              
              <Link
                href="/settings"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200 group"
              >
                <Settings className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Settings</span>
              </Link>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 group bg-red-50/50"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
            
            {/* Scroll indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>
        </div>
      )}
    </div>
  );
}
