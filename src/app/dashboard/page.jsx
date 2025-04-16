"use client";

import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  FaLock, 
  FaLockOpen, 
  FaKey, 
  FaDice, 
  FaUserSecret,
  FaSignOutAlt
} from "react-icons/fa";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Cryptographic Tools</h1>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <FaSignOutAlt className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Encrypt", href: "/encrypt", icon: FaLock, description: "Encrypt files using AES or RSA" },
            { label: "Decrypt", href: "/decrypt", icon: FaLockOpen, description: "Decrypt your encrypted files" },
            { label: "Hash", href: "/hash", icon: FaKey, description: "Generate file or text hashes" },
            { label: "Generate Keys", href: "/keygen", icon: FaDice, description: "Generate cryptographic keys" },
            { label: "Steganography", href: "/steganography", icon: FaUserSecret, description: "Hide data in images" },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => router.push(btn.href)}
              className="p-6 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all transform hover:scale-105 text-white shadow-xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <span className="text-4xl text-blue-500">
                  {<btn.icon />}
                </span>
                <span className="text-xl font-semibold">{btn.label}</span>
                <p className="text-sm text-gray-400 text-center">
                  {btn.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}