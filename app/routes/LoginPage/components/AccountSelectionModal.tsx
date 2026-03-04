import React from 'react';
import Modal from '~/shared/components/modal';
import type { Identity } from '~/shared/utils/identityManager';
import { User, ChevronRight } from 'lucide-react';

interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  identities: Identity[];
  onSelect: (aid: string) => void;
  isLoading: boolean;
}

const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({
  isOpen,
  onClose,
  identities,
  onSelect,
  isLoading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Saved Identities"
      maxWidth="sm"
    >
      <div className="p-6">
        <p className="text-sm text-muted mb-6">
          Pick an account you've used before on this device to sign in instantly.
        </p>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {identities.map((identity) => (
            <button
              key={identity.aid}
              onClick={() => {
                onSelect(identity.aid);
                onClose();
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform font-bold text-lg">
                  {identity.username[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-foreground truncate max-w-[160px]">
                    {identity.username}
                  </p>
                  <p className="text-[10px] text-muted font-mono">
                    AID: {identity.aid.substring(0, 12)}...
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>

        {identities.length === 0 && (
          <div className="text-center py-8">
            <User size={48} className="mx-auto text-muted mb-4" />
            <p className="text-muted font-medium">No saved accounts found.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AccountSelectionModal;
