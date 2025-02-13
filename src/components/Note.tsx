import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface NoteProps {
  id: string;
  title: string;
  content: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Note({ id, content, onEdit, onDelete }: NoteProps) {
  return (
    <div className='bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 border border-gray-100'>
      <div className='flex justify-end gap-2 mb-3'>
        <button
          onClick={() => onEdit(id)}
          className='text-gray-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50 flex items-center gap-1'
          aria-label='Edit note'
        >
          <Pencil className='w-4 h-4' />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(id)}
          className='text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 flex items-center gap-1'
          aria-label='Delete note'
        >
          <Trash2 className='w-4 h-4' />
          <span>Delete</span>
        </button>
      </div>
      <p className='text-gray-700 whitespace-pre-wrap text-base leading-relaxed'>
        {content}
      </p>
    </div>
  );
}
