import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface PostFormData {
  title: string;
  content: string;
  categories: string[];
  tags: string[];
  images: string[];
}

const PostList = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    categories: [],
    tags: [],
    images: [],
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [currentPost, setCurrentPost] = useState<any | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase.from("posts").select("*");
        if (error) throw new Error(error.message);
        setPosts(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategoriesAndTags = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("*");
      const { data: tagsData, error: tagsError } = await supabase.from("tags").select("*");

      if (categoriesError || tagsError) {
        console.error("Error fetching categories/tags", categoriesError || tagsError);
        return;
      }

      setCategories(categoriesData || []);
      setTags(tagsData || []);
    };

    fetchPosts();
    fetchCategoriesAndTags();
  }, []);

  const handleEdit = async (post: any) => {
    setCurrentPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      categories: post.categories || [],
      tags: post.tags || [],
      images: post.images || [],
    });

    // Hämta bilder från Supabase Storage (hämta url:er)
    const imagesUrls = await Promise.all(
      post.images.map(async (imagePath: string) => {
        const { publicURL, error } = supabase.storage.from("posts").getPublicUrl(imagePath);
        if (error) {
          console.error("Error fetching image URL:", error);
          return "";
        }
        return publicURL || "";
      })
    );
    setUploadedImages(imagesUrls);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Är du säker på att du vill ta bort detta inlägg?")) {
      try {
        const { error } = await supabase.from("posts").delete().eq("id", id);
        if (error) throw new Error(error.message);
        setPosts(posts.filter((post) => post.id !== id));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const uploadImages = async () => {
        const uploadedImages: string[] = [];
        for (const file of Array.from(files)) {
          const { data, error } = await supabase.storage
            .from("posts")
            .upload(`public/${file.name}`, file);

          if (error) {
            console.error("Error uploading image:", error);
            continue;
          }

          uploadedImages.push(data?.path || "");
        }
        setFormData((prevData) => ({
          ...prevData,
          images: [...prevData.images, ...uploadedImages],
        }));
      };

      uploadImages();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentPost?.id) {
        const { error } = await supabase
          .from("posts")
          .update({ ...formData })
          .eq("id", currentPost.id);

        if (error) throw error;

        alert("Inlägget har uppdaterats!");
      } else {
        const { error } = await supabase.from("posts").insert([formData]);

        if (error) throw error;

        alert("Inlägget har skapats!");
      }
      setCurrentPost(null);
      setFormData({
        title: "",
        content: "",
        categories: [],
        tags: [],
        images: [],
      });
      navigate("/posts");
    } catch (error) {
      console.error("Error saving post", error);
    }
  };

  if (loading) {
    return <div>Laddar...</div>;
  }

  if (error) {
    return <div>{`Fel: ${error}`}</div>;
  }

  return (
    <div className="flex gap-10 p-6 bg-black text-green-400">
      {/* Lista med inlägg */}
      <div className="flex-1">
        <div className="text-center mb-6">
          <button
            onClick={() => navigate("/create-post")}
            className="bg-blue-400 text-black font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-blue-300 transition duration-200"
          >
            Skapa Nytt Inlägg
          </button>
        </div>

        <h2 className="text-3xl font-semibold mb-6 text-blue-400 text-center glow">Inlägg</h2>

        <table className="min-w-full table-auto bg-gray-900 rounded-lg shadow-lg">
          <thead>
            <tr className="bg-gray-800 text-blue-400">
              <th className="px-6 py-3 text-left">Titel</th>
              <th className="px-6 py-3 text-left">Skapad</th>
              <th className="px-6 py-3 text-left">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-800 transition-all duration-200 ease-in-out">
                <td className="px-6 py-3 text-white">{post.title}</td>
                <td className="px-6 py-3 text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-3 flex justify-around">
                  <button
                    onClick={() => handleEdit(post)}
                    className="bg-transparent text-white py-2 px-4 rounded-lg hover:bg-transparent transition flex items-center space-x-2"
                  >
                    <PencilIcon className="h-5 w-5 text-white" />
                  </button>

                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-transparent text-white py-2 px-4 rounded-lg hover:bg-transparent transition flex items-center space-x-2"
                  >
                    <TrashIcon className="h-5 w-5 text-white" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulär sektion för att skapa eller redigera inlägg */}
      <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-blue-400">Skapa eller Redigera Inlägg</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-blue-400 mb-2">Titel</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 bg-gray-700 text-white rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-blue-400 mb-2">Innehåll</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-2 bg-gray-700 text-white rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-blue-400 mb-2">Kategorier</label>
            <select
              value={formData.categories}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categories: Array.from(e.target.selectedOptions, (option) => option.value),
                })
              }
              className="w-full p-2 bg-gray-700 text-white rounded-lg"
              multiple
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-blue-400 mb-2">Taggar</label>
            <select
              value={formData.tags}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tags: Array.from(e.target.selectedOptions, (option) => option.value),
                })
              }
              className="w-full p-2 bg-gray-700 text-white rounded-lg"
              multiple
            >
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-blue-400 mb-2">Bilder</label>
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`Uploaded ${index}`} className="w-full h-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== index))}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="p-2 bg-gray-700 text-white rounded-lg mt-4"
            />
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="bg-green-400 text-black py-2 px-6 rounded-lg shadow-lg hover:bg-green-300 transition duration-200"
            >
              {currentPost ? "Uppdatera Inlägg" : "Skapa Inlägg"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostList;










