import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundIcons from "@/components/BackgroundIcons";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Crypt - Secure Encryption Tools",
  description: "Secure encryption and cryptographic tools for your data protection needs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <BackgroundIcons />
          <Navbar />
          <main className="flex-grow relative z-10">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
} 