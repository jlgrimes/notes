import React, { useState } from 'react';

interface NoteFormProps {
  onSubmit: (title: string, content: string) => void;
  initialContent?: string;
  isEditing?: boolean;
}

export function NoteForm({
  onSubmit,
  initialContent = '',
  isEditing = false,
}: NoteFormProps) {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit('', content);
      if (!isEditing) {
        setContent('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4 max-w-2xl mx-auto'>
      <div className='relative'>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder='Write your note here...'
          className='w-full px-6 py-4 border-0 rounded-xl bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px] text-gray-700 placeholder-gray-400 resize-none'
          required
        />
      </div>
      <button
        type='submit'
        className='w-full bg-indigo-600 text-white py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg'
      >
        {isEditing ? 'Update Note' : 'Add Note'}
      </button>
    </form>
  );
}
