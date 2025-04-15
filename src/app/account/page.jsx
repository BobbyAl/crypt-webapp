"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/firebase/config";
import { updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { 
  FaKey, 
  FaUserCog, 
  FaTrash, 
  FaCopy, 
  FaEye, 
  FaEyeSlash,
  FaExclamationTriangle
} from "react-icons/fa";

export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setPublicKey(data.publicKey || "");
          setPrivateKey(data.privateKey || "");
        }
      } catch (error) {
        console.error("Error fetching keys:", error);
        setMessage({ text: "Failed to load keys", type: "error" });
      }
    };

    fetchKeys();
  }, []);

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ text: `${label} copied to clipboard!`, type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: "Failed to copy to clipboard", type: "error" });
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
      <div className="bg-[#111827] rounded-2xl shadow-xl p-10 max-w-xl w-full">
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

        {/* Keys Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <FaKey className="w-5 h-5 mr-2" />
            Your Keys
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Public Key</label>
              <div className="relative">
                <textarea
                  readOnly
                  value={publicKey}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white text-sm font-mono"
                  rows={3}
                />
                {publicKey && (
                  <button
                    onClick={() => handleCopy(publicKey, "Public key")}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  >
                    <FaCopy />
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Private Key</label>
              <div className="relative">
                <textarea
                  readOnly
                  value={privateKey}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white text-sm font-mono"
                  rows={3}
                />
                {privateKey && (
                  <button
                    onClick={() => handleCopy(privateKey, "Private key")}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  >
                    <FaCopy />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Change Password</h2>
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
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <FaTrash className="w-5 h-5 mr-2" />
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