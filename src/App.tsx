import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Note } from './components/Note';
import { NoteForm } from './components/NoteForm';
import { LogIn, LogOut } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import 'react-native-reanimated';

interface NoteType {
  id: string;
  title: string;
  content: string;
  user_id: string;
}

function App() {
  const [session, setSession] = useState(null);
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [editingNote, setEditingNote] = useState<NoteType | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchNotes();
    }
  }, [session]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch notes');
    } else {
      setNotes(data);
    }
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) toast.error('Failed to sign in');
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error('Failed to sign out');
    else {
      setNotes([]);
      setEditingNote(null);
    }
  };

  const handleAddNote = async (title: string, content: string) => {
    const { error } = await supabase.from('notes').insert([
      {
        title,
        content,
        user_id: session?.user?.id,
      },
    ]);

    if (error) {
      toast.error('Failed to add note');
    } else {
      toast.success('Note added successfully');
      fetchNotes();
    }
  };

  const handleUpdateNote = async (title: string, content: string) => {
    if (!editingNote) return;

    const { error } = await supabase
      .from('notes')
      .update({ title, content })
      .eq('id', editingNote.id);

    if (error) {
      toast.error('Failed to update note');
    } else {
      toast.success('Note updated successfully');
      setEditingNote(null);
      fetchNotes();
    }
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete note');
    } else {
      toast.success('Note deleted successfully');
      fetchNotes();
    }
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <Toaster position='top-right' />
      <nav className='bg-white shadow-md'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold text-gray-900'>Notes App</h1>
            {session ? (
              <button
                onClick={handleSignOut}
                className='flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors'
              >
                <LogOut className='w-4 h-4' />
                Sign Out
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
              >
                <LogIn className='w-4 h-4' />
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {session ? (
          <div className='space-y-8'>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-xl font-semibold mb-4'>
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </h2>
              <NoteForm
                onSubmit={editingNote ? handleUpdateNote : handleAddNote}
                initialTitle={editingNote?.title}
                initialContent={editingNote?.content}
                isEditing={!!editingNote}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {notes.map(note => (
                <Note
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  content={note.content}
                  onEdit={() => setEditingNote(note)}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className='text-center py-12'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              Welcome to Notes App
            </h2>
            <p className='mt-2 text-gray-600'>
              Please sign in with Google to start creating notes.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
