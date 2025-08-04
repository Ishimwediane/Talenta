import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Talenta - Rwandan Youth Creative Platform",
  description: "Online hub for Rwandan youth to upload short films, poetry, podcasts, and get paid. Create in silence. Be heard worldwide.",
  keywords: "Rwanda, youth, creative platform, short films, poetry, podcasts, digital content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
