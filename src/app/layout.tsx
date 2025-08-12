// This file is now a Server Component. Do NOT add "use client" here.

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import LayoutClient from "@/components/LayoutClient"; // <-- Import our new component
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// We can safely export metadata because this is a Server Component.
export const metadata: Metadata = {
  title: "Talenta - Rwandan Youth Creative Platform",
  description:
    "Online hub for Rwandan youth to upload short films, poetry, podcasts, and get paid. Create in silence. Be heard worldwide.",
  keywords: "Rwanda, youth, creative platform, short films, poetry, podcasts, digital content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {/* AuthProvider can wrap server components and provide context to client components below it */}
        <AuthProvider>
          {/* Use the new client component to handle the dynamic layout */}
          <LayoutClient>{children}</LayoutClient>
        </AuthProvider>
      </body>
    </html>
  );
}