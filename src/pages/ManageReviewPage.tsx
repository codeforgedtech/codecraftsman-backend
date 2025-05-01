import React from "react";

import ReviewListWithForm from "../components/Review/ReviewList";

const ManageReviewsPage = () => {
  return (
    <div className="flex justify-center items-center w-screen min-h-screen bg-black text-green-400">
      <ReviewListWithForm />
    </div>
  );
};

export default ManageReviewsPage;
