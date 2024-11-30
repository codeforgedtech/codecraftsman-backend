import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const ProtectedRoute: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // Check if there is an active session
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkSession();

    // Optional: listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    // Show a loading spinner or message while checking authentication status
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component(s)
  return <Outlet />;
};



export default ProtectedRoute;

