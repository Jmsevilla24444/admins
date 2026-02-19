import React, { useState } from "react";
import "./AdminDashboard.css";
import { IconUpload } from "./icons";
import { db } from "./service/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const AddFacilities: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [image, setImage] = useState<string | null>(null); // base64
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Convert file to base64
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) return alert("Please fill all fields!");

    setLoading(true);
    try {
      await addDoc(collection(db, "incomingFacilities"), {
        name,
        type,
        image: image || null,
        submittedBy: "Admin",
        submittedAt: serverTimestamp(),
        approved: false,
      });

      alert("Facility added and sent to Super Admin!");
      setName("");
      setType("");
      setImage(null);
      setPreview(null);
    } catch (err: any) {
      console.error("Error adding facility:", err);
      alert(`Failed to add facility: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ad-add">
      <form className="ad-form" onSubmit={onSubmit}>
        <div className="ad-form-grid">
          <div className="ad-form-left">
            <label className="ad-label">Facility Name</label>
            <input
              className="ad-input"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="ad-label">Type</label>
            <select
              className="ad-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Select Type</option>
              <option>Gate</option>
              <option>Office</option>
              <option>Room</option>
              <option>Academic</option>
              <option>Laboratory</option>
            </select>
          </div>

          <div className="ad-form-right">
            <div className="ad-upload-row">
              <div className="ad-upload">
                {preview ? (
                  <img
                    src={preview}
                    alt="facility"
                    className="ad-upload-preview"
                  />
                ) : (
                  <div className="ad-upload-empty">
                    <IconUpload size={22} />
                  </div>
                )}
                <input
                  className="ad-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={onPick}
                />
              </div>
              <div className="ad-upload-label">Upload image</div>
            </div>
          </div>
        </div>

        <div className="ad-form-actions">
          <button
            type="submit"
            className="ad-btn ad-btn-primary"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
      <p className="ad-footnote">
        This added facility will be reviewed by the Super Admin before
        activation.
      </p>
    </div>
  );
};

export default AddFacilities;
