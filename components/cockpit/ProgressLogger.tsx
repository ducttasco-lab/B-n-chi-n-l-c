// components/cockpit/ProgressLogger.tsx
import React, { useState } from 'react';
// FIX: Added .ts extension to the import path.
import { StrategicInitiative, ProgressUpdate } from '../../types.ts';

interface ProgressLoggerProps {
  initiative: StrategicInitiative;
  onClose: () => void;
  // FIX: Simplified onSave signature to only pass the update object.
  onSave: (update: ProgressUpdate) => void;
}

const ProgressLogger: React.FC<ProgressLoggerProps> = ({ initiative, onClose, onSave }) => {
  const [progress, setProgress] = useState(initiative.currentProgress || 0);
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !author.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    const newUpdate: ProgressUpdate = {
      id: `update-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      progressPercentage: progress,
      comment,
      author,
    };
    // FIX: Call onSave with only the new update.
    onSave(newUpdate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Log Progress for "{initiative.name}"</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
              Progress ({progress}%)
            </label>
            <input
              id="progress"
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
           <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author</label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgressLogger;
