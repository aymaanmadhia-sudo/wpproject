import React from 'react';
import { X, FileText, Download, ExternalLink } from 'lucide-react';

export default function ReceiptModal({ receipt, itemName, onClose }) {
  if (!receipt) return null;

  const isPdf = receipt.mimetype === 'application/pdf' || receipt.filename?.toLowerCase().endsWith('.pdf');
  const formattedSize = receipt.size 
    ? `${(receipt.size / 1024).toFixed(1)} KB` 
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl border border-stone-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200 bg-stone-50">
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">Receipt</h3>
            <p className="text-xs text-stone-500">{itemName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto flex-1 flex flex-col items-center justify-center bg-stone-100/50">
          {isPdf ? (
            <div className="py-12 flex flex-col items-center text-center">
              <FileText className="w-14 h-14 text-stone-400 mb-3" />
              <p className="font-medium text-stone-800 text-sm mb-1">{receipt.originalName || 'Receipt PDF'}</p>
              {formattedSize && <p className="text-xs text-stone-500 mb-4">{formattedSize}</p>}
              <a
                href={receipt.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white text-xs font-medium rounded hover:bg-emerald-900 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open PDF
              </a>
            </div>
          ) : (
            <img
              src={receipt.url}
              alt={`Receipt for ${itemName}`}
              className="max-h-[60vh] max-w-full object-contain rounded border border-stone-200 bg-white"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-white flex items-center justify-between text-xs">
          <span className="text-stone-500">{formattedSize}</span>
          <div className="flex items-center gap-2">
            <a
              href={receipt.url}
              download={receipt.originalName || 'receipt'}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-stone-300 text-stone-700 rounded hover:bg-stone-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
