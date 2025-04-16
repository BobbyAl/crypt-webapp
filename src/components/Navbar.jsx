"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChevronDown, FaUser, FaTachometerAlt, FaLock, FaShieldAlt } from 'react-icons/fa';
import { auth } from "@/firebase/config";

export default function Navbar() {
  const [isModesOpen, setIsModesOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const isActive = (path) => pathname === path;

  const handleAccountClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      window.location.href = "/crypt-webapp/login";
    }
  };

  return (
    <nav className="bg-[#111827]/90 border-b border-white/10 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-20">
          {/* Left - Logo */}
          <div className="flex items-center">
            <Link href="/crypt-webapp/dashboard" className="flex items-center text-white font-bold text-xl">
              <FaShieldAlt className="w-6 h-6 mr-2" />
              Crypt
            </Link>
          </div>

          {/* Center - Dashboard & Modes */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/crypt-webapp/dashboard"
              className={`inline-flex items-center px-1 pt-1 text-base font-medium ${
                isActive('/dashboard')
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <FaTachometerAlt className="mr-2" />
              Dashboard
            </Link>

            {/* Modes Dropdown */}
            <div className="relative flex items-center">
              <button
                onClick={() => setIsModesOpen(!isModesOpen)}
                className={`inline-flex items-center px-1 text-base font-medium ${
                  isModesOpen ? 'text-blue-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                <FaLock className="mr-2" />
                Modes
                <FaChevronDown className="ml-2" />
              </button>

              {isModesOpen && (
                <div className="absolute z-50 top-full mt-1 w-48 rounded-md shadow-lg bg-[#1F2937] ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu">
                    <Link
                      href="/crypt-webapp/encrypt"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => setIsModesOpen(false)}
                    >
                      Encrypt
                    </Link>
                    <Link
                      href="/crypt-webapp/decrypt"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => setIsModesOpen(false)}
                    >
                      Decrypt
                    </Link>
                    <Link
                      href="/crypt-webapp/hash"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => setIsModesOpen(false)}
                    >
                      Hash
                    </Link>
                    <Link
                      href="/crypt-webapp/keygen"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => setIsModesOpen(false)}
                    >
                      Key Generation
                    </Link>
                    <Link
                      href="/crypt-webapp/steganography"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => setIsModesOpen(false)}
                    >
                      Steganography
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Account */}
          <div className="hidden md:flex items-center">
            <Link
              href={isAuthenticated ? "/crypt-webapp/account" : "/crypt-webapp/login"}
              onClick={handleAccountClick}
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                isActive('/account')
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <FaUser className="mr-2" />
              {isAuthenticated ? "Account" : "Sign In"}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 