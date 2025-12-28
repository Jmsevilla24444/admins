// src/components/AddEvents.tsx
import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { IconUpload, IconEdit, IconTrash, IconSearch } from "./icons";
import { db, storage } from "./service/firebase";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  image: string;
}

const AddEvents: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<EventItem | null>(null);
  const [editEvent, setEditEvent] = useState<EventItem | null>(null);
  const [query, setQuery] = useState("");

  // Pick image
  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File) => {
    const filename = `events/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const formatDate = (value: string) => {
    const d = new Date(value);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (value: string) => {
    const t = new Date(`1970-01-01T${value}`);
    let hours = t.getHours();
    const minutes = t.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const snapshot = await getDocs(collection(db, "Events"));
      const list: EventItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<EventItem, "id">),
      }));
      setEvents(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Add event
  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!title || !description || !date || !time || !imageFile) {
      alert("Please fill in all fields.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      alert("You cannot select a past date.");
      return;
    }

    setSaving(true);
    try {
      const imageUrl = await uploadImage(imageFile);
      const docRef = await addDoc(collection(db, "Events"), {
        title,
        description,
        date: formatDate(date),
        time: formatTime(time),
        image: imageUrl,
        createdAt: serverTimestamp(),
      });

      setEvents((prev) => [
        ...prev,
        {
          id: docRef.id,
          title,
          description,
          date: formatDate(date),
          time: formatTime(time),
          image: imageUrl,
        },
      ]);

      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setImageFile(null);
      setPreview(null);

      alert("Event created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create event.");
    } finally {
      setSaving(false);
    }
  };

  // Delete event
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteDoc(doc(db, "Events", deleteConfirm.id));
      setEvents((prev) => prev.filter((e) => e.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete event.");
    }
  };

  // Save edit from modal
  const handleSaveEdit = async () => {
    if (!editEvent) return;
    try {
      const refDoc = doc(db, "Events", editEvent.id);
      await updateDoc(refDoc, {
        title: editEvent.title,
        description: editEvent.description,
        date: editEvent.date,
        time: editEvent.time,
      });
      setEvents((prev) =>
        prev.map((e) => (e.id === editEvent.id ? editEvent : e))
      );
      setEditEvent(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update event.");
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="ad-add">
      {/* Event Form */}
      <form className="ad-form" onSubmit={onSubmit}>
        <div className="ad-form-grid">
          <div className="ad-form-left">
            <label className="ad-label">Event Title</label>
            <input
              className="ad-input"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label className="ad-label">Description</label>
            <textarea
              className="ad-input"
              style={{ height: 100 }}
              placeholder="Event Description"
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

          <div className="ad-form-right">
            <div className="ad-upload-row">
              <div className="ad-upload">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="ad-upload-preview"
                  />
                ) : (
                  <div className="ad-upload-empty">
                    <div className="ad-upload-ico">
                      <IconUpload size={22} />
                    </div>
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
            <div className="ad-help">Use a 4:3 image. PNG or JPG.</div>
          </div>
        </div>

        <div className="ad-form-actions">
          <button
            type="submit"
            className="ad-btn ad-btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Add"}
          </button>
          <button
            type="button"
            className="ad-btn"
            onClick={() => (window.location.hash = "#/dashboard")}
          >
            Cancel
          </button>
        </div>
      </form>

      <p className="ad-footnote">
        This added Event will be reviewed by the Super Admin before activation.
      </p>

      {/* Scrollable Event Table */}
      <div
        className="ad-table-card"
        style={{ marginTop: 30, maxHeight: 400, overflowY: "auto" }}
      >
        <header className="ad-header">
          <h1 className="ad-title">All Events</h1>
        </header>

        <div className="ad-search">
          <span className="ad-search-ico" aria-hidden>
            <IconSearch size={16} />
          </span>
          <input
            className="ad-search-input"
            placeholder="Search Events"
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
            {filteredEvents.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{e.date}</td>
                <td>{e.time}</td>
                <td>{e.description}</td>
                <td className="ad-actions">
                  <button
                    className="ad-icon-btn edit"
                    title="Edit"
                    onClick={() => setEditEvent(e)}
                  >
                    <IconEdit size={16} />
                  </button>
                  <button
                    className="ad-icon-btn danger"
                    title="Delete"
                    type="button"
                    onClick={() => setDeleteConfirm(e)}
                  >
                    <IconTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editEvent && (
        <div className="ad-modal-overlay">
          <div className="ad-modal-content">
            <h3>Edit Event</h3>
            <label>Title</label>
            <input
              className="ad-input"
              value={editEvent.title}
              onChange={(e) =>
                setEditEvent({ ...editEvent, title: e.target.value })
              }
            />
            <label>Date</label>
            <input
              className="ad-input"
              type="date"
              value={editEvent.date}
              onChange={(e) =>
                setEditEvent({ ...editEvent, date: e.target.value })
              }
            />
            <label>Time</label>
            <input
              className="ad-input"
              type="time"
              value={editEvent.time}
              onChange={(e) =>
                setEditEvent({ ...editEvent, time: e.target.value })
              }
            />
            <label>Description</label>
            <textarea
              className="ad-input"
              style={{ height: 100 }}
              value={editEvent.description}
              onChange={(e) =>
                setEditEvent({ ...editEvent, description: e.target.value })
              }
            />
            <div className="ad-modal-actions">
              <button
                className="ad-btn ad-btn-primary"
                onClick={handleSaveEdit}
              >
                Save
              </button>
              <button className="ad-btn" onClick={() => setEditEvent(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="ad-modal-overlay">
          <div className="ad-modal-content">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteConfirm.title}</strong>?
            </p>
            <div className="ad-modal-actions">
              <button className="ad-btn danger" onClick={handleDelete}>
                Yes, Delete
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

export default AddEvents;
