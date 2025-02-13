import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface NoteProps {
  id: string;
  title: string;
  content: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Note({ id, title, content, onEdit, onDelete }: NoteProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(id)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-gray-600 whitespace-pre-wrap">{content}</p>
    </div>
  );
}