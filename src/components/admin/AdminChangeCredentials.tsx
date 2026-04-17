import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { X, Mail, Lock, ShieldCheck, Loader2, Send, KeyRound, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUPABASE_URL = "https://lrtnndwxvntqxrspdsfo.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxydG5uZHd4dm50cXhyc3Bkc2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjIyODIsImV4cCI6MjA5MDU5ODI4Mn0.pN_rIN0tj66CIpJQeMGinLUt3gGLRmtbj6GDvlJjj94";

// Verification email — hardcoded, can only be changed by backend team
const VERIFICATION_EMAIL = "connectangels08@gmail.com";

// A separate Supabase client that does NOT persist sessions.
// Used only for sending/verifying the OTP without disrupting the admin's current session.
const otpClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "send" | "verify" | "change";

export const AdminChangeCredentials = ({ open, onClose }: Props) => {
  const [step, setStep] = useState<Step>("send");
  const [otpCode, setOtpCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const maskedEmail =
    VERIFICATION_EMAIL.replace(/(.{3})(.*)(@.*)/, "$1***$3");

  // ── Step 1: Send OTP ──────────────────────────────────────────
  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await otpClient.auth.signInWithOtp({
        email: VERIFICATION_EMAIL,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      toast.success(`Verification code sent to ${maskedEmail}`);
      setStep("verify");
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const { error } = await otpClient.auth.verifyOtp({
        email: VERIFICATION_EMAIL,
        token: otpCode,
        type: "email",
      });
      if (error) throw error;
      toast.success("Verified! You can now change credentials.");
      setStep("change");
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Change credentials ────────────────────────────────
  const handleChangeCredentials = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!newEmail && !newPassword) {
      toast.error("Enter a new email or password to change");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const updates: { email?: string; password?: string } = {};
      if (newEmail.trim()) updates.email = newEmail.trim();
      if (newPassword) updates.password = newPassword;

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      // If email changed, also update profiles table
      if (newEmail.trim()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ email: newEmail.trim() })
            .eq("id", user.id);
        }
      }

      toast.success("Credentials updated successfully!");
      handleClose();
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Failed to update credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("send");
    setOtpCode("");
    setNewEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !loading && handleClose()}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#0B0F19] border border-[#1F2937] shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937]">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-semibold text-white">Change Credentials</h2>
          </div>
          <button
            onClick={() => !loading && handleClose()}
            className="h-7 w-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1F2937] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-6 pt-5">
          <div className="flex items-center gap-2 mb-6">
            {(["send", "verify", "change"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    step === s
                      ? "bg-violet-600 text-white"
                      : (["send", "verify", "change"].indexOf(step) > i)
                        ? "bg-green-600 text-white"
                        : "bg-[#1F2937] text-gray-500"
                  }`}
                >
                  {(["send", "verify", "change"].indexOf(step) > i) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 rounded ${
                      (["send", "verify", "change"].indexOf(step) > i)
                        ? "bg-green-600"
                        : "bg-[#1F2937]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {/* ── STEP 1: Send OTP ── */}
          {step === "send" && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Email Verification Required
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  For security, a verification code will be sent to{" "}
                  <span className="text-violet-400 font-medium">{maskedEmail}</span>.
                  <br />
                  Only authorized personnel with access to this email can proceed.
                </p>
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </div>
          )}

          {/* ── STEP 2: Verify OTP ── */}
          {step === "verify" && (
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="text-sm font-semibold text-white mb-1">
                  Enter Verification Code
                </h3>
                <p className="text-xs text-gray-400">
                  We sent a 6-digit code to{" "}
                  <span className="text-violet-400 font-medium">{maskedEmail}</span>.
                  Check your inbox (and spam folder).
                </p>
              </div>

              {/* OTP input */}
              <input
                id="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full text-center text-3xl font-mono tracking-[0.5em] py-4 rounded-xl bg-[#131827] border border-[#1F2937] text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otpCode.length < 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                onClick={() => { setStep("send"); setOtpCode(""); }}
                disabled={loading}
                className="w-full py-2 text-xs text-gray-400 hover:text-violet-400 transition-colors"
              >
                Didn't receive? Send again
              </button>
            </div>
          )}

          {/* ── STEP 3: Change Credentials ── */}
          {step === "change" && (
            <div className="space-y-5">
              <div className="p-3 rounded-xl bg-green-600/10 border border-green-600/20">
                <p className="text-xs text-green-400 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Verified! You may now update your credentials.
                </p>
              </div>

              {/* New Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  New Email (optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131827] border border-[#1F2937] text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  New Password (optional)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131827] border border-[#1F2937] text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              {newPassword && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131827] border border-[#1F2937] text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl border border-[#1F2937] text-sm font-medium text-gray-300 hover:bg-[#1F2937] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangeCredentials}
                  disabled={loading || (!newEmail && !newPassword)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {loading ? "Saving..." : "Update"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
