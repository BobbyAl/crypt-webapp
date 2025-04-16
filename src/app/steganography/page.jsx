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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SteganographyPage() {
  // Common state
  const [operation, setOperation] = useState("embed");
  const [loading, setLoading] = useState(false);
  const [outputFileUrl, setOutputFileUrl] = useState(null);
  const [outputFileName, setOutputFileName] = useState("");

  // Embed-specific state
  const [coverFileEmbed, setCoverFileEmbed] = useState(null);
  const [secretFile, setSecretFile] = useState(null);
  const [embedCapacity, setEmbedCapacity] = useState(null);

  // Extract-specific state
  const [carrierFile, setCarrierFile] = useState(null);

  // Steganography parameters
  const [mode, setMode] = useState("fixed");
  const [sValue, setSValue] = useState(0);
  const [lValue, setLValue] = useState(1);

  const checkCapacity = async () => {
    if (!coverFileEmbed) {
      alert("Please select a cover file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("cover_file", coverFileEmbed);
    formData.append("s", sValue);
    formData.append("l", lValue);

    try {
      const response = await fetch(`${API_URL}/steg/capacity`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setEmbedCapacity(data.capacity);
    } catch (err) {
      console.error("Capacity check error:", err);
      alert("Error checking capacity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmbed = async () => {
    if (!coverFileEmbed || !secretFile) {
      alert("Please select both cover and secret files.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("cover_file", coverFileEmbed);
    formData.append("secret_file", secretFile);
    formData.append("s", sValue);
    formData.append("l", lValue);
    formData.append("mode", mode);

    try {
      const response = await fetch(`${API_URL}/steg/embed`, {
        method: "POST",
        body: formData,
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `steg_${coverFileEmbed.name}`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/["']/g, '');
      }
      
      setOutputFileName(filename);
      setOutputFileUrl(url);
    } catch (err) {
      console.error("Embed error:", err);
      alert("Error embedding file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!carrierFile) {
      alert("Please select a carrier file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("carrier_file", carrierFile);
    formData.append("s", sValue);
    formData.append("l", lValue);
    formData.append("mode", mode);

    try {
      const response = await fetch(`${API_URL}/steg/extract`, {
        method: "POST",
        body: formData,
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `extracted_${carrierFile.name}`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/["']/g, '');
      }
      
      setOutputFileName(filename);
      setOutputFileUrl(url);
    } catch (err) {
      console.error("Extract error:", err);
      alert("Error extracting file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderEmbedSection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300">
          <div className="flex items-center">
            <FaImage className="w-4 h-4 mr-2" />
            Cover File (Image)
          </div>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFileEmbed(e.target.files[0])}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          <div className="flex items-center">
            <FaFile className="w-4 h-4 mr-2" />
            Secret File
          </div>
        </label>
        <input
          type="file"
          onChange={(e) => setSecretFile(e.target.files[0])}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        onClick={checkCapacity}
        disabled={loading || !coverFileEmbed}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
      >
        <FaSearch className="w-4 h-4 mr-2" />
        {loading ? "Checking..." : "Check Capacity"}
      </button>

      {embedCapacity !== null && (
        <div className="p-4 rounded-md bg-gray-900/50 text-gray-300">
          Available Capacity: {embedCapacity} bits ({Math.floor(embedCapacity / 8)} bytes)
        </div>
      )}

      <button
        onClick={handleEmbed}
        disabled={loading || !coverFileEmbed || !secretFile}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
      >
        <FaEye className="w-4 h-4 mr-2" />
        {loading ? "Embedding..." : "Embed File"}
      </button>
    </div>
  );

  const renderExtractSection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300">
          <div className="flex items-center">
            <FaImage className="w-4 h-4 mr-2" />
            Carrier File (Image with hidden data)
          </div>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCarrierFile(e.target.files[0])}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        onClick={handleExtract}
        disabled={loading || !carrierFile}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
      >
        <FaEyeSlash className="w-4 h-4 mr-2" />
        {loading ? "Extracting..." : "Extract Hidden File"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl">
        <div>
          <h1 className="text-3xl font-bold text-center text-white flex items-center justify-center">
            Steganography <FaEyeSlash className="ml-3 w-8 h-8" />
          </h1>
          <p className="mt-2 text-center text-gray-400">
            Hide and extract files within images using steganography
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <FaCog className="w-4 h-4 mr-2" />
                Operation
              </div>
            </label>
            <select
              value={operation}
              onChange={(e) => {
                setOperation(e.target.value);
                setOutputFileUrl(null);
                setOutputFileName("");
                setEmbedCapacity(null);
              }}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="embed">Embed Secret File</option>
              <option value="extract">Extract Hidden File</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <FaCog className="w-4 h-4 mr-2" />
                Mode
              </div>
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="fixed">Fixed</option>
              <option value="variable">Variable</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                S Value (Start Position)
              </label>
              <input
                type="number"
                min="0"
                value={sValue}
                onChange={(e) => setSValue(parseInt(e.target.value))}
                className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                L Value (Periodicity)
              </label>
              <input
                type="number"
                min="1"
                value={lValue}
                onChange={(e) => setLValue(parseInt(e.target.value))}
                className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {operation === "embed" ? renderEmbedSection() : renderExtractSection()}

          {outputFileUrl && (
            <a
              href={outputFileUrl}
              download={outputFileName}
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center"
            >
              <FaDownload className="w-4 h-4 mr-2" />
              Download {operation === "embed" ? "Carrier" : "Extracted"} File
            </a>
          )}
        </div>
      </div>
    </div>
  );
} 