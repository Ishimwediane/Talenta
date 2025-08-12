'use client';
import React, { useState, useEffect } from "react";
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
    userId: "", // will be set from logged-in user
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);

  // Load logged-in user ID from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFormData(prev => ({ ...prev, userId: user.id }));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" && e.target instanceof HTMLInputElement
        ? e.target.checked
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!coverImage || !bookFile) {
      alert("Please upload both cover image and book file");
      return;
    }

    // ISBN validation
    if (
      formData.isbn &&
      !/^(?:\d{9}[\dXx]|\d{13})$/.test(formData.isbn.replace(/[-\s]/g, ''))
    ) {
      alert("Invalid ISBN format");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "tags" && typeof value === "string" && value.trim() !== "") {
        const tagsArray = value
          .split(",")
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        data.append("tags", JSON.stringify(tagsArray));
      } else if (value !== "" && value !== null) {
        data.append(key, String(value));
      }
    });

    data.append("coverImage", coverImage);
    data.append("bookFile", bookFile);

    try {
      const token = localStorage.getItem("authToken"); // assuming you store JWT after login
      const res = await axios.post("http://localhost:5000/api/books", data, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` // if your backend requires auth
        },
      });

      alert("Book uploaded successfully!");
      console.log(res.data);

      // Reset form
      setFormData(prev => ({
        ...prev,
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
      }));
      setCoverImage(null);
      setBookFile(null);

    } catch (error) {
      console.error(error);
      alert("Failed to upload book");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}
    >
      <input name="title" placeholder="Title" onChange={handleChange} value={formData.title} required />
      <input name="authors" placeholder="Authors" onChange={handleChange} value={formData.authors} required />
      <textarea name="description" placeholder="Description" onChange={handleChange} value={formData.description} />
      <input name="publisher" placeholder="Publisher" onChange={handleChange} value={formData.publisher} />
      <input type="date" name="publicationDate" onChange={handleChange} value={formData.publicationDate} />
      <input name="isbn" placeholder="ISBN" onChange={handleChange} value={formData.isbn} />
      <input name="category" placeholder="Category" onChange={handleChange} value={formData.category} />
      <input name="language" placeholder="Language" onChange={handleChange} value={formData.language} />
      <input name="tags" placeholder="Tags (comma separated)" onChange={handleChange} value={formData.tags} />
      <input name="pageCount" placeholder="Page Count" type="number" onChange={handleChange} value={formData.pageCount} />
      <input name="rights" placeholder="Rights" onChange={handleChange} value={formData.rights} />
      <label>
        Published:
        <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} />
      </label>

      <label>Cover Image:</label>
      <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} required />

      <label>Book File:</label>
      <input type="file" accept=".pdf,.epub" onChange={(e) => setBookFile(e.target.files?.[0] || null)} required />

      <button type="submit">Upload Book</button>
    </form>
  );
}
