import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface EditPostProps {
  postId: string; // 👈 Tar emot postId från props
}

const EditPost: React.FC<EditPostProps> = ({ postId }) => {
  // 👈 Använd props här
  const [post, setPost] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categories: [],
    tags: [],
    images: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();
      if (error) {
        console.error("Error fetching post:", error);
        return;
      }
      setPost(data);
      setFormData({
        title: data.title || "",
        content: data.content || "",
        categories: data.categories || [],
        tags: data.tags || [],
        images: data.images || [],
      });
    };

    fetchPost();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId) return;

    const { error } = await supabase
      .from("posts")
      .update(formData)
      .eq("id", postId);

    if (error) {
      console.error("Error updating post:", error);
      return;
    }

    alert("Inlägget har uppdaterats!");
    navigate("/posts");
  };

  if (!post) return <div>Laddar...</div>;

  return (
    <div className="p-6 bg-black text-green-400">
      <h2 className="text-3xl font-semibold text-blue-400">Redigera Inlägg</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 bg-gray-700 text-white rounded-lg"
        />
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          className="w-full p-2 bg-gray-700 text-white rounded-lg"
        />
        <button type="submit" className="bg-green-400 py-2 px-6 rounded-lg">
          Uppdatera Inlägg
        </button>
      </form>
    </div>
  );
};

export default EditPost;
