"use client";
// https://react-icons.github.io/react-icons/icons?name=fa - for icons used

import { useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaDownload,
  FaImage,
  FaFile,
  FaCog,
  FaExchangeAlt,
  FaSearch
} from "react-icons/fa";

// API base URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
console.log('API URL:', API_URL); // Debug log

export default function SteganographyPage() {
  // State management for file handling and UI
  const [coverFile, setCoverFile] = useState(null);
  const [secretFile, setSecretFile] = useState(null);
  const [mode, setMode] = useState("fixed");
  const [sValue, setSValue] = useState(0);
  const [lValue, setLValue] = useState(1);
  const [operation, setOperation] = useState("embed");
  const [capacity, setCapacity] = useState(null);
  const [outputFileUrl, setOutputFileUrl] = useState(null);
  const [outputFileName, setOutputFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const checkCapacity = async () => {
    if (!coverFile) {
      alert("Please select a cover file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", coverFile);
    formData.append("s", sValue);
    formData.append("l", lValue);

    try {
      const response = await fetch(`${API_URL}/steg/capacity`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setCapacity(data.capacity);
    } catch (err) {
      console.error("Capacity check error:", err);
      alert("Error checking capacity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOperation = async () => {
    if (!coverFile || (operation === "embed" && !secretFile)) {
      alert("Please select all required files.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("cover_file", coverFile);
    if (operation === "embed") {
      formData.append("secret_file", secretFile);
    }
    formData.append("s", sValue);
    formData.append("l", lValue);
    formData.append("mode", mode);

    try {
      const endpoint = operation === "embed" ? "/steg/embed" : "/steg/extract";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = operation === "embed" ? `steg_${coverFile.name}` : `extracted_${coverFile.name}`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/["']/g, '');
      }
      
      setOutputFileName(filename);
      setOutputFileUrl(url);
    } catch (err) {
      console.error("Operation error:", err);
      alert("Error performing steganography operation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-6">
      <div className="bg-[#111827] rounded-2xl shadow-xl p-10 max-w-xl w-full text-white">
        <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
          Steganography <FaEyeSlash className="ml-3 w-8 h-8" />
        </h1>

        {/* Operation Select */}
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          <div className="flex items-center">
            <FaCog className="w-4 h-4 mr-2" />
            Operation
          </div>
        </label>
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          className="mb-4 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
        >
          <option value="embed">Embed Secret File</option>
          <option value="extract">Extract Hidden File</option>
        </select>

        {/* Cover File Upload */}
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          <div className="flex items-center">
            <FaImage className="w-4 h-4 mr-2" />
            Cover File
          </div>
        </label>
        <input
          type="file"
          onChange={(e) => setCoverFile(e.target.files[0])}
          className="mb-4 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
        />

        {/* Secret File Upload (only for embed) */}
        {operation === "embed" && (
          <>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              <div className="flex items-center">
                <FaUpload className="w-4 h-4 mr-2" />
                Secret File
              </div>
            </label>
            <input
              type="file"
              onChange={(e) => setSecretFile(e.target.files[0])}
              className="mb-4 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
            />
          </>
        )}

        {/* Mode Select */}
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          <div className="flex items-center">
            <FaCog className="w-4 h-4 mr-2" />
            Mode
          </div>
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="mb-4 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
        >
          <option value="fixed">Fixed</option>
          <option value="variable">Variable</option>
        </select>

        {/* S and L Parameters */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              S Value (Start Position)
            </label>
            <input
              type="number"
              min="0"
              value={sValue}
              onChange={(e) => setSValue(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              L Value (Periodicity)
            </label>
            <input
              type="number"
              min="1"
              value={lValue}
              onChange={(e) => setLValue(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
            />
          </div>
        </div>

        {/* Check Capacity Button */}
        <button
          onClick={checkCapacity}
          disabled={loading || !coverFile}
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
        >
          <FaSearch className="w-4 h-4 mr-2" />
          {loading ? "Checking..." : "Check Capacity"}
        </button>

        {/* Capacity Display */}
        {capacity !== null && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg text-white">
            Available Capacity: {capacity} bits ({Math.floor(capacity / 8)} bytes)
          </div>
        )}

        {/* Operation Button */}
        <button
          onClick={handleOperation}
          disabled={loading || !coverFile || (operation === "embed" && !secretFile)}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
        >
          <FaEye className="w-4 h-4 mr-2" />
          {loading ? "Processing..." : (operation === "embed" ? "Embed File" : "Extract File")}
        </button>

        {/* Download Output File */}
        {outputFileUrl && (
          <a
            href={outputFileUrl}
            download={outputFileName}
            className="block mt-6 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition flex items-center justify-center"
          >
            <FaDownload className="w-4 h-4 mr-2" />
            Download {operation === "embed" ? "Carrier" : "Extracted"} File
          </a>
        )}
      </div>
    </div>
  );
} 