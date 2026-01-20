// src/components/Report.tsx
import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { db, storage } from "./service/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const ADMIN_ID = "admin_001";

interface ReportType {
  id: string;
  title: string;
  description: string;
  image: string | null;
  from: string;
  category: string;
  status: string;
  created: string;
  createdAt: any;
}

const Report: React.FC = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reports, setReports] = useState<ReportType[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<ReportType | null>(null);

  // Image picker
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Upload image to Firebase Storage
  const uploadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const filename = `reports/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        () => {},
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        },
      );
    });
  };

  // Fetch reports in real-time
  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc")); // lowercase
    const unsub = onSnapshot(q, (snap) => {
      const list: ReportType[] = snap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
        .filter((r) => r.from === ADMIN_ID); // only show admin's reports
      setReports(list);
    });
    return () => unsub();
  }, []);

  // Submit report
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) {
      alert("Please enter title and description.");
      return;
    }
    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      await addDoc(collection(db, "reports"), {
        // lowercase
        title: title.trim(),
        description: desc.trim(),
        image: imageUrl,
        from: ADMIN_ID,
        category: "General",
        status: "Open",
        created: new Date().toLocaleString(),
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDesc("");
      setImageFile(null);
      setPreview(null);
      alert("Report sent successfully!");
    } catch (err) {
      console.error("Failed to send report:", err);
      alert("Failed to send report. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  // Delete report
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteDoc(doc(db, "reports", deleteConfirm.id)); // lowercase
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete report:", err);
      alert("Failed to delete report.");
    }
  };

  // Badge color
  const statusClass = (status: string) => {
    const s = (status || "Open").toLowerCase();
    if (s === "open") return "ad-badge rose";
    if (s === "in review") return "ad-badge amber";
    if (s === "resolved") return "ad-badge emerald";
    return "ad-badge gray";
  };

  return (
    <div className="ad-add">
      {/* Report Form */}
      <form className="ad-form" onSubmit={onSubmit}>
        <div className="ad-form-grid">
          <div className="ad-form-left">
            <label className="ad-label">Title</label>
            <input
              className="ad-input"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <label className="ad-label">Description</label>
            <textarea
              className="ad-input ad-textarea"
              placeholder="Describe the issue"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />
          </div>

          <div className="ad-form-right">
            <div className="ad-upload-row">
              <div className="ad-upload">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="ad-upload-preview"
                  />
                ) : (
                  <div className="ad-upload-empty">
                    <div className="ad-upload-ico">⬆️</div>
                  </div>
                )}
                <input
                  className="ad-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={onPick}
                />
              </div>
              <div>
                <div className="ad-upload-label">Upload image</div>
                <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 6 }}>
                  Optional, for visual context
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ad-form-actions">
          <button
            type="submit"
            className="ad-btn ad-btn-primary"
            disabled={saving}
          >
            {saving ? "Sending..." : "Send"}
          </button>
        </div>
      </form>

      {/* Reports Table */}
      <div className="ad-table-card" style={{ marginTop: 24 }}>
        <h3>Your Reports</h3>
        <table className="ad-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 16 }}>
                  No reports yet
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{r.description}</td>
                  <td>
                    <span className={statusClass(r.status)}>{r.status}</span>
                  </td>
                  <td>{r.created}</td>
                  <td>
                    <button
                      className="ad-icon-btn"
                      title="Delete report"
                      onClick={() => setDeleteConfirm(r)}
                      style={{ fontSize: 16 }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ background: "#fff", borderRadius: 12, width: 400 }}>
            <div style={{ padding: 16 }}>
              Delete report "{deleteConfirm.title}" permanently?
            </div>
            <div className="ad-form-actions" style={{ padding: 16 }}>
              <button className="ad-btn" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                className="ad-btn ad-btn-primary"
                style={{ backgroundColor: "red", color: "#fff" }}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
