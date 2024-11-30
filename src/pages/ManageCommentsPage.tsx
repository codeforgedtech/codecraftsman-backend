import React from "react";
import CommentForm from "../components/Comments/CommentForm";
import CommentList from "../components/Comments/CommentList";


const ManageCommentsPage = () => {
  return (
    
      <div className="flex justify-center items-center w-screen bg-black text-green-400">
        <CommentList />
      </div>
  
  );
};

export default ManageCommentsPage;
