import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Receipt,
  X,
  AlertCircle,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = ['Electronics', 'Appliances', 'Accessories', 'Furniture', 'Other'];

export default function ItemForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    category: 'Electronics',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: '',
    serialNumber: '',
    seller: '',
    notes: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [existingReceipt, setExistingReceipt] = useState(null);
  const [removeExistingReceipt, setRemoveExistingReceipt] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const loadItem = async () => {
        try {
          const res = await api.items.getById(id);
          if (res.success && res.data) {
            const item = res.data;
            setFormData({
              name: item.name || '',
              brand: item.brand || '',
              model: item.model || '',
              category: item.category || 'Electronics',
              purchasePrice: item.purchasePrice !== undefined ? String(item.purchasePrice) : '',
              purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
              warrantyExpiry: item.warrantyExpiry ? item.warrantyExpiry.split('T')[0] : '',
              serialNumber: item.serialNumber || '',
              seller: item.seller || '',
              notes: item.notes || '',
            });

            if (item.receipt) {
              setExistingReceipt(item.receipt);
            }
          }
        } catch (err) {
          setError(err.message || 'Failed to load item');
        } finally {
          setFetching(false);
        }
      };
      loadItem();
    }
  }, [id, isEdit]);

  const applyWarrantyDuration = (months) => {
    const baseDate = formData.purchaseDate ? new Date(formData.purchaseDate) : new Date();
    const expiryDate = new Date(baseDate);
    expiryDate.setMonth(expiryDate.getMonth() + months);
    setFormData((prev) => ({
      ...prev,
      warrantyExpiry: expiryDate.toISOString().split('T')[0]
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('File exceeds 8MB limit');
      return;
    }

    setSelectedFile(file);
    setRemoveExistingReceipt(false);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter an item name');
      return;
    }
    if (!formData.purchaseDate) {
      setError('Please select a purchase date');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const submitData = new FormData();
    submitData.append('name', formData.name.trim());
    submitData.append('brand', formData.brand.trim());
    submitData.append('model', formData.model.trim());
    submitData.append('category', formData.category);
    submitData.append('purchasePrice', formData.purchasePrice !== '' ? formData.purchasePrice : '0');
    submitData.append('purchaseDate', formData.purchaseDate);
    submitData.append('warrantyExpiry', formData.warrantyExpiry || '');
    submitData.append('serialNumber', formData.serialNumber.trim());
    submitData.append('seller', formData.seller.trim());
    submitData.append('notes', formData.notes.trim());

    if (selectedFile) {
      submitData.append('receipt', selectedFile);
    }

    if (removeExistingReceipt) {
      submitData.append('removeReceipt', 'true');
    }

    try {
      if (isEdit) {
        await api.items.update(id, submitData);
        setSuccessMsg('Item updated');
        setTimeout(() => navigate(`/items/${id}`), 500);
      } else {
        const res = await api.items.create(submitData);
        setSuccessMsg('Item saved');
        setTimeout(() => navigate(`/items/${res.data._id}`), 500);
      }
    } catch (err) {
      setError(err.message || 'Error saving item');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="bg-white rounded-lg border border-stone-200 p-8 text-center text-xs text-stone-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-stone-200">
        <Link
          to={isEdit ? `/items/${id}` : '/items'}
          className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900">
            {isEdit ? 'Edit Item' : 'Add Item'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-stone-200 shadow-xs p-6 space-y-6">
        {/* Section 1: Item Info */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-100">
            Product Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Item Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Item name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                placeholder="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Model
              </label>
              <input
                type="text"
                placeholder="Model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                placeholder="Serial number"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Purchase & Warranty */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-100">
            Purchase &amp; Warranty
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Purchase Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Store / Seller
              </label>
              <input
                type="text"
                placeholder="Store or seller"
                value={formData.seller}
                onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Warranty Expiry
              </label>
              <input
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-stone-500">
                <button
                  type="button"
                  onClick={() => applyWarrantyDuration(12)}
                  className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded text-stone-700"
                >
                  +1 Year
                </button>
                <button
                  type="button"
                  onClick={() => applyWarrantyDuration(24)}
                  className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded text-stone-700"
                >
                  +2 Years
                </button>
                <button
                  type="button"
                  onClick={() => applyWarrantyDuration(36)}
                  className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded text-stone-700"
                >
                  +3 Years
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, warrantyExpiry: '' })}
                  className="px-1.5 py-0.5 text-stone-400 hover:text-stone-600"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Receipt */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-100">
            Receipt
          </h2>

          {existingReceipt && !removeExistingReceipt && !selectedFile && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-800" />
                <span className="font-medium text-stone-800">
                  {existingReceipt.originalName || existingReceipt.filename}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRemoveExistingReceipt(true)}
                className="text-xs text-rose-700 hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          {removeExistingReceipt && (
            <div className="p-2 bg-amber-50 text-amber-900 border border-amber-200 rounded text-xs flex items-center justify-between">
              <span>Receipt will be removed on save.</span>
              <button
                type="button"
                onClick={() => setRemoveExistingReceipt(false)}
                className="text-xs font-medium underline"
              >
                Undo
              </button>
            </div>
          )}

          <div className="border border-dashed border-stone-300 rounded-lg p-4 text-center bg-stone-50/50 hover:bg-stone-50 transition-colors">
            {selectedFile ? (
              <div className="flex items-center justify-between bg-white p-3 rounded border border-stone-200">
                <div className="flex items-center gap-2 text-xs">
                  <Receipt className="w-4 h-4 text-emerald-800" />
                  <span className="font-medium text-stone-800">{selectedFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-5 h-5 text-stone-400 mx-auto mb-2" />
                <label className="cursor-pointer text-xs font-medium text-emerald-800 hover:text-emerald-900">
                  <span>Upload receipt (PDF or Image)</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}

            {filePreview && (
              <div className="mt-3">
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-h-32 mx-auto rounded border border-stone-200 object-contain bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Notes */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-stone-700">
            Notes
          </label>
          <textarea
            rows={3}
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full text-xs px-3 py-2 border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
          <Link
            to={isEdit ? `/items/${id}` : '/items'}
            className="px-4 py-2 text-xs font-medium text-stone-600 border border-stone-300 rounded-md hover:bg-stone-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-800 rounded-md hover:bg-emerald-900 transition-colors disabled:opacity-50"
          >
            <PackageCheck className="w-4 h-4" />
            <span>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Item'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
