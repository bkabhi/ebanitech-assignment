"use client";

import { useState, useEffect } from "react";

export default function UserDashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });
  const [error, setError] = useState("");

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteForm),
      });
      if (res.ok) {
        setNoteForm({ title: "", content: "" });
        fetchNotes();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      fetchNotes();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">User Dashboard</h2>
      <p className="text-gray-600 mb-6">Manage your notes</p>

      {error && <div className="text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-black">Create Note</h3>
          <form onSubmit={handleCreateNote} className="space-y-3">
            <input required type="text" placeholder="Title" className="w-full border p-2 rounded text-black" value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} />
            <textarea required placeholder="Content" rows={4} className="w-full border p-2 rounded text-black" value={noteForm.content} onChange={e => setNoteForm({...noteForm, content: e.target.value})} />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Note</button>
          </form>
        </div>
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-black">Your Notes</h3>
          {notes.length === 0 ? (
            <div className="bg-white p-6 text-center text-gray-500 rounded-lg shadow-sm border">No notes created yet.</div>
          ) : (
            notes.map((note: any) => (
              <div key={note._id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg text-black">{note.title}</h4>
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">{note.content}</p>
                  <span className="text-xs text-gray-400 mt-2 block">{new Date(note.createdAt).toLocaleString()}</span>
                </div>
                <button onClick={() => handleDeleteNote(note._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
