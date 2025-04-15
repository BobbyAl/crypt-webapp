"use client";

import { useState } from "react";
import { auth, db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  FaKey,
  FaCopy,
  FaRandom,
  FaLock,
  FaExchangeAlt,
  FaCheck,
  FaTimes,
  FaFont,
  FaHashtag,
  FaAsterisk
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
  const [copyFeedback, setCopyFeedback] = useState("");
  const [loading, setLoading] = useState({
    aes: false,
    rsa: false,
    dh: false,
    password: false
  });

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

      const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      const pubBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
      const privBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));

      setRsaKeys({ publicKey: pubBase64, privateKey: privBase64 });

      // Encrypt private key before storing
      const encryptionKey = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt"]
      );
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedPrivateKey = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        encryptionKey,
        new TextEncoder().encode(privBase64)
      );

      // Store encrypted private key
      await addDoc(collection(db, "files"), {
        filename: "rsa_private_key",
        method: "RSA",
        user: auth.currentUser?.email || "anonymous",
        timestamp: serverTimestamp(),
        type: "key",
        content: btoa(String.fromCharCode(...new Uint8Array(encryptedPrivateKey))),
        iv: btoa(String.fromCharCode(...iv))
      });
    } catch (error) {
      console.error('RSA Key Generation Error:', error);
      setCopyFeedback('Failed to generate RSA keys');
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
      const selectedSets = [];
      if (includeUppercase) selectedSets.push(uppercase);
      if (includeNumbers) selectedSets.push(numbers);
      if (includeSymbols) selectedSets.push(symbols);

      // If no character types are selected, show alert
      if (selectedSets.length === 0) {
        alert("Please select at least one character type (uppercase, numbers, or symbols)");
        return;
      }

      // Join all selected character sets
      const chars = selectedSets.join('');
      
      // Generate password using cryptographically secure random values
      let generated = "";
      const array = new Uint32Array(passwordLength);
      crypto.getRandomValues(array);
      
      // Ensure at least one character from each selected set
      const password = new Array(passwordLength);
      let currentIndex = 0;
      
      // Add one character from each selected set
      if (includeUppercase) {
        const randomIndex = array[currentIndex] % uppercase.length;
        password[currentIndex] = uppercase[randomIndex];
        currentIndex++;
      }
      if (includeNumbers) {
        const randomIndex = array[currentIndex] % numbers.length;
        password[currentIndex] = numbers[randomIndex];
        currentIndex++;
      }
      if (includeSymbols) {
        const randomIndex = array[currentIndex] % symbols.length;
        password[currentIndex] = symbols[randomIndex];
        currentIndex++;
      }
      
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

  return (
    <div className="flex items-center justify-center py-12 px-6">
      <div className="bg-[#111827] rounded-2xl shadow-xl p-10 max-w-xl w-full text-white">
        <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
          Key Generation <FaKey className="ml-3 w-8 h-8" />
        </h1>

        {/* Copy feedback message */}
        {copyFeedback && (
          <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <span className="mr-2">{copyFeedback}</span>
          </div>
        )}

        {/* AES Key Generation */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaLock className="w-5 h-5 mr-2" />
            AES Key
          </h2>
          <div className="flex space-x-4">
            <button
              onClick={generateAesKey}
              disabled={loading.aes}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition flex items-center justify-center"
            >
              <FaRandom className="w-4 h-4 mr-2" />
              {loading.aes ? "Generating..." : "Generate AES Key"}
            </button>
            {aesKey && (
              <button
                onClick={() => handleCopy(aesKey, "AES Key")}
                className="px-4 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center justify-center"
              >
                <FaCopy className="w-4 h-4" />
              </button>
            )}
          </div>
          {aesKey && (
            <textarea
              readOnly
              value={aesKey}
              className="mt-2 w-full p-2 bg-gray-900 rounded text-sm font-mono"
              rows={2}
            />
          )}
        </div>

        {/* RSA Key Generation */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaKey className="w-5 h-5 mr-2" />
            RSA Key Pair
          </h2>
          <button
            onClick={generateRsaKeyPair}
            disabled={loading.rsa}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition flex items-center justify-center"
          >
            <FaRandom className="w-4 h-4 mr-2" />
            {loading.rsa ? "Generating..." : "Generate RSA Keys"}
          </button>
          {rsaKeys.publicKey && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Public Key:</span>
                <button
                  onClick={() => handleCopy(rsaKeys.publicKey, "Public Key")}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded flex items-center"
                >
                  <FaCopy className="w-3 h-3" />
                </button>
              </div>
              <textarea
                readOnly
                value={rsaKeys.publicKey}
                className="w-full p-2 bg-gray-900 rounded text-sm font-mono"
                rows={3}
              />
            </div>
          )}
          {rsaKeys.privateKey && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Private Key:</span>
                <button
                  onClick={() => handleCopy(rsaKeys.privateKey, "Private Key")}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded flex items-center"
                >
                  <FaCopy className="w-3 h-3" />
                </button>
              </div>
              <textarea
                readOnly
                value={rsaKeys.privateKey}
                className="w-full p-2 bg-gray-900 rounded text-sm font-mono"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Diffie-Hellman Simulation */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaExchangeAlt className="w-5 h-5 mr-2" />
            Diffie-Hellman Simulation
          </h2>
          <button
            onClick={simulateDH}
            disabled={loading.dh}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition flex items-center justify-center"
          >
            <FaRandom className="w-4 h-4 mr-2" />
            {loading.dh ? "Simulating..." : "Simulate DH Exchange"}
          </button>
          {dhSharedSecret && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Shared Secret:</span>
                <button
                  onClick={() => handleCopy(dhSharedSecret, "DH Secret")}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded flex items-center"
                >
                  <FaCopy className="w-3 h-3" />
                </button>
              </div>
              <textarea
                readOnly
                value={dhSharedSecret}
                className="w-full p-2 bg-gray-900 rounded text-sm font-mono"
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Password Generation */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaKey className="w-5 h-5 mr-2" />
            Password Generation
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 flex items-center">
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
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="form-checkbox"
              />
              <span className="text-sm flex items-center">
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
              <span className="text-sm flex items-center">
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
              <span className="text-sm flex items-center">
                <FaAsterisk className="w-3 h-3 mr-1" />
                @#$
              </span>
            </label>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={generatePassword}
              disabled={loading.password}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition flex items-center justify-center"
            >
              <FaRandom className="w-4 h-4 mr-2" />
              {loading.password ? "Generating..." : "Generate Password"}
            </button>
            {password && (
              <button
                onClick={() => handleCopy(password, "Password")}
                className="px-4 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center justify-center"
              >
                <FaCopy className="w-4 h-4" />
              </button>
            )}
          </div>
          {password && (
            <div className="mt-4 p-4 bg-gray-900 rounded text-xl font-mono text-center break-all">
              {password}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}