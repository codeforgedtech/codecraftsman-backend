import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

interface User {
  id: string;
  full_name: string;
  email: string;
  profile_image: string;
  phone_number: string;
  status: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [imageFile, setImageFile] = useState<File | null>(null); // State to store the image file

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          throw new Error("Could not fetch user data");
        }

        const { data, error: userDetailsError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userData.user.id)
          .single();

        if (userDetailsError) throw new Error(userDetailsError.message);

        setUser(data);
        setFormData(data); // Set initial form data
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      if (!user) return;

      let profileImageUrl = user.profile_image; // Keep existing image URL if not uploading a new one
      if (imageFile) {
        // Upload the file to Supabase storage
        const filePath = `profile-images/${user.id}/${imageFile.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600", // optional: caching for 1 hour
            upsert: true, // optional: overwrite existing file
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // Ensure file was uploaded before getting the public URL
        if (data) {
          profileImageUrl = supabase.storage
            .from("profile-images")
            .getPublicUrl(filePath).publicURL;
        }
      }

      // Update the user profile with the new image URL and other form data
      const { error } = await supabase
        .from("users")
        .update({ ...formData, profile_image: profileImageUrl })
        .eq("id", user.id);

      if (error) throw new Error(error.message);

      // Successfully updated the profile
      setUser((prevUser) => ({ ...prevUser!, ...formData, profile_image: profileImageUrl }));
      setEditMode(false); // Exit edit mode
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setFormData(user!); // Reset to original user data
    setEditMode(false);
    setImageFile(null); // Reset image selection
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="h-screen w-screen bg-black text-blue-400 flex flex-col items-center">
      <h2 className="text-3xl font-semibold mb-6 text-blue-400 text-center mt-12">Profile</h2>

      {/* Profile Info */}
      {user && (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-blue-400 w-full max-w-md">
          <div className="flex justify-center mb-4">
            <img
              src={user.profile_image || "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>

          {/* If not in edit mode, display the details */}
          {!editMode ? (
            <div className="mb-4">
              <p className="text-lg font-semibold">Name: {user.full_name}</p>
              <p className="text-sm">Email: {user.email}</p>
              <p className="text-sm">Phone: {user.phone_number}</p>
              <p className="text-sm">Status: {user.status}</p>
            </div>
          ) : (
            <div className="mb-4">
              <div className="mb-2">
                <label className="block text-sm font-semibold">Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name || ""}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white p-2 rounded w-full"
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white p-2 rounded w-full"
                  disabled
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-semibold">Phone</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number || ""}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white p-2 rounded w-full"
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-semibold">Status</label>
                <input
                  type="text"
                  name="status"
                  value={formData.status || ""}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white p-2 rounded w-full"
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-semibold">Profile Image</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="bg-gray-800 text-white p-2 rounded w-full"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-400 text-black py-2 px-4 rounded-lg hover:bg-blue-300 transition mb-2"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                className="bg-blue-400 text-black py-2 px-4 rounded-lg hover:bg-blue-300 transition"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-black py-2 px-4 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;



















