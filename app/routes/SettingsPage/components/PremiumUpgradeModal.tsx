import React, { useState } from 'react';
import { Crown, Shield, Zap, Coins, X, CheckCircle2, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import Card from '~/shared/components/ui/card';
import Badge from '~/shared/components/ui/badge';
import Input from '~/shared/components/ui/input';
import { createPaymentIntent, redeemVoucher } from '~/shared/utils/controllers/paymentController';
import { useClipboard } from '~/shared/hooks';

interface PremiumUpgradeModalProps {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ token, onClose, onSuccess }) => {
  const [step, setStep] = useState<'select' | 'pay' | 'redeem'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const { copy, hasCopied } = useClipboard();

  const handleSelectProvider = async (provider: 'monero' | 'lightning' | 'stripe') => {
    setLoading(true);
    setError(null);
    try {
      const intent = await createPaymentIntent(token, provider, 5.00); // Fixed price for now
      setPaymentData(intent);
      setStep('pay');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!voucherCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await redeemVoucher(token, voucherCode.trim());
      setStep('redeem');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative isolate">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl -z-10 rounded-full" />
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-linear-to-br from-amber-400 to-orange-500 rounded-xl text-white shadow-lg shadow-orange-500/20">
              <Crown size={24} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground leading-none">Upgrade to Premium</h2>
              <p className="text-xs text-muted mt-1">Unlock advanced privacy features</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted-bg rounded-full text-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3 text-destructive text-sm animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {step === 'select' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                <Card 
                  onClick={() => handleSelectProvider('monero')}
                  className="p-4 flex items-center gap-4 group hover:border-primary/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <Coins size={24} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">Monero (XMR)</h3>
                      <Badge variant="green" className="py-0.5 px-1.5">Recommended</Badge>
                    </div>
                    <p className="text-xs text-muted">Maximum Anonymity. No KYC.</p>
                  </div>
                  <Zap size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>

                <Card 
                  onClick={() => handleSelectProvider('lightning')}
                  className="p-4 flex items-center gap-4 group hover:border-primary/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-bold text-foreground">Bitcoin Lightning</h3>
                    <p className="text-xs text-muted">Instant & Low Fees.</p>
                  </div>
                </Card>

                <Card 
                  onClick={() => handleSelectProvider('stripe')}
                  className="p-4 flex items-center gap-4 group hover:border-primary/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Shield size={24} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">Credit Card / Apple Pay</h3>
                      <Badge variant="red" className="py-0.5 px-1.5">Not Anonymous</Badge>
                    </div>
                    <p className="text-xs text-muted">Convenient but links your identity.</p>
                  </div>
                </Card>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted text-center mb-4 italic">Already have a voucher code?</p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter voucher code..." 
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1"
                  />
                  <button 
                    onClick={handleRedeem}
                    disabled={loading || !voucherCode.trim()}
                    className="px-6 py-2 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'pay' && paymentData && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="p-6 bg-muted-bg rounded-3xl border border-border space-y-4">
                <p className="text-sm text-muted">Send exactly <span className="font-bold text-foreground">{paymentData.amount} USD</span> equivalent to:</p>
                
                {paymentData.provider === 'monero' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-background border border-border rounded-2xl font-mono text-[10px] break-all select-all">
                      {paymentData.address}
                    </div>
                    <button 
                      onClick={() => copy(paymentData.address)}
                      className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl hover:bg-primary/20 transition-all"
                    >
                      {hasCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      <span>{hasCopied ? 'Copied!' : 'Copy Address'}</span>
                    </button>
                  </div>
                )}

                {paymentData.provider === 'lightning' && (
                  <div className="space-y-4 text-center">
                    <div className="aspect-square w-48 mx-auto bg-white p-2 rounded-2xl">
                      {/* QR Code Placeholder */}
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground italic text-xs">QR Code</div>
                    </div>
                    <p className="text-[10px] font-mono text-muted break-all">{paymentData.invoice}</p>
                  </div>
                )}

                {paymentData.provider === 'stripe' && (
                  <a 
                    href={paymentData.checkoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    Go to Secure Checkout
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-amber-500 text-xs text-left">
                <Shield size={16} className="shrink-0 mt-0.5" />
                <p>After payment, you will receive a <strong>Voucher Code</strong>. Keep this window open or save the code to redeem your features.</p>
              </div>

              <button 
                onClick={() => setStep('select')}
                className="text-sm font-bold text-muted hover:text-foreground transition-colors"
              >
                Go Back
              </button>
            </div>
          )}

          {step === 'redeem' && (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Upgrade Successful!</h3>
              <p className="text-muted max-w-xs mx-auto">Your premium features have been unlocked and synced to your account.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted-bg/50 border-t border-border flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-[10px] text-muted font-medium uppercase tracking-widest">
            <Zap size={12} className="text-primary" />
            Instant Activation
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted font-medium uppercase tracking-widest">
            <Shield size={12} className="text-primary" />
            E2EE Privacy
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumUpgradeModal;
