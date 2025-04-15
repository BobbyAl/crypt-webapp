"use client";

import { useState } from "react";
import { auth, db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  FaLock, 
  FaUpload, 
  FaKey, 
  FaDownload,
  FaSave
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

  const handleSaveFile = async () => {
    if (!auth.currentUser) {
      setMessage({ text: "Please login to save files", type: "error" });
      return;
    }

    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "files"), {
        name: encryptedFileName,
        type: "encrypted",
        method: method.toUpperCase(),
        createdAt: serverTimestamp()
      });
      setMessage({ text: "File saved to account!", type: "success" });
    } catch (error) {
      console.error("Error saving file:", error);
      setMessage({ text: "Failed to save file", type: "error" });
    }
  };

  const handleEncrypt = async () => {
    if (!file || (!key && method !== "rsa")) {
      alert("Please select a file and enter a key (except RSA).");
      return;
    }

    // Check file size for RSA
    if (method === "rsa" && file.size > RSA_MAX_SIZE) {
      alert(`RSA encryption is limited to files smaller than ${RSA_MAX_SIZE} bytes. Your file is ${file.size} bytes. Please use AES or 3DES for larger files.`);
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
    } catch (err) {
      console.error("Encryption error:", err);
      setMessage({ text: "Error encrypting file: " + err.message, type: "error" });
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

        {message.text && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "error"
                ? "bg-red-500/10 text-red-500"
                : "bg-green-500/10 text-green-500"
            }`}
          >
            {message.text}
          </div>
        )}

        <label className="block text-sm font-semibold mb-2 text-gray-300">
          <div className="flex items-center">
            <FaUpload className="w-4 h-4 mr-2" />
            Upload File
          </div>
        </label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm"
        />

        <label className="block text-sm font-semibold mb-2 text-gray-300">
          <div className="flex items-center">
            <FaLock className="w-4 h-4 mr-2" />
            Encryption Method
          </div>
        </label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="mb-4 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm"
        >
          <option value="aes">AES</option>
          <option value="3des">3DES</option>
          <option value="rsa">RSA (max file size: 190 bytes)</option>
        </select>

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
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="mb-6 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm h-32 font-mono"
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
              className="mb-6 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm"
            />
          </>
        )}

        <button
          onClick={handleEncrypt}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
        >
          <FaLock className="w-4 h-4 mr-2" />
          {loading ? "Encrypting..." : "Encrypt"}
        </button>

        {encryptedFileUrl && (
          <div className="mt-6 space-y-4">
            <a
              href={encryptedFileUrl}
              download={encryptedFileName}
              className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition flex items-center justify-center"
            >
              <FaDownload className="w-4 h-4 mr-2" />
              Download Encrypted File
            </a>
            
            <button
              onClick={handleSaveFile}
              disabled={!auth.currentUser}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center disabled:opacity-50"
            >
              <FaSave className="w-4 h-4 mr-2" />
              {auth.currentUser ? "Save to Account" : "Login to Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}