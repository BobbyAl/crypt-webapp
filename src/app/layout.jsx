import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'CryptoSite',
  description: 'Secure cryptography utility for file encryption, decryption, and key management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 min-h-screen">
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
} 