"use client"; // This MUST be the first line

import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // We can safely use a hook here because this is a Client Component.
  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      {/* Conditionally render Navbar and Footer based on user role */}
      {!isAdmin && <Navbar />}
      <main>{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}