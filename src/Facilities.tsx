import React from "react";
import "./AdminDashboard.css";
import { IconSearch, IconPlus, IconEye } from "./icons";
import { storage } from "./service/firebase";
import { ref, listAll, getDownloadURL } from "firebase/storage";

type Facility = {
  id: number;
  name: string;
  type: "Gate" | "Office" | "Room" | "Academic" | "Laboratory";
  updated: string;
  imageUrl: string;
};

const Facilities: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const [facilities, setFacilities] = React.useState<Facility[]>([]);
  const [viewImage, setViewImage] = React.useState<string | null>(null);

  const detectType = (
    filename: string,
  ): "Gate" | "Office" | "Room" | "Academic" | "Laboratory" => {
    const name = filename.toLowerCase();

    if (name.includes("gate")) return "Gate";
    if (name.includes("office")) return "Office";
    if (name.includes("room")) return "Room";
    if (name.includes("lab")) return "Laboratory";

    return "Academic";
  };

  React.useEffect(() => {
    const loadFacilities = async () => {
      try {
        const folders = [
          "walkthrough/firstFloor",
          "walkthrough/secondFloor",
          "walkthrough/thirdFloor",
        ];

        let allItems: any[] = [];

        for (const path of folders) {
          const folderRef = ref(storage, path);
          const result = await listAll(folderRef);
          allItems = allItems.concat(result.items);
        }

        const mapped: Facility[] = await Promise.all(
          allItems.map(async (item, index) => {
            const url = await getDownloadURL(item);

            const rawName = item.name.replace(/\.[^/.]+$/, "");

            const cleanName = rawName
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (c: string) => c.toUpperCase());

            return {
              id: index + 1,
              name: cleanName,
              type: detectType(rawName),
              updated: new Date().toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              imageUrl: url,
            };
          }),
        );

        setFacilities(mapped);
      } catch (err) {
        console.error("Failed to load facilities:", err);
      }
    };

    loadFacilities();
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return facilities;

    return facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q),
    );
  }, [query, facilities]);

  return (
    <div className="ad-fac">
      <header className="ad-header">
        <h1 className="ad-title">Facilities Management</h1>

        <button
          type="button"
          className="ad-btn ad-btn-accent"
          onClick={() => (window.location.hash = "#/add-facilities")}
        >
          <span className="ad-btn-ico">
            <IconPlus size={16} stroke="#fff" />
          </span>
          <span>Add new facilities</span>
        </button>
      </header>

      <div className="ad-search">
        <span className="ad-search-ico" aria-hidden>
          <IconSearch size={16} />
        </span>
        <input
          className="ad-search-input"
          placeholder="Search Facilities"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* TABLE WITH INTERNAL SCROLL */}
      <div
        className="ad-table-card"
        style={{ maxHeight: "500px", overflowY: "auto" }}
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Facility name</th>
              <th>Type</th>
              <th>Last Updated</th>
              <th className="ad-col-actions">View</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 16 }}>
                  No facilities found
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.type}</td>
                  <td>{f.updated}</td>

                  {/* LEFT-ALIGNED EYE ICON */}
                  <td className="ad-actions" style={{ textAlign: "left" }}>
                    <button
                      className="ad-icon-btn"
                      title="View Image"
                      type="button"
                      onClick={() => setViewImage(f.imageUrl)}
                      style={{ marginLeft: 4 }}
                    >
                      <IconEye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* IMAGE VIEW MODAL */}
      {viewImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
          onClick={() => setViewImage(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              maxWidth: "90%",
              maxHeight: "90%",
              padding: 12,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={viewImage}
              alt="Facility Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: 8,
              }}
            />

            <div className="ad-form-actions" style={{ marginTop: 12 }}>
              <button className="ad-btn" onClick={() => setViewImage(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facilities;
