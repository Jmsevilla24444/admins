import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { IconEdit, IconTrash, IconSearch } from "./icons";
import { db } from "./service/firebase";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
}

const AddNotification: React.FC = () => {
  // ===== YOUR EXISTING STATES (UNCHANGED) =====
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  // ===== ADDED STATES =====
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [query, setQuery] = useState("");
  const [editItem, setEditItem] = useState<NotificationItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<NotificationItem | null>(
    null
  );

  // ===== FETCH NOTIFICATIONS =====
  const fetchNotifications = async () => {
    try {
      const snap = await getDocs(collection(db, "Notifications"));
      const list: NotificationItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<NotificationItem, "id">),
      }));
      setNotifications(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ===== YOUR EXISTING ADD LOGIC (UNCHANGED) =====
  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();

    if (!title || !description || !date || !time) {
      alert("Please fill in all fields.");
      return;
    }

    const selectedDateTime = new Date(`${date}T${time}`);
    if (selectedDateTime < new Date()) {
      alert("You cannot select a past date or time.");
      return;
    }

    setSaving(true);
    try {
      const ref = await addDoc(collection(db, "Notifications"), {
        title,
        message: description,
        date,
        time,
        createdAt: serverTimestamp(),
      });

      setNotifications((prev) => [
        ...prev,
        {
          id: ref.id,
          title,
          message: description,
          date,
          time,
        },
      ]);

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: description });
      }

      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      alert("Notification created successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to create notification.");
    } finally {
      setSaving(false);
    }
  };

  // ===== DELETE =====
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteDoc(doc(db, "Notifications", deleteConfirm.id));
      setNotifications((prev) => prev.filter((n) => n.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ===== SAVE EDIT =====
  const handleSaveEdit = async () => {
    if (!editItem) return;
    try {
      await updateDoc(doc(db, "Notifications", editItem.id), {
        title: editItem.title,
        message: editItem.message,
        date: editItem.date,
        time: editItem.time,
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === editItem.id ? editItem : n))
      );
      setEditItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.message.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="ad-add">
      {/* FORM */}
      <form className="ad-form" onSubmit={onSubmit}>
        <div className="ad-form-grid">
          <div className="ad-form-left">
            <label className="ad-label">Title</label>
            <input
              className="ad-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="ad-label">Description</label>
            <textarea
              className="ad-input"
              style={{ height: 100 }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label className="ad-label">Date</label>
            <input
              type="date"
              className="ad-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <label className="ad-label">Time</label>
            <input
              type="time"
              className="ad-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="ad-form-actions">
          <button
            type="submit"
            className="ad-btn ad-btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Notification"}
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div
        className="ad-table-card"
        style={{ marginTop: 30, maxHeight: 400, overflowY: "auto" }}
      >
        <header className="ad-header">
          <h1 className="ad-title">All Notifications</h1>
        </header>

        <div className="ad-search">
          <span className="ad-search-ico">
            <IconSearch size={16} />
          </span>
          <input
            className="ad-search-input"
            placeholder="Search Notification"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <table className="ad-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Description</th>
              <th className="ad-col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((n) => (
              <tr key={n.id}>
                <td>{n.title}</td>
                <td>{n.date}</td>
                <td>{n.time}</td>
                <td>{n.message}</td>
                <td className="ad-actions">
                  <button
                    className="ad-icon-btn edit"
                    onClick={() => setEditItem(n)}
                  >
                    <IconEdit size={16} />
                  </button>
                  <button
                    className="ad-icon-btn danger"
                    onClick={() => setDeleteConfirm(n)}
                  >
                    <IconTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editItem && (
        <div className="ad-modal-overlay">
          <div className="ad-modal-content">
            <h3>Edit Notification</h3>
            <input
              className="ad-input"
              value={editItem.title}
              onChange={(e) =>
                setEditItem({ ...editItem, title: e.target.value })
              }
            />
            <textarea
              className="ad-input"
              style={{ height: 80 }}
              value={editItem.message}
              onChange={(e) =>
                setEditItem({ ...editItem, message: e.target.value })
              }
            />
            <input
              type="date"
              className="ad-input"
              value={editItem.date}
              onChange={(e) =>
                setEditItem({ ...editItem, date: e.target.value })
              }
            />
            <input
              type="time"
              className="ad-input"
              value={editItem.time}
              onChange={(e) =>
                setEditItem({ ...editItem, time: e.target.value })
              }
            />
            <div className="ad-modal-actions">
              <button
                className="ad-btn ad-btn-primary"
                onClick={handleSaveEdit}
              >
                Save
              </button>
              <button className="ad-btn" onClick={() => setEditItem(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="ad-modal-overlay">
          <div className="ad-modal-content">
            <h3>Delete Notification</h3>
            <p>
              Delete <strong>{deleteConfirm.title}</strong>?
            </p>
            <div className="ad-modal-actions">
              <button className="ad-btn danger" onClick={handleDelete}>
                Delete
              </button>
              <button className="ad-btn" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNotification;
