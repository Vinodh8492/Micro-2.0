import React, { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaTachometerAlt,
  FaBox,
  FaClipboardList,
  FaShoppingCart,
  FaLayerGroup,
  FaUserShield,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/image copy.png";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeLink, setActiveLink] = useState("/");
  const location = useLocation();
  const { user } = useAuth();

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

  // Basic navItems
  const navItems = [
    { path: "/", icon: FaTachometerAlt, label: "Dashboard" },
    { path: "/material", icon: FaBox, label: "Materials" },
    { path: "/recipes", icon: FaClipboardList, label: "Recipes" },
    { path: "/orders", icon: FaShoppingCart, label: "Orders" },
    { path: "/activeorders", icon: FaShoppingCart, label: "Active Orders" },
    { path: "/batches", icon: FaLayerGroup, label: "Batches" },
  ];

  // Conditionally show Admin panel only for admin users
  if (user?.role === "admin") {
    navItems.push({
      path: "/admin",
      icon: FaUserShield,
      label: "Administrator",
    });
  }

  // Conditionally show Login if user is not logged in
  if (!user) {
    navItems.push({
      path: "/login",
      icon: FaUserShield,
      label: "Login",
    });
  }

  // Always show Storage (optional: restrict this too if needed)
  navItems.push({
    path: "/storage",
    icon: FaUserShield,
    label: "Storage",
  });

  return (
    <div className="relative flex h-screen bg-gray-100">
      <aside
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-[#D4D6D9] text-black h-full shadow-md transition-all duration-300 flex flex-col border-r`}
      >
        <div className="p-4 flex justify-center items-center bg-[#D4D6D9]">
          <img
            src={Logo}
            alt="Hercules Logo"
            className={`transition-all duration-300 ${
              isOpen ? "h-16" : "h-10"
            }`}
          />
        </div>

        <nav className="mt-6 space-y-2 px-4 text-sm flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 py-2 font-medium px-2 rounded-md transition ${
                activeLink === item.path
                  ? "bg-gray-700 text-white"
                  : "hover:bg-gray-300 hover:text-black"
              }`}
              onClick={() => handleLinkClick(item.path)}
            >
              <item.icon />
              {isOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
