import { jsPDF } from "jspdf";
"use client"

import { useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { NotepadTabs } from "./notepad-tabs"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface Note {
  id: string
  title: string
  content: string
}

export default function Notepad() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string>("")
  const [content, setContent] = useState("")

  // Initialize notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("notepad-notes")
    const savedActiveId = localStorage.getItem("notepad-active-id")

    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    } else {
      // Create a default note if none exist
      const defaultNote = { id: uuidv4(), title: "New Note", content: "" }
      setNotes([defaultNote])
      setActiveNoteId(defaultNote.id)
    }

    if (savedActiveId) {
      setActiveNoteId(savedActiveId)
    }
  }, [])

  // Get the active note
  const activeNote = notes.find((note) => note.id === activeNoteId) || notes[0]

  // Update content when active note changes
  useEffect(() => {
    if (activeNote) {
      setContent(activeNote.content)
    }
  }, [activeNote])

  // Save notes to localStorage when they change
  const debouncedNotes = useDebounce(notes, 500)
  useEffect(() => {
    if (debouncedNotes.length > 0) {
      localStorage.setItem("notepad-notes", JSON.stringify(debouncedNotes))
    }
  }, [debouncedNotes])

  // Save active note ID
  useEffect(() => {
    if (activeNoteId) {
      localStorage.setItem("notepad-active-id", activeNoteId)
    }
  }, [activeNoteId])

  // Create a new note
  const handleCreateNote = () => {
    const newNote = {
      id: uuidv4(),
      title: "New Note",
      content: "",
    }
    setNotes([...notes, newNote])
    setActiveNoteId(newNote.id)
  }

  // Delete a note
  const handleDeleteNote = (id: string) => {
    if (notes.length <= 1) {
      // Don't delete the last note
      return
    }

    const newNotes = notes.filter((note) => note.id !== id)
    setNotes(newNotes)

    // If we're deleting the active note, switch to another one
    if (id === activeNoteId) {
      setActiveNoteId(newNotes[0].id)
    }
  }

  // Rename a note
  const handleRenameNote = (id: string, title: string) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, title } : note)))
  }

  // Update note content
  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setNotes(notes.map((note) => (note.id === activeNoteId ? { ...note, content: newContent } : note)))
  }

  // Export note
  const handleExport = () => {
    if (!activeNote) return

    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${activeNote.title || "note"}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="flex-1 flex flex-col bg-yellow-50 dark:bg-yellow-950 border border-yellow-300 dark:border-yellow-800 rounded shadow-md">
      <NotepadTabs
        activeNoteId={activeNoteId}
        notes={notes}
        onSelectNote={setActiveNoteId}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onRenameNote={handleRenameNote}
      />

      <div className="bg-yellow-100 dark:bg-yellow-900 p-2 border-b border-yellow-300 dark:border-yellow-800 flex justify-between items-center">
        <div className="text-sm text-yellow-800 dark:text-yellow-200">My Notes</div>
        <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
      </div>

      <textarea
        className="flex-1 p-4 resize-none focus:outline-none font-mono bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 border-none w-full"
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="📝 “Write Anything. Anywhere. No Login Needed.”
A fast, distraction-free online notepad that saves your notes automatically."
        style={{ direction: "ltr", textAlign: "left" }}
      />

      <div className="flex justify-between items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-xs text-yellow-700 dark:text-yellow-300 border-t border-yellow-300 dark:border-yellow-800">
        <div>Auto-saving...</div>
        <div>{content.length} characters</div>
      </div>
    </div>
  )
}
