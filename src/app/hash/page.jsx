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

  const handleHash = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("method", method);

    const response = await fetch("http://localhost:5000/hash", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setHashResult(data.hash);
  };

  const handleCompare = async () => {
    if (!file || !secondFile) return;

    const formData1 = new FormData();
    formData1.append("file", file);
    formData1.append("method", method);

    const formData2 = new FormData();
    formData2.append("file", secondFile);
    formData2.append("method", method);

    const [res1, res2] = await Promise.all([
      fetch("http://localhost:5000/hash", { method: "POST", body: formData1 }),
      fetch("http://localhost:5000/hash", { method: "POST", body: formData2 }),
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();

    setHashResult(data1.hash);
    setSecondHash(data2.hash);
    setCompareResult(data1.hash === data2.hash);
  };

  return (
    <div className="flex items-center justify-center py-12 px-6">
      <div className="bg-[#111827] rounded-2xl shadow-xl p-10 max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-white flex items-center justify-center">
          Hash File <FaFlask className="ml-3 w-8 h-8" />
        </h1>

        <label className="block text-sm font-semibold mb-2 text-gray-300">
          <div className="flex items-center">
            <FaHashtag className="w-4 h-4 mr-2" />
            Hash Method
          </div>
        </label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="mb-4 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm"
        >
          <option value="sha256">SHA-256</option>
          <option value="sha3_512">SHA3-512</option>
        </select>

        <label className="block text-sm font-semibold mb-2 text-gray-300">
          <div className="flex items-center">
            <FaUpload className="w-4 h-4 mr-2" />
            Upload First File
          </div>
        </label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm"
        />
        <button
          onClick={handleHash}
          className="mb-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center"
        >
          <FaHashtag className="w-4 h-4 mr-2" />
          Generate Hash
        </button>

        <label className="block text-sm font-semibold mb-2 text-gray-300">
          <div className="flex items-center">
            <FaUpload className="w-4 h-4 mr-2" />
            Upload Second File (for comparison)
          </div>
        </label>
        <input
          type="file"
          onChange={(e) => setSecondFile(e.target.files[0])}
          className="mb-4 w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white text-sm"
        />
        <button
          onClick={handleCompare}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center"
        >
          <FaEquals className="w-4 h-4 mr-2" />
          Compare File Hashes
        </button>

        {/* Display single hash result */}
        {hashResult && compareResult === null && (
          <div className="mt-6 p-4 rounded bg-gray-800">
            <div className="flex items-center text-xs text-gray-300 break-all font-mono">
              <FaHashtag className="w-3 h-3 mr-2 flex-shrink-0" />
              <span>Hash: {hashResult}</span>
            </div>
          </div>
        )}

        {compareResult !== null && (
          <div className="mt-6 p-4 rounded bg-gray-800">
            <div className="flex items-center text-xs text-gray-300 break-all font-mono mb-2">
              <FaHashtag className="w-3 h-3 mr-2 flex-shrink-0" />
              <span>File 1 Hash: {hashResult}</span>
            </div>
            <div className="flex items-center text-xs text-gray-300 break-all font-mono mb-2">
              <FaHashtag className="w-3 h-3 mr-2 flex-shrink-0" />
              <span>File 2 Hash: {secondHash}</span>
            </div>
            <div
              className={`mt-2 font-bold flex items-center ${
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
  );
}