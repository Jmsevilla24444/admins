import React, { useMemo, useState } from "react";
import "./AdminDashboard.css";
import { IconUpload } from "./icons";
import { db, storage } from "./service/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

type FacilityType =
  | "Gate"
  | "Office"
  | "Room"
  | "Academic"
  | "Laboratory"
  | "Clinic"
  | "Library"
  | "Canteen"
  | "Other";

type FloorOption = "Ground" | "1st" | "2nd" | "3rd" | "4th" | "5th" | "Other";

const AddFacilities: React.FC = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState<FacilityType | "">("");
  const [floor, setFloor] = useState<FloorOption | "">("");
  const [location, setLocation] = useState("");
  const [isClosed, setIsClosed] = useState<"" | "yes" | "no">("");
  const [notes, setNotes] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // simple field errors (only for image + optional future use)
  const [imageError, setImageError] = useState<string>("");

  const typeOptions: FacilityType[] = useMemo(
    () => [
      "Gate",
      "Office",
      "Room",
      "Academic",
      "Laboratory",
      "Clinic",
      "Library",
      "Canteen",
      "Other",
    ],
    [],
  );

  const floorOptions: FloorOption[] = useMemo(
    () => ["1st", "2nd", "3rd", "4th","Other"],
    [],
  );

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please choose a valid image file.");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setImageError("");
  };

  const clearImage = () => {
    setImageFile(null);
    setPreview(null);
    setImageError("Image is required.");
  };

  const uploadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const filename = `incomingFacilities/${Date.now()}-${file.name}`;
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

  const validate = () => {
    if (!name.trim()) return "Facility name is required.";
    if (!type) return "Type is required.";
    if (!floor) return "Floor is required.";
    if (!location.trim()) return "Location/Where is required.";
    if (!isClosed) return "Closed status is required.";

    // ✅ REQUIRED image
    if (!imageFile) {
      setImageError("Image is required.");
      return "Please upload an image.";
    }

    return "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validate();
    if (err) return alert(err);

    setLoading(true);
    try {
      // image is guaranteed by validate()
      const imageUrl = await uploadImage(imageFile!);

      const submittedBy = "Admin";

      await addDoc(collection(db, "incomingFacilities"), {
        name: name.trim(),
        type,
        floor,
        location: location.trim(),
        isClosed: isClosed === "yes",
        notes: notes.trim() || "",
        imageUrl,

        status: "pending",
        submittedBy,
        submittedAt: serverTimestamp(),

        resolvedAt: null,
        resolvedBy: null,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: "",
      });

      alert("Facility submitted! It will appear in SuperAdmin → FacilitiesInbox.");

      setName("");
      setType("");
      setFloor("");
      setLocation("");
      setIsClosed("");
      setNotes("");
      setImageFile(null);
      setPreview(null);
      setImageError("");
    } catch (error: any) {
      console.error("Error submitting facility:", error);
      alert(`Failed to submit: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    !!name.trim() &&
    !!type &&
    !!floor &&
    !!location.trim() &&
    !!isClosed &&
    !!imageFile &&
    !loading;

  return (
    <div className="ad-add">
      <form className="ad-form" onSubmit={onSubmit}>
        <div className="ad-form-grid">
          {/* LEFT */}
          <div className="ad-form-left">
            <label className="ad-label">Facility Name</label>
            <input
              className="ad-input"
              placeholder="e.g. Computer Laboratory"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="ad-row" style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="ad-label">Type</label>
                <select
                  className="ad-input"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="">Select type</option>
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label className="ad-label">Floor</label>
                <select
                  className="ad-input"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value as any)}
                >
                  <option value="">Select floor</option>
                  {floorOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="ad-label">Where / Location</label>
            <input
              className="ad-input"
              placeholder='e.g. Near Library, left hallway, Building A'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />


          

            <label className="ad-label">Notes / Details (optional)</label>
            <textarea
              className="ad-input"
              style={{ minHeight: 90, resize: "vertical" }}
              placeholder="Add extra details for SuperAdmin review…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* RIGHT */}
          <div className="ad-form-right">
            <div className="ad-upload-row">
              <div className="ad-upload" style={{ position: "relative" }}>
                {/* ✅ Required badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    zIndex: 2,
                    background: "rgba(239,68,68,.12)",
                    border: "1px solid rgba(239,68,68,.35)",
                    color: "#7f1d1d",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 800,
                    backdropFilter: "blur(6px)",
                  }}
                >
                  Required
                </div>

                {preview ? (
                  <img
                    src={preview}
                    alt="facility"
                    className="ad-upload-preview"
                  />
                ) : (
                  <div
                    className="ad-upload-empty"
                    style={{
                      border:
                        imageError ? "2px dashed rgba(239,68,68,.55)" : undefined,
                    }}
                  >
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

              <div
                className="ad-upload-label"
                style={{ display: "flex", gap: 10, alignItems: "center" }}
              >
                Upload image
                {preview ? (
                  <button
                    type="button"
                    className="ad-btn"
                    onClick={clearImage}
                    style={{ padding: "6px 10px" }}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>

            {imageError ? (
              <div style={{ marginTop: 10, color: "#b91c1c", fontSize: 13 }}>
                {imageError}
              </div>
            ) : (
              <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
                Upload a clear image so SuperAdmin can verify quickly.
              </div>
            )}
          </div>
        </div>

        <div className="ad-form-actions">
          <button
            type="submit"
            className="ad-btn ad-btn-primary"
            disabled={!canSubmit}
            title={!canSubmit ? "Complete all fields and upload an image." : ""}
            style={
              !canSubmit
                ? { opacity: 0.55, cursor: "not-allowed" }
                : undefined
            }
          >
            {loading ? "Submitting..." : "Submit to SuperAdmin"}
          </button>
        </div>
      </form>

      <p className="ad-footnote">
        This facility goes to <b>SuperAdmin → FacilitiesInbox</b> for review.
      </p>
    </div>
  );
};

export default AddFacilities;
