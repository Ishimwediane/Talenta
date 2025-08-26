"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  MessageSquare, 
  Send, 
  Search, 
  MoreVertical,
  Online,
  Offline,
  Image as ImageIcon,
  Paperclip
} from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: "text" | "image" | "file";
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Simulate loading conversations
    setTimeout(() => {
      setConversations([
        {
          id: "1",
          userId: "user1",
          userName: "Marie Uwimana",
          lastMessage: "Thank you for the feedback on my poem!",
          lastMessageTime: "2024-01-15T10:30:00Z",
          unreadCount: 2,
          isOnline: true,
          messages: [
            {
              id: "msg1",
              senderId: "user1",
              receiverId: user?.id || "",
              content: "Hi! I loved your latest story.",
              timestamp: "2024-01-15T09:00:00Z",
              isRead: true,
              type: "text"
            },
            {
              id: "msg2",
              senderId: user?.id || "",
              receiverId: "user1",
              content: "Thank you! I'm glad you enjoyed it.",
              timestamp: "2024-01-15T09:15:00Z",
              isRead: true,
              type: "text"
            },
            {
              id: "msg3",
              senderId: "user1",
              receiverId: user?.id || "",
              content: "Thank you for the feedback on my poem!",
              timestamp: "2024-01-15T10:30:00Z",
              isRead: false,
              type: "text"
            }
          ]
        },
        {
          id: "2",
          userId: "user2",
          userName: "Jean Pierre",
          lastMessage: "Let's collaborate on a project!",
          lastMessageTime: "2024-01-14T16:45:00Z",
          unreadCount: 0,
          isOnline: false,
          messages: [
            {
              id: "msg4",
              senderId: "user2",
              receiverId: user?.id || "",
              content: "Let's collaborate on a project!",
              timestamp: "2024-01-14T16:45:00Z",
              isRead: true,
              type: "text"
            }
          ]
        },
        {
          id: "3",
          userId: "user3",
          userName: "Grace Mukamana",
          lastMessage: "Your audio recording is amazing!",
          lastMessageTime: "2024-01-13T14:20:00Z",
          unreadCount: 1,
          isOnline: true,
          messages: [
            {
              id: "msg5",
              senderId: "user3",
              receiverId: user?.id || "",
              content: "Your audio recording is amazing!",
              timestamp: "2024-01-13T14:20:00Z",
              isRead: false,
              type: "text"
            }
          ]
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, [isAuthenticated, router, user?.id]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `msg${Date.now()}`,
      senderId: user?.id || "",
      receiverId: selectedConversation.userId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: "text"
    };

    // Update conversation with new message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation.id 
          ? {
              ...conv,
              lastMessage: newMessage,
              lastMessageTime: new Date().toISOString(),
              messages: [...conv.messages, message]
            }
          : conv
      )
    );

    // Update selected conversation
    setSelectedConversation(prev => 
      prev ? {
        ...prev,
        lastMessage: newMessage,
        lastMessageTime: new Date().toISOString(),
        messages: [...prev.messages, message]
      } : null
    );

    setNewMessage("");
  };

  const markConversationAsRead = (conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0, messages: conv.messages.map(msg => ({ ...msg, isRead: true })) }
          : conv
      )
    );
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">Connect with other creators and readers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex">
          {/* Conversations Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      markConversationAsRead(conversation.id);
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? "bg-orange-50 border-orange-200" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold">
                          {conversation.userAvatar ? (
                            <img 
                              src={conversation.userAvatar} 
                              alt={conversation.userName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            conversation.userName.charAt(0)
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          conversation.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}></div>
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">{conversation.userName}</h3>
                          <span className="text-xs text-gray-500">
                            {new Date(conversation.lastMessageTime).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                      </div>

                      {/* Unread Badge */}
                      {conversation.unreadCount > 0 && (
                        <div className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold">
                        {selectedConversation.userAvatar ? (
                          <img 
                            src={selectedConversation.userAvatar} 
                            alt={selectedConversation.userName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          selectedConversation.userName.charAt(0)
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        selectedConversation.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedConversation.userName}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((message) => {
                    const isOwnMessage = message.senderId === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? "text-orange-100" : "text-gray-500"
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

