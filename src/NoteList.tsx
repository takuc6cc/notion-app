import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Note } from "./Note";

type Props = {
  notes: Note[];
  selectNoteId: number | null;
  onSelect: (note: Note) => void;
  handleChangeTitle: (noteId: number, title: string) => void;
  handleDeleteNote: (noteId: number) => void;
};

const NoteList: React.FC<Props> = ({
  notes,
  selectNoteId,
  onSelect,
  handleChangeTitle,
  handleDeleteNote,
}) => {
  const [editingTitle, setEditingTitle] = useState("");
  const [selectEditTitleNoteId, setSelectEditTitleNoteId] = useState<
    number | null
  >(null);
  return (
    <ul className="space-y-2">
      {notes.map((note) => (
        <li
          key={note.id}
          onClick={() => onSelect(note)}
          className={`cursor-pointer p-2 rounded flex justify-between ${
            selectNoteId === note.id ? "bg-blue-200" : "bg-white"
          }`}
        >
          {selectEditTitleNoteId === note.id ? (
            <input
              name="title"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="ml-2 p-1 border border-gray-300 rounded w-[200px]"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter" && selectEditTitleNoteId) {
                  handleChangeTitle(selectEditTitleNoteId, editingTitle);
                  setSelectEditTitleNoteId(null);
                }
              }}
            />
          ) : (
            <span>{note.title}</span>
          )}
          <div className="flex gap-2">
            <button
              className="text-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                setEditingTitle(note.title);
                setSelectEditTitleNoteId(note.id);
              }}
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
            <button
              className="text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                if (
                  window.confirm(`「${note.title}」を削除してもよろしいですか?`)
                ) {
                  handleDeleteNote(note.id);
                }
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default NoteList;
