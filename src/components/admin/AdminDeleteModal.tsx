import { X, AlertCircle, Trash2, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  loading?: boolean;
}

export const AdminDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  loading = false,
}: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md rounded-[32px] bg-[#0B0F19] border border-[#1F2937] shadow-[0_0_50px_-12px_rgba(220,38,38,0.25)] z-10 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

        {/* Close Button */}
        <button
          onClick={() => !loading && onClose()}
          className="absolute top-4 right-4 h-9 w-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Warning Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <div className="space-y-3">
              <p className="text-gray-400 text-sm leading-relaxed">
                {description}
              </p>
              {itemName && (
                <div className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                  <span className="text-red-400 text-sm font-semibold italic">"{itemName}"</span>
                </div>
              )}
            </div>
          </div>

          {/* Danger Alert */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 mb-8">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300/80 leading-relaxed italic">
              This action is permanent. Deleting this entry will remove all associated data from the servers.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => !loading && onClose()}
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-2xl border border-[#1F2937] text-gray-300 font-bold hover:bg-[#1F2937] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-red-900/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              {loading ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
