import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  ShieldCheck,
  ShieldAlert,
  Plus,
  ArrowRight,
  Receipt,
  RotateCw,
  Coins,
  PackageOpen,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import WarrantyBadge from '../components/WarrantyBadge';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    stats: {
      totalItems: 0,
      activeWarranties: 0,
      expiringWithin30Days: 0,
      expiredWarranties: 0,
      noWarrantyCount: 0,
      totalValue: 0,
    },
    recentItems: [],
    upcomingExpirations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.dashboard.getStats();
      if (res.success) {
        setData({
          stats: res.stats || {},
          recentItems: res.recentItems || [],
          upcomingExpirations: res.upcomingExpirations || [],
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = data.stats;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900">
            Dashboard
          </h1>
          {user?.name && (
            <p className="text-xs text-stone-500 mt-0.5">
              Welcome back, {user.name.split(' ')[0]}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            title="Refresh"
            className="p-2 border border-stone-300 rounded-md bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/items/add"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-800 rounded-md hover:bg-emerald-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-md flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Items */}
        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Items</span>
            <div className="p-1.5 rounded-md bg-stone-100 text-stone-700">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-stone-900">
              {loading ? '...' : stats.totalItems}
            </span>
          </div>
        </div>

        {/* Active Warranties */}
        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Active Warranties</span>
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-800">
              {loading ? '...' : stats.activeWarranties}
            </span>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className={`p-4 rounded-lg border shadow-xs transition-colors ${
          stats.expiringWithin30Days > 0
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-white border-stone-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900">Expiring in 30 Days</span>
            <div className="p-1.5 rounded-md bg-amber-100 text-amber-800">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-bold tracking-tight ${
              stats.expiringWithin30Days > 0 ? 'text-amber-900 font-extrabold' : 'text-stone-900'
            }`}>
              {loading ? '...' : stats.expiringWithin30Days}
            </span>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Purchase Value</span>
            <div className="p-1.5 rounded-md bg-stone-100 text-stone-700">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
              ₹{loading ? '...' : (stats.totalValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Expiring Soon Section */}
      <section className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Expiring Soon (Next 30 Days)
            </h2>
          </div>
          <Link
            to="/reminders"
            className="text-xs font-medium text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
          >
            All Reminders
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs text-stone-500">Loading...</div>
        ) : data.upcomingExpirations.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-500">
            No warranties expiring in the next 30 days.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {data.upcomingExpirations.map((item) => (
              <div
                key={item._id}
                className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/80 transition-colors"
              >
                <div>
                  <Link
                    to={`/items/${item._id}`}
                    className="text-xs font-semibold text-stone-900 hover:text-emerald-800 transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {item.brand ? `${item.brand} • ` : ''}{item.category}
                    {item.serialNumber ? ` • ${item.serialNumber}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <WarrantyBadge expiryDate={item.warrantyExpiry} size="sm" />
                  <Link
                    to={`/items/${item._id}`}
                    className="text-xs text-stone-600 hover:text-stone-900 border border-stone-200 px-2.5 py-1 rounded bg-white hover:bg-stone-50"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Items Section */}
      <section className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-stone-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Recent Items
            </h2>
          </div>
          <Link
            to="/items"
            className="text-xs font-medium text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs text-stone-500">Loading...</div>
        ) : data.recentItems.length === 0 ? (
          <div className="p-8 text-center">
            <PackageOpen className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs text-stone-500 mb-3">No items added yet</p>
            <Link
              to="/items/add"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-800 rounded hover:bg-emerald-900 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/50 text-stone-500 font-medium border-b border-stone-100">
                <tr>
                  <th className="px-5 py-2.5">Item</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Purchase Date</th>
                  <th className="px-4 py-2.5">Price</th>
                  <th className="px-4 py-2.5">Warranty</th>
                  <th className="px-4 py-2.5">Receipt</th>
                  <th className="px-5 py-2.5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {data.recentItems.map((item) => (
                  <tr key={item._id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-5 py-2.5">
                      <Link
                        to={`/items/${item._id}`}
                        className="font-medium text-stone-900 hover:text-emerald-800 transition-colors"
                      >
                        {item.name}
                      </Link>
                      {item.brand && (
                        <span className="block text-[11px] text-stone-500">{item.brand}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-700 border border-stone-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-stone-600 font-mono text-[11px]">
                      {new Date(item.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-medium text-stone-900">
                      ₹{Number(item.purchasePrice || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5">
                      <WarrantyBadge expiryDate={item.warrantyExpiry} size="xs" />
                    </td>
                    <td className="px-4 py-2.5">
                      {item.receipt ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                          <Receipt className="w-3 h-3" />
                          Attached
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">&mdash;</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <Link
                        to={`/items/${item._id}`}
                        className="text-xs text-stone-600 hover:text-stone-900 border border-stone-200 px-2.5 py-1 rounded bg-white hover:bg-stone-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
