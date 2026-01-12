import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { createChatroom } from '../../lib/controllers/chatroomController';
import { validateRoomname, validateDescription, validateRoomPassword } from '../../lib/helpers/validation';
import { useAuth } from '../../hooks';
import { FEATURES } from '../../lib/constants/features';
import Input from '../ui/input';
import Modal from '../modal';
import type { CreateChatroomModalProps } from './types';

const CreateChatroomModal: React.FC<CreateChatroomModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomname, setRoomname] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPremium = user?.allowedFeatures?.includes(FEATURES.CREATE_PRIVATE_ROOM);

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

      if (password && !validateRoomPassword(password)) {
        setError('Password must be between 4 and 50 characters');
        setLoading(false);
        return;
      }

      const response = await createChatroom(roomname, description, password, isPrivate);
      setRoomname('');
      setDescription('');
      setPassword('');
      setIsPrivate(false);
      
      // Redirect to the newly created room
      if (response?.data?.id) {
        const { id, isPrivate, token } = response.data;
        const encodedToken = token ? encodeURIComponent(token) : "";
        const redirectPath = isPrivate && encodedToken ? `/join/${encodedToken}` : `/${id}`;
        navigate(redirectPath);
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create chatroom';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Chatroom"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <Input
          id="roomname"
          label="Chatroom Name"
          value={roomname}
          onChange={(e) => setRoomname(e.target.value)}
          placeholder="Enter a descriptive name"
          disabled={loading}
        />

        <Input
          id="description"
          label="Description"
          multiline
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this room about?"
          rows={3}
          disabled={loading}
          helperText="Optional"
        />

        <Input
          id="password"
          label="Room Password (optional)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Set a password for privacy"
          disabled={loading}
          autoComplete="new-password"
          helperText="Leave blank for a public room that anyone can join."
        />

        <div className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            id="isPrivate"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            disabled={loading || !isPremium}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
          />
          <label 
            htmlFor="isPrivate" 
            className={`text-sm font-medium ${isPremium ? 'text-foreground' : 'text-muted'}`}
          >
            Private Room (Premium Only)
            {!isPremium && <span className="ml-2 text-xs text-amber-500">(Upgrade required)</span>}
          </label>
        </div>
        <div className="mt-2 text-xs text-muted">
          {isPrivate 
            ? "Private rooms are hidden from search and only accessible via share link. A secure password will be automatically generated if you don't provide one." 
            : "Public rooms are visible to everyone."}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-foreground bg-white/5 rounded-xl hover:bg-white/10 transition-all font-semibold"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-white bg-primary rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateChatroomModal;
