import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import logotype from "../assets/codelogo.svg";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
 
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };
  // Redirect if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      // Check session from Supabase
      const { data } = await supabase.auth.getSession();
      console.log("Session from supabase.auth.getSession:", data);

      // Check session from localStorage
      const session = localStorage.getItem('supabase.auth.token');
      if (session) {
        const parsedSession = JSON.parse(session);
        console.log("Session from localStorage:", parsedSession);
        navigate("/"); // Redirect to homepage if session exists
      } else {
        console.log("No session found in localStorage.");
      }
    };

    checkSession();

    // Listen for auth state changes
    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (session) {
        console.log("User logged in:", session);
        try {
          // Store session in localStorage
          localStorage.setItem('supabase.auth.token', JSON.stringify(session)); // Store session as JSON string
          console.log("Session stored in localStorage:", session);
        } catch (error) {
          console.error("Error storing session in localStorage:", error);
        }
        navigate("/");
      } else {
        console.log("User logged out");
        localStorage.removeItem('supabase.auth.token');
      }
    });

    return () => {
      authListener.data = null; // Cleanup listener
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // Get session after login
      const { data } = await supabase.auth.getSession();
      console.log("Session after login:", data);

      try {
        // Store session manually in localStorage
        localStorage.setItem('supabase.auth.token', JSON.stringify(data)); // Store session as JSON string
        console.log("Session stored in localStorage:", data);
      } catch (error) {
        console.error("Error storing session in localStorage:", error);
      }

      // Test: Store a simple value in localStorage to check functionality
      try {
        localStorage.setItem('testKey', 'testValue');
        console.log('Test value stored in localStorage:', localStorage.getItem('testKey'));
      } catch (error) {
        console.error("Error storing test value in localStorage:", error);
      }

      navigate("/");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-black text-blue-500">
      <div className="bg-transparent p-8 rounded-lg shadow-lg w-full sm:w-96 max-w-md border-2 border-blue-400">
        {/* Centered Logo */}
        <h2 className="text-center mb-6">
          <img src={logotype} alt="logotype" className="w-36 md:w-48 mx-auto" />
        </h2>

        {error && (
          <div className="text-red-500 text-center mb-4 px-4 py-2 border border-red-500 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-400 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-transparent border border-blue-400 rounded-lg text-blue-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-blue-400 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"} // Dynamisk typändring
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-transparent border border-blue-400 rounded-lg text-blue-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your password"
              required
            />
           <button
  type="button"
  onClick={togglePasswordVisibility}
  className="bg-transparent absolute right-1 top-8 text-blue-500"
>
  {showPassword ? (
    <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
  ) : (
    <EyeIcon className="w-5 h-5" aria-hidden="true" />
  )}
</button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-semibold py-3 rounded-lg focus:outline-none transition-all duration-300 ease-in-out ${
              isLoading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-500 hover:border-blue-700 focus:ring-2 focus:ring-blue-500"
            } ${!isLoading ? 'transform hover:scale-105' : ''} `}
          >
            {isLoading ? <span className="animate-pulse">Logging in...</span> : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Powered by <span className="font-semibold text-blue-500">CodeForged Tech</span></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;












