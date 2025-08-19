import {DashboardSidebar} from "@/app/admin/Sidebar";
import {DashboardNavbar} from "@/app/admin/Navbar";
import "@/components/tiptap.css"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout" style={{ display: 'flex', height: '100vh' }}>
      <DashboardSidebar />
      <div className="admin-content" style={{ flexGrow: 1, overflowY: 'auto' }}>
        <DashboardNavbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
