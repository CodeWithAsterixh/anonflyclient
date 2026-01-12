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

  const { theme, colorScheme, setColorScheme, toggleTheme } = useTheme();

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
    <div className="h-full overflow-y-auto bg-background transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (onBack) {
                    onBack();
                  }
                  navigate('/');
                }}
                className="p-2 hover:bg-muted-bg rounded-full transition-colors text-muted"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-foreground">Settings</h1>
            </div>
            <Logo size={32} />
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
          {/* User Profile Section */}
          <section className="bg-background rounded-3xl p-4 sm:p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg shadow-primary/20 shrink-0">
                  {user?.username?.[0].toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate whitespace-nowrap">{user?.username}</h2>
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
                className="flex shrink-0 items-center gap-2 px-4 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3 p-4 bg-muted-bg rounded-2xl min-w-0">
                <Calendar className="text-primary shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-xs text-muted font-medium uppercase tracking-wider truncate whitespace-nowrap">Account Created</p>
                  <p className="text-sm font-semibold text-foreground truncate whitespace-nowrap">
                    {formatDate(currentIdentity?.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted-bg rounded-2xl min-w-0">
                <Activity className="text-primary shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-xs text-muted font-medium uppercase tracking-wider truncate whitespace-nowrap">Online Status</p>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0"></span>
                    <p className="text-sm font-semibold text-foreground truncate whitespace-nowrap">Active Session</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Accounts Management Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
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
            <div className="bg-background rounded-3xl border border-border divide-y divide-border overflow-hidden">
              {identities.map((id) => (
                <div 
                  key={id.aid} 
                  className={`p-4 flex items-center justify-between gap-3 group transition-colors ${
                    id.aid === user?.userId 
                      ? 'bg-primary/10' 
                      : 'hover:bg-muted-bg'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${
                      id.aid === user?.userId ? 'bg-primary shadow-md shadow-primary/20' : 'bg-muted'
                    }`}>
                      {id.username[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className={`font-bold truncate whitespace-nowrap ${id.aid === user?.userId ? 'text-primary' : 'text-foreground'}`}>
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
                        className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all disabled:opacity-50"
                        title="Switch to this identity"
                      >
                        <RefreshCw size={18} className={authLoading ? 'animate-spin' : ''} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteAccount(id.aid, id.username, id.aid === user?.userId && myRooms.length > 0 && (
                        <div className="space-y-4 mt-4 p-4 bg-muted-bg rounded-2xl border border-border">
                          <p className="text-sm font-bold text-foreground mb-3">
                            Manage your {myRooms.length} chatroom{myRooms.length > 1 ? 's' : ''}:
                          </p>
                          <div className="space-y-3">
                            <label className={`flex items-center gap-3 p-3 bg-background rounded-xl border border-border transition-colors group ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}`}>
                              <Input
                                type="radio"
                                name="roomAction"
                                value="transfer"
                                checked={roomActionState === 'transfer'}
                                onChange={() => !isProcessing && setRoomAction('transfer')}
                                disabled={isProcessing}
                                className="w-4 h-4 text-primary border-border focus:ring-primary disabled:opacity-50"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-foreground">Transfer Authority</p>
                                <p className="text-xs text-muted">Pass ownership to the next earliest member</p>
                              </div>
                            </label>
                            <label className={`flex items-center gap-3 p-3 bg-background rounded-xl border border-border transition-colors group ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-destructive'}`}>
                              <Input
                                type="radio"
                                name="roomAction"
                                value="delete"
                                checked={roomActionState === 'delete'}
                                onChange={() => !isProcessing && setRoomAction('delete')}
                                disabled={isProcessing}
                                className="w-4 h-4 text-destructive border-border focus:ring-destructive disabled:opacity-50"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-foreground">Delete All Rooms</p>
                                <p className="text-xs text-muted">Completely remove all rooms you created</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      ))}
                      disabled={authLoading}
                      className="p-2 text-muted hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-50"
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
            <h3 className="text-lg font-bold text-foreground px-2 flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              Security & Identity
            </h3>
            <div className="bg-background rounded-3xl overflow-hidden border border-border divide-y divide-border">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                    <Key size={24} />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <h4 className="font-bold text-foreground">Identity Keys</h4>
                    <p className="text-sm text-muted mt-1 mb-4">
                      Your unique cryptographic keys are stored locally in your browser's IndexedDB.
                    </p>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted-bg rounded-xl min-w-0">
                        <HideableField 
                          label="Public Identity Key (Ed25519)" 
                          value={currentIdentity?.identityKeyPair.publicKey || ''} 
                          className="flex-col items-start! gap-1.5!"
                          labelClassName="text-[10px] uppercase tracking-wider font-bold text-muted"
                          showLabelOnHidden={true}
                        />
                      </div>
                      <div className="p-3 bg-muted-bg rounded-xl min-w-0">
                        <HideableField 
                          label="Public Exchange Key (X25519)" 
                          value={currentIdentity?.exchangeKeyPair.publicKey || ''} 
                          className="flex-col items-start! gap-1.5!"
                          labelClassName="text-[10px] uppercase tracking-wider font-bold text-muted"
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
            <h3 className="text-lg font-bold text-foreground px-2 flex items-center gap-2">
              <Palette size={20} className="text-primary" />
              Appearance
            </h3>
            <div className="bg-background rounded-3xl p-4 sm:p-6 border border-border space-y-6">
              {/* Theme Toggle */}
              <div>
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  Color Mode
                </h4>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all bg-muted-bg hover:bg-muted-bg/80 text-foreground group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </p>
                    <p className="text-[10px] text-muted font-medium">Click to switch</p>
                  </div>
                </button>
              </div>

              {/* Color Schemes */}
              <div>
                <h4 className="font-bold text-foreground mb-3">
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
                          isActive ? 'ring-2 ring-offset-2 ring-primary ring-offset-background' : ''
                        }`}
                        style={{ backgroundColor: displayColor }}
                        title={scheme.name}
                      >
                        {isActive && (
                          <CheckCircle2 size={18} className="text-white drop-shadow-md" />
                        )}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background text-foreground text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border whitespace-nowrap">
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
            <h3 className="text-lg font-bold text-foreground px-2 flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Your Chatrooms
            </h3>
            <div className="bg-background rounded-3xl border border-border overflow-hidden">
              {myRooms.length > 0 ? (
                <div className="divide-y divide-border">
                  {myRooms.map((room) => (
                    <div 
                      key={room.id} 
                      className="p-4 flex items-center justify-between gap-4 hover:bg-muted-bg transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-foreground truncate">{room.roomname}</p>
                          <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-black rounded-full uppercase tracking-tighter shrink-0">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-muted truncate">
                          Created {formatDate(room.createdAt)}
                        </p>
                      </div>
                      <button 
                        onClick={() => navigate(`/${room.id}`)}
                        className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                        title="Go to room"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-muted-bg rounded-2xl flex items-center justify-center text-muted mx-auto mb-4">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-foreground font-bold">No rooms yet</p>
                  <p className="text-sm text-muted mt-1">Chatrooms you create will appear here.</p>
                </div>
              )}
            </div>
          </section>

          {/* Device & PWA Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-foreground px-2 flex items-center gap-2">
              <Smartphone size={20} className="text-primary" />
              Device & Application
            </h3>
            <div className="bg-background rounded-3xl border border-border overflow-hidden divide-y divide-border">
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-muted-bg rounded-xl text-foreground shrink-0">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">PWA Installation</h4>
                    <p className="text-sm text-muted mt-0.5">
                      {isInstalled ? `App is installed (v${appVersion})` : 'Install for a better experience'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isInstalled && (
                    <button 
                      onClick={installApp}
                      disabled={!isInstallable}
                      className={`flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 ${isInstallable ? 'hover:bg-primary/90' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      <Download size={18} />
                      Install App
                    </button>
                  )}
                  {updateAvailable && (
                    <button 
                      onClick={updateApp}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                    >
                      <RefreshCw size={18} />
                      Update Now
                    </button>
                  )}
                  {isInstalled && !updateAvailable && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 font-bold rounded-xl text-sm">
                      <CheckCircle2 size={16} />
                      Up to Date
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-foreground px-2 flex items-center gap-2">
              <Info size={20} className="text-primary" />
              About Anonfly
            </h3>
            <div className="bg-background rounded-3xl border border-border p-4 sm:p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted-bg rounded-xl text-primary shrink-0">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Decentralized & Secure</h4>
                  <p className="text-sm text-muted mt-1 leading-relaxed">
                    Anonfly uses end-to-end encryption and doesn't store your personal data. 
                    Your identity is tied to your local browser storage.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                <a 
                  href="https://anonfly.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Privacy Policy
                  <ExternalLink size={12} />
                </a>
                <span className="text-border">•</span>
                <a 
                  href="https://anonfly.com/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Terms of Service
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </section>
        </main>

        <AlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
          onConfirm={alertDialog.onConfirm}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type}
          isLoading={isProcessing}
        >
          {alertDialog.children}
        </AlertDialog>
      </div>
  );
};

export default SettingsPage;
