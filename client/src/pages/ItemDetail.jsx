import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Receipt,
  Download,
  Wrench,
  Plus,
  FileText,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import WarrantyBadge from '../components/WarrantyBadge';
import ReceiptModal from '../components/ReceiptModal';
import RepairModal from '../components/RepairModal';
import DeleteModal from '../components/DeleteModal';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Repair delete modal
  const [deleteRepairId, setDeleteRepairId] = useState(null);
  const [deleteRepairLoading, setDeleteRepairLoading] = useState(false);

  const fetchItemData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.items.getById(id);
      if (res.success) {
        setItem(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemData();
  }, [id]);

  const handleDeleteItem = async () => {
    setDeleteLoading(true);
    try {
      await api.items.delete(id);
      navigate('/items');
    } catch (err) {
      alert(`Failed to delete item: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteRepair = async () => {
    if (!deleteRepairId) return;
    setDeleteRepairLoading(true);
    try {
      await api.repairs.delete(deleteRepairId);
      setDeleteRepairId(null);
      await fetchItemData();
    } catch (err) {
      alert(`Failed to delete repair log: ${err.message}`);
    } finally {
      setDeleteRepairLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-stone-200 p-8 text-center text-xs text-stone-500">
        Loading...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-xs text-rose-700">{error || 'Item not found'}</p>
        <Link
          to="/items"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to items
        </Link>
      </div>
    );
  }

  const repairs = item.repairs || [];
  const totalRepairCost = repairs.reduce((acc, r) => acc + (Number(r.cost) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link
            to="/items"
            className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                {item.category}
              </span>
              <WarrantyBadge expiryDate={item.warrantyExpiry} size="xs" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 mt-1">
              {item.name}
            </h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to={`/items/edit/${item._id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded hover:bg-stone-50 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-white border border-rose-200 rounded hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Details */}
          <div className="bg-white rounded-lg border border-stone-200 shadow-xs p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-100">
              Product Details
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
              <div>
                <dt className="text-stone-500 font-medium">Brand</dt>
                <dd className="text-stone-900 font-semibold mt-0.5">{item.brand || '—'}</dd>
              </div>

              <div>
                <dt className="text-stone-500 font-medium">Model</dt>
                <dd className="text-stone-900 font-semibold mt-0.5">{item.model || '—'}</dd>
              </div>

              <div>
                <dt className="text-stone-500 font-medium">Serial Number</dt>
                <dd className="text-stone-900 font-mono mt-0.5">{item.serialNumber || '—'}</dd>
              </div>

              <div>
                <dt className="text-stone-500 font-medium">Store / Seller</dt>
                <dd className="text-stone-900 mt-0.5">{item.seller || '—'}</dd>
              </div>

              <div>
                <dt className="text-stone-500 font-medium">Purchase Date</dt>
                <dd className="text-stone-900 font-mono mt-0.5">
                  {new Date(item.purchaseDate).toLocaleDateString()}
                </dd>
              </div>

              <div>
                <dt className="text-stone-500 font-medium">Purchase Price</dt>
                <dd className="text-stone-900 font-mono font-semibold mt-0.5">
                  ₹{Number(item.purchasePrice || 0).toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Warranty */}
          <div className="bg-white rounded-lg border border-stone-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Warranty
              </h2>
              <WarrantyBadge expiryDate={item.warrantyExpiry} size="sm" />
            </div>

            <div className="text-xs">
              <span className="text-stone-500">Expiration Date: </span>
              <span className="font-semibold text-stone-900 font-mono">
                {item.warrantyExpiry
                  ? new Date(item.warrantyExpiry).toLocaleDateString()
                  : 'None recorded'}
              </span>
            </div>
          </div>

          {/* Notes */}
          {item.notes && (
            <div className="bg-white rounded-lg border border-stone-200 shadow-xs p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-100 mb-2">
                Notes
              </h2>
              <p className="text-xs text-stone-700 whitespace-pre-wrap leading-relaxed">
                {item.notes}
              </p>
            </div>
          )}

          {/* Repairs */}
          <div className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-stone-700" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Repairs ({repairs.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowRepairModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-emerald-800 rounded hover:bg-emerald-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Repair</span>
              </button>
            </div>

            {repairs.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500">
                No repairs recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-200">
                    <tr>
                      <th className="px-5 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Issue</th>
                      <th className="px-4 py-2.5">Shop</th>
                      <th className="px-4 py-2.5">Cost</th>
                      <th className="px-4 py-2.5">Notes</th>
                      <th className="px-5 py-2.5 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {repairs.map((rep) => (
                      <tr key={rep._id} className="hover:bg-stone-50/60">
                        <td className="px-5 py-2.5 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                          {new Date(rep.repairDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-stone-900">
                          {rep.issue}
                        </td>
                        <td className="px-4 py-2.5 text-stone-600">
                          {rep.repairShop || '—'}
                        </td>
                        <td className="px-4 py-2.5 font-mono font-medium text-stone-900">
                          ₹{Number(rep.cost || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-stone-500 text-[11px] max-w-xs truncate">
                          {rep.notes || '—'}
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => setDeleteRepairId(rep._id)}
                            title="Delete"
                            className="p-1 text-stone-400 hover:text-rose-700 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Receipt */}
          <div className="bg-white rounded-lg border border-stone-200 shadow-xs p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-800" />
              Receipt
            </h2>

            {item.receipt ? (
              <div className="space-y-3">
                <div
                  onClick={() => setShowReceiptModal(true)}
                  className="cursor-pointer border border-stone-200 rounded-md overflow-hidden bg-stone-50 hover:border-emerald-700 transition-colors"
                >
                  {item.receipt.mimetype === 'application/pdf' || item.receipt.filename?.endsWith('.pdf') ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center p-4">
                      <FileText className="w-10 h-10 text-stone-400 mb-2" />
                      <p className="text-xs font-medium text-stone-800 truncate max-w-full">
                        {item.receipt.originalName || 'PDF Document'}
                      </p>
                    </div>
                  ) : (
                    <img
                      src={item.receipt.url}
                      alt="Receipt"
                      className="w-full h-44 object-cover"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(true)}
                    className="text-emerald-800 hover:text-emerald-950 font-medium underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <a
                    href={item.receipt.url}
                    download={item.receipt.originalName || 'receipt'}
                    className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 border border-stone-200 px-2 py-1 rounded bg-stone-50"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 px-4 border border-dashed border-stone-200 rounded-md bg-stone-50/50">
                <p className="text-xs text-stone-500">No receipt attached</p>
                <Link
                  to={`/items/edit/${item._id}`}
                  className="mt-1.5 inline-block text-xs text-emerald-800 hover:underline font-medium"
                >
                  Upload receipt
                </Link>
              </div>
            )}
          </div>

          {/* Cost Summary */}
          <div className="bg-white rounded-lg border border-stone-200 shadow-xs p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-100">
              Cost Summary
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Purchase Price:</span>
                <span className="font-mono font-medium text-stone-900">
                  ₹{Number(item.purchasePrice || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Repairs:</span>
                <span className="font-mono font-medium text-stone-900">
                  ₹{totalRepairCost.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-100 flex justify-between font-semibold text-stone-900">
                <span>Total:</span>
                <span className="font-mono text-emerald-900">
                  ₹{(Number(item.purchasePrice || 0) + totalRepairCost).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReceiptModal && (
        <ReceiptModal
          receipt={item.receipt}
          itemName={item.name}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {showRepairModal && (
        <RepairModal
          itemId={item._id}
          itemName={item.name}
          onClose={() => setShowRepairModal(false)}
          onSaved={fetchItemData}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          title="Delete Item"
          message={`Are you sure you want to delete "${item.name}"?`}
          onConfirm={handleDeleteItem}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleteLoading}
        />
      )}

      {deleteRepairId && (
        <DeleteModal
          title="Delete Repair"
          message="Are you sure you want to delete this repair record?"
          onConfirm={handleDeleteRepair}
          onCancel={() => setDeleteRepairId(null)}
          loading={deleteRepairLoading}
        />
      )}
    </div>
  );
}
