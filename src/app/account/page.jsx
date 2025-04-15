"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/firebase/config";
import { updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { 
  FaKey, 
  FaUserCog, 
  FaTrash, 
  FaCopy, 
  FaEye, 
  FaEyeSlash,
  FaExclamationTriangle,
  FaFile,
  FaLock
} from "react-icons/fa";

export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rsaKeys, setRsaKeys] = useState({ publicKey: "", privateKey: "" });
  const [savedKeys, setSavedKeys] = useState([]);
  const [savedFiles, setSavedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;

      try {
        // Fetch RSA keys
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.rsaKeys) {
            setRsaKeys({
              publicKey: data.rsaKeys.publicKey || "",
              privateKey: data.rsaKeys.privateKey || ""
            });
          }
        }

        // Fetch saved keys
        const keysQuery = query(
          collection(db, "users", auth.currentUser.uid, "keys"),
          orderBy("createdAt", "desc")
        );
        const keysSnapshot = await getDocs(keysQuery);
        setSavedKeys(keysSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Fetch saved files
        const filesQuery = query(
          collection(db, "users", auth.currentUser.uid, "files"),
          orderBy("createdAt", "desc")
        );
        const filesSnapshot = await getDocs(filesQuery);
        setSavedFiles(filesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage({ text: "Failed to load user data", type: "error" });
      }
    };

    fetchUserData();
  }, []);

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ text: `${label} copied to clipboard!`, type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({ text: "Failed to copy to clipboard", type: "error" });
    }
  };

  const handleDeleteKey = async (keyId) => {
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "keys", keyId));
      setSavedKeys(keys => keys.filter(key => key.id !== keyId));
      setMessage({ text: "Key deleted successfully", type: "success" });
    } catch (error) {
      console.error("Error deleting key:", error);
      setMessage({ text: "Failed to delete key", type: "error" });
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "files", fileId));
      setSavedFiles(files => files.filter(file => file.id !== fileId));
      setMessage({ text: "File deleted successfully", type: "success" });
    } catch (error) {
      console.error("Error deleting file:", error);
      setMessage({ text: "Failed to delete file", type: "error" });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "New passwords don't match", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setMessage({ text: "Password updated successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({ text: "Failed to update password: " + error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentPassword) {
      setMessage({ text: "Please enter your current password", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Delete user data from Firestore
      await deleteDoc(doc(db, "users", user.uid));
      
      // Delete user account
      await deleteUser(user);
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      setMessage({ text: "Failed to delete account: " + error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-6">
      <div className="bg-[#111827] rounded-2xl shadow-xl p-10 max-w-4xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-white flex items-center justify-center">
          Account Settings <FaUserCog className="ml-3 w-8 h-8" />
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

        {/* RSA Keys Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <FaKey className="w-5 h-5 mr-2" />
            Your RSA Keys
          </h2>
          
          {rsaKeys.publicKey ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Public Key</label>
                <div className="relative">
                  <textarea
                    readOnly
                    value={rsaKeys.publicKey}
                    className="w-full p-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white font-mono"
                    rows={3}
                  />
                  <button
                    onClick={() => handleCopy(rsaKeys.publicKey, "Public key")}
                    className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  >
                    <FaCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Private Key</label>
                <div className="relative">
                  <textarea
                    readOnly
                    value={rsaKeys.privateKey}
                    className="w-full p-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white font-mono"
                    rows={3}
                  />
                  <button
                    onClick={() => handleCopy(rsaKeys.privateKey, "Private key")}
                    className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  >
                    <FaCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-400">No RSA keys generated yet. Generate them in the Key Generation page.</p>
          )}
        </div>

        {/* Saved Keys Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <FaKey className="w-5 h-5 mr-2" />
            Saved Keys
          </h2>
          
          {savedKeys.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {savedKeys.map((key) => (
                <div key={key.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-300">{key.type} Key</span>
                      <p className="text-xs text-gray-400">
                        {new Date(key.createdAt?.toDate()).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopy(key.value, `${key.type} key`)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <FaCopy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="p-1 text-red-400 hover:text-red-500"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={key.value}
                      className="w-full p-2 text-xs bg-gray-900 border border-gray-700 rounded text-white font-mono"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No saved keys found.</p>
          )}
        </div>

        {/* Saved Files Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <FaFile className="w-5 h-5 mr-2" />
            Saved Files
          </h2>
          
          {savedFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedFiles.map((file) => (
                <div key={file.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <FaLock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">{file.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(file.createdAt?.toDate()).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Method: {file.method} | Type: {file.type}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1 text-red-400 hover:text-red-500"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No saved files found.</p>
          )}
        </div>

        {/* Password Change Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <FaLock className="w-5 h-5 mr-2" />
            Change Password
          </h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-white"
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-white"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Delete Account Section */}
        <div className="border-t border-gray-700 pt-8">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <FaExclamationTriangle className="w-5 h-5 mr-2 text-red-500" />
            Delete Account
          </h2>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition flex items-center justify-center"
            >
              <FaExclamationTriangle className="mr-2" />
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-red-400 text-sm">
                This action cannot be undone. Please enter your password to confirm.
              </p>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-white"
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCurrentPassword("");
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
                >
                  {loading ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 