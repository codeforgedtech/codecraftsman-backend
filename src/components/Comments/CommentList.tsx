import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { ArrowUturnLeftIcon, ChatBubbleLeftEllipsisIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Post {
  id: string;
  title: string;
}

interface Comment {
  id: string;
  post_id: string;
  content: string;
  user_id: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

interface Reply {
  id: string;
  comment_id: string;
  content: string;
  user_id: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

const CommentList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false); // Modal state
  const [modalMessage, setModalMessage] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false); // Confirmation modal state
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null); // ID for the item to delete

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("id, title");
        if (postsError) throw new Error(postsError.message);
        setPosts(postsData || []);

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*");
        if (commentsError) throw new Error(commentsError.message);
        setComments(commentsData || []);

        // Fetch replies
        const { data: repliesData, error: repliesError } = await supabase
          .from("replies")
          .select("*");
        if (repliesError) throw new Error(repliesError.message);
        setReplies(repliesData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddCommentOrReply = async () => {
    if (!newComment) {
      
      setModalMessage("Write something before submitting");
      return;
    }
  
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setModalMessage("You must be logged in to comment.");
        return;
      }
     
      const user = userData.user;
  
      // Hämta användardata från 'users'-tabellen
      const { data: userDetails, error: userDetailsError } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("id", user.id)
        .single(); // Eftersom det bara ska finnas en användare med samma id
  
      if (userDetailsError) {
        
        setModalMessage("Could not fetch user data.");
        return;
      }
  
      const userName = userDetails?.full_name || "Anonym";
      const userEmail = userDetails?.email || user.email;
  
      if (replyToCommentId) {
        const { data, error } = await supabase.from("replies").insert({
          comment_id: replyToCommentId,
          content: newComment,
          user_id: user.id,
          user_name: userName,
          user_email: userEmail,
        });
        if (error) throw new Error(error.message);
  
        setReplies((prevReplies) => [...prevReplies, ...(data || [])]);
        setReplyToCommentId(null);
        setModalMessage("Reply sent!");
      } else if (selectedPostId) {
        const { data, error } = await supabase.from("comments").insert({
          post_id: selectedPostId,
          content: newComment,
          user_id: user.id,
          user_name: userName,
          user_email: userEmail,
        });
        if (error) throw new Error(error.message);
  
        setComments((prevComments) => [...prevComments, ...(data || [])]);
        setModalMessage("Comment sent!");
      }
  
      setNewComment("");
      setShowModal(true); // Show success modal after posting
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteItemId) return;

    try {
      const isReply = replies.some((reply) => reply.id === deleteItemId);
      if (isReply) {
        // Ta bort ett svar
        const { error: replyError } = await supabase
          .from("replies")
          .delete()
          .eq("id", deleteItemId);
        if (replyError) throw new Error(replyError.message);
  
        setReplies((prevReplies) =>
          prevReplies.filter((reply) => reply.id !== deleteItemId)
        );
      } else {
        // Ta bort en kommentar och dess svar
        const { error: repliesError } = await supabase
          .from("replies")
          .delete()
          .eq("comment_id", deleteItemId);
        if (repliesError) throw new Error(repliesError.message);
  
        const { error: commentError } = await supabase
          .from("comments")
          .delete()
          .eq("id", deleteItemId);
        if (commentError) throw new Error(commentError.message);
  
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== deleteItemId)
        );
        setReplies((prevReplies) =>
          prevReplies.filter((reply) => reply.comment_id !== deleteItemId)
        );
      }
      setShowDeleteModal(false); // Close the confirmation modal
      setDeleteItemId(null); // Reset the item to delete
    } catch (err: any) {
      setError(err.message);
    }
  };

  const confirmDeleteComment = (id: string) => {
    setDeleteItemId(id);
    setShowDeleteModal(true);
  };

  const getRepliesForComment = (commentId: string) =>
    replies.filter((reply) => reply.comment_id === commentId);

  if (loading) {
    return <div>Laddar...</div>;
  }

  if (error) {
    return <div>Fel: {error}</div>;
  }

  return (
    <div className="w-screen min-h-screen bg-black text-blue-400 flex">
    {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg border border-blue-400 shadow-lg">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">{modalMessage}</h3>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-400 text-black py-2 px-4 rounded-lg hover:bg-blue-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg border border-red-400 shadow-lg">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Do you really want to delete this?</h3>
            <button
              onClick={handleDeleteComment}
              className="bg-red-400 text-black py-2 px-4 rounded-lg hover:bg-red-300 transition"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* Kommentarsfält */}
     {(selectedPostId || replyToCommentId) && (
  <div className="fixed bottom-0 left-0 w-full max-w-md p-6 bg-gray-900 rounded-lg shadow-lg border border-blue-400 z-50">
    <h3 className="text-lg font-semibold mb-4">
      {replyToCommentId ? "Reply to comment" : "Comment on the post"}
    </h3>
    <textarea
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      rows={4}
      placeholder="Write your comment here..."
      className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
    ></textarea>
    <div className="flex gap-3">
      <button
        onClick={handleAddCommentOrReply}
        className="mt-2 bg-blue-400 text-black py-2 px-4 rounded-lg hover:bg-blue-300 transition"
      >
        Send
      </button>
      <button
        onClick={() => {
          setReplyToCommentId(null);
          setSelectedPostId(null);
        }}
        className="mt-2 block text-sm text-gray-400 hover:text-white"
      >
        Cancel
      </button>
    </div>
  </div>
)}

      {/* Inläggslista */}
      <div className="flex-1 p-6">
        <h2 className="text-4xl font-semibold text-center mb-8">Posts</h2>
        <ul className="space-y-6 max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-lg border border-blue-400 ">
  {posts.map((post) => (
    <li
      key={post.id}
      className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800"
    >
      <div className="flex justify-between items-center">
        <p className="text-lg text-blue">{post.title}</p>
        <button
          onClick={() => setSelectedPostId(post.id)}
          className="bg-transparent text-white hover:text-blue-400 transition flex items-center"
        >
          <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-1" />
        </button>
      </div>
      <ul className="space-y-2 mt-4">
        {comments
          .filter((comment) => comment.post_id === post.id)
          .map((comment) => (
            <li
              key={comment.id}
              className="bg-gray-800 p-4 rounded-lg space-y-2"
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">{comment.user_name}</p>
                <p>{comment.content}</p>
                <button
                  onClick={() => confirmDeleteComment(comment.id)}
                  className="bg-transparent text-xs text-white hover:text-white transition"
                >
                  <TrashIcon className="h-5 w-5 text-white" />
                </button>
              </div>
              <button
                onClick={() => setReplyToCommentId(comment.id)}
                className="bg-transparent text-xs text-white hover:text-white transition"
              >
                <ArrowUturnLeftIcon className="h-5 w-5 text-white" />
              </button>
              <ul className="pl-4 mt-4 border-l border-gray-700 space-y-4">
                {getRepliesForComment(comment.id).map((reply) => (
                  <li
                    key={reply.id}
                    className="bg-gray-700 p-4 rounded-lg flex justify-between items-start space-x-4"
                  >
                    <p className="">{reply.user_name}</p>
                    <div className="flex justify-between items-center">
                      
                      <p className="text-sm space-y-2">{reply.content}</p>
                      
                      </div>
                      <p className="flex justify-between items-center">{reply.created_at}</p>
                    <button
                      onClick={() => confirmDeleteComment(reply.id)}
                      className="bg-transparent text-xs text-white hover:text-white transition"
                    >
                     
                      <TrashIcon className="h-5 w-5 text-white" />
                    </button>
                  
                  </li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </li>
  ))}
</ul>
        
      </div>
    </div>
  );
};

export default CommentList;






