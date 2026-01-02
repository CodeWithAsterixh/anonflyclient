import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { editChatroom } from '../../lib/controllers/chatroomController';
import { validateRoomname, validateDescription } from '../../lib/helpers/validation';
import Input from '../ui/input';
import type { EditChatroomModalProps } from './types';

const EditChatroomModal: React.FC<EditChatroomModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  chatroomId,
  initialRoomname,
  initialDescription,
}) => {
  const [roomname, setRoomname] = useState(initialRoomname);
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when initial values change
  useEffect(() => {
    setRoomname(initialRoomname);
    setDescription(initialDescription);
    setError(null);
  }, [initialRoomname, initialDescription, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!validateRoomname(roomname)) {
        setError('Chatroom name must be between 3 and 50 characters');
        setLoading(false);
        return;
      }

      if (!validateDescription(description)) {
        setError('Description must be 200 characters or less');
        setLoading(false);
        return;
      }

      await editChatroom(chatroomId, roomname, description);
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit chatroom';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Chatroom</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          <Input
            id="roomname"
            label="Chatroom Name"
            value={roomname}
            onChange={(e) => setRoomname(e.target.value)}
            placeholder="Enter chatroom name"
            disabled={loading}
          />

          <Input
            id="description"
            label="Description"
            multiline
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter chatroom description"
            rows={3}
            disabled={loading}
            helperText="Optional"
          />

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 dark:border-gray-700 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-white bg-blue-600 dark:bg-blue-500 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditChatroomModal;
