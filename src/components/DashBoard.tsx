import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const Dashboard = () => {
  const [latestPost, setLatestPost] = useState(null);
  const [latestComments, setLatestComments] = useState([]);
  const [latestAds, setLatestAds] = useState([]);

  // Fetch the latest data including replies
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        // Fetch latest post
        const { data: posts, error: postError } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);
        if (postError) throw postError;
        setLatestPost(posts[0]);

        // Fetch 10 latest comments
        const { data: comments, error: commentError } = await supabase
          .from("comments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
        if (commentError) throw commentError;

        // Fetch replies for each comment
        const commentsWithReplies = await Promise.all(
          comments.map(async (comment) => {
            const { data: replies, error: replyError } = await supabase
              .from("replies")
              .select("*")
              .eq("comment_id", comment.id)
              .order("created_at", { ascending: false });
            if (replyError) throw replyError;
            return { ...comment, replies };
          })
        );

        setLatestComments(commentsWithReplies);

        // Fetch 5 latest ads
        const { data: ads, error: adError } = await supabase
          .from("ads")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);
        if (adError) throw adError;
        setLatestAds(ads);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchLatestData();
  }, []);

  // Function to render comments and replies
  const renderComments = (comments) => {
    return comments.map((comment) => (
      <div key={comment.id} className="mb-4 pl-4 border-l-2 border-gray-700">
        <p className="text-sm text-gray-400">{comment.content}</p>
        <p className="text-xs text-gray-500">
          By: {comment.user_name} - {comment.created_at}
        </p>

        {/* Render replies if any */}
        {comment.replies.length > 0 && (
          <div className="ml-4 mt-2">{renderReplies(comment.replies)}</div>
        )}
      </div>
    ));
  };

  // Function to render replies
  const renderReplies = (replies) => {
    return replies.map((reply) => (
      <div key={reply.id} className="mb-4 pl-4 border-l-2 border-gray-600">
        <p className="text-sm text-gray-300">{reply.content}</p>
        <p className="text-xs text-gray-500">
          By: {reply.user_name} - {reply.created_at}
        </p>
      </div>
    ));
  };

  return (
    <div className="flex-1 justify-center items-center h-screen w-screen bg-black text-blue-500">
      <div className="bg-black p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-blue mb-4">Dashboard Overview</h2>
        <p className="text-gray-300">
          Here you can manage all your content and settings. Select a section to get started.
        </p>

        {/* Latest Updates */}
        <div className="mt-6 bg-gray-900 rounded-lg p-4 border border-blue-400">
          <h3 className="text-2xl font-semibold text-blue-400 mb-4">Latest Updates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Latest Post */}
            <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
              <h4 className="text-xl font-semibold">Latest Post</h4>
              {latestPost ? (
                <div>
                  <p className="text-sm text-gray-400">Title: {latestPost.title}</p>
                  <img
                    src={latestPost.images}
                    alt={latestPost.title}
                    className="rounded mt-2"
                  />
                  <p className="text-xs text-gray-500">
                    Created at: {latestPost.created_at}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No posts available.</p>
              )}
            </div>

            {/* Latest Comments */}
            <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
              <h4 className="text-xl font-semibold">Latest Comments</h4>
              {latestComments.length > 0 ? (
                renderComments(latestComments)
              ) : (
                <p className="text-sm text-gray-500">No comments available.</p>
              )}
            </div>

            {/* Latest Ads */}
            <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
              <h4 className="text-xl font-semibold">Latest Ads</h4>
              {latestAds.length > 0 ? (
                latestAds.map((ad, index) => (
                  <div
                    key={ad.id}
                    className="mb-2 border-b border-gray-700 pb-2"
                  >
                    <p className="text-sm text-gray-400">
                      #{index + 1} {ad.altText}
                    </p>
                    <img
                      src={ad.imageUrl}
                      alt={ad.altText}
                      className="rounded mt-2"
                    />
                    <p className="text-xs text-gray-500">
                      Created at: {ad.created_at}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No ads available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;




