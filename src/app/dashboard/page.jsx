"use client";

import { auth, db } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { 
  FaLock, 
  FaLockOpen, 
  FaKey, 
  FaDice, 
  FaUserSecret 
} from "react-icons/fa";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const q = query(
          collection(db, "files"),
          where("user", "==", user.email),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSavedItems(items);
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
    <div className="flex flex-col items-center justify-start min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-12 mt-6">Dashboard</h1>

      {/* Function Buttons - Centered */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-20">
        {[
          { label: "Encrypt", href: "/encrypt", icon: FaLock },
          { label: "Decrypt", href: "/decrypt", icon: FaLockOpen },
          { label: "Hash", href: "/hash", icon: FaKey },
          { label: "Keygen", href: "/keygen", icon: FaDice },
          { label: "Steganography", href: "/steganography", icon: FaUserSecret },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => router.push(btn.href)}
            className="w-48 h-24 text-xl font-bold text-white rounded-2xl shadow-lg bg-gradient-to-br from-blue-800 to-blue-900 hover:from-blue-600 hover:to-blue-800 transition-transform transform hover:scale-105"
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-3xl">
                {<btn.icon className="w-8 h-8" />}
              </span>
              <span>{btn.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Divider */}
      <hr className="w-full max-w-6xl border-t border-gray-600 mb-6" />

      {/* Saved Files & Keys Section */}
      <div className="w-full max-w-6xl">
        <h2 className="text-2xl font-semibold mb-4">Files & Keys</h2>
        {savedItems.length === 0 ? (
          <p className="text-gray-400">No saved items found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 border rounded-xl shadow bg-gray-800 text-white"
              >
                <p className="text-sm text-gray-400">
                  {new Date(item.timestamp?.toDate()).toLocaleString()}
                </p>
                <p className="font-semibold text-lg">{item.filename}</p>
                <p className="text-sm">Type: {item.type.toUpperCase()}</p>
                <p className="text-sm mb-2">Method: {item.method}</p>
                {item.type === "key" && item.content && (
                  <>
                    <textarea
                      readOnly
                      value={item.content}
                      className="w-full p-2 text-xs bg-gray-700 rounded"
                      rows={4}
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(item.content)}
                      className="mt-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm"
                    >
                      Copy Key
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}