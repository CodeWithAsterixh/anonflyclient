import React, { useState, useEffect } from 'react';
import { editChatroom } from '../../lib/controllers/chatroomController';
import { validateRoomname, validateDescription } from '../../lib/helpers/validation';
import Input from '../ui/input';
import Modal from '../modal';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Chatroom"
    >
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
            className="px-5 py-2.5 text-white bg-primary rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditChatroomModal;
