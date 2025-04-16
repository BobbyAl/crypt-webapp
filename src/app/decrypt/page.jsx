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
  FaLockOpen, 
  FaUpload, 
  FaKey, 
  FaDownload,
} from "react-icons/fa";

export default function DecryptPage() {
  const [file, setFile] = useState(null);
  const [method, setMethod] = useState("aes");
  const [key, setKey] = useState("");
  const [aesKeySize, setAesKeySize] = useState("256");
  const [aesMode, setAesMode] = useState("cbc");
  const [decryptedFileUrl, setDecryptedFileUrl] = useState(null);
  const [decryptedFileName, setDecryptedFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleDecrypt = async () => {
    if (!file || (!key && method !== "rsa")) {
      setMessage({ text: "Please select a file and enter a key (except RSA).", type: "error" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("method", method);
    formData.append("key", key);

    // add AES-specific params
    if (method === "aes") {
      formData.append("key_size", parseInt(aesKeySize));
      formData.append("block_mode", aesMode);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/decrypt`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = file.name.replace('encrypted_', '');
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/["']/g, '');
      }
      
      setDecryptedFileName(filename);
      setDecryptedFileUrl(url);
      setMessage({ text: "File decrypted successfully!", type: "success" });
    } catch (err) {
      console.error("Decryption error:", err);
      setMessage({ text: "Error decrypting file: " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl">
        <div>
          <h1 className="text-3xl font-bold text-center text-white flex items-center justify-center">
            Decrypt File <FaLockOpen className="ml-3 w-8 h-8" />
          </h1>
          <p className="mt-2 text-center text-gray-400">
            Decrypt your files using AES, 3DES, or RSA decryption
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
                <FaLockOpen className="w-4 h-4 mr-2" />
                Decryption Method
              </div>
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="aes">AES</option>
              <option value="3des">3DES</option>
              <option value="rsa">RSA</option>
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
                  <option value="256">AES-256</option>
                </select>
                <p className="mt-1 text-sm text-gray-400">
                  Must match the key size used for encryption
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  <div className="flex items-center">
                    <FaLockOpen className="w-4 h-4 mr-2" />
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
                  Must match the mode used for encryption
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <FaKey className="w-4 h-4 mr-2" />
                {method === "rsa" ? "Private Key" : "Decryption Key"}
              </div>
            </label>
            {method === "rsa" ? (
              <textarea
                placeholder="Paste RSA private key here"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm h-32 font-mono focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <input
                type="text"
                placeholder="Enter key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>

          <button
            onClick={handleDecrypt}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
          >
            <FaLockOpen className="w-4 h-4 mr-2" />
            {loading ? "Decrypting..." : "Decrypt File"}
          </button>

          {decryptedFileUrl && (
            <a
              href={decryptedFileUrl}
              download={decryptedFileName}
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center"
            >
              <FaDownload className="w-4 h-4 mr-2" />
              Download Decrypted File
            </a>
          )}
        </div>
      </div>
    </div>
  );
}