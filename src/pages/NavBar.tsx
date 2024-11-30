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
} from "@heroicons/react/24/outline";
import logotype from "../assets/codelogo.svg";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDisabled, setIsLogoutDisabled] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    if (!isLogoutDisabled) {
      setIsLogoutDisabled(true);
      await supabase.auth.signOut();
      navigate("/login");
    }
  };

  return (
    <nav className="bg-black text-white w-full top-0 left-0 z-50 shadow-xl border-b-4 border-blue-500">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center relative">
        {/* Logo */}
        <Link
          to="/"
         
        >
          <img src={logotype} alt="logotype" className="w-30 md:w-40" />
        </Link>

        {/* Mobile Menu Icon */}
        <button
          className="md:hidden text-white hover:text-blue-500"
          onClick={toggleMobileMenu}
        >
          <span className="text-3xl">☰</span>
        </button>

        {/* Desktop Navigation Links */}
        <ul
          className={`md:flex space-x-8 hidden ${
            isMobileMenuOpen ? "block" : "hidden"
          }`}
        >
          {/* Dashboard */}
          <li>
            <Link
              to="/"
              className="text-xl font-semibold hover:text-white transition duration-300 transform hover:scale-105 hover:shadow-lg py-2 px-4 rounded-md bg-gray-800 hover:bg-blue-800 text-white flex items-center space-x-2"
            >
              <HomeIcon className="w-6 h-6" />
              <span>Dashboard</span>
            </Link>
          </li>

          {/* Comments */}
          <li>
            <Link
              to="/manage-comments"
              className="text-xl font-semibold hover:text-white transition duration-300 transform hover:scale-105 hover:shadow-lg py-2 px-4 rounded-md bg-gray-800 hover:bg-blue-800 text-white flex items-center space-x-2"
            >
              <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
              <span>Comments</span>
            </Link>
          </li>

          {/* Posts */}
          <li>
            <Link
              to="/manage-posts"
              className="text-xl font-semibold hover:text-white transition duration-300 transform hover:scale-105 hover:shadow-lg py-2 px-4 rounded-md bg-gray-800 hover:bg-blue-800 text-white flex items-center space-x-2"
            >
              <DocumentTextIcon className="w-6 h-6" />
              <span>Posts</span>
            </Link>
          </li>

          {/* Ads */}
          <li>
            <Link
              to="/manage-ads"
              className="text-xl font-semibold hover:text-white transition duration-300 transform hover:scale-105 hover:shadow-lg py-2 px-4 rounded-md bg-gray-800 hover:bg-blue-800 text-white flex items-center space-x-2"
            >
              <TagIcon className="w-6 h-6" />
              <span>Ads</span>
            </Link>
          </li>

          {/* Profile */}
          <li>
            <Link
              to="/profile"
              className="text-xl font-semibold hover:text-white transition duration-300 transform hover:scale-105 hover:shadow-lg py-2 px-4 rounded-md bg-gray-800 hover:bg-blue-800 text-white flex items-center space-x-2"
            >
              <UserCircleIcon className="w-6 h-6" />
              <span>Profile</span>
            </Link>
          </li>

          {/* Logout */}
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className={`text-xl font-semibold hover:text-white transition duration-300 transform hover:scale-105 hover:shadow-lg py-2 px-4 rounded-md flex items-center space-x-2 ${
                isLogoutDisabled
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-gray-800 hover:bg-blue-800 text-white"
              }`}
            >
              <PowerIcon className="w-6 h-6" />
              <span>Logout</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;





