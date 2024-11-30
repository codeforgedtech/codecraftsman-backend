import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

interface Ad {
  id: number;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  placement: string;
  created_at: string;
}

const AdListWithForm: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State för formulär och redigering
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    linkUrl: "",
    altText: "",
    placement: "Header", // Standardplacering
  });
  const [showAddButton, setShowAddButton] = useState<boolean>(false); // Ny state för att visa knappen "Lägg till Annons"

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data, error } = await supabase.from("ads").select("*");
        if (error) throw new Error(error.message);
        setAds(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Är du säker på att du vill ta bort denna annons?")) {
      try {
        const { error } = await supabase.from("ads").delete().eq("id", id);
        if (error) throw new Error(error.message);
        setAds((prevAds) => prevAds.filter((ad) => ad.id !== id));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleEditClick = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      altText: ad.altText,
      placement: ad.placement,
    });
    setShowAddButton(true); // Visa "Lägg till Annons"-knappen när redigera trycks
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAd) {
        // Redigera annons
        const { error } = await supabase
          .from("ads")
          .update(formData)
          .eq("id", editingAd.id);

        if (error) throw new Error(error.message);

        // Uppdatera listan
        setAds((prevAds) =>
          prevAds.map((ad) => (ad.id === editingAd.id ? { ...ad, ...formData } : ad))
        );
      } else {
        // Lägg till ny annons
        const { data, error } = await supabase.from("ads").insert([formData]);
        if (error) throw new Error(error.message);

        if (data) setAds((prevAds) => [...prevAds, ...data]);
      }

      // Rensa formulär och redigeringsläge
      setEditingAd(null);
      setFormData({
        imageUrl: "",
        linkUrl: "",
        altText: "",
        placement: "Header",
      });
      setShowAddButton(false); // Dölja knappen efter att en annons lagts till/redigerats
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddAdClick = () => {
    setEditingAd(null);
    setFormData({
      imageUrl: "",
      linkUrl: "",
      altText: "",
      placement: "Header",
    });
    setShowAddButton(false); // Dölja knappen "Lägg till Annons"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-blue-400">
        <p>Laddar annonser...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-blue-400">
        <p>Fel: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full bg-black text-blue-400">
      {/* Formulärsektion */}
      <div className="fixed bottom-0 left-0 w-full max-w-md p-6 bg-gray-900 rounded-lg shadow-lg border border-blue-400 z-50">
        {showAddButton && (
          <button
            onClick={handleAddAdClick}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 transition mb-6"
          >
            Lägg till Annons
          </button>
        )}
        <h2 className="text-2xl font-semibold mb-6">
          {editingAd ? "Redigera Annons" : "Lägg till Annons"}
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <input
            type="text"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleFormChange}
            placeholder="Bild-URL"
            className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
          />
          <input
            type="text"
            name="linkUrl"
            value={formData.linkUrl}
            onChange={handleFormChange}
            placeholder="Länk-URL"
            className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
          />
          <input
            type="text"
            name="altText"
            value={formData.altText}
            onChange={handleFormChange}
            placeholder="Alt-text"
            className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
          />
          <select
            name="placement"
            value={formData.placement}
            onChange={handleFormChange}
            className="w-full p-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="sidebar">Sidabar</option>
            <option value="in-content">In Content</option>
            <option value="middle">Post Middle</option>
            <option value="post-top">Post Top</option>
            <option value="post-bottom">Post Bottom</option>
          </select>
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 transition"
          >
            {editingAd ? "Spara Ändringar" : "Lägg till Annons"}
          </button>
        </form>
      </div>

      {/* Annonssektion */}
      <div className="flex-1 p-6 ">
        <h2 className="text-4xl font-semibold text-center mb-6">Hantera Annonser</h2>
        <ul className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3  bg-gray-900 rounded-lg shadow-lg border border-blue-400 ">
          {ads.map((ad) => (
            <li
              key={ad.id}
              className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800"
            >
              <img
                src={ad.imageUrl}
                alt={ad.altText || "Annonsbild"}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <p className="text-lg font-medium text-green-300 mb-2">
                Placement: {ad.placement}
              </p>
              <p className="text-sm text-gray-400 mb-4">Link: {ad.linkUrl}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleEditClick(ad)}
                  className="bg-transparent text-white hover:text-white transition flex items-center"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="bg-transparent text-white hover:text-white transition flex items-center"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
            
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Skapad: {new Date(ad.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdListWithForm;








