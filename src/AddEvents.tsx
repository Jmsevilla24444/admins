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
  query,
  orderBy,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

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
  const [queryText, setQueryText] = useState("");

  const [modalMessage, setModalMessage] = useState(""); // Success modal

  // Pick image
  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Upload image
  const uploadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const filename = `events/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        () => {},
        (error) => reject(error),
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (err) {
            reject(err);
          }
        },
      );
    });
  };

  // Format date/time
  const formatDate = (value: string) => {
    const d = new Date(value);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  // Fetch all approved events from "Events" collection
  const fetchAllEvents = async () => {
    try {
      const q = query(collection(db, "Events"), orderBy("date", "asc"));
      const snapshot = await getDocs(q);
      const list: EventItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<EventItem, "id">),
      }));
      setEvents(list);
    } catch (err) {
      console.error("FETCH ALL EVENTS ERROR:", err);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  // Validate date/time (cannot be past)
  const isValidDateTime = () => {
    if (!date || !time) return false;
    const now = new Date();
    const selected = new Date(`${date}T${time}`);
    return selected >= now;
  };

  // ===== MODAL HANDLER =====
  const showModal = (message: string) => {
    setModalMessage(message);
    setTimeout(() => setModalMessage(""), 2000); // hide after 2s
  };

  // Add event (goes to EventRequests for Super Admin approval)
  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!title || !description || !date || !time || !imageFile) {
      showModal("Please fill in all fields.");
      return;
    }

    if (!isValidDateTime()) {
      showModal("Event date and time cannot be in the past.");
      return;
    }

    setSaving(true);

    try {
      const imageUrl = await uploadImage(imageFile);

      await addDoc(collection(db, "EventRequests"), {
        title,
        description,
        date: formatDate(date),
        time: formatTime(time),
        image: imageUrl,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Reset form
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setImageFile(null);
      setPreview(null);

      showModal("Event submitted for Super Admin approval!");
    } catch (err) {
      console.error("ADD EVENT ERROR:", err);
      showModal("Failed to create event.");
    } finally {
      setSaving(false);
    }
  };

  // Delete event (from "Events" collection)
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteDoc(doc(db, "Events", deleteConfirm.id));
      setEvents((prev) => prev.filter((e) => e.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      showModal("Failed to delete event.");
    }
  };

  // Save edit (edit existing events)
  const handleSaveEdit = async () => {
    if (!editEvent) return;
    if (!isValidDateTime()) {
      showModal("Event date and time cannot be in the past.");
      return;
    }

    try {
      const refDoc = doc(db, "Events", editEvent.id);
      await updateDoc(refDoc, {
        title: editEvent.title,
        description: editEvent.description,
        date: editEvent.date,
        time: editEvent.time,
      });
      setEvents((prev) =>
        prev.map((e) => (e.id === editEvent.id ? editEvent : e)),
      );
      setEditEvent(null);
    } catch (err) {
      console.error(err);
      showModal("Failed to update event.");
    }
  };

  // Filter events
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(queryText.toLowerCase()),
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
              min={new Date().toISOString().split("T")[0]}
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

      {/* Event Table */}
      <div
        className="ad-table-card"
        style={{ marginTop: 30, maxHeight: 400, overflowY: "auto" }}
      >
        <header className="ad-header">
          <h1 className="ad-title">All Events</h1>
        </header>

        <div className="ad-search">
          <span className="ad-search-ico">
            <IconSearch size={16} />
          </span>
          <input
            className="ad-search-input"
            placeholder="Search Events"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
        </div>

        <table className="ad-table">
          <thead>
            <tr>
              <th>Image</th>
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
                <td>
                  {e.image ? (
                    <img
                      src={e.image}
                      alt={e.title}
                      style={{
                        width: 80,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </td>
                <td>{e.title}</td>
                <td>{e.date}</td>
                <td>{e.time}</td>
                <td>{e.description}</td>
                <td className="ad-actions">
                  <button
                    className="ad-icon-btn edit"
                    onClick={() => setEditEvent(e)}
                  >
                    <IconEdit size={16} />
                  </button>
                  <button
                    className="ad-icon-btn danger"
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
              min={new Date().toISOString().split("T")[0]}
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

      {/* Delete modal */}
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

      {/* ===== SUCCESS MODAL ===== */}
      {modalMessage && (
        <div
          className="ad-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px 40px",
              borderRadius: 8,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              fontWeight: "bold",
            }}
          >
            {modalMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEvents;
