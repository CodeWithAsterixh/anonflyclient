import React, { useState } from 'react';
import { Crown, Shield, Zap, X, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import Card from '~/shared/components/ui/card';
import Badge from '~/shared/components/ui/badge';
import Input from '~/shared/components/ui/input';
import { submitManualProof, redeemVoucher } from '~/shared/utils/controllers/paymentController';
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
  const [paymentProof, setPaymentProof] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const { copy, hasCopied } = useClipboard();
  const [selectedToken, setSelectedToken] = useState<'USDT' | 'USDC' | 'USDM'>('USDT');
  const walletAddress = import.meta.env.VITE_WALLET_ADDRESS || "0x789...PLEASE_SET_VITE_WALLET_ADDRESS_IN_ENV...";

  const handleManualPayment = () => {
    setStep('pay');
  };

  const handleSubmitProof = async () => {
    if (!paymentProof.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await submitManualProof(token, 5, selectedToken, paymentProof.trim());
      setStep('redeem');
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
        <div className="p-6 overflow-y-auto max-h-[70vh]">
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
                  onClick={handleManualPayment}
                  className="p-4 flex items-center gap-4 group hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">Manual Transaction</h3>
                      <Badge variant="blue" className="py-0.5 px-1.5 text-[10px]">Direct Transfer</Badge>
                    </div>
                    <p className="text-xs text-muted">Celo Network (USDT, USDC, USDM). Reviewed in 2 days.</p>
                  </div>
                  <CheckCircle2 size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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

          {step === 'pay' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="p-5 bg-muted-bg rounded-3xl border border-border space-y-5">
                <div className="text-center">
                  <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Manual Payment Process</h4>
                  
                  <div className="flex flex-col items-center gap-4 py-2">
                    <div className="p-2 bg-white rounded-2xl shadow-sm">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(walletAddress)}&bgcolor=ffffff&color=000000&margin=1`} 
                        alt="Wallet QR Code" 
                        className="w-32 h-32"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted uppercase font-bold">Network</p>
                      <Badge variant="blue">Celo</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-muted uppercase font-bold mb-2">1. Select Token</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['USDT', 'USDC', 'USDM'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedToken(t)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            selectedToken === t 
                              ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                              : 'bg-background border-border text-muted hover:border-muted hover:text-foreground'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-background border border-border rounded-2xl text-left">
                    <p className="text-[10px] text-muted uppercase font-bold mb-1">2. Transfer to Address</p>
                    <div className="flex items-center justify-between gap-3">
                      <code className="text-xs font-mono break-all text-primary">{walletAddress}</code>
                      <button onClick={() => copy(walletAddress)} className="text-muted hover:text-primary shrink-0 transition-colors">
                        {hasCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <p className="text-[10px] text-muted uppercase font-bold text-left">3. Submit Proof</p>
                    <p className="text-[10px] text-muted italic text-left leading-relaxed">Please provide the transaction hash or ID for review.</p>
                    <Input 
                      placeholder="Enter transaction hash..." 
                      value={paymentProof}
                      onChange={(e) => setPaymentProof(e.target.value)}
                      className="w-full text-xs"
                    />
                    <button 
                      onClick={handleSubmitProof}
                      disabled={loading || !paymentProof.trim()}
                      className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      Submit Proof
                      <Zap size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-amber-500 text-[10px] text-left">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>Transfer will be verified and premium features activated within <strong>2 business days</strong>.</p>
              </div>

              <button 
                onClick={() => setStep('select')}
                className="text-[10px] font-bold text-muted hover:text-foreground transition-colors uppercase tracking-widest"
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
              <h3 className="text-2xl font-bold text-foreground">Submission Received!</h3>
              <p className="text-muted max-w-xs mx-auto">Your proof has been submitted for review. You will receive premium access within 2 business days once verified.</p>
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
