import React from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  content: string;
  isPreviewMode: boolean;
  onContentChange: (content: string) => void;
}

const NoteEditor: React.FC<Props> = ({
  content,
  isPreviewMode,
  onContentChange,
}) => {
  return isPreviewMode ? (
    <div className="markdown">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  ) : (
    <textarea
      className="w-full h-[500px] p-2 border border-gray-300 rounded"
      value={content}
      onChange={(e) => onContentChange(e.target.value)}
    />
  );
};

export default NoteEditor;
