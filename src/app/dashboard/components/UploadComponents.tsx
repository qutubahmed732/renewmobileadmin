// components/UploadComponent.tsx
"use client"
import { useActionState } from "react";
import { createContentAction } from "@/app/uploadAction";
import { useState, useEffect } from "react";

export default function UploadComponent({ type }: { type: string }) {
  const boundAction = createContentAction.bind(null, type);
  const [state, formAction, isPending] = useActionState(boundAction, null);
  const [token, setToken] = useState("");

  useEffect(() => {
  setToken(localStorage.getItem("authorized token") || "");
}, []);

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-xl border">
      <div>
        <label className="block text-sm font-medium mb-1 capitalize">{type} Title</label>
        <input name="title" className="w-full border p-2 rounded" placeholder="Enter title..." required />
      </div>
      <input type="hidden" name="token" value={token} />

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" className="w-full border p-2 rounded" rows={4} />
      </div>

      {/* Conditional UI based on Type (Jaisa aapki images mein hai) */}
      {type === 'videos' && (
        <div className="p-4 bg-slate-50 rounded-lg border-dashed border-2">
           <p className="text-center text-sm text-slate-500">Video Upload Section</p>
           {/* Image_a8aa0f.png wala logic yahan aayega */}
        </div>
      )}

      {type === 'series' && (
        <div>
           <p className="text-sm text-slate-500 italic">Episodes will be added after series creation.</p>
           {/* Image_a8a91d.png wala logic */}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" className="px-4 py-2 border rounded">Cancel</button>
        <button type="submit" disabled={isPending} className="bg-amber-500 text-white px-4 py-2 rounded">
          {isPending ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}