import React from "react";
import "./loader.css"; // Import the loader styles

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen bg-black">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="loader-spinner"></div>
        {/* Text */}
        <p className="loader-text">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loader;