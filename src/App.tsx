import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";

import ManagePostsPage from "./pages/ManagePostsPage";

import ManageCommentsPage from "./pages/ManageCommentsPage";
import ManageAdsPage from "./pages/ManageAdsPage";
import Navbar from "./pages/NavBar";

import Dashboard from "./components/DashBoard";
import ProfilePage from "./components/Profil/ProfilePage";
import Loader from "./components/Loader";
import ManageReviewsPage from "./pages/ManageReviewPage";

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation(); // För att spåra sidnavigering

  // Visa loader när sidändring sker
  useEffect(() => {
    setLoading(true); // Starta loader vid navigering
    const timer = setTimeout(() => setLoading(false), 1000); // Laddning i 1 sek

    return () => clearTimeout(timer); // Rensa timeout vid ny navigering
  }, [location]);

  return (
    <div>
      {loading && <Loader />} {/* Visa loader vid sidnavigering */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Dashboard />
              </>
            }
          />

          <Route
            path="/manage-posts"
            element={
              <>
                <Navbar />
                <ManagePostsPage />
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <>
                <Navbar />
                <ProfilePage />
              </>
            }
          />

          <Route
            path="/manage-comments"
            element={
              <>
                <Navbar />
                <ManageCommentsPage />
              </>
            }
          />
          <Route
            path="/manage-ads"
            element={
              <>
                <Navbar />
                <ManageAdsPage />
              </>
            }
          />
        </Route>
        <Route
          path="/manage-reviews"
          element={
            <>
              <Navbar />
              <ManageReviewsPage />
            </>
          }
        />
        {/* Catch-All Route */}
        <Route path="*" element={<div>404 Page Not Found</div>} />
      </Routes>
    </div>
  );
};

export default App;
