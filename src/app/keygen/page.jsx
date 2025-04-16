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
  FaUserFriends,
} from "react-icons/fa";

export default function KeygenPage() {
  const [aesKey, setAesKey] = useState("");
  const [rsaKeys, setRsaKeys] = useState({ publicKey: "", privateKey: "" });
  const [dhState, setDhState] = useState({
    myKeyPair: null,
    myPublicKey: "",
    otherKeyPair: null,
    otherPublicKey: "",
    sharedSecret: ""
  });
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

  const generateMyDHKey = async () => {
    try {
      setLoading(prev => ({ ...prev, dh: true }));
      const params = { name: "ECDH", namedCurve: "P-256" };
      
      // Generate my key pair
      const keyPair = await crypto.subtle.generateKey(params, true, ["deriveKey"]);
      const publicKeyRaw = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyRaw)));
      
      setDhState(prev => ({
        ...prev,
        myKeyPair: keyPair,
        myPublicKey: publicKeyBase64,
        sharedSecret: "" // Reset shared secret when generating new key
      }));
      setCopyFeedback('Your DH key pair generated!');
    } catch (err) {
      console.error("DH Key Generation Error:", err);
      setCopyFeedback('Failed to generate DH key');
    } finally {
      setLoading(prev => ({ ...prev, dh: false }));
    }
  };

  const generateOtherDHKey = async () => {
    try {
      setLoading(prev => ({ ...prev, dh: true }));
      const params = { name: "ECDH", namedCurve: "P-256" };
      
      // Generate other party's key pair
      const keyPair = await crypto.subtle.generateKey(params, true, ["deriveKey"]);
      const publicKeyRaw = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyRaw)));
      
      setDhState(prev => ({
        ...prev,
        otherKeyPair: keyPair,
        otherPublicKey: publicKeyBase64,
        sharedSecret: "" // Reset shared secret when generating new key
      }));
      setCopyFeedback('Other party\'s DH key pair generated!');
    } catch (err) {
      console.error("DH Key Generation Error:", err);
      setCopyFeedback('Failed to generate other party\'s DH key');
    } finally {
      setLoading(prev => ({ ...prev, dh: false }));
    }
  };

  const deriveSharedSecret = async () => {
    try {
      if (!dhState.myKeyPair || !dhState.otherPublicKey) {
        setCopyFeedback('Generate your key and enter/generate other party\'s public key first');
        return;
      }

      setLoading(prev => ({ ...prev, dh: true }));
      
      let otherPublicKey;
      if (dhState.otherKeyPair) {
        // If we generated the other party's key, use it directly
        otherPublicKey = dhState.otherKeyPair.publicKey;
      } else {
        // Convert base64 public key back to CryptoKey
        const binaryStr = atob(dhState.otherPublicKey);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        
        const params = { name: "ECDH", namedCurve: "P-256" };
        otherPublicKey = await crypto.subtle.importKey(
          "spki",
          bytes,
          params,
          true,
          []
        );
      }

      // Derive shared secret
      const sharedKey = await crypto.subtle.deriveKey(
        { name: "ECDH", public: otherPublicKey },
        dhState.myKeyPair.privateKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      const sharedKeyRaw = await crypto.subtle.exportKey("raw", sharedKey);
      const sharedKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(sharedKeyRaw)));
      
      setDhState(prev => ({
        ...prev,
        sharedSecret: sharedKeyBase64
      }));
      setCopyFeedback('Shared secret derived successfully!');
    } catch (err) {
      console.error("DH Shared Secret Error:", err);
      setCopyFeedback('Failed to derive shared secret. Make sure the public key is valid.');
      setDhState(prev => ({ ...prev, sharedSecret: "" }));
    } finally {
      setLoading(prev => ({ ...prev, dh: false }));
    }
  };

  const generatePassword = () => {
    setLoading(prev => ({ ...prev, password: true }));
    try {
      const length = passwordLength;
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      let charset = lowercase;
      if (includeUppercase) charset += uppercase;
      if (includeNumbers) charset += numbers;
      if (includeSymbols) charset += symbols;
      
      let password = '';
      // Ensure at least one character from each selected type
      if (includeUppercase) password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      if (includeNumbers) password += numbers[Math.floor(Math.random() * numbers.length)];
      if (includeSymbols) password += symbols[Math.floor(Math.random() * symbols.length)];
      
      // Fill the rest randomly
      while (password.length < length) {
        password += charset[Math.floor(Math.random() * charset.length)];
      }
      
      // Shuffle the password
      password = password.split('').sort(() => Math.random() - 0.5).join('');
      
      setPassword(password);
    } catch (error) {
      console.error('Password Generation Error:', error);
      setCopyFeedback('Failed to generate password');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
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

          {/* DH Key Exchange */}
          <div className="space-y-4 p-4 rounded-md bg-gray-900/50">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <FaExchangeAlt className="w-5 h-5 mr-2" />
              Diffie-Hellman Key Exchange
            </h3>
            <p className="text-sm text-gray-400">
              Generate your key pair, exchange public keys with another party (or simulate), and derive a shared secret
            </p>
            <div className="space-y-4">
              <button
                onClick={generateMyDHKey}
                disabled={loading.dh}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
              >
                <FaRandom className="w-4 h-4 mr-2" />
                {loading.dh ? "Generating..." : "Generate My Key Pair"}
              </button>
              
              {dhState.myPublicKey && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Your Public Key</label>
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <code className="text-sm text-gray-300 font-mono break-all">{dhState.myPublicKey}</code>
                    <button
                      onClick={() => handleCopy(dhState.myPublicKey, "Your public key")}
                      className="ml-2 p-2 text-gray-400 hover:text-white"
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">Share this public key with the other party</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Other Party's Public Key</label>
                <textarea
                  placeholder="Paste the other party's public key here"
                  value={dhState.otherPublicKey}
                  onChange={(e) => setDhState(prev => ({ ...prev, otherPublicKey: e.target.value }))}
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm h-32 font-mono focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={generateOtherDHKey}
                  disabled={loading.dh}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
                >
                  <FaUserFriends className="w-4 h-4 mr-2" />
                  {loading.dh ? "Generating..." : "Simulate: Generate Other Party's Key"}
                </button>
              </div>

              <button
                onClick={deriveSharedSecret}
                disabled={loading.dh || !dhState.myKeyPair || !dhState.otherPublicKey}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
              >
                <FaKey className="w-4 h-4 mr-2" />
                {loading.dh ? "Deriving..." : "Derive Shared Secret"}
              </button>

              {dhState.sharedSecret && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Derived Shared Secret</label>
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <code className="text-sm text-gray-300 font-mono break-all">{dhState.sharedSecret}</code>
                    <button
                      onClick={() => handleCopy(dhState.sharedSecret, "Shared secret")}
                      className="ml-2 p-2 text-gray-400 hover:text-white"
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Both parties will derive the same secret key independently
                  </p>
                  <button
                    onClick={() => downloadSingleKey(dhState.sharedSecret, 'dh-secret.txt')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center"
                  >
                    <FaDownload className="w-4 h-4 mr-2" />
                    Download Secret
                  </button>
                </div>
              )}
            </div>
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