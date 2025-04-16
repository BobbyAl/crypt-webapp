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
    try {
      setLoading(prev => ({ ...prev, password: true }));
      
      // Validate password length
      if (passwordLength < 8) {
        alert("Password length must be at least 8 characters");
        return;
      }
      if (passwordLength > 64) {
        alert("Password length must not exceed 64 characters");
        return;
      }

      const lowercase = "abcdefghijklmnopqrstuvwxyz";
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

      // Create an array of selected character sets
      const selectedSets = [lowercase]; // Always include lowercase
      if (includeUppercase) selectedSets.push(uppercase);
      if (includeNumbers) selectedSets.push(numbers);
      if (includeSymbols) selectedSets.push(symbols);

      // Join all selected character sets
      const chars = selectedSets.join('');
      
      // Generate password using cryptographically secure random values
      const array = new Uint32Array(passwordLength);
      crypto.getRandomValues(array);
      
      // Ensure at least one character from each selected set
      const password = new Array(passwordLength);
      let currentIndex = 0;
      
      // Add one character from each selected set
      selectedSets.forEach(set => {
        if (currentIndex < passwordLength) {
          const randomIndex = array[currentIndex] % set.length;
          password[currentIndex] = set[randomIndex];
          currentIndex++;
        }
      });
      
      // Fill the rest with random characters from all selected sets
      for (let i = currentIndex; i < passwordLength; i++) {
        const randomIndex = array[i] % chars.length;
        password[i] = chars[randomIndex];
      }
      
      // Shuffle the password array
      for (let i = password.length - 1; i > 0; i--) {
        const j = array[i] % (i + 1);
        [password[i], password[j]] = [password[j], password[i]];
      }

      setPassword(password.join(''));
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Key Generation Tools
          </h2>
        </div>

        {copyFeedback && (
          <div className="p-3 rounded-md text-sm text-center bg-blue-500/10 text-blue-500">
            {copyFeedback}
          </div>
        )}

        {/* AES Key Generation */}
        <div className="space-y-4 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <FaLock className="w-5 h-5 mr-2" />
            AES Key
          </h3>
          <button
            onClick={generateAesKey}
            disabled={loading.aes}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center disabled:opacity-50"
          >
            <FaRandom className="w-4 h-4 mr-2" />
            {loading.aes ? "Generating..." : "Generate AES Key"}
          </button>
          {aesKey && (
            <div className="relative">
              <textarea
                readOnly
                value={aesKey}
                className="w-full h-24 p-2 bg-gray-900 text-gray-300 rounded-md font-mono text-sm"
              />
              <button
                onClick={() => handleCopy(aesKey, "AES key")}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                title="Copy to clipboard"
              >
                <FaCopy />
              </button>
            </div>
          )}
        </div>

        {/* RSA Key Generation */}
        <div className="space-y-4 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <FaKey className="w-5 h-5 mr-2" />
            RSA Keys
          </h3>
          <button
            onClick={generateRsaKeyPair}
            disabled={loading.rsa}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center disabled:opacity-50"
          >
            <FaKey className="w-4 h-4 mr-2" />
            {loading.rsa ? "Generating..." : "Generate RSA Keys"}
          </button>

          {rsaKeys.publicKey && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Public Key</label>
                <div className="relative">
                  <textarea
                    readOnly
                    value={rsaKeys.publicKey}
                    className="w-full h-24 p-2 bg-gray-900 text-gray-300 rounded-md font-mono text-sm"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={() => handleCopy(rsaKeys.publicKey, "Public key")}
                      className="text-gray-400 hover:text-white"
                      title="Copy to clipboard"
                    >
                      <FaCopy />
                    </button>
                    <button
                      onClick={() => downloadSingleKey(rsaKeys.publicKey, 'public-key.txt')}
                      className="text-gray-400 hover:text-white"
                      title="Download as file"
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Private Key</label>
                <div className="relative">
                  <textarea
                    readOnly
                    value={rsaKeys.privateKey}
                    className="w-full h-24 p-2 bg-gray-900 text-gray-300 rounded-md font-mono text-sm"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={() => handleCopy(rsaKeys.privateKey, "Private key")}
                      className="text-gray-400 hover:text-white"
                      title="Copy to clipboard"
                    >
                      <FaCopy />
                    </button>
                    <button
                      onClick={() => downloadSingleKey(rsaKeys.privateKey, 'private-key.txt')}
                      className="text-gray-400 hover:text-white"
                      title="Download as file"
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={downloadKeys}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Download Both Keys
              </button>
            </>
          )}
        </div>

        {/* Diffie-Hellman Simulation */}
        <div className="space-y-4 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <FaExchangeAlt className="w-5 h-5 mr-2" />
            Diffie-Hellman Simulation
          </h3>
          <button
            onClick={simulateDH}
            disabled={loading.dh}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center disabled:opacity-50"
          >
            <FaRandom className="w-4 h-4 mr-2" />
            {loading.dh ? "Simulating..." : "Simulate DH Exchange"}
          </button>
          {dhSharedSecret && (
            <div className="relative">
              <textarea
                readOnly
                value={dhSharedSecret}
                className="w-full h-24 p-2 bg-gray-900 text-gray-300 rounded-md font-mono text-sm"
              />
              <button
                onClick={() => handleCopy(dhSharedSecret, "DH Secret")}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                title="Copy to clipboard"
              >
                <FaCopy />
              </button>
            </div>
          )}
        </div>

        {/* Password Generation */}
        <div className="space-y-4 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <FaKey className="w-5 h-5 mr-2" />
            Password Generation
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300 flex items-center">
                <FaHashtag className="w-4 h-4 mr-2" />
                Password Length: {passwordLength}
              </label>
              <input
                type="range"
                min="8"
                max="64"
                value={passwordLength}
                onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="text-sm text-gray-300 flex items-center">
                  <FaFont className="w-3 h-3 mr-1" />
                  ABC
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="text-sm text-gray-300 flex items-center">
                  <FaHashtag className="w-3 h-3 mr-1" />
                  123
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="text-sm text-gray-300 flex items-center">
                  <FaAsterisk className="w-3 h-3 mr-1" />
                  @#$
                </span>
              </label>
            </div>
            <button
              onClick={generatePassword}
              disabled={loading.password}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center disabled:opacity-50"
            >
              <FaRandom className="w-4 h-4 mr-2" />
              {loading.password ? "Generating..." : "Generate Password"}
            </button>
            {password && (
              <div className="relative">
                <div className="p-4 bg-gray-900 rounded-md text-xl font-mono text-gray-300 text-center break-all">
                  {password}
                </div>
                <button
                  onClick={() => handleCopy(password, "Password")}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}