"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Check, 
  Trash2, 
  Settings,
  Heart,
  MessageSquare,
  Eye,
  Share2,
  Star,
  Users,
  BookOpen,
  Mic
} from "lucide-react";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "feature" | "mention" | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId?: string;
  contentId?: string;
  actorName?: string;
  actorAvatar?: string;
}

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Simulate loading notifications
    setTimeout(() => {
      setNotifications([
        {
          id: "1",
          type: "feature",
          title: "Your content was featured!",
          message: "Your poem 'Rwanda's Heart' has been featured on the homepage.",
          isRead: false,
          createdAt: "2024-01-15T10:30:00Z",
          contentId: "123"
        },
        {
          id: "2",
          type: "like",
          title: "New like on your content",
          message: "John Doe liked your story 'Morning in Kigali'",
          isRead: false,
          createdAt: "2024-01-15T09:15:00Z",
          userId: "456",
          actorName: "John Doe",
          actorAvatar: "/api/placeholder/40/40"
        },
        {
          id: "3",
          type: "comment",
          title: "New comment on your content",
          message: "Sarah commented: 'Beautiful poem! The imagery is amazing.'",
          isRead: true,
          createdAt: "2024-01-14T16:45:00Z",
          userId: "789",
          actorName: "Sarah",
          actorAvatar: "/api/placeholder/40/40"
        },
        {
          id: "4",
          type: "follow",
          title: "New follower",
          message: "Alex started following you",
          isRead: true,
          createdAt: "2024-01-14T14:20:00Z",
          userId: "101",
          actorName: "Alex",
          actorAvatar: "/api/placeholder/40/40"
        },
        {
          id: "5",
          type: "mention",
          title: "You were mentioned",
          message: "Maria mentioned you in her story 'Collaborative Poetry'",
          isRead: false,
          createdAt: "2024-01-14T12:10:00Z",
          userId: "202",
          actorName: "Maria",
          actorAvatar: "/api/placeholder/40/40"
        },
        {
          id: "6",
          type: "system",
          title: "Welcome to Talenta!",
          message: "Thank you for joining our creative community. Start exploring content and sharing your work!",
          isRead: true,
          createdAt: "2024-01-13T08:00:00Z"
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, [isAuthenticated, router]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <Users className="w-5 h-5 text-green-500" />;
      case "feature":
        return <Star className="w-5 h-5 text-yellow-500" />;
      case "mention":
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      case "system":
        return <Bell className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "like":
        return "bg-red-50 border-red-200";
      case "comment":
        return "bg-blue-50 border-blue-200";
      case "follow":
        return "bg-green-50 border-green-200";
      case "feature":
        return "bg-yellow-50 border-yellow-200";
      case "mention":
        return "bg-purple-50 border-purple-200";
      case "system":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "unread") return !notif.isRead;
    if (filter === "read") return notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Check className="inline w-4 h-4 mr-2" />
                Mark all as read
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "all", label: "All", count: notifications.length },
                { id: "unread", label: "Unread", count: unreadCount },
                { id: "read", label: "Read", count: notifications.length - unreadCount }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    filter === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === "all" 
                  ? "You're all caught up! Check back later for new updates." 
                  : `No ${filter} notifications to show.`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-orange-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          
                          {/* Actor info for social notifications */}
                          {notification.actorName && (
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                {notification.actorAvatar ? (
                                  <img 
                                    src={notification.actorAvatar} 
                                    alt={notification.actorName}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs text-gray-600 font-medium">
                                    {notification.actorName.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">{notification.actorName}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Time */}
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                          
                          {/* Actions */}
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Email Notifications</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3 text-orange-500" />
                  <span className="text-sm text-gray-700">New likes and comments</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3 text-orange-500" />
                  <span className="text-sm text-gray-700">New followers</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3 text-orange-500" />
                  <span className="text-sm text-gray-700">Content featured</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Push Notifications</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3 text-orange-500" />
                  <span className="text-sm text-gray-700">Enable push notifications</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3 text-orange-500" />
                  <span className="text-sm text-gray-700">Sound alerts</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 text-orange-500" />
                  <span className="text-sm text-gray-700">Vibration</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

