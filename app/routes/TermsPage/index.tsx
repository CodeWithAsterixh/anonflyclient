import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, Clock, Globe } from 'lucide-react';
import React, { useContext } from 'react';
import { useNavigate, type MetaFunction } from 'react-router';
import Logo from '~/shared/components/logo';
import { ChatLayoutContext } from '~/shell/context/ChatLayoutContext';

export const meta: MetaFunction = () => {
  return [
    { title: "Terms of Service | Anonfly" },
    { name: "description", content: "Read the Terms of Service for using Anonfly's anonymous messaging platform." },
  ];
};

const TermsPage: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(ChatLayoutContext);
  const onBack = context?.onBack;

  const sections = [
    {
      title: "Acceptance of Terms",
      icon: <CheckCircle className="text-primary" size={24} />,
      content: "By accessing or using Anonfly, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the service."
    },
    {
      title: "Anonymous Service",
      icon: <Globe className="text-primary" size={24} />,
      content: "Anonfly provides a platform for anonymous communication. We do not verify the identity of users. You are responsible for maintaining the confidentiality of your local identity keys."
    },
    {
      title: "Prohibited Conduct",
      icon: <AlertTriangle className="text-primary" size={24} />,
      content: "You agree not to use Anonfly for any illegal purposes, including but not limited to harassment, distribution of malware, or any activity that violates local or international laws."
    },
    {
      title: "No Warranty",
      icon: <Scale className="text-primary" size={24} />,
      content: "Anonfly is provided 'as is' and 'as available' without any warranties of any kind, whether express or implied. We do not guarantee that the service will be uninterrupted or error-free."
    },
    {
      title: "Limitation of Liability",
      icon: <FileText className="text-primary" size={24} />,
      content: "In no event shall Anonfly or its creators be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service."
    },
    {
      title: "Changes to Terms",
      icon: <Clock className="text-primary" size={24} />,
      content: "We reserve the right to modify these terms at any time. Your continued use of the service after any changes constitutes your acceptance of the new terms."
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
            <h1 className="text-xl font-bold text-foreground">Terms of Service</h1>
          </div>
          <Logo size={32} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
        <section className="text-center space-y-4 py-8">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 shadow-lg shadow-primary/5">
            <Scale size={40} />
          </div>
          <h2 className="text-3xl font-black text-foreground">Terms and Conditions</h2>
          <p className="text-muted leading-relaxed max-w-2xl mx-auto">
            Please read these terms carefully before using Anonfly. By using the platform,
            you acknowledge that you have read, understood, and agreed to these terms.
          </p>
        </section>

        <div className="grid gap-6">
          {sections.map((section, index) => (
            <div
              key={index + 1}
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

export default TermsPage;
