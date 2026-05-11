"use client";

import { use, useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Upload, FileVideo, Loader2, CheckCircle2, X, AlertTriangle } from "lucide-react";
import * as tus from "tus-js-client";
import {
  createSeriesEpisodeSessionAction,
  completeVideoUploadAction,
  cancelVideoUploadAction,
  getVideoUploadStatusAction,
} from "@/app/uploadAction";
import { useToast } from "@/components/ui/toast";

type UploadPhase =
  | "idle"
  | "creating-session"
  | "uploading"
  | "finalizing"
  | "done"
  | "error";

const PHASE_LABELS: Record<UploadPhase, string> = {
  idle: "",
  "creating-session": "Creating upload session…",
  uploading: "Uploading to Vimeo…",
  finalizing: "Finalizing upload…",
  done: "Done!",
  error: "Upload failed",
};

export default function UploadEpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: seriesId } = use(params);
  const searchParams = useSearchParams();
  const seriesTitle = searchParams.get("title") ?? "Series";
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const videoIdRef = useRef<string | null>(null);
  const tusUploadRef = useRef<tus.Upload | null>(null);

  const phaseStep =
    ({ "creating-session": 1, uploading: 2, finalizing: 3, done: 3, error: 0, idle: 0 } as Record<UploadPhase, number>)[phase] ?? 0;

  const reset = useCallback(() => {
    setLoading(false);
    setPhase("idle");
    setUploadProgress(0);
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    videoIdRef.current = null;
    tusUploadRef.current = null;
  }, []);

  useEffect(() => {
    if (!loading) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [loading]);

  const handleBack = useCallback(() => {
    router.push("/dashboard/series");
  }, [router]);

  const handleCancelUpload = useCallback(async () => {
    if (tusUploadRef.current) {
      try { tusUploadRef.current.abort(); } catch {}
      tusUploadRef.current = null;
    }
    if (videoIdRef.current) {
      try { await cancelVideoUploadAction(videoIdRef.current); } catch {}
    }
    reset();
    router.push("/dashboard/series");
  }, [reset, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!videoFile) {
      toast({ type: "error", title: "Video required", message: "Please select a video file." });
      return;
    }
    if (!title.trim()) {
      toast({ type: "error", title: "Title required", message: "Please enter an episode title." });
      return;
    }

    setLoading(true);
    setPhase("creating-session");

    const metadata = JSON.stringify([{
      title: title.trim(),
      description: description.trim() || undefined,
      sourceFileName: videoFile.name,
      sourceFileSize: videoFile.size,
    }]);

    const formData = new FormData();
    formData.append("metadata", metadata);
    if (thumbnailFile && thumbnailFile.size > 0) {
      formData.append("thumbnails", thumbnailFile);
      formData.append("thumbnailIndexes", "[0]");
    }

    const sessionRes = await createSeriesEpisodeSessionAction(seriesId, formData);

    if (!sessionRes.success) {
      const msg =
        (Array.isArray(sessionRes.data?.message) ? sessionRes.data.message.join(", ") : sessionRes.data?.message) ||
        sessionRes.error ||
        "Could not initialize the upload session.";
      toast({ type: "error", title: "Session creation failed", message: String(msg) });
      setLoading(false);
      setPhase("error");
      return;
    }

    const inner = sessionRes.data?.data;
    const sessions = inner?.items ?? inner?.sessions ?? (Array.isArray(inner) ? inner : null);
    const firstSession = sessions?.[0] ?? inner;
    const uploadUrl: string | undefined = firstSession?.upload?.uploadLink;
    const videoId: string | undefined = firstSession?.video?.id;

    if (!uploadUrl || !videoId) {
      toast({
        type: "error",
        title: "Session response invalid",
        message: `Backend did not return upload URL or video ID. Got: ${JSON.stringify(inner)}`,
      });
      setLoading(false);
      setPhase("error");
      return;
    }

    videoIdRef.current = videoId;
    setPhase("uploading");

    const tusUpload = new tus.Upload(videoFile, {
      uploadUrl,
      retryDelays: [0, 1000, 3000, 5000, 10000, 20000],
      chunkSize: 8 * 1024 * 1024,
      metadata: { filename: videoFile.name, filetype: videoFile.type },
      onError(error) {
        toast({ type: "error", title: "Upload failed", message: error.message || "Network error during upload." });
        setLoading(false);
        setPhase("error");
        setUploadProgress(0);
      },
      onProgress(bytesUploaded, bytesTotal) {
        setUploadProgress(bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0);
      },
      async onSuccess() {
        setUploadProgress(100);
        setPhase("finalizing");

        const completeRes = await completeVideoUploadAction(videoId);

        if (completeRes.success) {
          setPhase("done");
          toast({ type: "success", title: "Episode uploaded!", message: "Your episode is being processed by Vimeo and will appear shortly." });
          reset();
          router.push("/dashboard/series");
          return;
        }

        const statusRes = await getVideoUploadStatusAction(videoId);
        const statusPayload = statusRes.data?.data ?? statusRes.data;
        const status: string = statusPayload?.status || "";

        if (["PROCESSING", "READY", "PUBLISHED"].includes(status.toUpperCase())) {
          setPhase("done");
          toast({ type: "success", title: "Episode uploaded!", message: "Your episode is being processed and will appear shortly." });
          reset();
          router.push("/dashboard/series");
        } else {
          const errMsg = completeRes.data?.message || completeRes.error || "Episode reached Vimeo but backend failed to finalize.";
          toast({ type: "error", title: "Finalization failed", message: String(errMsg) });
          setPhase("error");
          setLoading(false);
        }
      },
    });

    tusUploadRef.current = tusUpload;
    tusUpload.start();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d0f14] p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <button
          type="button"
          onClick={loading ? undefined : handleBack}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-40"
        >
          <ArrowLeft size={16} />
          Back to Series
        </button>

        <div className="bg-white dark:bg-[#111318] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Upload Episode</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{seriesTitle}</p>
          </div>

          {loading ? (
            <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3">
              <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700 dark:text-rose-400 font-medium leading-snug">
                Upload in progress — <span className="font-bold">do not close or navigate away</span> or your upload will be lost.
              </p>
            </div>
          ) : (
            <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-400 leading-snug">
                Once the upload starts, <span className="font-semibold">keep this page open</span> until it completes. Closing or navigating away will cancel the upload and all progress will be lost.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Episode Title <span className="text-rose-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter episode title…"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none transition-all disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={loading}
                placeholder="Enter episode description…"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none resize-none transition-all disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Thumbnail</label>
              <div className={`relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-amber-50/20 dark:bg-amber-500/5 min-h-[110px] flex items-center justify-center ${loading ? "pointer-events-none opacity-60" : ""}`}>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setThumbnailFile(f);
                    setThumbnailPreview(f ? URL.createObjectURL(f) : null);
                  }}
                  disabled={loading}
                />
                {thumbnailPreview ? (
                  <div className="relative w-full">
                    <div className="relative w-full h-40">
                      <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setThumbnailFile(null); setThumbnailPreview(null); }}
                      className="absolute top-2 right-2 z-20 bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600 transition-colors"
                    >
                      <X size={13} />
                    </button>
                    <p className="text-center text-xs text-slate-400 py-1.5 truncate px-4">{thumbnailFile?.name}</p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Upload className="mx-auto text-amber-500 mb-2" size={22} />
                    <p className="text-xs text-slate-500">Click to upload thumbnail</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Video File <span className="text-rose-500">*</span>
              </label>
              <div className={`relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center bg-amber-50/20 dark:bg-amber-500/5 ${loading ? "pointer-events-none opacity-60" : ""}`}>
                <input
                  type="file"
                  accept="video/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  disabled={loading}
                />
                {videoFile ? (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <FileVideo size={26} className="text-amber-500 mb-1" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">{videoFile.name}</span>
                    <span className="text-xs text-slate-400">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto text-amber-500 mb-2" size={22} />
                    <p className="text-xs text-slate-500">Click to select video file (any size)</p>
                  </div>
                )}
              </div>
            </div>

            {loading && phase !== "idle" && (
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  {(["creating-session", "uploading", "finalizing"] as UploadPhase[]).map((p, idx) => {
                    const step = idx + 1;
                    const done = phaseStep > step;
                    const active = phaseStep === step;
                    return (
                      <div key={p} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          done ? "bg-emerald-500 text-white" :
                          active ? "bg-amber-500 text-white" :
                          "bg-slate-200 dark:bg-slate-700 text-slate-400"
                        }`}>
                          {done ? <CheckCircle2 size={12} /> : step}
                        </div>
                        <span className={active ? "text-amber-600 dark:text-amber-400 font-semibold" : ""}>{PHASE_LABELS[p]}</span>
                        {idx < 2 && <div className="w-6 h-px bg-slate-200 dark:bg-slate-700" />}
                      </div>
                    );
                  })}
                </div>

                {phase === "uploading" && (
                  <>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Direct upload to Vimeo</span>
                      <span className="text-amber-600 dark:text-amber-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    {videoFile && (
                      <p className="text-[11px] text-slate-400">
                        {((uploadProgress / 100) * videoFile.size / 1024 / 1024).toFixed(0)} MB / {(videoFile.size / 1024 / 1024).toFixed(0)} MB
                      </p>
                    )}
                  </>
                )}

                {(phase === "creating-session" || phase === "finalizing") && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin text-amber-500" />
                    <span>{PHASE_LABELS[phase]}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={loading ? handleCancelUpload : handleBack}
                className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all"
              >
                {loading ? "Cancel Upload" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-60 transition-all flex items-center gap-2 min-w-[130px] justify-center"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading
                  ? phase === "creating-session" ? "Preparing…"
                  : phase === "uploading" ? `${uploadProgress}%`
                  : phase === "finalizing" ? "Finalizing…"
                  : "Uploading…"
                  : "Upload Episode"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}