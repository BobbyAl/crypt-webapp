/**
 * cryptographic libraries
 * - hashlib (Python standard library) - https://docs.python.org/3/library/hashlib.html
 */

"use client";

import { useState } from "react";
import { 
  FaHashtag,
  FaUpload,
  FaEquals,
  FaCheck,
  FaTimes,
  FaFlask
} from "react-icons/fa";

export default function HashPage() {
  const [file, setFile] = useState(null);
  const [method, setMethod] = useState("sha256");
  const [hashResult, setHashResult] = useState("");
  const [secondFile, setSecondFile] = useState(null);
  const [secondHash, setSecondHash] = useState("");
  const [compareResult, setCompareResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleHash = async () => {
    if (!file) {
      alert("Please select a file to hash.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("method", method);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hash`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHashResult(data.hash);
      setCompareResult(null);
    } catch (err) {
      console.error("Hash error:", err);
      alert("Error generating hash: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!file || !secondFile) {
      alert("Please select both files to compare.");
      return;
    }

    setLoading(true);
    const formData1 = new FormData();
    formData1.append("file", file);
    formData1.append("method", method);

    const formData2 = new FormData();
    formData2.append("file", secondFile);
    formData2.append("method", method);

    try {
      const [res1, res2] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/hash`, { 
          method: "POST", 
          body: formData1 
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/hash`, { 
          method: "POST", 
          body: formData2 
        }),
      ]);

      if (!res1.ok || !res2.ok) {
        throw new Error(`HTTP error! status: ${!res1.ok ? res1.status : res2.status}`);
      }

      const data1 = await res1.json();
      const data2 = await res2.json();

      setHashResult(data1.hash);
      setSecondHash(data2.hash);
      setCompareResult(data1.hash === data2.hash);
    } catch (err) {
      console.error("Compare error:", err);
      alert("Error comparing hashes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl">
        <div>
          <h1 className="text-3xl font-bold text-center text-white flex items-center justify-center">
            Hash File <FaFlask className="ml-3 w-8 h-8" />
          </h1>
          <p className="mt-2 text-center text-gray-400">
            Generate and compare file hashes using SHA-256 or SHA3-512
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <FaHashtag className="w-4 h-4 mr-2" />
                Hash Method
              </div>
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="sha256">SHA-256</option>
              <option value="sha3_512">SHA3-512</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <FaUpload className="w-4 h-4 mr-2" />
                Upload First File
              </div>
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleHash}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
          >
            <FaHashtag className="w-4 h-4 mr-2" />
            {loading ? "Generating..." : "Generate Hash"}
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <FaUpload className="w-4 h-4 mr-2" />
                Upload Second File (for comparison)
              </div>
            </label>
            <input
              type="file"
              onChange={(e) => setSecondFile(e.target.files[0])}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleCompare}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
          >
            <FaEquals className="w-4 h-4 mr-2" />
            {loading ? "Comparing..." : "Compare File Hashes"}
          </button>

          {/* display single hash result */}
          {hashResult && compareResult === null && (
            <div className="p-4 rounded-md bg-gray-900/50">
              <div className="flex items-center text-sm text-gray-300 break-all font-mono">
                <FaHashtag className="w-3 h-3 mr-2 flex-shrink-0" />
                <span>Hash: {hashResult}</span>
              </div>
            </div>
          )}

          {compareResult !== null && (
            <div className="p-4 rounded-md bg-gray-900/50 space-y-4">
              <div className="flex items-center text-sm text-gray-300 break-all font-mono">
                <FaHashtag className="w-3 h-3 mr-2 flex-shrink-0" />
                <span>File 1 Hash: {hashResult}</span>
              </div>
              <div className="flex items-center text-sm text-gray-300 break-all font-mono">
                <FaHashtag className="w-3 h-3 mr-2 flex-shrink-0" />
                <span>File 2 Hash: {secondHash}</span>
              </div>
              <div
                className={`font-bold flex items-center ${
                  compareResult ? "text-green-400" : "text-red-400"
                }`}
              >
                {compareResult ? (
                  <>
                    <FaCheck className="w-4 h-4 mr-2" />
                    Hashes match
                  </>
                ) : (
                  <>
                    <FaTimes className="w-4 h-4 mr-2" />
                    Hashes do not match
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}