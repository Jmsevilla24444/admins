import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./service/firebase";

// ─── Constants ────────────────────────────────────────────────────────────────

const KB_COLLECTION = "chatbotdb";

const CATEGORY_PRESETS = [
  "general",
  "payments",
  "admissions",
  "events",
  "policies",
  "uniform",
  "staff",
  "teachers",
  "contacts",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseKeywords(input) {
  return input
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => k.toLowerCase());
}

function buildSearchText(question, keywords, category, language) {
  return normalize(`${question} ${keywords.join(" ")} ${category} ${language}`);
}

function getFinalCategory(preset, custom) {
  const value = preset === "custom" ? custom : preset;
  return (value || "general").trim().toLowerCase();
}

function isPresetCategory(value) {
  return CATEGORY_PRESETS.includes((value || "").toLowerCase());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const CategoryPills = ({ selected, onChange }) => {
  const choices = [...CATEGORY_PRESETS, "custom"];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
      {choices.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`ad-chip${selected === c ? " active" : ""}`}
          style={{ textTransform: "capitalize" }}
        >
          {c}
        </button>
      ))}
    </div>
  );
};

const LangPills = ({ selected, onChange }) => (
  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
    {["en", "tl"].map((lang) => (
      <button
        key={lang}
        type="button"
        onClick={() => onChange(lang)}
        className={`ad-chip${selected === lang ? " active" : ""}`}
      >
        {lang === "en" ? "English" : "Tagalog"}
      </button>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminChatbotFeeder = () => {
  const [tab, setTab] = useState("add"); // "add" | "manage"

  // ── Add form state ──
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [keywordsText, setKeywordsText] = useState("");
  const [categoryPreset, setCategoryPreset] = useState("general");
  const [categoryCustom, setCategoryCustom] = useState("");
  const [language, setLanguage] = useState("en");
  const [priorityText, setPriorityText] = useState("0");

  // ── List / UI state ──
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLang, setFilterLang] = useState("all");

  // ── Edit state ──
  const [editingId, setEditingId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editKeywordsText, setEditKeywordsText] = useState("");
  const [editCategoryPreset, setEditCategoryPreset] = useState("general");
  const [editCategoryCustom, setEditCategoryCustom] = useState("");
  const [editLanguage, setEditLanguage] = useState("en");
  const [editPriorityText, setEditPriorityText] = useState("0");

  // ── Modal message ──
  const [modalMessage, setModalMessage] = useState("");
  const showModal = (msg) => {
    setModalMessage(msg);
    setTimeout(() => setModalMessage(""), 2200);
  };

  // ── Fetch ──
  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, KB_COLLECTION),
        orderBy("updatedAt", "desc")
      );
      const snap = await getDocs(q);
      setItems(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            question: data.question ?? "",
            answer: data.answer ?? "",
            keywords: Array.isArray(data.keywords) ? data.keywords : [],
            category: data.category ?? "general",
            language: data.language ?? "en",
            active: data.active !== false,
            priority: typeof data.priority === "number" ? data.priority : 0,
          };
        })
      );
    } catch (e) {
      setError(e?.message || "Failed to load items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  // ── Create ──
  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    const q = question.trim();
    const a = answer.trim();
    if (!q || !a) { setError("Question and Answer are required."); return; }

    const keywords = parseKeywords(keywordsText);
    const prio = parseInt(priorityText || "0", 10);
    const finalCategory = getFinalCategory(categoryPreset, categoryCustom);

    setLoading(true);
    try {
      await addDoc(collection(db, KB_COLLECTION), {
        question: q,
        answer: a,
        keywords,
        category: finalCategory,
        language,
        priority: isFinite(prio) ? prio : 0,
        active: true,
        searchText: buildSearchText(q, keywords, finalCategory, language),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setQuestion(""); setAnswer(""); setKeywordsText("");
      setCategoryPreset("general"); setCategoryCustom("");
      setLanguage("en"); setPriorityText("0");
      await refresh();
      setTab("manage");
      showModal("Entry added successfully!");
    } catch (e) {
      setError(e?.message || "Failed to create entry.");
    } finally {
      setLoading(false);
    }
  }

  // ── Edit ──
  function startEdit(item) {
    setEditingId(item.id);
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
    setEditKeywordsText(item.keywords.join(", "));
    const cat = (item.category || "general").toLowerCase();
    if (isPresetCategory(cat)) { setEditCategoryPreset(cat); setEditCategoryCustom(""); }
    else { setEditCategoryPreset("custom"); setEditCategoryCustom(cat); }
    setEditLanguage(item.language);
    setEditPriorityText(String(item.priority ?? 0));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditQuestion(""); setEditAnswer(""); setEditKeywordsText("");
    setEditCategoryPreset("general"); setEditCategoryCustom("");
    setEditLanguage("en"); setEditPriorityText("0");
  }

  async function saveEdit() {
    if (!editingId) return;
    setError(null);
    const q = editQuestion.trim();
    const a = editAnswer.trim();
    if (!q || !a) { setError("Question and Answer are required."); return; }

    const keywords = parseKeywords(editKeywordsText);
    const prio = parseInt(editPriorityText || "0", 10);
    const finalCategory = getFinalCategory(editCategoryPreset, editCategoryCustom);

    setLoading(true);
    try {
      await updateDoc(doc(db, KB_COLLECTION, editingId), {
        question: q, answer: a, keywords, category: finalCategory,
        language: editLanguage,
        priority: isFinite(prio) ? prio : 0,
        searchText: buildSearchText(q, keywords, finalCategory, editLanguage),
        updatedAt: serverTimestamp(),
      });
      cancelEdit();
      await refresh();
      showModal("Entry updated successfully!");
    } catch (e) {
      setError(e?.message || "Failed to save changes.");
    } finally {
      setLoading(false);
    }
  }

  // ── Toggle Active (Admin can enable/disable too) ──
  async function toggleActive(id, newValue) {
    setLoading(true);
    try {
      await updateDoc(doc(db, KB_COLLECTION, id), {
        active: newValue,
        updatedAt: serverTimestamp(),
      });
      await refresh();
      showModal(newValue ? "Entry enabled." : "Entry disabled.");
    } catch (e) {
      setError(e?.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  }

  // ── Filtered list ──
  const filtered = useMemo(() => {
    const qStr = search.trim().toLowerCase();
    return items.filter((item) => {
      if (!showInactive && !item.active) return false;
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      if (filterLang !== "all" && item.language !== filterLang) return false;
      if (qStr) {
        return (
          item.question.toLowerCase().includes(qStr) ||
          item.answer.toLowerCase().includes(qStr) ||
          item.keywords.some((k) => k.includes(qStr)) ||
          item.category.includes(qStr)
        );
      }
      return true;
    });
  }, [items, search, showInactive, filterCategory, filterLang]);

  // ── Unique categories for filter ──
  const allCategories = useMemo(
    () => ["all", ...new Set(items.map((i) => i.category))],
    [items]
  );

  return (
    <section className="ad-section">
      <h2 className="ad-section-title">Chatbot Knowledge Base</h2>

      {/* Info notice */}
      <div
        style={{
          background: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: 8, padding: "10px 16px", color: "#1d4ed8",
          marginBottom: 16, fontSize: 13,
        }}
      >
        ℹ️ You can add and edit knowledge base entries. Only the <strong>SuperAdmin</strong> can permanently delete entries.
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["add", "manage"].map((t) => (
          <button
            key={t}
            type="button"
            className={`ad-btn${tab === t ? " ad-btn-primary" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "add" ? "➕ Add Entry" : `📋 Manage Entries (${items.length})`}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: "#fff1f2", border: "1px solid #fda4af",
            borderRadius: 8, padding: "10px 16px", color: "#be123c",
            marginBottom: 16, fontSize: 13,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ══════════ ADD TAB ══════════ */}
      {tab === "add" && (
        <form className="ad-form ad-add" onSubmit={handleCreate}>
          <div className="ad-form-grid">
            <div className="ad-form-left" style={{ display: "grid", gap: 16 }}>

              <div>
                <div className="ad-label">Question *</div>
                <input
                  className="ad-input"
                  placeholder="e.g. What are the school hours?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <div>
                <div className="ad-label">Answer *</div>
                <textarea
                  className="ad-input"
                  placeholder="Type the full answer here..."
                  rows={5}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div>
                <div className="ad-label">Keywords <span style={{ fontWeight: 400, color: "#6b7280" }}>(comma-separated)</span></div>
                <input
                  className="ad-input"
                  placeholder="e.g. hours, schedule, time"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                />
              </div>

              <div>
                <div className="ad-label">Category</div>
                <CategoryPills selected={categoryPreset} onChange={setCategoryPreset} />
                {categoryPreset === "custom" && (
                  <input
                    className="ad-input"
                    style={{ marginTop: 8 }}
                    placeholder='Custom category (e.g. "clubs")'
                    value={categoryCustom}
                    onChange={(e) => setCategoryCustom(e.target.value)}
                  />
                )}
              </div>

              <div>
                <div className="ad-label">Language</div>
                <LangPills selected={language} onChange={setLanguage} />
              </div>

              <div>
                <div className="ad-label">Priority <span style={{ fontWeight: 400, color: "#6b7280" }}>(higher = matched first)</span></div>
                <input
                  className="ad-input"
                  type="number"
                  min={0}
                  value={priorityText}
                  onChange={(e) => setPriorityText(e.target.value)}
                  style={{ maxWidth: 120 }}
                />
              </div>

            </div>
          </div>

          <div className="ad-form-actions" style={{ marginTop: 16 }}>
            <button className="ad-btn ad-btn-primary" type="submit" disabled={loading}>
              {loading ? "Saving…" : "➕ Add Entry"}
            </button>
          </div>
        </form>
      )}

      {/* ══════════ MANAGE TAB ══════════ */}
      {tab === "manage" && (
        <div>
          {/* Search + filters */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
            <div className="ad-search" style={{ flex: "1 1 220px" }}>
              <span className="ad-search-ico">🔍</span>
              <input
                className="ad-search-input"
                placeholder="Search entries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="ad-input"
              style={{ maxWidth: 160 }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {allCategories.map((c) => (
                <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
              ))}
            </select>

            <select
              className="ad-input"
              style={{ maxWidth: 140 }}
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="tl">Tagalog</option>
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              Show disabled
            </label>

            <button type="button" className="ad-btn" onClick={refresh} disabled={loading}>
              {loading ? "…" : "↻ Refresh"}
            </button>
          </div>

          {/* Table */}
          <div className="ad-table-card">
            <table className="ad-table">
              <thead>
                <tr>
                  <th style={{ width: "26%" }}>Question</th>
                  <th style={{ width: "32%" }}>Answer</th>
                  <th>Category</th>
                  <th>Lang</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="ad-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#6b7280" }}>
                      {loading ? "Loading…" : "No entries found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr style={{ opacity: item.active ? 1 : 0.5 }}>
                        <td style={{ fontWeight: 600 }}>{item.question}</td>
                        <td style={{ color: "#374151", fontSize: 13 }}>
                          {item.answer.length > 120 ? item.answer.slice(0, 120) + "…" : item.answer}
                        </td>
                        <td>
                          <span className="ad-badge amber" style={{ textTransform: "capitalize" }}>
                            {item.category}
                          </span>
                        </td>
                        <td>
                          <span className="ad-badge emerald">
                            {item.language === "en" ? "EN" : "TL"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>{item.priority}</td>
                        <td>
                          <span className={`ad-badge ${item.active ? "emerald" : "rose"}`}>
                            {item.active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="ad-actions">
                          {/* Edit */}
                          <button
                            className="ad-btn ad-btn-primary"
                            style={{ fontSize: 12, padding: "4px 10px" }}
                            onClick={() => editingId === item.id ? cancelEdit() : startEdit(item)}
                          >
                            {editingId === item.id ? "Cancel" : "Edit"}
                          </button>

                          {/* Toggle Active */}
                          <button
                            className="ad-btn"
                            style={{ fontSize: 12, padding: "4px 10px", marginLeft: 4 }}
                            onClick={() => toggleActive(item.id, !item.active)}
                            disabled={loading}
                          >
                            {item.active ? "Disable" : "Enable"}
                          </button>

                          {/* Delete is NOT available to Admin */}
                          <span
                            title="Contact SuperAdmin to delete entries"
                            style={{
                              fontSize: 11, color: "#9ca3af", marginLeft: 8,
                              display: "inline-flex", alignItems: "center", cursor: "default",
                            }}
                          >
                            🔒 Delete (SA only)
                          </span>
                        </td>
                      </tr>

                      {/* Inline edit row */}
                      {editingId === item.id && (
                        <tr>
                          <td colSpan={7} style={{ background: "#f9fafb", padding: 20 }}>
                            <div style={{ display: "grid", gap: 12, maxWidth: 760 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                                ✏️ Editing Entry
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                  <div className="ad-label">Question *</div>
                                  <input className="ad-input" value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)} />
                                </div>
                                <div>
                                  <div className="ad-label">Keywords</div>
                                  <input className="ad-input" value={editKeywordsText} onChange={(e) => setEditKeywordsText(e.target.value)} />
                                </div>
                              </div>

                              <div>
                                <div className="ad-label">Answer *</div>
                                <textarea className="ad-input" rows={4} value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} style={{ resize: "vertical" }} />
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                  <div className="ad-label">Category</div>
                                  <CategoryPills selected={editCategoryPreset} onChange={setEditCategoryPreset} />
                                  {editCategoryPreset === "custom" && (
                                    <input className="ad-input" style={{ marginTop: 8 }} value={editCategoryCustom} onChange={(e) => setEditCategoryCustom(e.target.value)} placeholder="Custom category" />
                                  )}
                                </div>
                                <div>
                                  <div className="ad-label">Language</div>
                                  <LangPills selected={editLanguage} onChange={setEditLanguage} />
                                  <div className="ad-label" style={{ marginTop: 12 }}>Priority</div>
                                  <input className="ad-input" type="number" min={0} value={editPriorityText} onChange={(e) => setEditPriorityText(e.target.value)} style={{ maxWidth: 100 }} />
                                </div>
                              </div>

                              <div className="ad-form-actions">
                                <button type="button" className="ad-btn" onClick={cancelEdit}>Cancel</button>
                                <button type="button" className="ad-btn ad-btn-primary" onClick={saveEdit} disabled={loading}>
                                  {loading ? "Saving…" : "Save Changes"}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {modalMessage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: "20px 40px", fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
            ✅ {modalMessage}
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminChatbotFeeder;