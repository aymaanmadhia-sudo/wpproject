import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, ShieldMinus } from 'lucide-react';

export const getWarrantyStatus = (warrantyExpiry) => {
  if (!warrantyExpiry) {
    return {
      status: 'none',
      label: 'No warranty',
      daysLeft: null,
      color: 'bg-stone-100 text-stone-700 border-stone-200',
      icon: ShieldMinus
    };
  }

  const expiry = new Date(warrantyExpiry);
  const now = new Date();
  
  const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = expiryDay - nowDay;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: 'expired',
      label: 'Expired',
      daysLeft,
      color: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: ShieldX
    };
  }

  if (daysLeft === 0) {
    return {
      status: 'expiring_urgent',
      label: 'Expires today',
      daysLeft,
      color: 'bg-amber-100 text-amber-900 border-amber-300 font-medium',
      icon: ShieldAlert
    };
  }

  if (daysLeft <= 7) {
    return {
      status: 'expiring_urgent',
      label: `${daysLeft}d left`,
      daysLeft,
      color: 'bg-amber-100 text-amber-900 border-amber-300 font-medium',
      icon: ShieldAlert
    };
  }

  if (daysLeft <= 30) {
    return {
      status: 'expiring_soon',
      label: `${daysLeft}d left`,
      daysLeft,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: ShieldAlert
    };
  }

  return {
    status: 'active',
    label: 'Active',
    daysLeft,
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: ShieldCheck
  };
};

export default function WarrantyBadge({ expiryDate, size = 'sm' }) {
  const info = getWarrantyStatus(expiryDate);
  const Icon = info.icon;

  const sizeClasses = size === 'xs' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'md' 
    ? 'text-sm px-3 py-1' 
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${info.color} ${sizeClasses} whitespace-nowrap`}
    >
      <Icon className={size === 'md' ? 'w-4 h-4 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span>{info.label}</span>
    </span>
  );
}
