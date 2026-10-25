
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  NotebookPen,
  CalendarDays,
  CheckSquare,
  Star,
  Trash2,
  Settings,
  Search,
  Plus,
  Moon,
  Sun,
  Bell,
  Pin,
  Clock3,
  ArrowUpRight,
  CheckCircle2,
  Menu,
  X,
  BookOpen,
  BriefcaseBusiness,
  Heart,
  Palette,
} from "lucide-react";

const initialNotes = [
  {
    id: 1,
    title: "MERN Stack Project",
    content: "Build the Smart Notes application with React, Express, MongoDB and Node.js.",
    category: "Projects",
    color: "violet",
    pinned: true,
    favorite: true,
    updated: "Just now",
  },
  {
    id: 2,
    title: "College Assignments",
    content: "Complete the assignment, prepare notes and revise important questions.",
    category: "College",
    color: "blue",
    pinned: false,
    favorite: false,
    updated: "20 min ago",
  },
  {
    id: 3,
    title: "Weekly Goals",
    content: "Practice React hooks, finish the backend APIs and test the login flow.",
    category: "Personal",
    color: "green",
    pinned: false,
    favorite: true,
    updated: "1 hour ago",
  },
  {
    id: 4,
    title: "Meeting Notes",
    content: "Review project requirements, plan upcoming tasks and track progress.",
    category: "Work",
    color: "orange",
    pinned: false,
    favorite: false,
    updated: "Yesterday",
  },
];

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "All Notes", icon: NotebookPen },
  { label: "Favourites", icon: Star },
  { label: "Reminders", icon: CalendarDays },
  { label: "Tasks", icon: CheckSquare },
  { label: "Recently Deleted", icon: Trash2 },
];

const colors = {
  violet: "border-violet-400/30 bg-violet-500/10",
  blue: "border-sky-400/30 bg-sky-500/10",
  green: "border-emerald-400/30 bg-emerald-500/10",
  orange: "border-orange-400/30 bg-orange-500/10",
};

const iconColors = {
  violet: "text-violet-500",
  blue: "text-sky-500",
  green: "text-emerald-500",
  orange: "text-orange-500",
};

