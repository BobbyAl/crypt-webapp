"use client";

import Link from 'next/link';
import { FaGithub, FaTwitter, FaLinkedin, FaShieldAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#111827]/90 border-t border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/dashboard" className="flex items-center text-white font-bold text-xl">
              <FaShieldAlt className="w-6 h-6 mr-2" />
              Crypt
            </Link>
            <p className="text-gray-400 text-sm">
              Secure encryption and cryptographic tools for your data protection needs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/encrypt" className="text-gray-400 hover:text-white text-sm">
                  Encrypt
                </Link>
              </li>
              <li>
                <Link href="/decrypt" className="text-gray-400 hover:text-white text-sm">
                  Decrypt
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-white font-semibold mb-4">Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/hash" className="text-gray-400 hover:text-white text-sm">
                  Hash Generator
                </Link>
              </li>
              <li>
                <Link href="/keygen" className="text-gray-400 hover:text-white text-sm">
                  Key Generation
                </Link>
              </li>
              <li>
                <Link href="/steganography" className="text-gray-400 hover:text-white text-sm">
                  Steganography
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <FaGithub className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <FaTwitter className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Crypt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 