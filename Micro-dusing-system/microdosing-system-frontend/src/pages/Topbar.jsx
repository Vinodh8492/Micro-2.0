import React, { useState } from "react";
import companyLogo from "../assets/Asm_Logo.png";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa"; // Importing logout icon from react-icons

const Topbar = () => {
  const { user, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  const toggleLogout = () => setShowLogout((prev) => !prev);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/logout", null, {
        withCredentials: true,
      });

      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  // 🧠 Fallback logic for username
  const displayName =
    user?.username || user?.name || user?.email?.split("@")[0] || "Guest";

  const initial =
    (user?.username?.charAt(0) ||
      user?.name?.charAt(0) ||
      user?.email?.charAt(0) ||
      "A"
    ).toUpperCase();

  return (
    <div className="w-full h-16 bg-[#D4D6D9] flex items-center justify-between px-4 shadow-md relative">
      <div className="flex items-center gap-4" />

      <div className="flex items-center gap-4 relative">
        <p className="text-sm text-gray-700">
          Hello, <span className="font-bold">{displayName}</span>
        </p>

        <div
          className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110"
          onClick={toggleLogout}
        >
          {initial}
        </div>

        <img
          src={companyLogo}
          alt="Company Logo"
          className="h-10 cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={toggleLogout}
        />

        {showLogout && (
          <div className="absolute top-14 right-2 bg-white border shadow-lg rounded-lg p-4 z-50 max-w-[200px]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 py-2 px-4 rounded-md text-red-600 font-medium hover:bg-red-50 hover:text-red-800 transition-all duration-150"
            >
              <FaSignOutAlt className="text-xl" /> {/* Exit icon */}
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;
