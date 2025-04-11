import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient"; // Adjust if your supabase client is different
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import ReactQuill from "react-quill"; // Importera Quill-komponenten
import "react-quill/dist/quill.snow.css";
// Create a type for a review
interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  imageUrl: string;
  created_at: string;
  version: string;
  os_type: string;
  origin: string;
  desktop_environment: string[];
  categories: string[];
  based_on: string[];
  architecture: string[];
  slug: string;
}

const ReviewListWithForm: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for form and editing
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<Partial<Review>>({
    title: "",
    content: "",
    rating: 0,
    imageUrl: "",
    version: "",
    os_type: "",
    origin: "",
    desktop_environment: [],
    categories: [],
    based_on: [],
    architecture: [],
    slug: "",
  });

  const [showAddForm, setShowAddForm] = useState<boolean>(false); // To show/hide the form

  // Fetch reviews from Supabase
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase.from("reviews").select("*");
        if (error) throw new Error(error.message);
        setReviews(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Omvandla kommaseparerad sträng till array för dessa specifika fält
    if (
      name === "desktop_environment" ||
      name === "categories" ||
      name === "based_on" ||
      name === "architecture"
    ) {
      const updatedArray = value.split(",").map((item) => item.trim());
      setFormData((prev) => ({
        ...prev,
        [name]: updatedArray,
      }));
    } else {
      // För alla andra fält
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission to add or edit a review
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingReview) {
        // Edit review
        const { error } = await supabase
          .from("reviews")
          .update(formData)
          .eq("id", editingReview.id);

        if (error) throw new Error(error.message);

        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === editingReview.id ? { ...review, ...formData } : review
          )
        );
      } else {
        // Add a new review
        const { data, error } = await supabase
          .from("reviews")
          .insert([formData]);
        if (error) throw new Error(error.message);

        if (data) {
          setReviews((prevReviews) => [...prevReviews, ...data]);
        }
      }

      // Reset form data and close the form
      setEditingReview(null);
      setFormData({
        title: "",
        content: "",
        rating: 0,
        imageUrl: "",
        version: "",
        os_type: "",
        origin: "",
        desktop_environment: [],
        categories: [],
        based_on: [],
        architecture: [],
        slug: "",
      });
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message);
    }
  };
  const handleOpenAddForm = () => {
    setEditingReview(null);
    setFormData({
      title: "",
      content: "",
      rating: 0,
      imageUrl: "",
      version: "",
      os_type: "",
      origin: "",
      desktop_environment: [],
      categories: [],
      based_on: [],
      architecture: [],
      slug: "",
    });
    setShowAddForm(true);
  };
  // Handle review deletion
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        const { error } = await supabase.from("reviews").delete().eq("id", id);
        if (error) throw new Error(error.message);
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== id)
        );
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  // Handle review edit
  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    setFormData({
      title: review.title,
      content: review.content,
      rating: review.rating,
      imageUrl: review.imageUrl,
      version: review.version,
      os_type: review.os_type,
      origin: review.origin,
      desktop_environment: review.desktop_environment,
      categories: review.categories,
      based_on: review.based_on,
      architecture: review.architecture,
      slug: review.slug,
    });
    setShowAddForm(true);
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const { error } = await supabase.storage
      .from("reviews")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("reviews")
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      setFormData((prev) => ({
        ...prev,
        imageUrl: publicUrlData.publicUrl,
      }));
    }
  };
  // Display loading or error message
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-blue-400">
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-blue-400">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-black text-blue-400 justify-center items-center">
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-80">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 bg-gray-900 rounded-lg shadow-lg border border-blue-400">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-400 transition duration-200"
              >
                X
              </button>
            </div>
            <h2 className="text-2xl font-semibold mb-6 text-center">
              {editingReview ? "Edit Review" : "Add Review"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Title"
                className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
              />
              <div className="w-full">
                <ReactQuill
                  value={formData.content || ""}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, content: value }))
                  } // Update 'content' directly
                  placeholder="Write your review..."
                  className="h-60 p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
                />
              </div>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleFormChange}
                placeholder="Rating (1-5)"
                className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
              />
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="mt-4 w-full max-h-64 object-contain rounded"
                  />
                )}
              </div>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleFormChange}
                placeholder="Version"
                className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
              />
              <input
                type="text"
                name="os_type"
                value={formData.os_type}
                onChange={handleFormChange}
                placeholder="OS Type"
                className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
              />
              <input
                type="text"
                name="rating"
                value={formData.rating}
                onChange={handleFormChange}
                placeholder="Rating (1-5)"
                className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
              />

              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleFormChange}
                placeholder="Origin"
                className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
              />
              <input
                name="desktop_environment"
                value={(formData.desktop_environment || []).join(", ")}
                onChange={handleFormChange}
                placeholder="Desktop Environment (comma-separated)"
                className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
              />
              <input
                name="categories"
                value={(formData.categories || []).join(", ")}
                onChange={handleFormChange}
                placeholder="Categories (comma-separated)"
                className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
              />
              <input
                name="based_on"
                value={(formData.based_on || []).join(", ")}
                onChange={handleFormChange}
                placeholder="Based On (comma-separated)"
                className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
              />
              <input
                name="architecture"
                value={(formData.architecture || []).join(", ")}
                onChange={handleFormChange}
                placeholder="Architecture (comma-separated)"
                className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
              />
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleFormChange}
                placeholder="Slug"
                className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
              />
              <button
                type="submit"
                className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 transition"
              >
                {editingReview ? "Save Changes" : "Add Review"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="flex-1 w-full max-w-screen-xl p-6 overflow-y-auto">
        <h2 className="text-4xl font-semibold text-center mb-6">
          Manage Reviews
        </h2>
        <button
          onClick={handleOpenAddForm}
          className="mx-auto bg-blue-400 text-black font-semibold py-2 px-6 text-sm rounded-lg shadow-lg hover:bg-blue-300 transition duration-200 mb-6"
        >
          Add Review
        </button>
        <ul className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 bg-gray-900 rounded-lg shadow-lg border border-blue-400">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800"
            >
              <img
                src={review.imageUrl}
                alt={review.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-medium text-green-300">
                {review.title}
              </h3>
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={() => handleEditClick(review)}
                  className="bg-transparent text-white hover:text-white transition flex items-center"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="bg-transparent text-white hover:text-white transition flex items-center"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReviewListWithForm;
