import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import {
  ArrowUturnLeftIcon,
  ChatBubbleLeftEllipsisIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: postsData } = await supabase
          .from("posts")
          .select("id, title");
        const { data: commentsData } = await supabase
          .from("comments")
          .select("*");
        const { data: repliesData } = await supabase
          .from("replies")
          .select("*");

        setPosts(postsData || []);
        setComments(commentsData || []);
        setReplies(repliesData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRepliesForComment = (commentId: string) =>
    replies.filter((reply) => reply.comment_id === commentId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col md:ml-64 p-6 h-screen bg-black text-blue-500">
      <div className="bg-black p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-blue mb-4">
          Comments Overview
        </h2>
        <p className="text-gray-300">
          Here you can manage all your comments. Select a comments and get
          started.
        </p>
        <div className="mt-6 bg-gray-900 rounded-lg p-4 border border-blue-400">
          <h3 className="text-2xl font-semibold text-blue-400 mb-4">
            Latest Comments
          </h3>
          {posts
            .filter((post) =>
              comments.some((comment) => comment.post_id === post.id)
            )
            .map((post) => (
              <div key={post.id} className=" rounded-lg shadow-lg mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-blue-300">
                    {post.title}
                  </h3>
                </div>

                <ul className="space-y-2">
                  {comments
                    .filter((comment) => comment.post_id === post.id)
                    .map((comment) => (
                      <li
                        key={comment.id}
                        className="bg-gray-800 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex justify-between items-center mb-10">
                            {comment.content}
                          </div>
                          <div className="font-semibold">
                            {comment.user_name}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div
                            onClick={() => setReplyToCommentId(comment.id)}
                            className="text-blue-300 hover:text-blue-500 transition mt-2"
                          >
                            <ArrowUturnLeftIcon className="h-5 w-5" />
                          </div>
                          <div
                            onClick={() =>
                              console.log("Delete comment", comment.id)
                            }
                            className="text-white hover:text-red-400 transition"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </div>
                        </div>
                        <ul className="mt-2 pl-4 border-l border-gray-600 space-y-2">
                          {getRepliesForComment(comment.id).map((reply) => (
                            <li
                              key={reply.id}
                              className="bg-gray-600 p-3 rounded-lg flex justify-between"
                            >
                              <p className="text-sm">{reply.content}</p>
                              <div
                                onClick={() =>
                                  console.log("Delete reply", reply.id)
                                }
                                className="text-white hover:text-red-400 transition"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                </ul>
              </div>
            ))}

          {posts.every(
            (post) => !comments.some((comment) => comment.post_id === post.id)
          ) && (
            <p className="text-gray-400 text-center">No comments available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentList;
