"use client";

import { useState } from "react";
import {
  FaKey,
  FaCopy,
  FaRandom,
  FaLock,
  FaExchangeAlt,
  FaFont,
  FaHashtag,
  FaAsterisk,
  FaDownload,
} from "react-icons/fa";

export default function KeygenPage() {
  const [aesKey, setAesKey] = useState("");
  const [rsaKeys, setRsaKeys] = useState({ publicKey: "", privateKey: "" });
  const [dhSharedSecret, setDhSharedSecret] = useState("");
  const [password, setPassword] = useState("");
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [loading, setLoading] = useState({
    aes: false,
    rsa: false,
    dh: false,
    password: false
  });
  const [copyFeedback, setCopyFeedback] = useState("");

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`${label} copied!`);
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (err) {
      setCopyFeedback("Failed to copy");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  };

  const generateAesKey = async () => {
    try {
      setLoading(prev => ({ ...prev, aes: true }));
      const key = crypto.getRandomValues(new Uint8Array(32));
      const base64Key = btoa(String.fromCharCode(...key));
      setAesKey(base64Key);
    } catch (error) {
      console.error('AES Key Generation Error:', error);
      setCopyFeedback('Failed to generate AES key');
    } finally {
      setLoading(prev => ({ ...prev, aes: false }));
    }
  };

  const generateRsaKeyPair = async () => {
    try {
      setLoading(prev => ({ ...prev, rsa: true }));
      
      // Generate RSA key pair
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      // Export keys to base64
      const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      const pubBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
      const privBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));

      setRsaKeys({ publicKey: pubBase64, privateKey: privBase64 });
    } catch (error) {
      console.error("Key Generation Error:", error);
      setCopyFeedback("Failed to generate keys");
    } finally {
      setLoading(prev => ({ ...prev, rsa: false }));
    }
  };

  const simulateDH = async () => {
    try {
      setLoading(prev => ({ ...prev, dh: true }));
      const params = { name: "ECDH", namedCurve: "P-256" };
      const alice = await crypto.subtle.generateKey(params, true, ["deriveKey"]);
      const bob = await crypto.subtle.generateKey(params, true, ["deriveKey"]);

      const aliceShared = await crypto.subtle.deriveKey(
        { ...params, public: bob.publicKey },
        alice.privateKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      const bobShared = await crypto.subtle.deriveKey(
        { ...params, public: alice.publicKey },
        bob.privateKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      const aliceRaw = await crypto.subtle.exportKey("raw", aliceShared);
      const bobRaw = await crypto.subtle.exportKey("raw", bobShared);

      const shared1 = btoa(String.fromCharCode(...new Uint8Array(aliceRaw)));
      const shared2 = btoa(String.fromCharCode(...new Uint8Array(bobRaw)));

      setDhSharedSecret(shared1 === shared2 ? shared1 : "Mismatch");
    } catch (err) {
      console.error("DH Simulation Error:", err);
      setDhSharedSecret("Error during simulation");
      setCopyFeedback('Failed to simulate DH exchange');
    } finally {
      setLoading(prev => ({ ...prev, dh: false }));
    }
  };

  const generatePassword = () => {
    setIsPasswordLoading(true);
    const length = 16;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const alphabet = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setPassword(password);
    setIsPasswordLoading(false);
  };

  const downloadKeys = () => {
    const content = JSON.stringify({
      publicKey: rsaKeys.publicKey,
      privateKey: rsaKeys.privateKey
    }, null, 2);
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rsa-keys.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSingleKey = (key, filename) => {
    const blob = new Blob([key], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl">
        <div>
          <h1 className="text-3xl font-bold text-center text-white flex items-center justify-center">
            Key Generation <FaKey className="ml-3 w-8 h-8" />
          </h1>
          <p className="mt-2 text-center text-gray-400">
            Generate cryptographic keys and secure passwords
          </p>
        </div>

        {copyFeedback && (
          <div className="p-4 rounded-md bg-blue-500/10 text-blue-500 text-center">
            {copyFeedback}
          </div>
        )}

        <div className="space-y-6">
          {/* AES Key Generation */}
          <div className="space-y-4 p-4 rounded-md bg-gray-900/50">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <FaLock className="w-5 h-5 mr-2" />
              AES Key
            </h3>
            <button
              onClick={generateAesKey}
              disabled={loading.aes}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
            >
              <FaRandom className="w-4 h-4 mr-2" />
              {loading.aes ? "Generating..." : "Generate AES Key"}
            </button>
            {aesKey && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                  <code className="text-sm text-gray-300 font-mono break-all">{aesKey}</code>
                  <button
                    onClick={() => handleCopy(aesKey, "AES key")}
                    className="ml-2 p-2 text-gray-400 hover:text-white"
                  >
                    <FaCopy className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => downloadSingleKey(aesKey, 'aes-key.txt')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center"
                >
                  <FaDownload className="w-4 h-4 mr-2" />
                  Download Key
                </button>
              </div>
            )}
          </div>

          {/* RSA Key Generation */}
          <div className="space-y-4 p-4 rounded-md bg-gray-900/50">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <FaKey className="w-5 h-5 mr-2" />
              RSA Key Pair
            </h3>
            <button
              onClick={generateRsaKeyPair}
              disabled={loading.rsa}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
            >
              <FaRandom className="w-4 h-4 mr-2" />
              {loading.rsa ? "Generating..." : "Generate RSA Keys"}
            </button>
            {(rsaKeys.publicKey || rsaKeys.privateKey) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Public Key</label>
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <code className="text-sm text-gray-300 font-mono break-all">{rsaKeys.publicKey}</code>
                    <button
                      onClick={() => handleCopy(rsaKeys.publicKey, "Public key")}
                      className="ml-2 p-2 text-gray-400 hover:text-white"
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Private Key</label>
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <code className="text-sm text-gray-300 font-mono break-all">{rsaKeys.privateKey}</code>
                    <button
                      onClick={() => handleCopy(rsaKeys.privateKey, "Private key")}
                      className="ml-2 p-2 text-gray-400 hover:text-white"
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={downloadKeys}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center"
                >
                  <FaDownload className="w-4 h-4 mr-2" />
                  Download Key Pair
                </button>
              </div>
            )}
          </div>

          {/* DH Shared Secret */}
          <div className="space-y-4 p-4 rounded-md bg-gray-900/50">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <FaExchangeAlt className="w-5 h-5 mr-2" />
              DH Shared Secret
            </h3>
            <button
              onClick={simulateDH}
              disabled={loading.dh}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
            >
              <FaRandom className="w-4 h-4 mr-2" />
              {loading.dh ? "Simulating..." : "Simulate DH Exchange"}
            </button>
            {dhSharedSecret && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                  <code className="text-sm text-gray-300 font-mono break-all">{dhSharedSecret}</code>
                  <button
                    onClick={() => handleCopy(dhSharedSecret, "DH secret")}
                    className="ml-2 p-2 text-gray-400 hover:text-white"
                  >
                    <FaCopy className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => downloadSingleKey(dhSharedSecret, 'dh-secret.txt')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center"
                >
                  <FaDownload className="w-4 h-4 mr-2" />
                  Download Secret
                </button>
              </div>
            )}
          </div>

          {/* Password Generation */}
          <div className="space-y-4 p-4 rounded-md bg-gray-900/50">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <FaAsterisk className="w-5 h-5 mr-2" />
              Password Generator
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Password Length</label>
                <input
                  type="number"
                  min="8"
                  max="64"
                  value={passwordLength}
                  onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Include Uppercase</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Include Numbers</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Include Symbols</span>
                </label>
              </div>
              <button
                onClick={generatePassword}
                disabled={loading.password}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
              >
                <FaRandom className="w-4 h-4 mr-2" />
                {loading.password ? "Generating..." : "Generate Password"}
              </button>
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <code className="text-sm text-gray-300 font-mono">{password}</code>
                    <button
                      onClick={() => handleCopy(password, "Password")}
                      className="ml-2 p-2 text-gray-400 hover:text-white"
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => downloadSingleKey(password, 'password.txt')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center"
                  >
                    <FaDownload className="w-4 h-4 mr-2" />
                    Download Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}