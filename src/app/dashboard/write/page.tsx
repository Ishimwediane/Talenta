'use client';
import React, { useState } from "react";
import axios from "axios";

export default function BookUploadForm() {
  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    description: "",
    publisher: "",
    publicationDate: "",
    isbn: "",
    category: "",
    language: "",
    tags: "",
    pageCount: "",
    rights: "",
    isPublished: false,
    userId: "", // replace with logged-in user id
  });

  const [coverImage, setCoverImage] = useState(null);
  const [bookFile, setBookFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coverImage || !bookFile) {
      alert("Please upload both cover image and book file");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    data.append("coverImage", coverImage);
    data.append("bookFile", bookFile);

    try {
      const res = await axios.post("http://localhost:5000/api/books", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Book uploaded successfully!");
      console.log(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to upload book");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
      <input name="title" placeholder="Title" onChange={handleChange} required />
      <input name="authors" placeholder="Authors" onChange={handleChange} required />
      <textarea name="description" placeholder="Description" onChange={handleChange} />
      <input name="publisher" placeholder="Publisher" onChange={handleChange} />
      <input type="date" name="publicationDate" onChange={handleChange} />
      <input name="isbn" placeholder="ISBN" onChange={handleChange} />
      <input name="category" placeholder="Category" onChange={handleChange} />
      <input name="language" placeholder="Language" onChange={handleChange} />
      <input name="tags" placeholder="Tags (comma separated)" onChange={handleChange} />
      <input name="pageCount" placeholder="Page Count" type="number" onChange={handleChange} />
      <input name="rights" placeholder="Rights" onChange={handleChange} />
      <label>
        Published:
        <input type="checkbox" name="isPublished" onChange={handleChange} />
      </label>
      <input name="userId" placeholder="User ID" onChange={handleChange} required />

      <label>Cover Image:</label>
      <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} required />

      <label>Book File:</label>
      <input type="file" accept=".pdf,.epub" onChange={(e) => setBookFile(e.target.files[0])} required />

      <button type="submit">Upload Book</button>
    </form>
  );
}
