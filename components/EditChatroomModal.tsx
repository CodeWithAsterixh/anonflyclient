import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { editChatroom } from '../lib/controllers/chatroomController';

interface EditChatroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  chatroomId: string;
  initialRoomname: string;
  initialDescription: string;
}

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
      if (!roomname.trim()) {
        setError('Chatroom name is required');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Chatroom</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="roomname" className="block text-sm font-medium text-gray-700 mb-1">
              Chatroom Name
            </label>
            <input
              id="roomname"
              type="text"
              value={roomname}
              onChange={(e) => setRoomname(e.target.value)}
              placeholder="Enter chatroom name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter chatroom description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
