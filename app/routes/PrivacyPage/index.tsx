import { ArrowLeft, Shield, Lock, EyeOff, Database, UserCheck, Info } from 'lucide-react';
import React, { useContext } from 'react';
import { useNavigate, type MetaFunction } from 'react-router';
import Logo from '../../../components/logo';
import { ChatLayoutContext } from '../../contexts/ChatLayoutContext';

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy | Anonfly" },
    { name: "description", content: "Learn how Anonfly protects your privacy with end-to-end encryption and local identity management." },
  ];
};

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(ChatLayoutContext);
  const onBack = context?.onBack;

  const sections = [
    {
      title: "No Personal Data",
      icon: <UserCheck className="text-primary" size={24} />,
      content: "Anonfly does not collect any personal information. No emails, phone numbers, or real names are required to use the service. Your identity is purely cryptographic and anonymous."
    },
    {
      title: "End-to-End Encryption",
      icon: <Lock className="text-primary" size={24} />,
      content: "All messages are encrypted on your device before being sent. Only the intended recipients in a chatroom have the keys to decrypt and read your messages. Even our servers cannot see your content."
    },
    {
      title: "Local Identity Storage",
      icon: <Database className="text-primary" size={24} />,
      content: "Your identity keys and chat history are stored locally in your browser's IndexedDB. This data never leaves your device unless you choose to share an invite link."
    },
    {
      title: "No Tracking",
      icon: <EyeOff className="text-primary" size={24} />,
      content: "We do not use tracking cookies, third-party analytics, or advertising scripts. Your browsing habits and interactions remain completely private."
    },
    {
      title: "Data Retention",
      icon: <Info className="text-primary" size={24} />,
      content: "Encrypted messages may be temporarily stored on our servers for delivery. Once a chatroom is inactive or deleted, associated encrypted data is removed from our systems."
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-background transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (onBack) {
                  onBack();
                }
                navigate(-1);
              }}
              className="p-2 hover:bg-muted-bg rounded-full transition-colors text-muted"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-foreground">Privacy Policy</h1>
          </div>
          <Logo size={32} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
        <section className="text-center space-y-4 py-8">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 shadow-lg shadow-primary/5">
            <Shield size={40} />
          </div>
          <h2 className="text-3xl font-black text-foreground">Your Privacy is our Priority</h2>
          <p className="text-muted leading-relaxed max-w-2xl mx-auto">
            At Anonfly, we believe privacy is a fundamental right. Our architecture is built 
            from the ground up to ensure that you remain anonymous and your data stays secure.
          </p>
        </section>

        <div className="grid gap-6">
          {sections.map((section, index) => (
            <div 
              key={index+1}
              className="bg-background rounded-3xl p-6 border border-border shadow-sm hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted-bg rounded-2xl group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
                  <p className="text-muted leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="text-center py-12 border-t border-border mt-12">
          <p className="text-sm text-muted">
            Last updated: January 12, 2026
          </p>
          <p className="text-xs text-muted/60 mt-2">
            Anonfly - Secure, Anonymous & Free Messaging
          </p>
        </footer>
      </main>
    </div>
  );
};

export default PrivacyPage;
