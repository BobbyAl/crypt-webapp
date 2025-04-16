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

  // Files
  const [carrierFile, setCarrierFile] = useState(null);
  const [messageFile, setMessageFile] = useState(null);

  // Steganography parameters
  const [mode, setMode] = useState("fixed");
  const [sValue, setSValue] = useState(0);
  const [lValue, setLValue] = useState(1);

  const handleEmbed = async () => {
    if (!carrierFile || !messageFile) {
      alert("Please select both carrier and message files.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("cover_file", carrierFile);
    formData.append("secret_file", messageFile);
    formData.append("s", sValue);
    formData.append("l", lValue);
    formData.append("mode", mode);

    try {
      const response = await fetch(`${API_URL}/steg/embed`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Keep the original carrier file extension
      const extension = carrierFile.name.split('.').pop();
      const filename = `modified_${carrierFile.name}`;
      
      setOutputFileName(filename);
      setOutputFileUrl(url);
    } catch (err) {
      console.error("Embed error:", err);
      alert("Error embedding message: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!carrierFile) {
      alert("Please select the carrier file containing the hidden message.");
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      setOutputFileName("extracted_message.txt");
      setOutputFileUrl(url);
    } catch (err) {
      console.error("Extract error:", err);
      alert("Error extracting message: " + err.message);
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
            Carrier Image File (BMP recommended)
          </div>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCarrierFile(e.target.files[0])}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-400">
          Select an image file to hide the message in
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          <div className="flex items-center">
            <FaFile className="w-4 h-4 mr-2" />
            Message File
          </div>
        </label>
        <input
          type="file"
          onChange={(e) => setMessageFile(e.target.files[0])}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-400">
          Select the file to hide in the carrier image
        </p>
      </div>

      <button
        onClick={handleEmbed}
        disabled={loading || !carrierFile || !messageFile}
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
            Modified Carrier File
          </div>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCarrierFile(e.target.files[0])}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-400">
          Select the modified image file containing the hidden message
        </p>
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
                setCarrierFile(null);
                setMessageFile(null);
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
            <p className="mt-1 text-sm text-gray-400">
              Must use the same mode for embedding and extracting
            </p>
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
              <p className="mt-1 text-sm text-gray-400">
                Must match for extract
              </p>
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
              <p className="mt-1 text-sm text-gray-400">
                Must match for extract
              </p>
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
              Download {operation === "embed" ? "Modified Carrier" : "Extracted"} File
            </a>
          )}
        </div>
      </div>
    </div>
  );
} 