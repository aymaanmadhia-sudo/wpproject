import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BellRing,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  ShieldMinus,
  Clock,
  ArrowRight,
  RotateCw,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import WarrantyBadge from '../components/WarrantyBadge';

export default function Reminders() {
  const [groups, setGroups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.reminders.getAll();
      if (res.success && res.data) {
        setGroups(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const tabsConfig = [
    { key: 'all', label: 'All', icon: BellRing, count: null },
    {
      key: 'expiring7Days',
      label: '7 Days',
      icon: ShieldAlert,
      count: groups?.expiring7Days?.count || 0,
      urgent: true
    },
    {
      key: 'expiring30Days',
      label: '30 Days',
      icon: Clock,
      count: groups?.expiring30Days?.count || 0,
      badgeColor: 'text-amber-800 bg-amber-100'
    },
    {
      key: 'expired',
      label: 'Expired',
      icon: ShieldX,
      count: groups?.expired?.count || 0,
      badgeColor: 'text-rose-800 bg-rose-100'
    },
    {
      key: 'activeBeyond30Days',
      label: 'Active',
      icon: ShieldCheck,
      count: groups?.activeBeyond30Days?.count || 0,
      badgeColor: 'text-emerald-800 bg-emerald-100'
    },
    {
      key: 'noWarranty',
      label: 'No Warranty',
      icon: ShieldMinus,
      count: groups?.noWarranty?.count || 0,
      badgeColor: 'text-stone-700 bg-stone-100'
    },
  ];

  const renderGroupSection = (groupKey, groupData, badgeTheme) => {
    if (!groupData) return null;
    const items = groupData.items || [];

    return (
      <div key={groupKey} className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden mb-5">
        {/* Section Header */}
        <div className={`px-5 py-2.5 border-b border-stone-200 flex items-center justify-between ${badgeTheme.headerBg}`}>
          <div className="flex items-center gap-2">
            <badgeTheme.icon className={`w-4 h-4 ${badgeTheme.iconColor}`} />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              {groupData.label}
            </h2>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeTheme.countBadge}`}>
            {items.length}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-5 text-center text-xs text-stone-500">
            No items in this category.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {items.map((item) => (
              <div
                key={item._id}
                className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/70 transition-colors"
              >
                <div>
                  <Link
                    to={`/items/${item._id}`}
                    className="font-semibold text-xs text-stone-900 hover:text-emerald-800 transition-colors inline-block"
                  >
                    {item.name}
                  </Link>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {item.brand ? `${item.brand} • ` : ''}{item.category}
                    {item.purchasePrice ? ` • ₹${Number(item.purchasePrice).toFixed(2)}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <WarrantyBadge expiryDate={item.warrantyExpiry} size="sm" />
                  <Link
                    to={`/items/${item._id}`}
                    className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 px-2 py-1 rounded bg-white hover:bg-stone-50"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const groupThemes = {
    expiring7Days: {
      headerBg: 'bg-rose-50/80',
      icon: ShieldAlert,
      iconColor: 'text-rose-700',
      countBadge: 'bg-rose-200 text-rose-900',
    },
    expiring30Days: {
      headerBg: 'bg-amber-50/70',
      icon: Clock,
      iconColor: 'text-amber-700',
      countBadge: 'bg-amber-200 text-amber-900',
    },
    expired: {
      headerBg: 'bg-stone-100/70',
      icon: ShieldX,
      iconColor: 'text-stone-700',
      countBadge: 'bg-stone-200 text-stone-800',
    },
    activeBeyond30Days: {
      headerBg: 'bg-emerald-50/60',
      icon: ShieldCheck,
      iconColor: 'text-emerald-700',
      countBadge: 'bg-emerald-100 text-emerald-800',
    },
    noWarranty: {
      headerBg: 'bg-stone-50',
      icon: ShieldMinus,
      iconColor: 'text-stone-500',
      countBadge: 'bg-stone-200 text-stone-700',
    },
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900">
            Warranty Reminders
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchReminders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded hover:bg-stone-50 transition-colors"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {tabsConfig.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors shrink-0 ${
                isActive
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : t.badgeColor || 'bg-stone-200 text-stone-800'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-stone-200 p-8 text-center text-xs text-stone-500">
          Loading...
        </div>
      ) : !groups ? (
        <div className="text-center p-8 text-xs text-stone-500">No reminder data</div>
      ) : (
        <div>
          {(activeTab === 'all' || activeTab === 'expiring7Days') &&
            renderGroupSection('expiring7Days', groups.expiring7Days, groupThemes.expiring7Days)}

          {(activeTab === 'all' || activeTab === 'expiring30Days') &&
            renderGroupSection('expiring30Days', groups.expiring30Days, groupThemes.expiring30Days)}

          {(activeTab === 'all' || activeTab === 'expired') &&
            renderGroupSection('expired', groups.expired, groupThemes.expired)}

          {(activeTab === 'all' || activeTab === 'activeBeyond30Days') &&
            renderGroupSection('activeBeyond30Days', groups.activeBeyond30Days, groupThemes.activeBeyond30Days)}

          {(activeTab === 'all' || activeTab === 'noWarranty') &&
            renderGroupSection('noWarranty', groups.noWarranty, groupThemes.noWarranty)}
        </div>
      )}
    </div>
  );
}
