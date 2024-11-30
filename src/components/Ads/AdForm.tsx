import React from "react";

const AdForm = () => {
  return (
    <form className="space-y-4">
      <div>
        <label className="block font-bold">Bild-URL</label>
        <input type="text" className="border p-2 w-full" />
      </div>
      <div>
        <label className="block font-bold">Länk-URL</label>
        <input type="text" className="border p-2 w-full" />
      </div>
      <div>
        <label className="block font-bold">Placering</label>
        <select className="border p-2 w-full">
          <option value="header">Header</option>
          <option value="sidebar">Sidebar</option>
          <option value="footer">Footer</option>
        </select>
      </div>
      <button className="bg-blue-500 text-white px-4 py-2">Spara</button>
    </form>
  );
};

export default AdForm;