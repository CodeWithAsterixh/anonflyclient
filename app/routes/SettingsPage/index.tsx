import {
  Activity,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Globe,
  Key,
  Lock,
  LogOut,
  MessageSquare,
  PlusCircle,
  RefreshCw,
  Shield,
  Trash2,
  Users,
  Copy,
  Check
} from 'lucide-react';
import React, { useMemo, useState, useRef, useContext } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import AlertDialog from '../../../components/alertDialog';
import Logo from '../../../components/logo';
import { useClipboard } from '../../../hooks/useClipboard/index';
import { requireAuth } from '../../middleware/auth';
import CopyWrapper from 'components/copyWrapper';
import { deleteChatroom, leaveChatroom } from '../../../lib/controllers/chatroomController';
import { ChatLayoutContext } from '../../contexts/ChatLayoutContext';

export async function loader({ request }: { request: Request }) {
  const { user, token } = await requireAuth(request);
  return { user, token };
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(ChatLayoutContext);
  
  if (!context) {
    throw new Error("SettingsPage must be used within ChatLayoutContext");
  }

  const { 
    user, 
    identities, 
    authLoading,
    chatrooms, 
    switchAccount, 
    deleteAccount, 
    logout,
    onBack
  } = context;

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm" | "error" | "success";
    onConfirm?: () => void;
    children?: React.ReactNode;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
  });

  const showDialog = (
    title: string,
    message: string,
    type: "alert" | "confirm" | "error" | "success" = "alert",
    onConfirm?: () => void,
    children?: React.ReactNode
  ) => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      children,
    });
  };

  const [roomAction, setRoomActionState] = useState<'transfer' | 'delete'>('transfer');
  const roomActionRef = useRef<'transfer' | 'delete'>('transfer');

  const setRoomAction = (action: 'transfer' | 'delete') => {
    setRoomActionState(action);
    roomActionRef.current = action;
  };

  // Find the full identity object for the current user
  const currentIdentity = useMemo(() => {
    return identities.find(id => id.aid === user?.userId);
  }, [identities, user]);

  const handleSwitchAccount = async (aid: string) => {
    if (aid === user?.userId) return;
    try {
      await switchAccount(aid);
    } catch (error) {
      showDialog("Error", "Failed to switch account. Please try again.", "error");
    }
  };

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingAid, setDeletingAid] = useState<string | null>(null);

  const handleDeleteAccount = (aid: string, username: string) => {
    setIsDeletingAccount(true);
    setDeletingAid(aid);
    setRoomAction('transfer');
    showDialog(
      "Delete Account",
      `Are you sure you want to delete the identity "${username}"? This action cannot be undone and you will lose access to all rooms joined with this identity.`,
      "confirm",
      async () => {
        setIsProcessing(true);
        try {
          // If it's the active account, handle room cleanup
          if (aid === user?.userId) {
            const roomsToProcess = myRooms;
            const currentAction = roomActionRef.current;
            
            for (const room of roomsToProcess) {
              try {
                if (currentAction === 'delete') {
                  await deleteChatroom(room.id);
                } else {
                  await leaveChatroom(room.id);
                }
              } catch (err) {
                console.error(`Failed to ${currentAction} room ${room.id}:`, err);
              }
            }
          }
          
          await deleteAccount(aid);
        } catch (error) {
          showDialog("Error", "Failed to delete account. Please try again.", "error");
        } finally {
          setIsProcessing(false);
          setIsDeletingAccount(false);
          setDeletingAid(null);
        }
      },
      aid === user?.userId && myRooms.length > 0 && (
        <div className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Manage your {myRooms.length} chatroom{myRooms.length > 1 ? 's' : ''}:
          </p>
          <div className="space-y-3">
            <label className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors group ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500'}`}>
              <input
                type="radio"
                name="roomAction"
                value="transfer"
                checked={roomAction === 'transfer'}
                onChange={() => !isProcessing && setRoomAction('transfer')}
                disabled={isProcessing}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Transfer Authority</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pass ownership to the next earliest member</p>
              </div>
            </label>
            <label className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors group ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-red-500'}`}>
              <input
                type="radio"
                name="roomAction"
                value="delete"
                checked={roomAction === 'delete'}
                onChange={() => !isProcessing && setRoomAction('delete')}
                disabled={isProcessing}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Delete All Rooms</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completely remove all rooms you created</p>
              </div>
            </label>
          </div>
        </div>
      )
    );
  };

  const handleLogout = () => {
    showDialog(
      "Logout",
      "Are you sure you want to logout? This will clear your current session, but your identity keys will remain safe on this device.",
      "confirm",
      () => logout()
    );
  };

  // Filter rooms created by the user
  const myRooms = useMemo(() => {
    if (!user) return [];
    return chatrooms.filter(room => room.hostAid === user.userId);
  }, [chatrooms, user]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    navigate('/');
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            </div>
            <Logo size={32} />
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
          {/* User Profile Section */}
          <section className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg shadow-blue-500/20 shrink-0">
                  {user?.username?.[0].toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate whitespace-nowrap">{user?.username}</h2>
                  <CopyWrapper className="min-w-0 w-full">
                    <CopyWrapper.Trigger text={user?.userId || ''} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono mt-1 hover:text-blue-500 transition-colors group min-w-0 w-full">
                      <span className="truncate whitespace-nowrap">AID: {user?.userId}</span>
                      <CopyWrapper.Content>
                        {(hasCopied) => (
                          hasCopied ? <Check size={12} className="text-green-500 shrink-0" /> : <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        )}
                      </CopyWrapper.Content>
                    </CopyWrapper.Trigger>
                  </CopyWrapper>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex shrink-0 items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl min-w-0">
                <Calendar className="text-blue-500 shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider truncate whitespace-nowrap">Account Created</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate whitespace-nowrap">
                    {formatDate(currentIdentity?.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl min-w-0">
                <Activity className="text-green-500 shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider truncate whitespace-nowrap">Online Status</p>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></span>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate whitespace-nowrap">Active Session</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Accounts Management Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users size={20} className="text-blue-500" />
                Linked Identities
              </h3>
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <PlusCircle size={16} />
                Add Identity
              </button>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden">
              {identities.map((id) => (
                <div 
                  key={id.aid} 
                  className={`p-4 flex items-center justify-between gap-3 group transition-colors ${
                    id.aid === user?.userId 
                      ? 'bg-blue-50/50 dark:bg-blue-900/10' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${
                      id.aid === user?.userId ? 'bg-blue-600 shadow-md shadow-blue-500/20' : 'bg-gray-400 dark:bg-gray-600'
                    }`}>
                      {id.username[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className={`font-bold truncate whitespace-nowrap ${id.aid === user?.userId ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                          {id.username}
                        </p>
                        {id.aid === user?.userId && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-[10px] font-black text-blue-600 dark:text-blue-400 rounded-full uppercase tracking-tighter shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate whitespace-nowrap">AID: {id.aid}</p>
                        <CopyWrapper>
                          <CopyWrapper.Trigger text={id.aid} className="text-gray-400 hover:text-blue-500 transition-colors shrink-0">
                            <CopyWrapper.Content>
                              {(hasCopied) => (
                                hasCopied ? <Check size={10} /> : <Copy size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </CopyWrapper.Content>
                          </CopyWrapper.Trigger>
                        </CopyWrapper>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    {id.aid !== user?.userId && (
                      <button 
                        onClick={() => handleSwitchAccount(id.aid)}
                        disabled={authLoading}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all disabled:opacity-50"
                        title="Switch to this identity"
                      >
                        <RefreshCw size={18} className={authLoading ? 'animate-spin' : ''} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteAccount(id.aid, id.username)}
                      disabled={authLoading}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50"
                      title="Delete this identity"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Security & Identity Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 px-2 flex items-center gap-2">
              <Shield size={20} className="text-blue-500" />
              Security & Identity
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 shrink-0">
                    <Key size={24} />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Identity Keys</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                      Your unique cryptographic keys are stored locally in your browser's IndexedDB.
                    </p>
                    <div className="space-y-3">
                      <CopyWrapper className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-col gap-1.5 group min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 shrink-0">Public Identity Key (Ed25519)</span>
                          <CopyWrapper.Trigger text={currentIdentity?.identityKeyPair.publicKey || ''} className="text-gray-400 hover:text-blue-500 transition-colors">
                            <CopyWrapper.Content>
                              {(hasCopied) => (
                                hasCopied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />
                              )}
                            </CopyWrapper.Content>
                          </CopyWrapper.Trigger>
                        </div>
                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate whitespace-nowrap leading-relaxed">
                          {currentIdentity?.identityKeyPair.publicKey}
                        </span>
                      </CopyWrapper>
                      <CopyWrapper className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-col gap-1.5 group min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 shrink-0">Public Exchange Key (X25519)</span>
                          <CopyWrapper.Trigger text={currentIdentity?.exchangeKeyPair.publicKey || ''} className="text-gray-400 hover:text-blue-500 transition-colors">
                            <CopyWrapper.Content>
                              {(hasCopied) => (
                                hasCopied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />
                              )}
                            </CopyWrapper.Content>
                          </CopyWrapper.Trigger>
                        </div>
                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate whitespace-nowrap leading-relaxed">
                          {currentIdentity?.exchangeKeyPair.publicKey}
                        </span>
                      </CopyWrapper>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 bg-blue-50/30 dark:bg-blue-900/10">
                <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
                  <Lock size={18} />
                  <p className="text-sm font-medium">Private keys are never uploaded to the server.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Rooms Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 px-2 flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-500" />
              My Chatrooms
            </h3>
            
            {myRooms.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center border border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                  <MessageSquare size={32} />
                </div>
                <p className="text-gray-500 dark:text-gray-400">You haven't created any chatrooms yet.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-4 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Create your first room
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myRooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => navigate(`/${room.id}`)}
                    className="flex flex-col p-5 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 w-full min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate whitespace-nowrap">
                        {room.roomname}
                      </h4>
                      {room.isLocked && <Lock size={14} className="text-gray-400 shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate whitespace-nowrap mb-4 flex-1">
                      {room.description || "No description provided."}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 min-w-0">
                        <Globe size={14} className="shrink-0" />
                        <span className="truncate whitespace-nowrap">{room.participantCount} Participants</span>
                      </div>
                      <ExternalLink size={16} className="text-gray-300 dark:text-gray-700 group-hover:text-blue-500 transition-colors shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Privacy & App Info */}
          <section className="pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Anonfly v1.0.0</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Anonfly is built with privacy in mind. All your chat data is encrypted and identities are managed locally. 
                We don't track your IP address or store any personal information.
              </p>
            </div>
          </section>
        </main>

        <AlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => {
            setAlertDialog(prev => ({ ...prev, isOpen: false }));
            setIsDeletingAccount(false);
            setDeletingAid(null);
          }}
          onConfirm={alertDialog.onConfirm}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type}
        >
          {alertDialog.children}
        </AlertDialog>
      </div>
  );
};

export default SettingsPage;
