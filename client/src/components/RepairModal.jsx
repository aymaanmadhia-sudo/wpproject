import React, { useState } from 'react';
import { X, Wrench, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function RepairModal({ itemId, itemName, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    repairDate: new Date().toISOString().split('T')[0],
    issue: '',
    repairShop: '',
    cost: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.issue.trim()) {
      setError('Please describe the issue or service performed');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.repairs.create(itemId, formData);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save repair');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl border border-stone-200 max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-md">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Add Repair</h3>
              <p className="text-xs text-stone-500">{itemName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.repairDate}
                onChange={(e) => setFormData({ ...formData, repairDate: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Cost (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Issue or Service <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Battery replacement"
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Repair Shop
            </label>
            <input
              type="text"
              placeholder="Shop or service center"
              value={formData.repairShop}
              onChange={(e) => setFormData({ ...formData, repairShop: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Optional notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-stone-600 border border-stone-300 rounded hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-medium bg-emerald-800 text-white rounded hover:bg-emerald-900 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Repair'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
