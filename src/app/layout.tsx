import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "Talenta – Rwanda's Home for Stories",
  description: "Read, write, and listen to stories rooted in Rwandan culture.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
