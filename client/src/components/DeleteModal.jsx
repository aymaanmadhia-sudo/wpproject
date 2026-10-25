import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteModal({ title = 'Delete Item', message = 'Are you sure you want to delete this record?', onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl border border-stone-200 max-w-md w-full overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-full shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-stone-900 text-sm">{title}</h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-3 py-1.5 border border-stone-300 text-stone-700 rounded hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-1.5 bg-rose-700 text-white font-medium rounded hover:bg-rose-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
