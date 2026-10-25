
                      
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  FilePlus2,
  FileText,
  Folder,
  GraduationCap,
  HardDrive,
  LayoutDashboard,
  List,
  Mail,
  Menu,
  Moon,
  MoreHorizontal,
  Pin,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  Sparkles,
  Star,
  StickyNote,
  Sun,
  Trash2,
  UserRound,
  X,
  Grid2X2,
  Edit3,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/notes";
const PROFILE_KEY = "smart-notes-profile";
const THEME_KEY = "smart-notes-pro-theme";

const emptyNote = {
  title: "",
  content: "",
  category: "Personal",
  priority: "Medium",
  color: "blue",
  favourite: false,
  pinned: false,
  archived: false,
  deleted: false,
  reminder: "",
};

const defaultNotes = [
  {
    ...emptyNote,
    id: 1,
    title: "Project Planning",
    content:
      "Complete the Smart Notes Management System dashboard. Prepare project documentation and review the remaining features.",
    category: "Work",
    priority: "High",
    color: "blue",
    favourite: true,
    pinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    ...emptyNote,
    id: 2,
    title: "Study Schedule",
    content:
      "Revise React hooks, JavaScript concepts, Express APIs and MongoDB CRUD operations for the practical examination.",
    category: "Study",
    priority: "Medium",
    color: "purple",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    ...emptyNote,
    id: 3,
    title: "Ideas & Inspiration",
    content:
      "Add smart reminders, note search, priority labels, category filters and a clean professional dashboard.",
    category: "Ideas",
    priority: "Low",
    color: "cyan",
    favourite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const categoryColors = {
  blue: "border-blue-400/25 bg-blue-500/10 text-blue-400",
  purple: "border-purple-400/25 bg-purple-500/10 text-purple-400",
  cyan: "border-cyan-400/25 bg-cyan-500/10 text-cyan-400",
  amber: "border-amber-400/25 bg-amber-500/10 text-amber-400",
  rose: "border-rose-400/25 bg-rose-500/10 text-rose-400",
};

const priorityColors = {
  High: "bg-rose-500/10 text-rose-400",
  Medium: "bg-amber-500/10 text-amber-400",
  Low: "bg-emerald-500/10 text-emerald-400",
};

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function formatDate(value) {
  if (!value) return "Just now";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getNoteSize(note) {
  const text = `${note.title || ""}\n${note.content || ""}`;
  const bytes = new TextEncoder().encode(text).length;

  return bytes < 1024
    ? `${bytes} B`
    : `${(bytes / 1024).toFixed(2)} KB`;
}

function getWordCount(text = "") {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function getTotalSize(notes) {
  const bytes = notes.reduce(
    (total, note) =>
      total +
      new TextEncoder().encode(
        `${note.title || ""}\n${note.content || ""}`,
      ).length,
    0,
  );

  return bytes < 1024
    ? `${bytes} B`
    : `${(bytes / 1024).toFixed(2)} KB`;
}

function initialProfile() {
  return {
    name: "Student",
    email: "",
    college: "",
    course: "B.Tech",
    branch: "Computer Engineering",
    year: "Final Year",
  };
}

function normalizeNote(note) {
  return {
    ...emptyNote,
    ...note,
    id: String(note._id || note.id || ""),
    title: note.title || "Untitled Note",
    content: note.content || "",
    category: note.category || "Personal",
    priority: note.priority || "Medium",
    color: note.color || "blue",
    favourite: Boolean(note.favourite ?? note.favorite),
    pinned: Boolean(note.pinned),
    archived: Boolean(note.archived),
    deleted: Boolean(note.deleted),
    reminder: note.reminder || "",
    createdAt: note.createdAt || new Date().toISOString(),
    updatedAt: note.updatedAt || note.createdAt || new Date().toISOString(),
  };
}

async function readApiResponse(response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    throw new Error(result.message || result.error || `Request failed (${response.status})`);
  }
  return result;
}

export default function App() {
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState("");

  const [profile, setProfile] = useState(() =>
    readStorage(PROFILE_KEY, initialProfile()),
  );

  const [theme, setTheme] = useState(() =>
    readStorage(THEME_KEY, "dark") === "light" ? "light" : "dark",
  );

  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedCategory, setSelectedCategory] = useState("All Notes");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [view, setView] = useState("grid");
  const [compactCards, setCompactCards] = useState(false);
  const [showWordCount, setShowWordCount] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [form, setForm] = useState({ ...emptyNote });
  const [toast, setToast] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadNotes = async () => {
      setNotesLoading(true);
      setNotesError("");
      try {
        const response = await fetch(API_URL);
        const result = await readApiResponse(response);
        const rows = Array.isArray(result)
          ? result
          : result.data ?? result.notes ?? result.results ?? [];
        if (!Array.isArray(rows)) throw new Error("API response does not contain a notes list.");
        if (!cancelled) setNotes(rows.map(normalizeNote));
      } catch (error) {
        if (!cancelled) {
          setNotesError(error.message || "Could not load notes from the server.");
          setToast("Could not connect to notes API.");
        }
      } finally {
        if (!cancelled) setNotesLoading(false);
      }
    };

    loadNotes();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // Profile remains available for the current session.
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    } catch {
      // Theme still works for this session.
    }
  }, [theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const ui =
    theme === "dark"
      ? {
          page: "bg-[#070d18] text-slate-100",
          sidebar: "border-slate-800 bg-[#0b1220]",
          surface: "border-slate-800 bg-[#0d1626]",
          surfaceSoft: "border-slate-800 bg-[#101b2c]",
          muted: "text-slate-400",
          subtle: "text-slate-500",
          input:
            "border-slate-700 bg-[#09111f] text-slate-100 placeholder:text-slate-600",
          divider: "border-slate-800",
          navActive: "bg-blue-500/15 text-blue-300",
          navIdle: "text-slate-400 hover:bg-slate-800/70 hover:text-white",
        }
      : {
          page: "bg-slate-50 text-slate-900",
          sidebar: "border-slate-200 bg-white",
          surface: "border-slate-200 bg-white",
          surfaceSoft: "border-slate-200 bg-slate-50",
          muted: "text-slate-600",
          subtle: "text-slate-500",
          input:
            "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
          divider: "border-slate-200",
          navActive: "bg-blue-50 text-blue-700",
          navIdle: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        };

  const activeNotes = notes.filter(
    (note) => !note.deleted && !note.archived,
  );
  const deletedNotes = notes.filter((note) => note.deleted);
  const archivedNotes = notes.filter(
    (note) => note.archived && !note.deleted,
  );
  const favouriteNotes = activeNotes.filter((note) => note.favourite);
  const pinnedNotes = activeNotes.filter((note) => note.pinned);

  const notifications = [
    {
      id: "welcome",
      title: "Welcome to SmartNotesPro",
      message: "Your workspace is ready. Start organizing your ideas.",
      time: "Workspace",
      icon: Sparkles,
    },
    {
      id: "notes",
      title: "Notes overview",
      message: `${activeNotes.length} active notes in your workspace.`,
      time: "Updated overview",
      icon: FileText,
    },
    {
      id: "reminders",
      title: "Upcoming reminders",
      message: `${
        activeNotes.filter(
          (note) =>
            note.reminder &&
            new Date(note.reminder).getTime() >= Date.now(),
        ).length
      } notes have upcoming reminders.`,
      time: "Reminder overview",
      icon: Bell,
    },
  ];

  const unreadCount = notifications.filter(
    (item) => !readNotifications.includes(item.id),
  ).length;

  const totalSize = getTotalSize(activeNotes);
  const totalWords = activeNotes.reduce(
    (total, note) => total + getWordCount(note.content),
    0,
  );

  const categories = [
    { name: "Personal", color: "bg-purple-400" },
    { name: "Work", color: "bg-blue-400" },
    { name: "Study", color: "bg-cyan-400" },
    { name: "Ideas", color: "bg-amber-400" },
  ];

  const openCreate = () => {
    setForm({ ...emptyNote });
    setEditingId(null);
    setEditorOpen(true);
    setActivePage("Dashboard");
    setMobileMenu(false);
    setMenuId(null);
  };

  const openEdit = (note) => {
    setForm({ ...note });
    setEditingId(note.id);
    setEditorOpen(true);
    setActivePage("Dashboard");
    setMenuId(null);
  };

  const saveNote = async (event) => {
    event.preventDefault();

    if (!form.title.trim() && !form.content.trim()) {
      setToast("Please enter a title or note content.");
      return;
    }

    const payload = {
      title: form.title.trim() || "Untitled Note",
      content: form.content.trim(),
      category: form.category || "Personal",
      priority: form.priority || "Medium",
      color: form.color || "blue",
      favourite: Boolean(form.favourite),
      pinned: Boolean(form.pinned),
      archived: Boolean(form.archived),
      deleted: Boolean(form.deleted),
      reminder: form.reminder || "",
    };

    try {
      const isEditing = editingId !== null;
      const response = await fetch(
        isEditing ? `${API_URL}/${encodeURIComponent(editingId)}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await readApiResponse(response);
      const saved = normalizeNote(result.data ?? result.note ?? result);
      if (!saved.id) throw new Error("Server saved the note but did not return its ID.");

      setNotes((previous) => isEditing
        ? previous.map((note) => note.id === String(editingId) ? saved : note)
        : [saved, ...previous.filter((note) => note.id !== saved.id)]);
      setToast(isEditing ? "Note updated successfully." : "Note created successfully.");
      setEditorOpen(false);
      setEditingId(null);
      setForm({ ...emptyNote });
      setActivePage("Dashboard");
      setSelectedCategory("All Notes");
      setNotesError("");
    } catch (error) {
      setToast(`Save failed: ${error.message}`);
    }
  };

  const updateNote = async (id, changes) => {
    const current = notes.find((note) => note.id === String(id));
    if (!current) return;

    const payload = {
      title: current.title,
      content: current.content,
      category: current.category,
      priority: current.priority,
      color: current.color,
      favourite: current.favourite,
      pinned: current.pinned,
      archived: current.archived,
      deleted: current.deleted,
      reminder: current.reminder || "",
      ...changes,
    };

    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await readApiResponse(response);
      const updated = normalizeNote(result.data ?? result.note ?? result);
      setNotes((previous) => previous.map((note) =>
        note.id === String(id) ? { ...note, ...payload, ...updated, id: String(id) } : note,
      ));
      setNotesError("");
    } catch (error) {
      setToast(`Update failed: ${error.message}`);
    }
  };

  const moveToTrash = (note) => {
    updateNote(note.id, { deleted: true, archived: false });
    setMenuId(null);
    setToast("Note moved to trash.");
  };

  const restoreNote = (id) => {
    updateNote(id, { deleted: false, archived: false });
    setToast("Note restored.");
  };

  const deletePermanently = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
      await readApiResponse(response);
      setNotes((previous) => previous.filter((note) => note.id !== String(id)));
      setMenuId(null);
      setToast("Note permanently deleted.");
    } catch (error) {
      setToast(`Delete failed: ${error.message}`);
    }
  };

  const toggleArchive = (note) => {
    updateNote(note.id, {
      archived: !note.archived,
      deleted: false,
    });
    setMenuId(null);
    setToast(note.archived ? "Note restored from archive." : "Note archived.");
  };

  const navigateTo = (page) => {
    setActivePage(page);
    setEditorOpen(false);
    setSelectedCategory("All Notes");
    setSearch("");
    setMobileMenu(false);
    setMenuId(null);
    setNotificationsOpen(false);
  };

  const sidebarLinks = [
    { name: "Dashboard", icon: LayoutDashboard, count: null },
    { name: "All Notes", icon: FileText, count: activeNotes.length },
    { name: "Favourites", icon: Star, count: favouriteNotes.length },
    { name: "Pinned Notes", icon: Pin, count: pinnedNotes.length },
    { name: "Archive", icon: Archive, count: archivedNotes.length },
    { name: "Trash", icon: Trash2, count: deletedNotes.length },
  ];

  const visibleNotes = useMemo(() => {
    let list = notes.filter((note) => {
      if (activePage === "Trash") return note.deleted;
      if (activePage === "Archive") return note.archived && !note.deleted;
      if (note.deleted || note.archived) return false;
      if (activePage === "Favourites" && !note.favourite) return false;
      if (activePage === "Pinned Notes" && !note.pinned) return false;
      return true;
    });

    if (selectedCategory !== "All Notes") {
      list = list.filter(
        (note) =>
          note.category.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    const term = search.toLowerCase().trim();

    if (term) {
      list = list.filter(
        (note) =>
          note.title.toLowerCase().includes(term) ||
          note.content.toLowerCase().includes(term) ||
          note.category.toLowerCase().includes(term),
      );
    }

    return [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "created") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [notes, activePage, selectedCategory, search, sortBy]);

  const NoteCard = ({ note }) => {
    const color = categoryColors[note.color] || categoryColors.blue;
    const borderColor =
      note.color === "purple"
        ? "border-l-purple-500 hover:border-purple-400"
        : note.color === "cyan"
          ? "border-l-cyan-500 hover:border-cyan-400"
          : note.color === "amber"
            ? "border-l-amber-500 hover:border-amber-400"
            : note.color === "rose"
              ? "border-l-rose-500 hover:border-rose-400"
              : "border-l-blue-500 hover:border-blue-400";

    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className={`group relative flex min-w-0 flex-col rounded-2xl border border-l-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${borderColor} ${ui.surface} ${
          compactCards ? "p-4" : "p-5"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {note.pinned && !note.deleted && (
              <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold text-cyan-400">
                <Pin size={11} /> Pinned
              </span>
            )}
            <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${color}`}>
              {note.category}
            </span>
          </div>

          <div className="relative flex shrink-0 items-center gap-1">
            {!note.deleted && (
              <button
                onClick={() =>
                  updateNote(note.id, { favourite: !note.favourite })
                }
                className={`rounded-lg p-2 transition hover:bg-amber-500/10 ${
                  note.favourite ? "text-amber-400" : ui.subtle
                }`}
                title="Toggle favourite"
              >
                <Star
                  size={16}
                  fill={note.favourite ? "currentColor" : "none"}
                />
              </button>
            )}

            <button
              onClick={() => setMenuId(menuId === note.id ? null : note.id)}
              className={`rounded-lg p-2 transition hover:bg-slate-500/10 ${ui.muted}`}
              title="More actions"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuId === note.id && (
              <div className={`absolute right-0 top-10 z-30 w-48 rounded-xl border p-1.5 shadow-2xl ${ui.surface}`}>
                {!note.deleted ? (
                  <>
                    <button
                      onClick={() => openEdit(note)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${ui.navIdle}`}
                    >
                      <Edit3 size={14} /> Edit note
                    </button>
                    <button
                      onClick={() => {
                        updateNote(note.id, { pinned: !note.pinned });
                        setMenuId(null);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${ui.navIdle}`}
                    >
                      <Pin size={14} /> {note.pinned ? "Unpin note" : "Pin note"}
                    </button>
                    <button
                      onClick={() => toggleArchive(note)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${ui.navIdle}`}
                    >
                      <Archive size={14} /> Archive
                    </button>
                    <button
                      onClick={() => moveToTrash(note)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 size={14} /> Move to trash
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => restoreNote(note.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${ui.navIdle}`}
                    >
                      <RotateCcw size={14} /> Restore note
                    </button>
                    <button
                      onClick={() => deletePermanently(note.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 size={14} /> Delete permanently
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => !note.deleted && openEdit(note)}
          className="block w-full min-w-0 text-left"
        >
          <h3 className="break-words text-base font-bold leading-6">
            {note.title || "Untitled Note"}
          </h3>
          <p
            className={`mt-3 whitespace-pre-wrap break-words text-sm leading-6 ${ui.muted}`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {note.content || "No content yet. Click to add details."}
          </p>
        </button>

        <div className={`mt-5 flex flex-wrap items-center gap-2 border-t pt-4 ${ui.divider}`}>
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${priorityColors[note.priority] || priorityColors.Medium}`}>
            <AlertCircle size={11} /> {note.priority}
          </span>

          <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] ${ui.divider} ${ui.muted}`}>
            <HardDrive size={11} /> {getNoteSize(note)}
          </span>

          {note.reminder && (
            <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-1 text-[10px] text-purple-400">
              <Bell size={11} /> Reminder
            </span>
          )}
        </div>

        <div className={`mt-3 flex items-center justify-between gap-3 text-[10px] ${ui.subtle}`}>
          <span className="inline-flex min-w-0 items-center gap-1">
            <Clock size={11} /> Updated {formatDate(note.updatedAt)}
          </span>
          {showWordCount && (
            <span className="shrink-0">{getWordCount(note.content)} words</span>
          )}
        </div>
      </motion.article>
    );
  };

  const showBanner =
    !editorOpen &&
    activePage !== "Settings" &&
    activePage !== "Profile";

  return (
    <div className={`min-h-screen ${ui.page}`}>
      {notesLoading && (
        <div className="fixed left-1/2 top-4 z-[200] -translate-x-1/2 rounded-xl border border-cyan-400/20 bg-slate-900 px-4 py-2 text-sm text-cyan-200 shadow-xl">
          Loading notes from MongoDB…
        </div>
      )}
      {!notesLoading && notesError && (
        <div className="fixed left-1/2 top-4 z-[200] flex max-w-[92vw] -translate-x-1/2 items-center gap-3 rounded-xl border border-rose-400/30 bg-slate-900 px-4 py-3 text-sm text-rose-200 shadow-xl">
          <AlertCircle size={18} />
          <span>API error: {notesError}. Check that backend is running on port 5000.</span>
          <button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-white/10 px-3 py-1">Retry</button>
        </div>
      )}
      {mobileMenu && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* FIXED SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[270px] flex-col overflow-hidden border-r ${ui.sidebar} transition-transform duration-300 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className={`flex shrink-0 items-center gap-3 border-b px-5 py-5 ${ui.divider}`}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
            <StickyNote size={23} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-extrabold">
              SmartNotes<span className="text-cyan-400">Pro</span>
            </h1>
            <p className={`mt-0.5 text-[10px] ${ui.subtle}`}>
              YOUR SMART WORKSPACE
            </p>
          </div>
          <button
            onClick={() => setMobileMenu(false)}
            className={`rounded-lg p-2 lg:hidden ${ui.muted}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="shrink-0 px-4 pt-5">
          <button
            onClick={openCreate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/20 transition hover:brightness-110"
          >
            <Plus size={18} /> Create New Note
          </button>
        </div>

        {/* Only this sidebar area scrolls */}
        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-4 py-5">
          <div>
            <p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] ${ui.subtle}`}>
              Workspace
            </p>
            <div className="space-y-1">
              {sidebarLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigateTo(item.name)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                      activePage === item.name ? ui.navActive : ui.navIdle
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{item.name}</span>
                    {item.count !== null && (
                      <span className="min-w-6 rounded-md bg-slate-500/10 px-1.5 py-0.5 text-center text-[10px]">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={() => navigateTo("Profile")}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  activePage === "Profile" ? ui.navActive : ui.navIdle
                }`}
              >
                <UserRound size={18} />
                <span className="flex-1">My Profile</span>
              </button>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between px-3">
              <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${ui.subtle}`}>
                Categories
              </p>
              <Folder size={14} className={ui.subtle} />
            </div>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setActivePage("All Notes");
                    setEditorOpen(false);
                    setMobileMenu(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    selectedCategory === category.name
                      ? ui.navActive
                      : ui.navIdle
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${category.color}`} />
                  <span className="flex-1">{category.name}</span>
                  <span className={`text-[10px] ${ui.subtle}`}>
                    {activeNotes.filter((note) => note.category === category.name).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${ui.surfaceSoft}`}>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-xs font-bold">Your Progress</p>
                <p className={`text-[10px] ${ui.subtle}`}>Keep ideas organized</p>
              </div>
            </div>
            <div className="mb-2 flex justify-between text-[10px]">
              <span className={ui.muted}>Active notes</span>
              <span className="font-semibold text-cyan-400">{activeNotes.length}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-500/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{ width: `${Math.min(activeNotes.length * 10, 100)}%` }}
              />
            </div>
            <p className={`mt-3 text-[10px] ${ui.subtle}`}>
              {totalWords} words · {totalSize}
            </p>
          </div>
        </div>

        {/* Sidebar bottom stays visible */}
        <div className={`shrink-0 border-t p-4 ${ui.divider}`}>
          <button
            onClick={() => navigateTo("Settings")}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              activePage === "Settings" ? ui.navActive : ui.navIdle
            }`}
          >
            <Settings size={18} />
            <span className="flex-1 text-left">Settings</span>
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${ui.navIdle}`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span className="flex-1 text-left">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          <button
            onClick={() => navigateTo("Profile")}
            className={`mt-3 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${ui.divider} hover:border-cyan-500/40`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-bold text-white">
              {(profile.name || "S").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{profile.name || "Student"}</p>
              <p className={`truncate text-[10px] ${ui.subtle}`}>
                {profile.college || "Add your college"}
              </p>
            </div>
            <UserRound size={15} className="text-cyan-400" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-h-screen min-w-0 lg:ml-[270px]">
        <header className={`sticky top-0 z-30 flex h-[72px] items-center justify-between gap-3 border-b px-4 sm:px-7 ${ui.sidebar}`}>
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              className={`rounded-xl border p-2.5 lg:hidden ${ui.divider}`}
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0">
              <p className={`hidden text-[10px] font-medium sm:block ${ui.subtle}`}>
                SMART NOTES / WORKSPACE
              </p>
              <h2 className="truncate text-lg font-bold sm:mt-0.5">
                {editorOpen
                  ? editingId !== null
                    ? "Edit Note"
                    : "Create Note"
                  : activePage}
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className={`hidden items-center gap-2 rounded-xl border px-3 py-2 md:flex ${ui.input}`}>
              <Search size={15} className={ui.subtle} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes..."
                className="w-36 bg-transparent text-xs outline-none lg:w-48"
              />
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`rounded-xl border p-2.5 transition hover:border-cyan-500/40 ${ui.divider}`}
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative rounded-xl border p-2.5 transition hover:border-cyan-400 hover:bg-cyan-400/10 ${ui.divider}`}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#0b1220] bg-gradient-to-r from-blue-500 to-cyan-400 px-1 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className={`absolute right-0 top-14 z-50 w-[min(340px,calc(100vw-32px))] overflow-hidden rounded-2xl border shadow-2xl ${ui.surface}`}
                  >
                    <div className="flex items-center justify-between border-b border-inherit bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4">
                      <div>
                        <h3 className="text-sm font-bold">Notifications</h3>
                        <p className={`mt-1 text-[10px] ${ui.muted}`}>
                          {unreadCount} unread notifications
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setReadNotifications(notifications.map((item) => item.id))
                        }
                        className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto p-2">
                      {notifications.map((notification) => {
                        const Icon = notification.icon;
                        const isRead = readNotifications.includes(notification.id);

                        return (
                          <button
                            key={notification.id}
                            onClick={() =>
                              setReadNotifications((previous) =>
                                previous.includes(notification.id)
                                  ? previous
                                  : [...previous, notification.id],
                              )
                            }
                            className={`flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-cyan-500/5 ${
                              isRead ? "opacity-60" : "bg-blue-500/5"
                            }`}
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-cyan-400">
                              <Icon size={18} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="text-xs font-bold">{notification.title}</span>
                                {!isRead && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                              </span>
                              <span className={`mt-1 block text-[11px] leading-5 ${ui.muted}`}>
                                {notification.message}
                              </span>
                              <span className={`mt-1 block text-[9px] ${ui.subtle}`}>
                                {notification.time}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => navigateTo("Profile")}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white"
              title="My profile"
            >
              {(profile.name || "S").charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] p-4 sm:p-7">
          <div className={`mb-5 flex items-center gap-2 rounded-xl border px-3 py-2.5 md:hidden ${ui.input}`}>
            <Search size={16} className={ui.subtle} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notes..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* Dashboard banner */}
          {showBanner && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-7 overflow-hidden rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-[#0d1a2d] via-[#10253c] to-[#073344] p-6 sm:p-8"
            >
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-cyan-300">
                    <Sparkles size={13} /> YOUR SMART WORKSPACE
                  </span>
                  <h1 className="mt-4 text-2xl font-black leading-tight text-white sm:text-4xl">
                    Organize your thoughts.
                    <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                      Focus on what matters.
                    </span>
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                    Create professional notes, manage priorities and keep your
                    ideas organized in one place.
                  </p>
                  <button
                    onClick={openCreate}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
                  >
                    <Plus size={18} /> Create Professional Note
                  </button>
                </div>

                <div className="grid w-full grid-cols-2 gap-3 sm:max-w-[230px]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                    <FileText size={19} className="text-cyan-300" />
                    <p className="mt-3 text-2xl font-black text-white">{activeNotes.length}</p>
                    <p className="mt-1 text-[10px] text-slate-400">Active notes</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                    <Star size={19} className="text-amber-300" />
                    <p className="mt-3 text-2xl font-black text-white">{favouriteNotes.length}</p>
                    <p className="mt-1 text-[10px] text-slate-400">Favourites</p>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-white">Total note size</p>
                        <p className="mt-1 text-[10px] text-slate-400">Approximate text storage</p>
                      </div>
                      <p className="text-sm font-bold text-cyan-300">{totalSize}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Dashboard stats */}
          {!editorOpen && activePage === "Dashboard" && (
            <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
              {[
                { label: "Total Notes", value: activeNotes.length, icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Pinned Notes", value: pinnedNotes.length, icon: Pin, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                { label: "Favourites", value: favouriteNotes.length, icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
                { label: "Archived", value: archivedNotes.length, icon: Archive, color: "text-purple-400", bg: "bg-purple-500/10" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`flex items-center gap-3 rounded-2xl border p-4 sm:p-5 ${ui.surface}`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                      <Icon size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[11px] ${ui.muted}`}>{stat.label}</p>
                      <p className="mt-1 text-2xl font-extrabold">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create/edit note editor */}
          <AnimatePresence mode="wait">
            {editorOpen && (
              <motion.section
                key="note-editor"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`mb-7 overflow-hidden rounded-3xl border ${ui.surface}`}
              >
                <div className={`flex items-center justify-between gap-4 border-b p-5 sm:p-6 ${ui.divider}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                      <FilePlus2 size={21} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">
                        {editingId !== null ? "Edit your note" : "Create a professional note"}
                      </h2>
                      <p className={`mt-1 text-xs ${ui.muted}`}>
                        Write it down. Organize it. Find it anytime.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditorOpen(false);
                      setEditingId(null);
                    }}
                    className={`rounded-xl border p-2.5 ${ui.divider} ${ui.muted}`}
                    title="Close editor"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={saveNote} className="space-y-5 p-5 sm:p-6">
                  <div>
                    <label className={`mb-2 block text-xs font-semibold ${ui.muted}`}>
                      Note title
                    </label>
                    <input
                      autoFocus
                      value={form.title}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          title: event.target.value,
                        }))
                      }
                      placeholder="Give your note a meaningful title..."
                      className={`w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition focus:border-cyan-500 ${ui.input}`}
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className={`text-xs font-semibold ${ui.muted}`}>
                        Note content
                      </label>
                      <span className={`text-[10px] ${ui.subtle}`}>
                        {getWordCount(form.content)} words · {getNoteSize(form)}
                      </span>
                    </div>
                    <textarea
                      value={form.content}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          content: event.target.value,
                        }))
                      }
                      placeholder="Write your ideas, tasks, meeting notes, or study material..."
                      rows={9}
                      className={`w-full resize-y rounded-xl border px-4 py-4 text-sm leading-7 outline-none transition focus:border-cyan-500 ${ui.input}`}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <label className={`mb-2 block text-xs font-semibold ${ui.muted}`}>
                        Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            category: event.target.value,
                          }))
                        }
                        className={`w-full rounded-xl border px-3 py-3 text-sm outline-none ${ui.input}`}
                      >
                        {["Personal", "Work", "Study", "Ideas"].map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`mb-2 block text-xs font-semibold ${ui.muted}`}>
                        Priority
                      </label>
                      <select
                        value={form.priority}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            priority: event.target.value,
                          }))
                        }
                        className={`w-full rounded-xl border px-3 py-3 text-sm outline-none ${ui.input}`}
                      >
                        {["Low", "Medium", "High"].map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`mb-2 block text-xs font-semibold ${ui.muted}`}>
                        Border colour
                      </label>
                      <select
                        value={form.color}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            color: event.target.value,
                          }))
                        }
                        className={`w-full rounded-xl border px-3 py-3 text-sm outline-none ${ui.input}`}
                      >
                        <option value="blue">Ocean Blue</option>
                        <option value="purple">Royal Purple</option>
                        <option value="cyan">Fresh Cyan</option>
                        <option value="amber">Warm Amber</option>
                        <option value="rose">Soft Rose</option>
                      </select>
                      <div className="mt-2 flex gap-2">
                        {[
                          ["blue", "bg-blue-500"],
                          ["purple", "bg-purple-500"],
                          ["cyan", "bg-cyan-500"],
                          ["amber", "bg-amber-500"],
                          ["rose", "bg-rose-500"],
                        ].map(([value, color]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setForm((previous) => ({ ...previous, color: value }))
                            }
                            title={`${value} border`}
                            className={`h-5 w-5 rounded-full ${color} ${
                              form.color === value
                                ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-white"
                                : ""
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`mb-2 block text-xs font-semibold ${ui.muted}`}>
                        Reminder
                      </label>
                      <input
                        type="datetime-local"
                        value={form.reminder || ""}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            reminder: event.target.value,
                          }))
                        }
                        className={`w-full min-w-0 rounded-xl border px-3 py-3 text-xs outline-none ${ui.input}`}
                      />
                    </div>
                  </div>

                  <div className={`flex flex-wrap items-center gap-3 border-t pt-5 ${ui.divider}`}>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          pinned: !previous.pinned,
                        }))
                      }
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                        form.pinned
                          ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                          : `${ui.divider} ${ui.muted}`
                      }`}
                    >
                      <Pin size={15} /> {form.pinned ? "Pinned" : "Pin note"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          favourite: !previous.favourite,
                        }))
                      }
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                        form.favourite
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                          : `${ui.divider} ${ui.muted}`
                      }`}
                    >
                      <Star
                        size={15}
                        fill={form.favourite ? "currentColor" : "none"}
                      />
                      {form.favourite ? "Favourite" : "Add favourite"}
                    </button>

                    <div className="flex-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setEditorOpen(false);
                        setEditingId(null);
                      }}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold ${ui.divider} ${ui.muted}`}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
                    >
                      <Save size={17} />
                      {editingId !== null ? "Update Note" : "Save Note"}
                    </button>
                  </div>
                </form>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Profile page */}
          {!editorOpen && activePage === "Profile" && (
            <section className={`overflow-hidden rounded-3xl border ${ui.surface}`}>
              <div className="bg-gradient-to-r from-blue-600/20 via-cyan-500/10 to-purple-500/20 p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-2xl font-black text-white">
                    {(profile.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold">My Profile</h2>
                    <p className={`mt-1 text-sm ${ui.muted}`}>
                      Personal and college information
                    </p>
                  </div>
                </div>
              </div>

              <form
                className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8"
                onSubmit={(event) => {
                  event.preventDefault();
                  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
                  setProfileSaved(true);
                  setToast("Profile saved successfully!");
                  setTimeout(() => setProfileSaved(false), 2500);
                }}
              >
                {[
                  { key: "name", label: "Full Name", icon: UserRound, placeholder: "Enter your name" },
                  { key: "email", label: "Email Address", icon: Mail, placeholder: "Enter your email" },
                  { key: "college", label: "College Name", icon: Building2, placeholder: "Enter your college name" },
                  { key: "course", label: "Course", icon: GraduationCap, placeholder: "e.g. B.Tech" },
                  { key: "branch", label: "Branch", icon: BookOpen, placeholder: "e.g. Computer Engineering" },
                ].map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.key}>
                      <label className={`mb-2 block text-xs font-semibold ${ui.muted}`}>
                        {field.label}
                      </label>
                      <div className={`flex items-center gap-3 rounded-xl border px-3 ${ui.input}`}>
                        <Icon size={16} className="shrink-0 text-cyan-400" />
                        <input
                          value={profile[field.key] || ""}
                          onChange={(event) =>
                            setProfile((previous) => ({
                              ...previous,
                              [field.key]: event.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          className="w-full min-w-0 bg-transparent py-3 text-sm outline-none"
                        />
                      </div>
                    </div>
                  );
                })}

                <div>
                  <label className={`mb-2 block text-xs font-semibold ${ui.muted}`}>
                    Academic Year
                  </label>
                  <select
                    value={profile.year}
                    onChange={(event) =>
                      setProfile((previous) => ({
                        ...previous,
                        year: event.target.value,
                      }))
                    }
                    className={`w-full rounded-xl border px-3 py-3 text-sm outline-none ${ui.input}`}
                  >
                    {["First Year", "Second Year", "Third Year", "Final Year", "Graduate"].map((year) => (
                      <option key={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end sm:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
                  >
                    <Save size={17} />
                    {profileSaved ? "Profile Saved" : "Save Profile"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Settings page */}
          {!editorOpen && activePage === "Settings" && (
            <section className={`rounded-3xl border p-5 sm:p-7 ${ui.surface}`}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Settings size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Workspace Settings</h2>
                  <p className={`mt-1 text-sm ${ui.muted}`}>
                    Customize your notes experience.
                  </p>
                </div>
              </div>

              <div className={`divide-y ${ui.divider}`}>
                <div className="flex items-center justify-between gap-4 py-5">
                  <div>
                    <p className="text-sm font-semibold">Compact note cards</p>
                    <p className={`mt-1 text-xs ${ui.muted}`}>
                      Show more notes on the screen.
                    </p>
                  </div>
                  <button
                    onClick={() => setCompactCards((value) => !value)}
                    className={`h-6 w-11 rounded-full p-0.5 transition ${compactCards ? "bg-blue-500" : "bg-slate-500/30"}`}
                  >
                    <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${compactCards ? "translate-x-5" : ""}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 py-5">
                  <div>
                    <p className="text-sm font-semibold">Show word count</p>
                    <p className={`mt-1 text-xs ${ui.muted}`}>
                      Display word count on each note.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWordCount((value) => !value)}
                    className={`h-6 w-11 rounded-full p-0.5 transition ${showWordCount ? "bg-blue-500" : "bg-slate-500/30"}`}
                  >
                    <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${showWordCount ? "translate-x-5" : ""}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 py-5">
                  <div>
                    <p className="text-sm font-semibold">Appearance</p>
                    <p className={`mt-1 text-xs ${ui.muted}`}>
                      Choose dark or light mode.
                    </p>
                  </div>
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${ui.divider}`}
                  >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                    {theme === "dark" ? "Dark mode" : "Light mode"}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 py-5">
                  <div>
                    <p className="text-sm font-semibold">Approximate note storage</p>
                    <p className={`mt-1 text-xs ${ui.muted}`}>
                      Text size of active notes.
                    </p>
                  </div>
                  <span className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400">
                    {totalSize}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Notes list */}
          {!editorOpen &&
            activePage !== "Settings" &&
            activePage !== "Profile" && (
              <section>
                <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={18} className="text-cyan-400" />
                      <h2 className="text-xl font-extrabold tracking-tight">
                        {activePage === "Dashboard" ? "Recent Notes" : activePage}
                      </h2>
                    </div>
                    <p className={`mt-1.5 text-xs sm:text-sm ${ui.muted}`}>
                      {activePage === "Dashboard"
                        ? "Your ideas, organized beautifully."
                        : `Manage your ${activePage.toLowerCase()} in one place.`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className={`rounded-xl border px-3 py-2.5 text-xs outline-none ${ui.input}`}
                      aria-label="Sort notes"
                    >
                      <option value="updated">Recently updated</option>
                      <option value="created">Recently created</option>
                      <option value="title">Title A–Z</option>
                    </select>

                    <button
                      onClick={() => setView("grid")}
                      className={`rounded-xl border p-2.5 ${
                        view === "grid"
                          ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                          : `${ui.divider} ${ui.muted}`
                      }`}
                      title="Grid view"
                    >
                      <Grid2X2 size={17} />
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={`rounded-xl border p-2.5 ${
                        view === "list"
                          ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                          : `${ui.divider} ${ui.muted}`
                      }`}
                      title="List view"
                    >
                      <List size={17} />
                    </button>

                    <button
                      onClick={openCreate}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 sm:text-sm"
                    >
                      <Plus size={16} /> New Note
                    </button>
                  </div>
                </div>

                {selectedCategory !== "All Notes" && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className={`text-xs ${ui.muted}`}>Category:</span>
                    <span className="rounded-lg bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-400">
                      {selectedCategory}
                    </span>
                    <button
                      onClick={() => setSelectedCategory("All Notes")}
                      className={`rounded-lg p-1 ${ui.muted}`}
                      title="Clear category filter"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {visibleNotes.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed p-8 text-center ${ui.divider}`}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                      {activePage === "Trash" ? <Trash2 size={27} /> : <FileText size={27} />}
                    </div>
                    <h3 className="mt-5 text-lg font-bold">
                      {search ? "No matching notes" : "Nothing here yet"}
                    </h3>
                    <p className={`mt-2 max-w-sm text-sm leading-6 ${ui.muted}`}>
                      {search
                        ? "Try another search term."
                        : activePage === "Trash"
                          ? "Deleted notes will appear here."
                          : "Create your first note and organize your ideas."}
                    </p>
                    {activePage !== "Trash" && (
                      <button
                        onClick={openCreate}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white"
                      >
                        <Plus size={17} /> Create Your First Note
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    className={
                      view === "grid"
                        ? "grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"
                        : "flex flex-col gap-3"
                    }
                  >
                    <AnimatePresence>
                      {visibleNotes.map((note) => (
                        <NoteCard key={note.id} note={note} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}

                <div className={`mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] ${ui.subtle}`}>
                  <span>
                    Showing {visibleNotes.length} notes · Total size {totalSize}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    Saved in this browser
                  </span>
                </div>
              </section>
            )}

          <footer className={`mt-10 flex flex-col justify-between gap-2 border-t py-5 text-[10px] ${ui.divider} ${ui.subtle} sm:flex-row sm:items-center`}>
            <span>© {new Date().getFullYear()} SmartNotesPro</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Workspace ready
            </span>
          </footer>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-5 right-5 z-[100] flex max-w-[calc(100vw-40px)] items-center gap-3 rounded-2xl border border-emerald-500/20 bg-[#101d2b] px-4 py-3.5 text-sm font-medium text-white shadow-2xl"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Check size={17} />
            </span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
