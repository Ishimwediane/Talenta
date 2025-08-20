import { DashboardSidebar } from "@/app/admin/Sidebar";
import { DashboardNavbar } from "@/app/admin/Navbar";
import "@/components/tiptap.css"; 
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout flex h-screen bg-gray-50">
      <DashboardSidebar />
      {/* This wrapper pushes the content to the right of the fixed sidebar */}
      <div className="flex-grow flex flex-col ml-44"> {/* <-- THE FIX IS HERE */}
        <DashboardNavbar />
        <main className="flex-1 overflow-y-auto p-6"> {/* Added padding for content */}
          {children}
        </main>
      </div>
    </div>
  );
}