import React, { useMemo, useState } from 'react';
import { useNavigate, useLoaderData } from 'react-router';
import { 
  User, 
  Shield, 
  MessageSquare, 
  Activity, 
  ArrowLeft, 
  Calendar, 
  Key, 
  ExternalLink,
  Lock,
  Globe,
  Users,
  Trash2,
  LogOut,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth/index';
import { useChatroomList } from '../../../hooks/useChatroomList/index';
import Logo from '../../../components/logo';
import { requireAuth } from '../../middleware/auth';
import AlertDialog from '../../../components/alertDialog';

export async function loader({ request }: { request: Request }) {
  const { user, token } = await requireAuth(request);
  return { user, token };
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: serverUser } = useLoaderData<typeof loader>();
  const { 
    user: clientUser, 
    identities, 
    isLoading: authLoading, 
    switchAccount, 
    deleteAccount,
    logout 
  } = useAuth();
  const { chatrooms, loading: roomsLoading } = useChatroomList();

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm" | "error" | "success";
    onConfirm?: () => void;
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
    onConfirm?: () => void
  ) => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  // Use client user if available (for real-time updates), otherwise fallback to server user
  const user = clientUser || serverUser;

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

  const handleDeleteAccount = (aid: string, username: string) => {
    showDialog(
      "Delete Account",
      `Are you sure you want to delete the identity "${username}"? This action cannot be undone and you will lose access to all rooms joined with this identity.`,
      "confirm",
      async () => {
        try {
          await deleteAccount(aid);
        } catch (error) {
          showDialog("Error", "Failed to delete account. Please try again.", "error");
        }
      }
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

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
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
          <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                  {user?.username?.[0].toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user?.username}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">AID: {user?.userId}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <Calendar className="text-blue-500" size={20} />
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Account Created</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {formatDate(currentIdentity?.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <Activity className="text-green-500" size={20} />
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Online Status</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Session</p>
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
                  className={`p-4 flex items-center justify-between group transition-colors ${
                    id.aid === user?.userId 
                      ? 'bg-blue-50/50 dark:bg-blue-900/10' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${
                      id.aid === user?.userId ? 'bg-blue-600 shadow-md shadow-blue-500/20' : 'bg-gray-400 dark:bg-gray-600'
                    }`}>
                      {id.username[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-bold truncate ${id.aid === user?.userId ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                          {id.username}
                        </p>
                        {id.aid === user?.userId && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-[10px] font-black text-blue-600 dark:text-blue-400 rounded-full uppercase tracking-tighter">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">AID: {id.aid}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
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
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                    <Key size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Identity Keys</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                      Your unique cryptographic keys are stored locally in your browser's IndexedDB. They are used to sign messages and derive shared secrets.
                    </p>
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between group">
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">Public Identity Key (Ed25519)</span>
                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate max-w-[200px]">
                          {currentIdentity?.identityKeyPair.publicKey}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">Public Exchange Key (X25519)</span>
                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate max-w-[200px]">
                          {currentIdentity?.exchangeKeyPair.publicKey}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-blue-50/30 dark:bg-blue-900/10">
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
                    <div className="flex items-center justify-between mb-2 w-full">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {room.roomname}
                      </h4>
                      {room.isLocked && <Lock size={14} className="text-gray-400" />}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                      {room.description || "No description provided."}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                        <Globe size={14} />
                        <span>{room.participantCount} Participants</span>
                      </div>
                      <ExternalLink size={16} className="text-gray-300 dark:text-gray-700 group-hover:text-blue-500 transition-colors" />
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
          onClose={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={alertDialog.onConfirm}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type}
        />
      </div>
  );
};

export default SettingsPage;
