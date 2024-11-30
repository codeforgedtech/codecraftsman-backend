import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import EditPost from "./components/Posts/EditPost";
import ManagePostsPage from "./pages/ManagePostsPage";
import CreatePost from "./components/Posts/CreatePost";
import ManageCommentsPage from "./pages/ManageCommentsPage";
import ManageAdsPage from "./pages/ManageAdsPage";
import Navbar from "./pages/NavBar";
import Dashboard from "./components/DashBoard";
import ProfilePage from "./components/Profil/ProfilePage";
import Loader from "./components/Loader";

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation(); // För att spåra sidnavigering

  // Visa loader när sidändring sker
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false); // Stänger av loadern efter 3 sekunder (simulerad laddningstid)
    }, 2000); // Laddningstid på 3 sekunder för demo
  }, [location]); // Hook triggas varje gång location ändras

  return (
    <div>
      {loading && <Loader />} {/* Visa loader när vi är i laddningsläge */}
      
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
          <Route path="/edit-post/:postId" element={<EditPost />} />
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
            path="/create-post"
            element={
              <>
                <Navbar />
                <CreatePost />
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

        {/* Catch-All Route */}
        <Route path="*" element={<div>404 Page Not Found</div>} />
      </Routes>
    </div>
  );
};

export default App;

