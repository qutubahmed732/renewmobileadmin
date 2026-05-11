"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, KeyRound, QrCode, Copy, Check } from "lucide-react";
import ProfileSkeleton from "@/app/loading-skeletons/profile-skeleton";
import { Button } from "@/components/ui/button";
import { getMfaStatusAction, setupMfaAction, verifyMfaSetupAction, disableMfaAction } from "@/app/MFAactions";
import { QRCodeCanvas } from "qrcode.react";

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [disableCode, setDisableCode] = useState("");

  // Setup Flow State
  const [setupMode, setSetupMode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedKeys, setCopiedKeys] = useState<{ [key: string]: boolean }>({});

  const fetchMfaStatus = async () => {
    try {
      setLoading(true);
      const result = await getMfaStatusAction();

      if (result?.success) {
        // Assume backend returns { data: { enabled: true/false } }
        setMfaEnabled(result.data?.enabled || result.data?.data?.enabled || false);
      }
    } catch (err) {
      console.error("Failed to fetch MFA status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMfaStatus();
  }, []);

  async function handleStartSetup() {
    if (!currentPassword || currentPassword.length < 6) {
      alert("Please enter your current password (at least 6 characters) to continue.");
      return;
    }

    try {
      setActionLoading(true);
      const result = await setupMfaAction(currentPassword);

      if (result?.success) {
        setSetupMode(true);
        // Map to the actual Swagger response keys
        const data = result.data?.data || result.data;
        console.log("Full Setup Response Data:", data);
        console.log("Extracted Factor ID:", data?.factorId);

        setQrCodeData(data?.otpauthUrl || null);
        setSecretKey(data?.secret || null);
        setFactorId(data?.factorId || null);
      } else {
        console.error("MFA Setup Failed:", result);
        alert(`Failed to start MFA setup: ${result?.data?.message || result?.message || "Please check console"}`);
      }
    } catch (err) {
      console.error("Setup error", err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleVerifySetup(e: React.FormEvent) {
    e.preventDefault();
    if (verifyCode.length < 6 || !factorId) {
      if (!factorId) alert("Missing factorId. Please cancel and try starting setup again.");
      return;
    }

    try {
      setActionLoading(true);
      const result = await verifyMfaSetupAction(verifyCode, factorId);

      if (result?.success) {
        setMfaEnabled(true);
        setSetupMode(false);
        setVerifyCode("");
        // Store recovery codes to show to the user
        const data = result.data?.data || result.data;
        if (data?.recoveryCodes) {
          setRecoveryCodes(data.recoveryCodes);
        }
      } else {
        console.error("MFA Verify Failed:", result);
        alert(`Verification Failed: ${result?.data?.message || result?.message || "Invalid code. Please try again."}`);
      }
    } catch (err) {
      console.error("Verify error", err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisableMfa() {
    if (!currentPassword || currentPassword.length < 6) {
      alert("Please enter your current password (at least 6 characters) to continue.");
      return;
    }
    if (!disableCode || disableCode.length !== 6) {
      alert("Please enter your 6-digit Authenticator code to verify disable.");
      return;
    }

    if (!confirm("Are you sure you want to disable Multi-Factor Authentication? This will make your account less secure.")) return;

    try {
      setActionLoading(true);
      const result = await disableMfaAction(currentPassword, disableCode);

      if (result?.success) {
        setMfaEnabled(false);
        setCurrentPassword("");
      } else {
        console.error("Disable MFA Failed:", result);
        alert(`Failed to disable MFA: ${result?.data?.message || result?.message || "Please check console"}`);
      }
    } catch (err) {
      console.error("Disable error", err);
    } finally {
      setActionLoading(false);
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeys(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedKeys(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">


      {/* Security Settings Card */}
      <div className="w-full rounded-3xl border bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
            <KeyRound size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Security</h2>
            <p className="text-sm text-slate-500">Protect your admin account with additional security layers.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start justify-between bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-3">
              {mfaEnabled ? (
                <ShieldCheck className="text-emerald-500" size={28} />
              ) : (
                <ShieldAlert className="text-rose-500" size={28} />
              )}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Multi-Factor Authentication (MFA)
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {mfaEnabled
                ? "Your account is currently protected by Multi-Factor Authentication. You will be required to enter a 6-digit code from your authenticator app each time you sign in."
                : "Add an extra layer of security to your account. Once enabled, you'll be required to enter both your password and an authenticator code to sign in."}
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {!setupMode && (
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full md:w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            )}

            {!setupMode && mfaEnabled && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  className="w-full md:w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  maxLength={6}
                />
              </div>
            )}

            {mfaEnabled ? (
              <Button
                onClick={handleDisableMfa}
                disabled={actionLoading}
                variant="outline"
                className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-500/30 dark:hover:bg-rose-500/10 h-12 px-8 rounded-xl font-semibold transition-all"
              >
                {actionLoading ? "Disabling..." : "Disable MFA"}
              </Button>
            ) : !setupMode ? (
              <Button
                onClick={handleStartSetup}
                disabled={actionLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black h-12 px-8 rounded-xl font-bold shadow-md transition-all"
              >
                {actionLoading ? "Starting Setup..." : "Enable MFA"}
              </Button>
            ) : null}
          </div>
        </div>

        {/* Setup Flow UI */}
        {setupMode && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <h3 className="text-xl font-bold mb-6 text-center text-slate-900 dark:text-white">Configure Authenticator App</h3>

              <div className="flex flex-col md:flex-row items-center gap-10 justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center min-w-50 min-h-50">
                    {qrCodeData ? (
                      <QRCodeCanvas value={qrCodeData} size={180} level={"M"} />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <QrCode size={48} className="mb-2 opacity-50" />
                        <span className="text-xs">QR Code unavailable</span>
                      </div>
                    )}
                  </div>
                  {secretKey && (
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Manual Entry Secret</p>
                      <code className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm font-mono text-slate-700 dark:text-slate-300 tracking-wider">
                        {secretKey}
                      </code>
                    </div>
                  )}
                </div>

                <div className="max-w-xs w-full">
                  <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-8 font-medium">
                    <li>Open Google Authenticator or Authy.</li>
                    <li>Scan the QR code or enter the secret manually.</li>
                    <li>Enter the 6-digit code generated below.</li>
                  </ol>

                  <form onSubmit={handleVerifySetup} className="space-y-4">
                    <input
                      type="text"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      placeholder="123456"
                      className="w-full text-center text-2xl tracking-[0.5em] font-mono py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSetupMode(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={verifyCode.length < 6 || actionLoading}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold"
                      >
                        {actionLoading ? "Verifying..." : "Verify & Enable"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recovery Codes UI */}
        {recoveryCodes.length > 0 && !setupMode && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-amber-500 text-white rounded-xl shrink-0">
                  <KeyRound size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Save Your Recovery Codes</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    These codes are the ONLY way to access your account if you lose your device. Keep them in a safe place. They will only be shown once.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recoveryCodes.map((code, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-sm">
                    <code className="text-base font-mono font-bold tracking-wider text-slate-800 dark:text-slate-200">{code}</code>
                    <button
                      onClick={() => copyToClipboard(code, `code-${index}`)}
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                    >
                      {copiedKeys[`code-${index}`] ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setRecoveryCodes([])}
                  variant="outline"
                  className="bg-white dark:bg-[#1a1d24] border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  I have saved them securely
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}