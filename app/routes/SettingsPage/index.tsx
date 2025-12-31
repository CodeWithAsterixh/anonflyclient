import React, { useMemo } from 'react';
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
  Globe
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth/index';
import { useChatroomList } from '../../../hooks/useChatroomList/index';
import Logo from '../../../components/logo';
import { userContext, tokenContext } from '../../context/auth';

export async function loader({ context }: any) {
  const user = context.get(userContext);
  const token = context.get(tokenContext);
  return { user, token };
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: serverUser } = useLoaderData<typeof loader>();
  const { user: clientUser, identities, isLoading: authLoading } = useAuth();
  const { chatrooms, loading: roomsLoading } = useChatroomList();

  // Use client user if available (for real-time updates), otherwise fallback to server user
  const user = clientUser || serverUser;

  // Find the full identity object for the current user
  const currentIdentity = useMemo(() => {
    return identities.find(id => id.aid === user?.userId);
  }, [identities, user]);

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
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                {user?.username?.[0].toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user?.username}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">AID: {user?.userId}</p>
              </div>
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
      </div>
  );
};

export default SettingsPage;
