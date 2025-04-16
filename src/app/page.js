import Link from "next/link";
import { FaShieldAlt, FaLock, FaKey, FaUserSecret } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center justify-between w-full">
        {/* Left side - Text and CTAs */}
        <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-white">
              Secure Your Data
              <span className="text-blue-500"> with Confidence</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Advanced encryption tools for your sensitive information. 
              Military-grade security made simple and accessible.
            </p>
          </div>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-medium"
            >
              <FaLock className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-medium border border-gray-600"
            >
              <FaKey className="w-5 h-5" />
              <span>Create Account</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8">
            <div className="text-center lg:text-left">
              <div className="text-blue-500 font-bold text-2xl">256-bit</div>
              <div className="text-gray-400">AES Encryption</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-blue-500 font-bold text-2xl">2048-bit</div>
              <div className="text-gray-400">RSA Keys</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-blue-500 font-bold text-2xl">100%</div>
              <div className="text-gray-400">Secure</div>
            </div>
          </div>
        </div>

        {/* Right side - Animated Icon */}
        <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center items-center">
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Main shield icon */}
            <FaShieldAlt className="w-full h-full text-blue-500/20 animate-pulse" />
            
            {/* Floating security icons */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <FaLock className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 text-blue-400 animate-float" />
                <FaKey className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-8 text-blue-400 animate-float-delayed" />
                <FaUserSecret className="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 text-blue-400 animate-float" />
                <FaShieldAlt className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 text-blue-400 animate-float-delayed" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
