import React from "react";

const CommentForm = () => {
  return (
    <form className="space-y-4">
      <div>
        <label className="block font-bold">Kommentar</label>
        <textarea className="border p-2 w-full" rows={4}></textarea>
      </div>
      <button className="bg-blue-500 text-white px-4 py-2">Skicka</button>
    </form>
  );
};

export default CommentForm;
