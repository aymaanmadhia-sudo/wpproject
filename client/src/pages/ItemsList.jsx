import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  Receipt,
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import WarrantyBadge from '../components/WarrantyBadge';
import EmptyState from '../components/EmptyState';
import DeleteModal from '../components/DeleteModal';
import ReceiptModal from '../components/ReceiptModal';

const CATEGORIES = ['All', 'Electronics', 'Appliances', 'Accessories', 'Furniture', 'Other'];
const WARRANTY_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'expiring_soon', label: 'Expiring in 30 Days' },
  { value: 'expired', label: 'Expired' },
  { value: 'no_warranty', label: 'No Warranty' },
];

export default function ItemsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Controls
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('purchaseDate_desc');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  // Modals
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.items.getAll({
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        status: status !== 'all' ? status : undefined,
        sort,
      });
      if (res.success) {
        setItems(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, status, sort]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.items.delete(deleteTarget._id);
      setDeleteTarget(null);
      await fetchItems();
    } catch (err) {
      alert(`Failed to delete item: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900">
            My Items
          </h1>
        </div>

        <Link
          to="/items/add"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-800 rounded-md hover:bg-emerald-900 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search items, brands, serial numbers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          {/* Warranty Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-800"
            >
              {WARRANTY_STATUSES.map((ws) => (
                <option key={ws.value} value={ws.value}>
                  {ws.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="sm:col-span-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-800"
            >
              <option value="purchaseDate_desc">Date: Newest</option>
              <option value="purchaseDate_asc">Date: Oldest</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="expiry_asc">Expiry: Soonest</option>
              <option value="expiry_desc">Expiry: Furthest</option>
              <option value="name_asc">Name: A–Z</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="sm:col-span-2 flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="List view"
              className={`p-1.5 rounded border text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-1.5 rounded border text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors shrink-0 ${
                category === cat
                  ? 'bg-stone-900 text-white font-medium'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg border border-stone-200 p-8 text-center text-xs text-stone-500">
          Loading items...
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={search || category !== 'All' || status !== 'all' ? 'No matching items' : 'No items yet'}
          description={
            search || category !== 'All' || status !== 'all'
              ? 'Try adjusting your search or filters.'
              : ''
          }
          onAction={
            search || category !== 'All' || status !== 'all'
              ? () => {
                  setSearch('');
                  setCategory('All');
                  setStatus('all');
                }
              : undefined
          }
          actionLabel={search || category !== 'All' || status !== 'all' ? 'Clear Filters' : 'Add Item'}
        />
      ) : viewMode === 'list' ? (
        /* Table View */
        <div className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/70 text-stone-500 font-medium border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Purchase Date</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Warranty</th>
                  <th className="px-4 py-3">Receipt</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        to={`/items/${item._id}`}
                        className="font-semibold text-stone-900 hover:text-emerald-800 transition-colors block"
                      >
                        {item.name}
                      </Link>
                      <span className="text-[11px] text-stone-500">
                        {item.brand ? item.brand : ''}
                        {item.model ? ` • ${item.model}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-700 border border-stone-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-stone-600">
                      {new Date(item.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-stone-900">
                      ₹{Number(item.purchasePrice || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <WarrantyBadge expiryDate={item.warrantyExpiry} size="xs" />
                    </td>
                    <td className="px-4 py-3">
                      {item.receipt ? (
                        <button
                          type="button"
                          onClick={() => setPreviewReceipt({ receipt: item.receipt, name: item.name })}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-800 hover:text-emerald-950 font-medium underline"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          View
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/items/${item._id}`}
                          title="View"
                          className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/items/edit/${item._id}`}
                          title="Edit"
                          className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          title="Delete"
                          className="p-1 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg border border-stone-200 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between p-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                    {item.category}
                  </span>
                  <WarrantyBadge expiryDate={item.warrantyExpiry} size="xs" />
                </div>

                <Link
                  to={`/items/${item._id}`}
                  className="font-semibold text-sm text-stone-900 hover:text-emerald-800 transition-colors block"
                >
                  {item.name}
                </Link>

                <p className="text-xs text-stone-500 mt-0.5">
                  {item.brand ? item.brand : ''}
                  {item.model ? ` ${item.model}` : ''}
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Price:</span>
                    <span className="font-mono font-medium text-stone-900">₹{Number(item.purchasePrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Purchased:</span>
                    <span className="font-mono">{new Date(item.purchaseDate).toLocaleDateString()}</span>
                  </div>
                  {item.receipt && (
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-stone-400">Receipt:</span>
                      <button
                        type="button"
                        onClick={() => setPreviewReceipt({ receipt: item.receipt, name: item.name })}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-800 hover:underline"
                      >
                        <Receipt className="w-3 h-3" />
                        Attached
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <Link
                  to={`/items/${item._id}`}
                  className="text-emerald-800 hover:text-emerald-950 font-medium inline-flex items-center gap-1"
                >
                  Details &rarr;
                </Link>
                <div className="flex items-center gap-1">
                  <Link
                    to={`/items/edit/${item._id}`}
                    title="Edit"
                    className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    title="Delete"
                    className="p-1.5 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          title="Delete Item"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* Receipt Modal */}
      {previewReceipt && (
        <ReceiptModal
          receipt={previewReceipt.receipt}
          itemName={previewReceipt.name}
          onClose={() => setPreviewReceipt(null)}
        />
      )}
    </div>
  );
}
