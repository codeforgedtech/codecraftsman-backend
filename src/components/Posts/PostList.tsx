import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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
  const [newCategory, setNewCategory] = useState<string>("");
  const [newTag, setNewTag] = useState<string>("");
  const [newImages, setNewImages] = useState<File[]>([]);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [showAddButton, setShowAddButton] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase.from("posts").select("*");
        if (error) throw new Error(error.message);

        // Sortera inläggen efter datum i fallande ordning (nyaste först)
        const sortedPosts = (data || []).sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // Extract categories and tags from posts and remove duplicates
        const allCategories = new Set<string>();
        const allTags = new Set<string>();

        sortedPosts.forEach((post: any) => {
          post.categories?.forEach((category: string) => allCategories.add(category));
          post.tags?.forEach((tag: string) => allTags.add(tag));
        });

        setPosts(sortedPosts);
        setCategories(Array.from(allCategories)); // Convert Set to Array
        setTags(Array.from(allTags)); // Convert Set to Array
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleEdit = (post: any) => {
    setCurrentPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      categories: post.categories || [],
      tags: post.tags || [],
      images: post.images || [],
    });
    setFormVisible(true);
    setShowAddButton(true)
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const uploadImages = async () => {
        const uploadedImages: string[] = [];
        for (const file of Array.from(files)) {
          const { data, error } = await supabase.storage
            .from("images")
            .upload(`/${file.name}`, file);

          if (error) {
            console.error("Error uploading image:", error);
            continue;
          }

          const fullURL = `https://iwlqqtafktfqeyapqxgz.supabase.co/storage/v1/object/public/images/${data?.path}`;
          uploadedImages.push(fullURL);
        }
        setFormData((prevData) => ({
          ...prevData,
          images: [...prevData.images, ...uploadedImages],
        }));
      };

      uploadImages();
    }
  };

  const handleDeleteImage = (image: string) => {
    const confirmDelete = window.confirm("Vill du ta bort denna bild?");
    if (confirmDelete) {
      const fileName = image.split("/").pop(); 
      if (fileName) {
        supabase.storage
          .from("images")
          .remove([fileName])
          .then(({ error }) => {
            if (error) {
              console.error("Error deleting image:", error);
            } else {
              setFormData((prevData) => ({
                ...prevData,
                images: prevData.images.filter((img) => img !== image),
              }));
            }
          });
      }
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug = generateSlug(formData.title);

    try {
      if (currentPost?.id) {
        const { error } = await supabase
          .from("posts")
          .update({ ...formData, slug })
          .eq("id", currentPost.id);

        if (error) throw error;

        alert("Inlägget har uppdaterats!");
      } else {
        const { error } = await supabase
          .from("posts")
          .insert([{ ...formData, slug }]);

        if (error) throw error;

        alert("Inlägget har skapats!");
      }
      resetFormAndNavigate();
    } catch (error) {
      console.error("Error saving post", error);
      alert("Ett fel inträffade vid sparandet av inlägget.");
    }
  };

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  function resetFormAndNavigate() {
    setCurrentPost(null);
    setFormData({
      title: "",
      content: "",
      categories: [],
      tags: [],
      images: [],
    });
    navigate("/manage-posts");
  }

  const addCategory = async () => {
    if (newCategory.trim()) {
      const { error } = await supabase
        .from("categories")
        .insert([{ name: newCategory }]);

      if (error) {
        console.error("Error adding category:", error);
        return;
      }

      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory(e.target.value);
  };
  const handleCreateNewPost = () => {
    setCurrentPost(null);
    setFormData({
      title: "",
      content: "",
      categories: [],
      tags: [],
      images: [],
    });
    setFormVisible(true);
    setShowAddButton(false)
  };

  const addTag = async () => {
    if (newTag.trim()) {
      const { error } = await supabase.from("tags").insert([{ name: newTag }]);

      if (error) {
        console.error("Error adding tag:", error);
        return;
      }

      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  if (loading) {
    return <div>Laddar...</div>;
  }

  if (error) {
    return <div>{`Fel: ${error}`}</div>;
  }
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTag(e.target.value);
  };
  return (
    <div className="flex w-full gap-10 p-6 bg-black text-blue">
      {/* Lista med inlägg */}
      <div className="flex-1">
        <div className="text-center mb-6">
          <button
            onClick={handleCreateNewPost}
            className="bg-blue-400 text-black font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-blue-300 transition duration-200"
          >
            Skapa Nytt Inlägg
          </button>
        </div>

        <h2 className="text-3xl font-semibold mb-6 text-blue-400 text-center">Inlägg</h2>

        <table className="min-w-full table-auto bg-gray-900 rounded-lg shadow-lg border border-blue-400">
          <thead>
            <tr className="bg-gray-800 text-blue-400 ">
              <th className="px-6 py-3 text-left">Titel</th>
              <th className="px-6 py-3 text-left">Datum</th>
              <th className="px-6 py-3 text-left">Aktioner</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-blue-400 text-blue-400">
                <td className="px-6 py-4">{post.title}</td>
                <td className="px-6 py-4">{new Date(post.created_at).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <PencilIcon
                    onClick={() => handleEdit(post)}
                    className="w-5 h-5 text-white cursor-pointer inline-block mr-4"
                  />
                  <TrashIcon
                    onClick={() => handleDelete(post.id)}
                    className="w-5 h-5 text-white cursor-pointer inline-block"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formVisible && (
  <div className="fixed bottom-0 left-0 w-full max-w-md p-6 bg-gray-900 rounded-lg shadow-lg border border-blue-400 z-50 overflow-y-auto max-h-screen">
    {showAddButton && (
      <div className="flex justify-center mb-4">
        <button
          onClick={handleCreateNewPost}
          className="bg-blue-400 text-black font-semibold py-2 px-6 rounded-lg shadow-lg mr-4 hover:bg-blue-300 transition duration-200"
        >
          Skapa Nytt Inlägg
        </button>
      </div>
    )}

    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-white">Titel</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-white">Innehåll</label>
        <ReactQuill
          value={formData.content}
          onChange={(value) => setFormData({ ...formData, content: value })}
          className="h-24"
        />
      </div>

      <div className="mb-4">
        <label className="block text-white">Kategorier</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newCategory}
            onChange={handleCategoryInputChange}
            placeholder="Lägg till en kategori"
            className="px-3 py-2 bg-gray-700 text-white rounded w-2/3"
          />
          <button
            type="button"
            onClick={addCategory}
            className="bg-blue-400 text-black font-semibold py-2 px-4 rounded-lg"
          >
            Lägg till
          </button>
        </div>
        <div className="mt-2">
          <select
            multiple
            value={formData.categories}
            onChange={(e) =>
              setFormData({
                ...formData,
                categories: Array.from(e.target.selectedOptions, (option) => option.value),
              })
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded mt-2"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-white">Taggar</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={handleTagInputChange}
            placeholder="Lägg till en tagg"
            className="px-3 py-2 bg-gray-700 text-white rounded w-2/3"
          />
          <button
            type="button"
            onClick={addTag}
            className="bg-blue-400 text-black font-semibold py-2 px-4 rounded-lg"
          >
            Lägg till
          </button>
        </div>
        <div className="mt-2">
          <select
            multiple
            value={formData.tags}
            onChange={(e) =>
              setFormData({
                ...formData,
                tags: Array.from(e.target.selectedOptions, (option) => option.value),
              })
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded mt-2"
          >
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-white">Bilder</label>
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          className="w-full bg-gray-700 text-white rounded"
        />
        <div className="mt-4">
          {formData.images.map((image, idx) => (
            <div key={idx} className="flex items-center space-x-2 mb-2">
              <img
                src={image}
                alt="Uploaded"
                className="w-12 h-12 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(image)}
                className="text-red-500"
              >
                Ta bort
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-400 text-black font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-blue-300 transition duration-200"
        >
          {currentPost ? "Uppdatera Inlägg" : "Skapa Inlägg"}
        </button>
      </div>
    </form>
  </div>
)}

    </div>
    
  );
};

export default PostList;














