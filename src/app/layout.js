// src/app/layout.jsx
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Crypt",
  description: "Secure cryptographic tools for encryption, hashing, and key generation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-black dark:bg-black dark:text-white font-sans">
      <nav className="text-white px-8 py-5 flex items-center justify-between shadow-md h-20">
        {/* Left: Logo */}
        <Link href="/dashboard" className="text-2xl font-bold tracking-wide">Crypt</Link>

        {/* Center: Navigation links */}
        <div className="space-x-12 text-base font-semibold flex-1 flex justify-center">
          <Link href="/encrypt" className="hover:underline">Encrypt</Link>
          <Link href="/decrypt" className="hover:underline">Decrypt</Link>
          <Link href="/hash" className="hover:underline">Hash</Link>
          <Link href="/keygen" className="hover:underline">Key Generator</Link>
          <Link href="/steganography" className="hover:underline">Steganography</Link>
        </div>

        {/* Right: Logout */}
        <Link href="/login" className="text-red-400 font-semibold hover:underline text-base">
          Logout
        </Link>
      </nav>
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </body>
    </html>
  );
}