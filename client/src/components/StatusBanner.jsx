import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function StatusBanner() {
  const { dbStatus, checkDb } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const handleReconnect = async () => {
    setRetrying(true);
    try {
      await api.health.reconnect();
      await checkDb();
    } catch (err) {
      console.error('Reconnect failed', err);
    } finally {
      setRetrying(false);
    }
  };

  if (dbStatus.isConnected) {
    return null; // When connected, do not clutter the UI with persistent banners
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Database connection error. {dbStatus.error || 'Unable to connect to database.'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleReconnect}
          disabled={retrying}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-900 text-amber-50 rounded hover:bg-amber-950 transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} />
          {retrying ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    </div>
  );
}
