import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Declare Razorpay on window for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckIcon = () => (
  <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

// Dynamically load Razorpay checkout script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PricingPage = () => {
  const navigate = useNavigate();
  const { user, startTrial, refreshProfile, isProActive, isProExpired, profile } = useAuth();

  const [isAnnual, setIsAnnual] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Monthly price = ₹179, Annual = ₹179 * 12 * 0.8 (20% off)
  const MONTHLY_PRICE_INR = 179;
  const annualPriceTotal = Math.round(MONTHLY_PRICE_INR * 0.8 * 12);
  const displayPrice = isAnnual ? annualPriceTotal : MONTHLY_PRICE_INR;

  // Amount in paise (1 INR = 100 paise)
  const amountPaise = displayPrice * 100;

  const proAlreadyActive = isProActive;
  const proCanSubscribe = !isProActive || isProExpired;

  const handleTryFree = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (proAlreadyActive) return;
    await startTrial();
    navigate("/");
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!proCanSubscribe || isPaymentLoading) return;

    setIsPaymentLoading(true);

    // 1. Load Razorpay SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load payment gateway. Please check your connection and try again.");
      setIsPaymentLoading(false);
      return;
    }

    try {
      // 2. Create Order via Edge Function
      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount: amountPaise,
          currency: "INR",
          plan: "pro",
          billing: isAnnual ? "annual" : "monthly",
        },
      });

      if (orderError || !orderData?.order_id) {
        throw new Error(orderData?.error || orderError?.message || "Failed to create payment order.");
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ConnectAngel",
        description: `Pro Plan – ${isAnnual ? "Annual" : "Monthly"}`,
        order_id: orderData.order_id,
        prefill: {
          email: user.email || "",
          name: profile?.name || "",
        },
        theme: {
          color: "#6366f1", // Indigo - matches your primary color
        },
        modal: {
          ondismiss: () => {
            setIsPaymentLoading(false);
            toast.info("Payment cancelled. You can try again anytime.");
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setIsVerifying(true);
          // 4. Verify Payment via Edge Function (HMAC-SHA256 validation)
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: "pro",
              },
            });

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyData?.error || verifyError?.message || "Payment verification failed.");
            }

            // 5. Refresh profile to get updated plan
            await refreshProfile();

            setIsVerifying(false);
            setShowSuccess(true);
            
            // Redirect after showing the success message
            setTimeout(() => {
              navigate("/");
            }, 3000);
          } catch (verifyErr: any) {
            console.error("Verification error:", verifyErr);
            toast.error(verifyErr?.message || "Payment verification failed. Please contact support.");
            setIsVerifying(false);
          } finally {
            setIsPaymentLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (failureResponse: any) => {
        console.error("Payment failed:", failureResponse.error);
        toast.error(`Payment failed: ${failureResponse.error?.description || "Unknown error"}`);
        setIsPaymentLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error("Subscription error:", err);
      toast.error(err?.message || "Something went wrong. Please try again.");
      setIsPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="text-center pt-16 pb-8 px-4">
        <span className="inline-block px-4 py-1.5 rounded-full border border-primary/40 text-primary text-xs font-semibold mb-6">
          Simple, Transparent Pricing
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
          Where Global Angels Discovers
          <br />
          Tomorrow's Unicorns.
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Choose the plan that fits your growth.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isAnnual ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${isAnnual ? "translate-x-6" : ""}`}
            />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
          </span>
          {isAnnual && (
            <span className="text-xs text-primary font-semibold">Save 20%</span>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-16 pt-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* Free Plan */}
          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Try Free for 26 Days</h3>
                <p className="text-sm text-muted-foreground mt-1">Perfect for getting started</p>
              </div>
              <span className="text-3xl font-bold text-foreground">₹0<span className="text-sm text-muted-foreground font-normal">/mo</span></span>
            </div>

            <div className="my-6 h-[1px] bg-border" />

            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Normal problem statements</strong> for everyday business challenges</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Unlimited searches</strong> of existing benchmark database</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Event Discovery:</strong> Find and explore events seamlessly</span>
              </div>
            </div>

            <button
              id="free-plan-btn"
              onClick={handleTryFree}
              disabled={proAlreadyActive}
              className={`mt-8 w-full py-3 rounded-lg border transition-colors font-medium ${proAlreadyActive
                  ? 'border-border/30 bg-muted/50 text-muted-foreground cursor-not-allowed'
                  : 'border-border bg-muted hover:bg-muted/80 text-foreground'
                }`}
            >
              {proAlreadyActive ? 'Already on Pro' : 'Try for Free for 26 Days'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="rounded-2xl border-2 border-primary bg-card p-8 flex flex-col relative shadow-[0_0_30px_rgba(var(--primary),0.1)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Pro Plan</h3>
                <p className="text-sm text-muted-foreground mt-1">For advanced analysis</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-foreground">₹{displayPrice}</span>
                <span className="text-sm text-muted-foreground font-normal">/{isAnnual ? 'yr' : 'mo'} + GST</span>
              </div>
            </div>

            <div className="my-6 h-[1px] bg-border" />

            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Million Dollar Ideas:</strong> Unlock high-value, game-changing ideas</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Everything in Free</strong></span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Pro Model</strong> – Advanced AI model for deeper insights</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Daily Calls:</strong> 5 calls per day per user</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Priority Access:</strong> Faster processing & response times</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Enhanced Limits:</strong> Designed for active users</span>
              </div>
            </div>

            <button
              id="pro-subscribe-btn"
              onClick={handleSubscribe}
              disabled={!proCanSubscribe || isPaymentLoading}
              className={`mt-6 w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${!proCanSubscribe
                  ? 'bg-primary/50 text-primary-foreground/60 cursor-not-allowed'
                  : isPaymentLoading
                    ? 'bg-primary/80 text-primary-foreground cursor-wait'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
            >
              {isPaymentLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isProActive
                ? 'Already Active'
                : isProExpired
                  ? (isPaymentLoading ? 'Processing...' : 'Reactivate Pro')
                  : (isPaymentLoading ? 'Processing...' : 'Subscribe Now')}
            </button>

            {/* Secure payment badge */}
            <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secured by Razorpay · UPI · Cards · NetBanking
            </p>
          </div>
        </div>
      </section>

      {/* Verification & Success Overlay */}
      {(isVerifying || showSuccess) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card p-8 rounded-2xl border shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 text-center animate-in fade-in zoom-in duration-300">
            {isVerifying ? (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-primary mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Processing...</h3>
                <p className="text-muted-foreground">Verifying your payment securely.</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Congratulations!</h3>
                <p className="text-muted-foreground mb-6">You are a Pro member now.</p>
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to dashboard...
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
