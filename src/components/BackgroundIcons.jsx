"use client";

import { FaLock, FaKey, FaShieldAlt, FaFingerprint, FaUserSecret } from 'react-icons/fa';

export default function BackgroundIcons() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Top left */}
      <div className="absolute -top-10 -left-10 text-white/[0.02] transform rotate-12">
        <FaLock className="w-40 h-40" />
      </div>
      
      {/* Top right */}
      <div className="absolute top-1/4 -right-10 text-white/[0.02] transform -rotate-12">
        <FaKey className="w-48 h-48" />
      </div>
      
      {/* Center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/[0.02]">
        <FaShieldAlt className="w-64 h-64" />
      </div>
      
      {/* Bottom left */}
      <div className="absolute bottom-1/4 -left-10 text-white/[0.02] transform rotate-45">
        <FaFingerprint className="w-48 h-48" />
      </div>
      
      {/* Bottom right */}
      <div className="absolute -bottom-10 -right-10 text-white/[0.02] transform -rotate-12">
        <FaUserSecret className="w-40 h-40" />
      </div>
    </div>
  );
} 