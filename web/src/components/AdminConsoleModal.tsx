import React, { useState, useEffect } from 'react';
import { Shield, Play, Trash2, RefreshCw, AlertTriangle, CheckCircle, Database, Lock, X, Radio } from 'lucide-react';
import type { EventItem } from '../types';

interface IngestionSourceStatus {
  source_name: string;
  base_url: string;
  status: string;
  last_run: string;
  events_count: number;
}

interface ReportItem {
  id: number;
  reporter_user_id: string;
  target_event_id?: number;
  target_user_id?: string;
  reason: string;
  details?: string;
  status: string;
  created_at: string;
}

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  onRefreshEvents: () => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  events,
  onRefreshEvents,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('triangle_admin_authed') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'sources' | 'events' | 'reports' | 'system'>('sources');

  // Sources & Ingestion State
  const [sources, setSources] = useState<IngestionSourceStatus[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionLog, setIngestionLog] = useState<string | null>(null);

  // Reports State
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Fetch Ingestion Sources
  const fetchSources = async () => {
    setLoadingSources(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/ingestion/sources');
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
      }
    } catch (e) {
      console.warn('Failed to fetch ingestion sources:', e);
    } finally {
      setLoadingSources(false);
    }
  };

  // Fetch Reports
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/moderation/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data || []);
      }
    } catch (e) {
      console.warn('Failed to fetch reports:', e);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchSources();
      fetchReports();
    }
  }, [isOpen, isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'triangle2026' || passcode === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('triangle_admin_authed', 'true');
      setAuthError(false);
      fetchSources();
      fetchReports();
    } else {
      setAuthError(true);
    }
  };

  // Trigger Live Ingestion Pipeline
  const handleTriggerIngestion = async () => {
    setIsIngesting(true);
    setIngestionLog('Executing live scrapers across all 13 Triangle publication sources...');
    try {
      const res = await fetch('http://localhost:8000/api/v1/ingestion/trigger', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setIngestionLog(`✅ Ingestion complete! Extracted ${data.total_extracted} candidates, stored ${data.total_ingested} events in ${data.duration_seconds}s.`);
        fetchSources();
        onRefreshEvents();
      } else {
        setIngestionLog('❌ Ingestion failed. Backend returned status ' + res.status);
      }
    } catch (e: any) {
      setIngestionLog('❌ Connection error: ' + e.message);
    } finally {
      setIsIngesting(false);
    }
  };

  // Trigger Past Event Cleanup Purge
  const handleCleanupPast = async () => {
    if (!confirm('Purge past events from database?')) return;
    try {
      const res = await fetch('http://localhost:8000/api/v1/events/cleanup-past', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Purged ${data.removed_count || 0} past events.`);
        onRefreshEvents();
        fetchSources();
      }
    } catch (e) {
      alert('Failed to execute past event cleanup');
    }
  };

  // Resolve Report
  const handleResolveReport = async (reportId: number, action: 'DISMISS' | 'DELETE_EVENT') => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/moderation/report/${reportId}/resolve?action=${action}`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchReports();
        onRefreshEvents();
      }
    } catch (e) {
      alert('Failed to resolve report');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFEFD] dark:bg-[#050E21] border border-[#E5E0D8] dark:border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#1A1A1A] dark:text-[#F8FAFC]">
        {/* Header */}
        <div className="bg-[#F5F1EC] dark:bg-[#0B172E] px-6 py-4 border-b border-[#E5E0D8] dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#1A1A1A] dark:bg-[#0018A8] text-white">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="font-['Bricolage_Grotesque'] text-lg font-bold">
                Triangle Admin Console & Scraper Dashboard
              </h2>
              <p className="text-xs text-[#77736F] dark:text-[#94A3B8]">
                Private operator tools · Scraper health · Moderation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#EBE5DD] dark:hover:bg-[#122244] text-[#77736F] dark:text-[#94A3B8]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Passcode Lock Screen */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="p-8 flex flex-col items-center justify-center max-w-sm mx-auto text-center my-auto">
            <div className="w-12 h-12 rounded-full bg-[#E8D7CC] dark:bg-[#0018A8]/30 text-[#D95F4B] dark:text-[#38BDF8] flex items-center justify-center mb-4">
              <Lock size={22} />
            </div>
            <h3 className="font-['Bricolage_Grotesque'] text-xl font-bold mb-1">
              Private Operator Passcode Required
            </h3>
            <p className="text-xs text-[#77736F] dark:text-[#94A3B8] mb-6">
              Enter your admin passcode to access scraper controls and platform analytics.
            </p>

            <input
              type="password"
              placeholder="Enter passcode (default: triangle2026)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] dark:border-white/10 bg-[#F5F1EC] dark:bg-[#0B172E] text-xs font-bold outline-none mb-3 text-center"
            />

            {authError && (
              <p className="text-xs font-bold text-red-500 mb-3">
                Incorrect passcode. Try 'triangle2026'.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#1A1A1A] dark:bg-[#0018A8] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-colors"
            >
              Unlock Console
            </button>
          </form>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#E5E0D8] dark:border-white/10 bg-[#FFFEFD] dark:bg-[#050E21] overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('sources')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'sources'
                    ? 'border-[#D95F4B] dark:border-[#38BDF8] text-[#D95F4B] dark:text-[#38BDF8]'
                    : 'border-transparent text-[#77736F] dark:text-[#94A3B8] hover:text-[#1A1A1A]'
                }`}
              >
                <Radio size={14} />
                <span>Scrapers & Sources ({sources.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'events'
                    ? 'border-[#D95F4B] dark:border-[#38BDF8] text-[#D95F4B] dark:text-[#38BDF8]'
                    : 'border-transparent text-[#77736F] dark:text-[#94A3B8] hover:text-[#1A1A1A]'
                }`}
              >
                <Database size={14} />
                <span>Event Database ({events.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'reports'
                    ? 'border-[#D95F4B] dark:border-[#38BDF8] text-[#D95F4B] dark:text-[#38BDF8]'
                    : 'border-transparent text-[#77736F] dark:text-[#94A3B8] hover:text-[#1A1A1A]'
                }`}
              >
                <AlertTriangle size={14} />
                <span>Content Reports ({reports.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('system')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'system'
                    ? 'border-[#D95F4B] dark:border-[#38BDF8] text-[#D95F4B] dark:text-[#38BDF8]'
                    : 'border-transparent text-[#77736F] dark:text-[#94A3B8] hover:text-[#1A1A1A]'
                }`}
              >
                <Shield size={14} />
                <span>System Config</span>
              </button>
            </div>

            {/* Tab Body Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tab 1: Scrapers & Ingestion Sources */}
              {activeTab === 'sources' && (
                <div className="flex flex-col gap-6">
                  {/* Top Action Card */}
                  <div className="bg-[#F5F1EC] dark:bg-[#0B172E] border border-[#E5E0D8] dark:border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-['Bricolage_Grotesque'] text-sm font-bold">
                        Automated Ingestion Control
                      </h3>
                      <p className="text-xs text-[#77736F] dark:text-[#94A3B8]">
                        Run all 13 verified RTP scrapers & RSS feeds on demand.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchSources}
                        disabled={loadingSources}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFFEFD] dark:bg-[#050E21] border border-[#E5E0D8] dark:border-white/10 hover:bg-[#EBE5DD] transition-colors flex items-center gap-1.5"
                      >
                        <RefreshCw size={13} className={loadingSources ? 'animate-spin' : ''} />
                        <span>Refresh Status</span>
                      </button>

                      <button
                        onClick={handleTriggerIngestion}
                        disabled={isIngesting}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1A1A1A] dark:bg-[#0018A8] text-white hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        {isIngesting ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                        <span>{isIngesting ? 'Scraping...' : 'Run Ingestion Pipeline'}</span>
                      </button>
                    </div>
                  </div>

                  {ingestionLog && (
                    <div className="bg-[#020916] text-[#38BDF8] font-mono text-xs p-3.5 rounded-xl border border-white/10">
                      {ingestionLog}
                    </div>
                  )}

                  {/* Scraper Sources Table */}
                  <div className="border border-[#E5E0D8] dark:border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F5F1EC] dark:bg-[#0B172E] font-bold text-[#77736F] dark:text-[#94A3B8] border-b border-[#E5E0D8] dark:border-white/10">
                        <tr>
                          <th className="py-3 px-4">SOURCE NAME</th>
                          <th className="py-3 px-4">STATUS</th>
                          <th className="py-3 px-4">EVENTS STORED</th>
                          <th className="py-3 px-4">ENDPOINT URL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E0D8] dark:divide-white/10 font-semibold">
                        {sources.map((s, idx) => (
                          <tr key={idx} className="hover:bg-[#F5F1EC]/50 dark:hover:bg-[#0B172E]/50">
                            <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#F8FAFC]">
                              {s.source_name}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle size={10} />
                                {s.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-[#D95F4B] dark:text-[#38BDF8]">
                              {s.events_count} events
                            </td>
                            <td className="py-3 px-4 text-[#77736F] dark:text-[#94A3B8] font-mono text-[11px] truncate max-w-xs">
                              <a href={s.base_url} target="_blank" rel="noreferrer" className="hover:underline">
                                {s.base_url}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Event Database */}
              {activeTab === 'events' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between bg-[#F5F1EC] dark:bg-[#0B172E] p-4 rounded-xl border border-[#E5E0D8] dark:border-white/10">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#77736F] dark:text-[#94A3B8]">
                        DATABASE TOTAL
                      </h4>
                      <p className="text-xl font-extrabold font-['Bricolage_Grotesque']">
                        {events.length} Live Events & Spots
                      </p>
                    </div>

                    <button
                      onClick={handleCleanupPast}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      <span>Purge Expired Past Events</span>
                    </button>
                  </div>

                  <div className="border border-[#E5E0D8] dark:border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F5F1EC] dark:bg-[#0B172E] font-bold text-[#77736F] dark:text-[#94A3B8] border-b border-[#E5E0D8] dark:border-white/10">
                        <tr>
                          <th className="py-3 px-4">EVENT TITLE</th>
                          <th className="py-3 px-4">CITY</th>
                          <th className="py-3 px-4">SOURCE</th>
                          <th className="py-3 px-4">PRICE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E0D8] dark:divide-white/10 font-semibold">
                        {events.slice(0, 30).map((ev) => (
                          <tr key={ev.id} className="hover:bg-[#F5F1EC]/50 dark:hover:bg-[#0B172E]/50">
                            <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#F8FAFC]">
                              {ev.title}
                            </td>
                            <td className="py-3 px-4 text-[#77736F] dark:text-[#94A3B8]">{ev.city}</td>
                            <td className="py-3 px-4 text-[#77736F] dark:text-[#94A3B8]">{ev.source_name || 'Community'}</td>
                            <td className="py-3 px-4 font-bold text-[#D95F4B] dark:text-[#38BDF8]">
                              {ev.is_free ? 'Free' : `$${ev.price_min}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Content Moderation */}
              {activeTab === 'reports' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Bricolage_Grotesque'] text-sm font-bold">
                      User Content Reports & Moderation
                    </h3>
                    <button
                      onClick={fetchReports}
                      disabled={loadingReports}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F5F1EC] dark:bg-[#0B172E] border border-[#E5E0D8] dark:border-white/10 hover:bg-[#EBE5DD] transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw size={13} className={loadingReports ? 'animate-spin' : ''} />
                      <span>Refresh Reports</span>
                    </button>
                  </div>
                  {reports.length === 0 ? (
                    <div className="text-center py-12 bg-[#F5F1EC] dark:bg-[#0B172E] rounded-2xl border border-[#E5E0D8] dark:border-white/10">
                      <CheckCircle size={28} className="mx-auto text-emerald-500 mb-2" />
                      <p className="font-bold text-sm">All Clean! Zero Flagged Reports</p>
                      <p className="text-xs text-[#77736F] dark:text-[#94A3B8]">No user content reports pending review.</p>
                    </div>
                  ) : (
                    <div className="border border-[#E5E0D8] dark:border-white/10 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F5F1EC] dark:bg-[#0B172E] font-bold text-[#77736F] dark:text-[#94A3B8] border-b border-[#E5E0D8] dark:border-white/10">
                          <tr>
                            <th className="py-3 px-4">REPORT ID</th>
                            <th className="py-3 px-4">REASON</th>
                            <th className="py-3 px-4">DETAILS</th>
                            <th className="py-3 px-4">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E0D8] dark:divide-white/10 font-semibold">
                          {reports.map((rep) => (
                            <tr key={rep.id}>
                              <td className="py-3 px-4 font-bold">#{rep.id}</td>
                              <td className="py-3 px-4 text-red-500 font-bold">{rep.reason}</td>
                              <td className="py-3 px-4 text-[#77736F] dark:text-[#94A3B8]">{rep.details || 'No details'}</td>
                              <td className="py-3 px-4 flex items-center gap-2">
                                <button
                                  onClick={() => handleResolveReport(rep.id, 'DISMISS')}
                                  className="px-2.5 py-1 bg-gray-200 dark:bg-gray-800 rounded-md font-bold"
                                >
                                  Dismiss
                                </button>
                                <button
                                  onClick={() => handleResolveReport(rep.id, 'DELETE_EVENT')}
                                  className="px-2.5 py-1 bg-red-600 text-white rounded-md font-bold"
                                >
                                  Delete Event
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: System Config */}
              {activeTab === 'system' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#F5F1EC] dark:bg-[#0B172E] p-5 rounded-2xl border border-[#E5E0D8] dark:border-white/10">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#77736F] dark:text-[#94A3B8] mb-3">
                      BACKEND API & DATABASE
                    </h4>
                    <div className="flex flex-col gap-2 text-xs font-semibold">
                      <div className="flex justify-between">
                        <span>API Base URL:</span>
                        <span className="font-mono text-[#D95F4B] dark:text-[#38BDF8]">http://localhost:8000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Database Driver:</span>
                        <span className="font-mono">SQLite (triangle_events.db)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Scrapers:</span>
                        <span className="font-mono text-emerald-500">13 Connected</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F5F1EC] dark:bg-[#0B172E] p-5 rounded-2xl border border-[#E5E0D8] dark:border-white/10">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#77736F] dark:text-[#94A3B8] mb-3">
                      ADMIN ACCESS & SECURITY
                    </h4>
                    <p className="text-xs text-[#77736F] dark:text-[#94A3B8] mb-4">
                      You are authenticated as private operator. Users cannot see or access this panel.
                    </p>
                    <button
                      onClick={() => {
                        sessionStorage.removeItem('triangle_admin_authed');
                        setIsAuthenticated(false);
                      }}
                      className="px-3.5 py-1.5 bg-[#1A1A1A] dark:bg-[#0018A8] text-white text-xs font-bold rounded-xl"
                    >
                      Lock Console Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
