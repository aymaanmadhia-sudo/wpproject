import React from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen, Plus } from 'lucide-react';

export default function EmptyState({
  title = 'No items found',
  description = 'No items have been added yet.',
  actionLabel = 'Add Item',
  actionLink = '/items/add',
  icon: Icon = PackageOpen,
  onAction
}) {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-stone-300 rounded-lg bg-stone-50/60 max-w-xl mx-auto my-6">
      <div className="w-10 h-10 rounded-full bg-stone-200/80 text-stone-600 mx-auto flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-stone-800 text-sm mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-800 rounded-md hover:bg-emerald-900 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      ) : actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-800 rounded-md hover:bg-emerald-900 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
