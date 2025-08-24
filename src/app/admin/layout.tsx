"use client"

import { DashboardSidebar } from "@/app/admin/Sidebar";
import { DashboardNavbar } from "@/app/admin/Navbar";
import { UserProvider } from "@/contexts/UserContext";
import "@/components/tiptap.css"; 
import React, { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <UserProvider>
      <div className="admin-layout">
        <DashboardSidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={toggleSidebar} 
        />
        {/* This wrapper pushes the content to the right of the fixed sidebar */}
        <div className={`content-area flex-grow flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <DashboardNavbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}