function App() {
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState("Overview");
  const [notes, setNotes] = useState(initialNotes);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Personal");
  const [color, setColor] = useState("violet");
  const [toast, setToast] = useState("");

  const theme = dark
    ? {
        page: "bg-[#0b0b12] text-slate-100",
        sidebar: "bg-[#101019] border-white/[0.07]",
        card: "bg-[#12121d] border-white/[0.07]",
        muted: "text-slate-400",
        input: "bg-white/[0.04] border-white/10 placeholder:text-slate-500",
        hover: "hover:bg-white/[0.06]",
        divider: "border-white/[0.07]",
        overlay: "bg-[#0b0b12]/90",
      }
    : {
        page: "bg-[#f6f7fb] text-slate-800",
        sidebar: "bg-white border-slate-200",
        card: "bg-white border-slate-200 shadow-sm shadow-slate-200/30",
        muted: "text-slate-500",
        input: "bg-slate-50 border-slate-200 placeholder:text-slate-400",
        hover: "hover:bg-slate-100",
        divider: "border-slate-200",
        overlay: "bg-white/90",
      };

  const visibleNotes = useMemo(() => {
    let result = [...notes];

    if (active === "Favourites") {
      result = result.filter((note) => note.favorite);
    }

    if (active === "Recently Deleted") {
      result = result.filter((note) => note.deleted);
    } else {
      result = result.filter((note) => !note.deleted);
    }

    if (active === "College" || active === "Personal" ||
        active === "Work" || active === "Projects") {
      result = result.filter((note) => note.category === active);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.category.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notes, active, search]);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }

  function openCreate() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setCategory("Personal");
    setColor("violet");
    setShowForm(true);
  }

  function openEdit(note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setColor(note.color);
    setShowForm(true);
  }

  function saveNote(event) {
    event.preventDefault();

    if (!title.trim()) {
      notify("Please enter a note title.");
      return;
    }

    if (editingId !== null) {
      setNotes((old) =>
        old.map((note) =>
          note.id === editingId
            ? { ...note, title: title.trim(), content: content.trim(),
                category, color, updated: "Just now" }
            : note
        )
      );
      notify("Note updated successfully!");
    } else {
      setNotes((old) => [
        {
          id: Date.now(),
          title: title.trim(),
          content: content.trim(),
          category,
          color,
          pinned: false,
          favorite: false,
          deleted: false,
          updated: "Just now",
        },
        ...old,
      ]);
      notify("Your new note has been created!");
    }

    setShowForm(false);
  }

  function togglePin(id) {
    setNotes((old) =>
      old.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned } : note
      )
    );
  }

  function toggleFavorite(id) {
    setNotes((old) =>
      old.map((note) =>
        note.id === id ? { ...note, favorite: !note.favorite } : note
      )
    );
  }

  function deleteNote(id) {
    setNotes((old) =>
      old.map((note) =>
        note.id === id ? { ...note, deleted: true, pinned: false } : note
      )
    );
    notify("Note moved to Recently Deleted.");
  }

  function restoreNote(id) {
    setNotes((old) =>
      old.map((note) =>
        note.id === id ? { ...note, deleted: false } : note
      )
    );
    notify("Note restored.");
  }

  function permanentlyDelete(id) {
    setNotes((old) => old.filter((note) => note.id !== id));
    notify("Note permanently deleted.");
  }

  const activeCount = notes.filter((note) => !note.deleted).length;
  const favouriteCount = notes.filter(
    (note) => note.favorite && !note.deleted
  ).length;

  return (
    <div className={`min-h-screen ${theme.page} transition-colors duration-300`}>
      {mobileMenu && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r ${theme.sidebar} transition-transform duration-300 lg:translate-x-0 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`flex h-[82px] items-center justify-between border-b px-6 ${theme.divider}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
              <NotebookPen size={21} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">NoteFlow</h1>
              <p className={`text-[10px] tracking-[0.2em] ${theme.muted}`}>
                SMART WORKSPACE
              </p>
            </div>
          </div>
          <button
            className={`rounded-lg p-2 lg:hidden ${theme.hover}`}
            onClick={() => setMobileMenu(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] ${theme.muted}`}>
            Workspace
          </p>

          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                setActive(label);
                setMobileMenu(false);
              }}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 ${
                active === label
                  ? "bg-violet-500/10 font-semibold text-violet-500"
                  : `${theme.muted} ${theme.hover}`
              }`}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{label}</span>
              {label === "All Notes" && (
                <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs text-violet-500">
                  {activeCount}
                </span>
              )}
              {label === "Favourites" && (
                <span className={`text-xs ${theme.muted}`}>{favouriteCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="px-4 pt-8">
          <p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] ${theme.muted}`}>
            Categories
          </p>
          {[
            { name: "College", icon: BookOpen, color: "text-sky-500" },
            { name: "Personal", icon: Heart, color: "text-rose-500" },
            { name: "Work", icon: BriefcaseBusiness, color: "text-orange-500" },
            { name: "Projects", icon: Palette, color: "text-violet-500" },
          ].map(({ name, icon: Icon, color: iconColor }) => (
            <button
              key={name}
              onClick={() => {
                setActive(name);
                setMobileMenu(false);
              }}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${theme.hover} ${
                active === name ? "font-semibold" : theme.muted
              }`}
            >
              <Icon size={17} className={iconColor} />
              {name}
            </button>
          ))}
        </div>

        <div className="mt-auto p-4">
          <div className={`rounded-2xl border p-4 ${theme.card}`}>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-violet-500">
              <Settings size={18} />
            </div>
            <p className="text-sm font-semibold">Your space, your way.</p>
            <p className={`mt-1 text-xs leading-5 ${theme.muted}`}>
              Keep your thoughts organized and your day productive.
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-500/15">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(activeCount * 10, 100)}%` }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
              />
            </div>
          </div>
          <div className={`mt-4 flex items-center gap-3 border-t px-1 pt-4 ${theme.divider}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 font-bold text-white">
              U
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">My Workspace</p>
              <p className={`text-xs ${theme.muted}`}>Personal account</p>
            </div>
            <button
              aria-label="Settings"
              title="Settings"
              onClick={() => notify("Account settings will be added in the next stage.")}
              className={`rounded-lg p-2 ${theme.muted} ${theme.hover}`}
            >
              <Settings size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[260px]">
        <header className={`sticky top-0 z-30 flex h-[82px] items-center justify-between gap-4 border-b px-4 backdrop-blur-xl sm:px-8 ${theme.sidebar} ${theme.divider} bg-opacity-90`}>
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="Open menu"
              onClick={() => setMobileMenu(true)}
              className={`rounded-xl border p-2.5 lg:hidden ${theme.divider}`}
            >
              <Menu size={19} />
            </button>
            <div className="hidden sm:block">
              <p className={`text-xs ${theme.muted}`}>Workspace / {active}</p>
              <h2 className="mt-1 text-sm font-semibold">{active}</h2>
            </div>
            <div className="sm:hidden">
              <h2 className="text-sm font-bold">NoteFlow</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`flex h-10 w-[min(36vw,260px)] items-center gap-2 rounded-xl border px-3 ${theme.input}`}>
              <Search size={17} className={theme.muted} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes..."
                className="w-full min-w-0 bg-transparent text-xs outline-none sm:text-sm"
              />
              <kbd className={`hidden rounded border px-1.5 py-0.5 text-[10px] sm:block ${theme.divider} ${theme.muted}`}>
                /
              </kbd>
            </div>

            <button
              onClick={() => notify("Your notification center is ready for reminders.")}
              aria-label="Notifications"
              className={`relative rounded-xl border p-2.5 transition ${theme.divider} ${theme.hover}`}
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-500" />
            </button>

            <button
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              className={`rounded-xl border p-2.5 transition ${theme.divider} ${theme.hover}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={dark ? "moon" : "sun"}
                  initial={{ rotate: -35, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 35, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.18 }}
                >
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-8">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative mb-8 overflow-hidden rounded-[28px] border border-violet-400/20 bg-gradient-to-br from-violet-600/15 via-indigo-500/10 to-transparent p-6 sm:p-9"
          >
            <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Your productivity space
                </span>
                <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  Make room for
                  <span className="block bg-gradient-to-r from-violet-500 to-indigo-400 bg-clip-text text-transparent">
                    your best ideas.
                  </span>
                </h1>
                <p className={`mt-3 max-w-md text-sm leading-6 ${theme.muted}`}>
                  Capture thoughts, organize your day and turn small ideas into meaningful progress.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:shadow-violet-600/30"
                  >
                    <Plus size={17} />
                    Create new note
                  </button>
                  <button
                    onClick={() => setActive("Tasks")}
                    className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${theme.divider} ${theme.hover}`}
                  >
                    View tasks <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-[32px] border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-indigo-500/10 md:flex"
              >
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, -3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <NotebookPen size={64} strokeWidth={1.1} className="text-violet-500" />
                </motion.div>
              </motion.div>
            </div>
          </motion.section>

          <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Notes", value: activeCount, icon: NotebookPen, tint: "text-violet-500", box: "bg-violet-500/10", foot: "Your saved ideas" },
              { label: "Favourites", value: favouriteCount, icon: Star, tint: "text-amber-500", box: "bg-amber-500/10", foot: "Notes you love" },
              { label: "Pinned Notes", value: notes.filter((n) => n.pinned && !n.deleted).length, icon: Pin, tint: "text-sky-500", box: "bg-sky-500/10", foot: "Quick access" },
              { label: "Tasks Completed", value: 0, icon: CheckCircle2, tint: "text-emerald-500", box: "bg-emerald-500/10", foot: "Ready to get started" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className={`rounded-2xl border p-5 transition-shadow hover:shadow-lg hover:shadow-violet-500/[0.04] ${theme.card}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xs font-medium ${theme.muted}`}>{stat.label}</p>
                    <motion.p
                      key={stat.value}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-3xl font-bold tracking-tight"
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.box} ${stat.tint}`}>
                    <stat.icon size={21} />
                  </div>
                </div>
                <p className={`mt-4 text-xs ${theme.muted}`}>{stat.foot}</p>
              </motion.div>
            ))}
          </section>

          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {active === "Overview" ? "Your notes" : active}
                </h2>
                <p className={`mt-1 text-sm ${theme.muted}`}>
                  {active === "Recently Deleted"
                    ? "Restore notes or remove them permanently."
                    : "Everything important, organized in one place."}
                </p>
              </div>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-500 transition hover:bg-violet-500/15"
              >
                <Plus size={17} /> New note
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active + search}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"
              >
                {visibleNotes.map((note, index) => (
                  <motion.article
                    layout
                    key={note.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ delay: index * 0.045, duration: 0.28 }}
                    whileHover={{ y: -4 }}
                    className={`group relative flex min-h-[220px] flex-col rounded-2xl border p-5 transition-shadow hover:shadow-xl hover:shadow-violet-500/[0.04] ${theme.card}`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${colors[note.color] || colors.violet} ${iconColors[note.color] || iconColors.violet}`}>
                        {note.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePin(note.id)}
                          title={note.pinned ? "Unpin note" : "Pin note"}
                          aria-label={note.pinned ? "Unpin note" : "Pin note"}
                          className={`rounded-lg p-2 transition ${note.pinned ? "text-violet-500" : `${theme.muted} opacity-60 hover:opacity-100`}`}
                        >
                          <Pin size={16} />
                        </button>
                        <button
                          onClick={() => toggleFavorite(note.id)}
                          title="Toggle favourite"
                          aria-label="Toggle favourite"
                          className={`rounded-lg p-2 transition ${note.favorite ? "text-amber-500" : theme.muted}`}
                        >
                          <Star size={16} fill={note.favorite ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>

                    <button onClick={() => openEdit(note)} className="text-left">
                      <h3 className="text-base font-bold tracking-tight transition-colors group-hover:text-violet-500">
                        {note.title}
                      </h3>
                      <p className={`mt-2 line-clamp-3 min-h-[60px] text-sm leading-6 ${theme.muted}`}>
                        {note.content || "No additional details."}
                      </p>
                    </button>

                    <div className={`mt-auto flex items-center justify-between border-t pt-4 ${theme.divider}`}>
                      <span className={`flex items-center gap-1.5 text-[11px] ${theme.muted}`}>
                        <Clock3 size={13} /> {note.updated}
                      </span>
                      <div className="flex items-center gap-1">
                        {active === "Recently Deleted" ? (
                          <>
                            <button
                              onClick={() => restoreNote(note.id)}
                              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/10"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => permanentlyDelete(note.id)}
                              aria-label="Permanently delete note"
                              className="rounded-lg p-2 text-rose-500 hover:bg-rose-500/10"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(note)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${theme.muted} ${theme.hover}`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteNote(note.id)}
                              aria-label="Move note to recycle bin"
                              className={`rounded-lg p-2 transition ${theme.muted} hover:bg-rose-500/10 hover:text-rose-500`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </AnimatePresence>

            {visibleNotes.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 rounded-2xl border border-dashed p-12 text-center ${theme.divider}`}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                  <NotebookPen size={25} />
                </div>
                <h3 className="mt-4 font-semibold">No notes found</h3>
                <p className={`mt-2 text-sm ${theme.muted}`}>
                  Try another search or create a new note.
                </p>
                <button
                  onClick={openCreate}
                  className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
                >
                  Create a note
                </button>
              </motion.div>
            )}
          </section>

          <footer className={`mt-12 border-t py-6 text-center text-xs ${theme.divider} ${theme.muted}`}>
            NoteFlow · Your ideas, beautifully organized.
          </footer>
        </div>
      </main>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowForm(false);
            }}
          >
            <motion.form
              onSubmit={saveNote}
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className={`my-auto w-full max-w-lg rounded-3xl border p-6 shadow-2xl sm:p-8 ${theme.card}`}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
                    Your workspace
                  </p>
                  <h2 className="mt-2 text-xl font-bold">
                    {editingId !== null ? "Edit your note" : "Create a new note"}
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close form"
                  onClick={() => setShowForm(false)}
                  className={`rounded-xl p-2 ${theme.hover}`}
                >
                  <X size={20} />
                </button>
              </div>

              <label className={`mb-2 block text-sm font-medium ${theme.muted}`}>
                Note title
              </label>
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give your note a title..."
                maxLength={120}
                className={`mb-5 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-violet-500 ${theme.input}`}
              />

              <label className={`mb-2 block text-sm font-medium ${theme.muted}`}>
                Description
              </label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write down your thoughts..."
                rows={5}
                maxLength={5000}
                className={`mb-5 w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition focus:border-violet-500 ${theme.input}`}
              />

              <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-sm font-medium ${theme.muted}`}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className={`w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-violet-500 ${theme.input}`}
                  >
                    <option>Personal</option>
                    <option>College</option>
                    <option>Work</option>
                    <option>Projects</option>
                  </select>
                </div>

                <div>
                  <label className={`mb-2 block text-sm font-medium ${theme.muted}`}>
                    Note color
                  </label>
                  <div className="flex h-[46px] items-center gap-3">
                    {[
                      ["violet", "bg-violet-500"],
                      ["blue", "bg-sky-500"],
                      ["green", "bg-emerald-500"],
                      ["orange", "bg-orange-500"],
                    ].map(([value, bg]) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} note color`}
                        onClick={() => setColor(value)}
                        className={`h-7 w-7 rounded-full ${bg} transition ${
                          color === value
                            ? "ring-2 ring-violet-400 ring-offset-2 ring-offset-transparent scale-110"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`rounded-xl border px-5 py-3 text-sm font-semibold ${theme.divider} ${theme.hover}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
                >
                  {editingId !== null ? "Save changes" : "Create note"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-5 right-5 z-[100] flex max-w-[calc(100vw-40px)] items-center gap-3 rounded-2xl border border-violet-400/20 bg-[#171525] px-5 py-4 text-sm font-medium text-white shadow-2xl"
          >
            <CheckCircle2 size={19} className="shrink-0 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
