/**
 * cryptographic libraries
 * - web crypto api - https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
 * - PyCrypto: https://www.dlitz.net/software/pycrypto/api/2.6/
 * - cryptography.io: https://cryptography.io/en/latest/
 * - pycryptodome: https://pycryptodome.readthedocs.io/en/latest/
 */

"use client";

import { useState } from "react";
import { 
  FaLock, 
  FaUpload, 
  FaKey, 
  FaDownload,
} from "react-icons/fa";

export default function EncryptPage() {
  const [file, setFile] = useState(null);
  const [method, setMethod] = useState("aes");
  const [key, setKey] = useState("");
  const [aesKeySize, setAesKeySize] = useState("256");
  const [aesMode, setAesMode] = useState("cbc");
  const [encryptedFileUrl, setEncryptedFileUrl] = useState(null);
  const [encryptedFileName, setEncryptedFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const RSA_MAX_SIZE = 190; // the max size in bytes for RSA-2048 with OAEP padding

  const handleEncrypt = async () => {
    if (!file || (!key && method !== "rsa")) {
      setMessage({ text: "Please select a file and enter a key (except RSA).", type: "error" });
      return;
    }

    // check file size for RSA
    if (method === "rsa" && file.size > RSA_MAX_SIZE) {
      setMessage({ 
        text: `RSA encryption is limited to files smaller than ${RSA_MAX_SIZE} bytes. Your file is ${file.size} bytes. Please use AES or 3DES for larger files.`,
        type: "error"
      });
      return;
    }

    // check key length for 3DES
    if (method === "3des" && key.length < 16) {
      setMessage({ 
        text: `3DES key must be at least 16 characters long. Your key is ${key.length} characters.`, 
        type: "error" 
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("method", method);
    formData.append("key", key);

    // add AES params
    if (method === "aes") {
      formData.append("key_size", parseInt(aesKeySize));
      formData.append("block_mode", aesMode);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/encrypt`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `encrypted_${file.name}`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/["']/g, '');
      }
      
      setEncryptedFileName(filename);
      setEncryptedFileUrl(url);
      setMessage({ text: "File encrypted successfully!", type: "success" });
    } catch (err) {
      console.error("Encryption error:", err);
      setMessage({ text: "Error encrypting file: " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl">
        <div>
          <h1 className="text-3xl font-bold text-center text-white flex items-center justify-center">
            Encrypt File <FaLock className="ml-3 w-8 h-8" />
          </h1>
          <p className="mt-2 text-center text-gray-400">
            Encrypt your files using AES, 3DES, or RSA encryption
          </p>
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-md ${
              message.type === "error"
                ? "bg-red-500/10 text-red-500"
                : "bg-green-500/10 text-green-500"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <FaUpload className="w-4 h-4 mr-2" />
                Upload File
              </div>
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <FaLock className="w-4 h-4 mr-2" />
                Encryption Method
              </div>
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="aes">AES</option>
              <option value="3des">3DES</option>
              <option value="rsa">RSA (max file size: 190 bytes)</option>
            </select>
          </div>

          {method === "aes" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  <div className="flex items-center">
                    <FaKey className="w-4 h-4 mr-2" />
                    AES Key Size
                  </div>
                </label>
                <select
                  value={aesKeySize}
                  onChange={(e) => setAesKeySize(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="128">AES-128</option>
                  <option value="192">AES-192</option>
                  <option value="256">AES-256 (Recommended)</option>
                </select>
                <p className="mt-1 text-sm text-gray-400">
                  Larger key sizes provide stronger security but may be slightly slower
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  <div className="flex items-center">
                    <FaLock className="w-4 h-4 mr-2" />
                    Block Mode
                  </div>
                </label>
                <select
                  value={aesMode}
                  onChange={(e) => setAesMode(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cbc">CBC - Cipher Block Chaining</option>
                  <option value="gcm">GCM - Galois/Counter Mode (Authenticated)</option>
                </select>
                <p className="mt-1 text-sm text-gray-400">
                  GCM provides authentication and is recommended for most uses
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <FaKey className="w-4 h-4 mr-2" />
                {method === "rsa" ? "Public Key" : "Encryption Key"}
              </div>
            </label>
            {method === "rsa" ? (
              <textarea
                placeholder="Paste RSA public key here"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm h-32 font-mono focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <>
                <input
                  type="text"
                  placeholder={method === "3des" ? "Enter key (minimum 16 characters)" : "Enter key"}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                {method === "3des" && (
                  <p className="mt-1 text-sm text-gray-400">
                    Key must be at least 16 characters long
                  </p>
                )}
              </>
            )}
          </div>

          <button
            onClick={handleEncrypt}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
          >
            <FaLock className="w-4 h-4 mr-2" />
            {loading ? "Encrypting..." : "Encrypt File"}
          </button>

          {encryptedFileUrl && (
            <a
              href={encryptedFileUrl}
              download={encryptedFileName}
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center"
            >
              <FaDownload className="w-4 h-4 mr-2" />
              Download Encrypted File
            </a>
          )}
        </div>
      </div>
    </div>
  );
}