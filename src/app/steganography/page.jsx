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
  FaExchangeAlt
} from "react-icons/fa";

// API base URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SteganographyPage() {
  // State management for file handling and UI
  const [carrierFile, setCarrierFile] = useState(null);
  const [messageFile, setMessageFile] = useState(null);
  const [startingBit, setStartingBit] = useState(0);
  const [periodicity, setPeriodicity] = useState(1);
  const [mode, setMode] = useState("fixed");
  const [resultFileUrl, setResultFileUrl] = useState(null);
  const [resultFileName, setResultFileName] = useState("");
  const [operation, setOperation] = useState("embed");
  const [loading, setLoading] = useState(false);

  // Handles embedding a message into a carrier file
  const handleEmbed = async () => {
    if (!carrierFile || !messageFile) {
      alert("Please select both carrier and message files.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("carrier_file", carrierFile);
    formData.append("message_file", messageFile);
    formData.append("S", startingBit);
    formData.append("L", periodicity);
    formData.append("mode", mode);

    try {
      const response = await fetch(`${API_URL}/steg/embed`, {
        method: "POST",
        body: formData,
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from Content-Disposition header or create one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `steg_${carrierFile.name}`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/["']/g, '');
      }
      
      setResultFileName(filename);
      setResultFileUrl(url);
    } catch (err) {
      console.error("Steganography error:", err);
      alert("Failed to embed message. Please check file sizes and parameters.");
    } finally {
      setLoading(false);
    }
  };

  // Handles extracting a hidden message from a carrier file
  const handleExtract = async () => {
    if (!carrierFile) {
      alert("Please select a carrier file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("carrier_file", carrierFile);
    formData.append("S", startingBit);
    formData.append("L", periodicity);
    formData.append("mode", mode);

    try {
      const response = await fetch(`${API_URL}/steg/extract`, {
        method: "POST",
        body: formData,
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from Content-Disposition header or create one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `extracted_message.bin`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/["']/g, '');
      }
      
      setResultFileName(filename);
      setResultFileUrl(url);
    } catch (err) {
      console.error("Steganography error:", err);
      alert("Failed to extract message. Please check parameters.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-6">
      <div className="bg-[#111827] rounded-2xl shadow-xl p-10 max-w-xl w-full text-white">
        <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
          Steganography {operation === "embed" ? <FaEyeSlash className="ml-3 w-8 h-8" /> : <FaEye className="ml-3 w-8 h-8" />}
        </h1>

        {/* Operation mode selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaExchangeAlt className="w-5 h-5 mr-2" />
            Operation Mode
          </h2>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
          >
            <option value="embed">Embed Message</option>
            <option value="extract">Extract Message</option>
          </select>
        </div>

        {/* Carrier file input section */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2 flex items-center">
            <FaImage className="w-4 h-4 mr-2" />
            Carrier File
          </label>
          <input
            type="file"
            onChange={(e) => setCarrierFile(e.target.files[0])}
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
          />
        </div>

        {/* Message file input (only shown for embed operation) */}
        {operation === "embed" && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 flex items-center">
              <FaFile className="w-4 h-4 mr-2" />
              Message File
            </label>
            <input
              type="file"
              onChange={(e) => setMessageFile(e.target.files[0])}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
            />
          </div>
        )}

        {/* Steganography parameters configuration */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCog className="w-5 h-5 mr-2" />
            Parameters
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Starting Bit (S)</label>
              <input
                type="number"
                min="0"
                value={startingBit}
                onChange={(e) => setStartingBit(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Periodicity (L)</label>
              <input
                type="number"
                min="1"
                value={periodicity}
                onChange={(e) => setPeriodicity(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-sm text-white"
            >
              <option value="fixed">Fixed</option>
              <option value="variable">Variable</option>
            </select>
          </div>
        </div>

        {/* Main action button for embed/extract */}
        <button
          onClick={operation === "embed" ? handleEmbed : handleExtract}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
        >
          {operation === "embed" ? (
            <FaEyeSlash className="w-4 h-4 mr-2" />
          ) : (
            <FaEye className="w-4 h-4 mr-2" />
          )}
          {loading
            ? "Processing..."
            : operation === "embed"
            ? "Embed Message"
            : "Extract Message"}
        </button>

        {/* Download section for results */}
        {resultFileUrl && (
          <a
            href={resultFileUrl}
            download={resultFileName}
            className="block mt-6 text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition flex items-center justify-center"
          >
            <FaDownload className="w-4 h-4 mr-2" />
            Download {operation === "embed" ? "Steganographic File" : "Extracted Message"}
          </a>
        )}
      </div>
    </div>
  );
} 