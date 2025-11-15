import { useEffect, useState } from "react";
import { supabase } from "./supabase/client";
import NoteList from "./NoteList";
import type { Note } from "./Note";
import NoteEditor from "./NoteEditor";

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null);

  useEffect(() => {
    fetchNotes();
    const mySubscription = supabase
      .channel("note")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "note" },
        fetchNotes
      )
      .subscribe();

    return () => {
      supabase.removeChannel(mySubscription);
    };
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("note")
      .select("*")
      .order("id", { ascending: false });
    if (error) console.error("Error fetching notes", error);
    else setNotes(data);
  };

  const handleNewNote = async () => {
    const { error } = await supabase
      .from("note")
      .insert({ title: "新規ノート", content: "" });
    if (error) {
      console.error(error);
      return;
    }
  };

  const handleContentChange = async (content: string) => {
    if (!currentNoteId) return;

    // まずローカルステートを即座に更新
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === currentNoteId ? { ...note, content } : note
      )
    );

    // その後、DBを更新
    const { error } = await supabase
      .from("note")
      .update({ content })
      .eq("id", currentNoteId);
    if (error) console.error("Error updating note", error);
  };

  const handleChangeTitle = async (noteId: number, title: string) => {
    // まずローカルステートを即座に更新
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId ? { ...note, title } : note
      )
    );

    // その後、DBを更新
    const { error } = await supabase
      .from("note")
      .update({ title })
      .eq("id", noteId);

    if (error) {
      console.error("Error updating note", error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    // 削除するノートが現在選択中の場合、選択を解除
    if (currentNoteId === noteId) {
      setCurrentNoteId(null);
    }

    // まずローカルステートを即座に更新
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));

    // その後、DBから削除
    const { error } = await supabase.from("note").delete().eq("id", noteId);

    if (error) {
      console.error("Error deleting note", error);
      // エラーが発生した場合、ノートを再取得
      fetchNotes();
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-[300px] bg-gray-100 p-4">
        <div className="mb-4">
          <button
            className="w-full p-2 bg-blue-500 text-white font-bold rounded"
            onClick={handleNewNote}
          >
            新規作成
          </button>
        </div>
        <NoteList
          notes={notes}
          selectNoteId={currentNoteId}
          onSelect={(note) => setCurrentNoteId(note.id)}
          handleChangeTitle={handleChangeTitle}
          handleDeleteNote={handleDeleteNote}
        />
      </div>
      <div className="flex-1 p-4">
        <div className="mb-4 flex justify-between">
          <h2 className="text-xl font-bold">Note Editor</h2>
          <button
            className="p-2 bg-green-500 text-white font-bold rounded"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? "Edit" : "Preview"}
          </button>
        </div>
        <NoteEditor
          content={
            notes.find((note) => note.id === currentNoteId)?.content || ""
          }
          isPreviewMode={previewMode}
          onContentChange={handleContentChange}
        />
      </div>
    </div>
  );
}

export default App;
