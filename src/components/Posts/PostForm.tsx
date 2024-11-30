import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

const PostForm = ({ post }: { post: any | null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categories: [],
    tags: [],
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]); // För att hålla kategorier
  const [tags, setTags] = useState<any[]>([]); // För att hålla taggar

  // Hämta kategorier och taggar från databasen (om du har sådana tabeller)
  useEffect(() => {
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

    fetchCategoriesAndTags();
  }, []);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        categories: post.categories || [],
        tags: post.tags || [],
        images: post.images || [],
      });
    }
  }, [post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setLoading(true);
      const uploadImages = async () => {
        const uploadedImages: string[] = [];
        for (const file of Array.from(files)) {
          const { data, error } = await supabase.storage
            .from("images")
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
        setLoading(false);
      };

      uploadImages();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (post?.id) {
        const { error } = await supabase
          .from("posts")
          .update({ ...formData })
          .eq("id", post.id);

        if (error) throw error;

        alert("Inlägget har uppdaterats!");
      } else {
        const { error } = await supabase.from("posts").insert([formData]);

        if (error) throw error;

        alert("Inlägget har skapats!");
      }
      navigate("/posts");
    } catch (error) {
      console.error("Error saving post", error);
    }
  };

  return (
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
        <input type="file" multiple onChange={handleImageChange} />
        <div className="mt-2">
          {formData.images.length > 0 &&
            formData.images.map((image: string, index: number) => (
              <img
                key={index}
                src={`https://your-bucket-url/${image}`}
                alt="Uploaded"
                className="w-20 h-20 object-cover rounded-lg"
              />
            ))}
        </div>
      </div>
      <button
        type="submit"
        className="bg-blue-400 text-black font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-blue-300 transition duration-200"
      >
        {post ? "Uppdatera Inlägg" : "Skapa Inlägg"}
      </button>
    </form>
  );
};

export default PostForm;



