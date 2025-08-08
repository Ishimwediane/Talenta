import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from "next/script";

export const metadata = {
  title: "Talenta – Rwanda's Home for Stories",
  description: "Read, write, and listen to stories rooted in Rwandan culture.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
