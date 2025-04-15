"use client";

import { useState } from "react";
import { 
  FaLock, 
  FaUpload, 
  FaKey, 
  FaDownload 
} from "react-icons/fa";

export default function EncryptPage() {
  const [file, setFile] = useState(null);
  const [method, setMethod] = useState("aes");
  const [key, setKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [encryptedFileUrl, setEncryptedFileUrl] = useState(null);
  const [encryptedFileName, setEncryptedFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEncrypt = async () => {
    if (!file) {
      alert("Please select a file to encrypt.");
      return;
    }
    
    if (method === "rsa" && !publicKey) {
      alert("Please enter a public key for RSA encryption.");
      return;
    }
    
    if (method !== "rsa" && !key) {
      alert("Please enter an encryption key.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("method", method);
    formData.append("key", method === "rsa" ? publicKey : key);

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
    } catch (err) {
      console.error("Encryption error:", err);
      alert("Error encrypting file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-6">
      <div className="bg-[#111827] rounded-2xl shadow-xl p-10 max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-white flex items-center justify-center">
          Encrypt File <FaLock className="ml-3 w-8 h-8" />
        </h1>

        {/* Upload File */}
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          <div className="flex items-center">
            <FaUpload className="w-4 h-4 mr-2" />
            Upload File
          </div>
        </label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
        />

        {/* Method Select */}
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          <div className="flex items-center">
            <FaLock className="w-4 h-4 mr-2" />
            Encryption Method
          </div>
        </label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="mb-4 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
        >
          <option value="aes">AES</option>
          <option value="3des">3DES</option>
          <option value="rsa">RSA</option>
        </select>

        {/* Key input */}
        {method === "rsa" ? (
          <>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              <div className="flex items-center">
                <FaKey className="w-4 h-4 mr-2" />
                Public Key
              </div>
            </label>
            <textarea
              placeholder="Paste RSA public key here"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="mb-6 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white h-32 font-mono"
            />
          </>
        ) : (
          <>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              <div className="flex items-center">
                <FaKey className="w-4 h-4 mr-2" />
                Encryption Key
              </div>
            </label>
            <input
              type="text"
              placeholder="Enter key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="mb-6 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
            />
          </>
        )}

        {/* Encrypt Button */}
        <button
          onClick={handleEncrypt}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaLock className="w-4 h-4 mr-2" />
          {loading ? "Encrypting..." : "Encrypt"}
        </button>

        {/* Download Encrypted File */}
        {encryptedFileUrl && (
          <a
            href={encryptedFileUrl}
            download={encryptedFileName}
            className="block mt-6 text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition flex items-center justify-center"
          >
            <FaDownload className="w-4 h-4 mr-2" />
            Download Encrypted File
          </a>
        )}
      </div>
    </div>
  );
}