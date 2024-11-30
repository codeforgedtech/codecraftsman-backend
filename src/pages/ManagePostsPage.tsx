import React from "react";
import { useLocation } from "react-router-dom";
import CreatePost from "../components/Posts/CreatePost";
import EditPost from "../components/Posts/EditPost";
import PostList from "../components/Posts/PostList";


const ManagePostsPage = () => {
  const location = useLocation();

  // Kontrollera vy baserat på URL
  const isCreatePostPage = location.pathname === "/create-post";
  const isEditPostPage = location.pathname.startsWith("/edit-post/");
  const postId = isEditPostPage ? location.pathname.split("/edit-post/")[1] : null;

  return (

      <div className="flex justify-center items-center w-screen bg-black text-green-400">
        {isCreatePostPage ? (
          <CreatePost />
        ) : isEditPostPage && postId ? (
          <EditPost postId={postId} />
        ) : (
          <PostList />
        )}
      </div>

  );
};

export default ManagePostsPage;

