import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Crown,
  Download,
  ExternalLink,
  Globe,
  Info,
  Key,
  Lock,
  LogOut,
  MessageSquare,
  PlusCircle,
  RefreshCw,
  Shield,
  Palette,
  Smartphone,
  Trash2,
  Users,
  Sun,
  Moon
} from 'lucide-react';
import React, { useContext } from 'react';
import { useNavigate, type MetaFunction } from 'react-router';
import AlertDialog from '../../../components/alertDialog';
import Logo from '../../../components/logo';
import Input from '../../../components/ui/input';
import { usePWA, useSettings, useTheme, colorSchemes, type ColorScheme } from '../../../hooks';
import { ChatLayoutContext } from '../../contexts/ChatLayoutContext';
import { requireAuth } from '../../middleware/auth';
import HideableField from './components/HideableField';

export const meta: MetaFunction = () => {
  return [
    { title: "Settings | Anonfly - Manage Your Identity" },
    { name: "description", content: "Manage your Anonfly account, identities, and app settings. Securely control your anonymous presence." },
    { property: "og:title", content: "Settings | Anonfly" },
    { property: "og:description", content: "Manage your Anonfly account and security settings." },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

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
    refreshUserInfo,
    onBack
  } = context;

  const {
    alertDialog,
    setAlertDialog,
    currentIdentity,
    myRooms,
    roomActionState,
    setRoomAction,
    isProcessing,
    handleSwitchAccount,
    handleLogout,
    handleDeleteAccount,
  } = useSettings({
    user,
    identities,
    chatrooms,
    switchAccount,
    deleteAccount,
    logout,
    authLoading
  });

  const { isInstallable, isInstalled, installApp, appVersion, updateAvailable, updateApp
  } = usePWA();

  const { theme, colorScheme, setTheme, setColorScheme } = useTheme();

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

  const isPremium = user?.allowedFeatures?.includes('CREATE_PRIVATE_ROOM');

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshUserInfo();
    } catch (error) {
      console.error("Failed to refresh user info:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (onBack) {
                    onBack();
                  }
                  navigate('/');
                }}
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
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg shadow-primary/20 shrink-0">
                  {user?.username?.[0].toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate whitespace-nowrap">{user?.username}</h2>
                    {isPremium && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-linear-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm shadow-orange-500/20">
                        <Crown size={10} fill="currentColor" />
                        Premium
                      </div>
                    )}
                  </div>
                  <HideableField 
                    label="AID" 
                    value={user?.userId || ''} 
                    className="mt-1"
                  />
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

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Info'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl min-w-0">
                <Calendar className="text-primary shrink-0" size={20} />
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
                <Users size={20} className="text-primary" />
                Linked Identities
              </h3>
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
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
                      ? 'bg-primary/10' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${
                      id.aid === user?.userId ? 'bg-primary shadow-md shadow-primary/20' : 'bg-gray-400 dark:bg-gray-600'
                    }`}>
                      {id.username[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className={`font-bold truncate whitespace-nowrap ${id.aid === user?.userId ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}`}>
                          {id.username}
                        </p>
                        {id.aid === user?.userId && (
                          <span className="px-2 py-0.5 bg-primary/10 text-[10px] font-black text-primary rounded-full uppercase tracking-tighter shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <HideableField 
                        label="AID" 
                        value={id.aid} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    {id.aid !== user?.userId && (
                      <button 
                        onClick={() => handleSwitchAccount(id.aid)}
                        disabled={authLoading}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all disabled:opacity-50"
                        title="Switch to this identity"
                      >
                        <RefreshCw size={18} className={authLoading ? 'animate-spin' : ''} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteAccount(id.aid, id.username, id.aid === user?.userId && myRooms.length > 0 && (
                        <div className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                            Manage your {myRooms.length} chatroom{myRooms.length > 1 ? 's' : ''}:
                          </p>
                          <div className="space-y-3">
                            <label className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors group ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}`}>
                              <Input
                                type="radio"
                                name="roomAction"
                                value="transfer"
                                checked={roomActionState === 'transfer'}
                                onChange={() => !isProcessing && setRoomAction('transfer')}
                                disabled={isProcessing}
                                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary disabled:opacity-50"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Transfer Authority</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pass ownership to the next earliest member</p>
                              </div>
                            </label>
                            <label className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors group ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-red-500'}`}>
                              <Input
                                type="radio"
                                name="roomAction"
                                value="delete"
                                checked={roomActionState === 'delete'}
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
                      ))}
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
              <Shield size={20} className="text-primary" />
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
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl min-w-0">
                        <HideableField 
                          label="Public Identity Key (Ed25519)" 
                          value={currentIdentity?.identityKeyPair.publicKey || ''} 
                          className="flex-col items-start! gap-1.5!"
                          labelClassName="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500"
                          showLabelOnHidden={true}
                        />
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl min-w-0">
                        <HideableField 
                          label="Public Exchange Key (X25519)" 
                          value={currentIdentity?.exchangeKeyPair.publicKey || ''} 
                          className="flex-col items-start! gap-1.5!"
                          labelClassName="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500"
                          showLabelOnHidden={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 bg-primary/5">
                <div className="flex items-center gap-3 text-primary">
                  <Lock size={18} />
                  <p className="text-sm font-medium">Private keys are never uploaded to the server.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 px-2 flex items-center gap-2">
              <Palette size={20} className="text-primary" />
              Appearance
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 space-y-6">
              {/* Theme Toggle */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  Color Mode
                </h4>
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      theme === 'light' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <Sun size={18} />
                    <span className="font-bold text-sm">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      theme === 'dark' 
                        ? 'bg-gray-900 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <Moon size={18} />
                    <span className="font-bold text-sm">Dark</span>
                  </button>
                </div>
              </div>

              {/* Color Schemes */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Color Scheme
                </h4>
                <div className="flex flex-wrap gap-3">
                  {(Object.keys(colorSchemes) as ColorScheme[]).map((schemeKey) => {
                    const scheme = colorSchemes[schemeKey];
                    const isActive = colorScheme === schemeKey;
                    const displayColor = theme === 'dark' ? scheme.dark : scheme.light;
                    
                    return (
                      <button
                        key={schemeKey}
                        onClick={() => setColorScheme(schemeKey)}
                        className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95 ${
                          isActive ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-gray-900' : ''
                        }`}
                        style={{ backgroundColor: displayColor }}
                        title={scheme.name}
                      >
                        {isActive && (
                          <CheckCircle2 size={18} className="text-white drop-shadow-md" />
                        )}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {scheme.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Rooms Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 px-2 flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
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
                  className="mt-4 text-primary font-bold hover:underline"
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
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors truncate whitespace-nowrap">
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
                      <ExternalLink size={16} className="text-gray-300 dark:text-gray-700 group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* App Management Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 px-2 flex items-center gap-2">
              <Smartphone size={20} className="text-primary" />
              App Management
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                      <Info size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">App Status</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isInstalled ? 'App is installed on your device' : 'App is running in browser'}
                      </p>
                    </div>
                  </div>
                  {!isInstalled && (
                    <button
                      onClick={() => {
                        if (isInstallable) {
                          installApp();
                        } else {
                          setAlertDialog({
                            isOpen: true,
                            title: "How to Install",
                            type: "alert",
                            message: "To install Anonfly on your device:\n\n" + 
                                     "• On iOS (Safari): Tap the 'Share' icon and select 'Add to Home Screen'.\n" +
                                     "• On Android (Chrome): Tap the three dots menu and select 'Install app'.\n" +
                                     "• On Desktop: Look for the install icon in your browser's address bar.",
                            onConfirm: () => setAlertDialog(prev => ({ ...prev, isOpen: false }))
                          });
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:opacity-90 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                    >
                      <Download size={18} />
                      {isInstallable ? 'Install App' : 'Manual Install'}
                    </button>
                  )}
                </div>
              </div>

              {updateAvailable && (
                <div className="p-4 sm:p-6 bg-green-50/30 dark:bg-green-900/10">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                      <CheckCircle2 size={18} />
                      <p className="text-sm font-medium">A new version of Anonfly is available!</p>
                    </div>
                    <button
                      onClick={updateApp}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-green-500/20"
                    >
                      Update Now
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Version</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">v{appVersion}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy & App Info */}
          <section className="pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Anonfly v{appVersion}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Anonfly is built with privacy in mind. All your chat data is encrypted and identities are managed locally. 
                We don't track your IP address or store any personal information.
              </p>
            </div>
          </section>
        </main>

        <AlertDialog
          isOpen={alertDialog.isOpen}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type}
          onConfirm={alertDialog.onConfirm}
          onClose={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
        >
          {alertDialog.children}
        </AlertDialog>
      </div>
  );
};

export default SettingsPage;
