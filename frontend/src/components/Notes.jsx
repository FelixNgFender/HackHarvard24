import React, { useState } from 'react';


const PopupNote = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');

  const togglePopup = () => setIsOpen(!isOpen);

  const handleNoteChange = (e) => setNote(e.target.value);

  const handleSave = () => {
    if (note.trim()) {
      const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
      const newNote = {
        id: Date.now(),
        content: note,
        timestamp: new Date().toISOString()
      };
      savedNotes.push(newNote);
      localStorage.setItem('notes', JSON.stringify(savedNotes));
      setNote('');
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-7 right-7">
      <button
        onClick={togglePopup}
        className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg"
      >
        {isOpen ? "Cancel" : 'Note+'}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4">
            <h2 className="text-lg text-black font-semibold mb-2">Quick Note</h2>
            <textarea
              value={note}
              onChange={handleNoteChange}
              className="w-full h-32 p-2 border rounded mb-4 resize-none"
              placeholder="Type your note here..."
            />
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupNote;