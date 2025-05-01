import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import {
  PowerIcon,
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon,
  TagIcon,
  UserCircleIcon,
  StarIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import logotype from "../assets/codelogo.svg";

const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutDisabled, setIsLogoutDisabled] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    if (!isLogoutDisabled) {
      setIsLogoutDisabled(true);
      await supabase.auth.signOut();
      navigate("/login");
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-black text-white w-64 p-5 transform transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        } md:translate-x-0 z-50 shadow-lg border-r-4 border-blue-500 flex flex-col items-center`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center w-full mb-6">
          <img src={logotype} alt="logotype" className="w-32" />
        </Link>

        {/* Navigation Links */}
        <ul className="space-y-4">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-800 text-white transition-transform transform hover:scale-105"
              >
                <Icon className="w-6 h-6" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
          {/* Logout */}
          <li>
            <button
              onClick={handleLogout}
              disabled={isLogoutDisabled}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-white transition-transform transform hover:scale-105 ${
                isLogoutDisabled
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-gray-800 hover:bg-blue-700"
              }`}
            >
              <PowerIcon className="w-6 h-6" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Sidebar Toggle Button (Mobile) */}
      <button
        className="fixed top-4 left-4 md:hidden z-50 bg-gray-800 p-2 rounded-md"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <XMarkIcon className="w-6 h-6 text-white" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

const navLinks = [
  { to: "/", icon: HomeIcon, label: "Dashboard" },
  {
    to: "/manage-comments",
    icon: ChatBubbleLeftEllipsisIcon,
    label: "Comments",
  },
  { to: "/manage-posts", icon: DocumentTextIcon, label: "Posts" },
  { to: "/manage-ads", icon: TagIcon, label: "Ads" },
  { to: "/profile", icon: UserCircleIcon, label: "Profile" },
  { to: "/manage-reviews", icon: StarIcon, label: "Reviews" },
];

export default Sidebar;
