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
  const [encryptedFileUrl, setEncryptedFileUrl] = useState(null);
  const [encryptedFileName, setEncryptedFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const RSA_MAX_SIZE = 190; // Maximum size in bytes for RSA-2048 with OAEP padding

  const handleEncrypt = async () => {
    if (!file || (!key && method !== "rsa")) {
      setMessage({ text: "Please select a file and enter a key (except RSA).", type: "error" });
      return;
    }

    // Check file size for RSA
    if (method === "rsa" && file.size > RSA_MAX_SIZE) {
      setMessage({ 
        text: `RSA encryption is limited to files smaller than ${RSA_MAX_SIZE} bytes. Your file is ${file.size} bytes. Please use AES or 3DES for larger files.`,
        type: "error"
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("method", method);
    formData.append("key", key);

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
      
      // Get filename from Content-Disposition header or create one from original
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-xl">
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