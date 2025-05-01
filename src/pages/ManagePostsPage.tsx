import { useLocation } from "react-router-dom";

import PostList from "../components/Posts/PostList";

const ManagePostsPage = () => {
  const location = useLocation();

  return (
    <div className="flex justify-center items-center w-screen bg-black text-green-400">
      <PostList />
    </div>
  );
};

export default ManagePostsPage;
