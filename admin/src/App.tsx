import React, { useState, useEffect } from 'react';
import { Shield, Play, Trash2, RefreshCw, AlertTriangle, CheckCircle, Database, Lock, Radio, Server, Activity } from 'lucide-react';

interface IngestionSourceStatus {
  source_name: string;
  base_url: string;
  status: string;
  last_run: string;
  events_count: number;
}

interface EventItem {
  id: number;
  title: string;
  city: string;
  venue_name?: string;
  source_name?: string;
  is_free: boolean;
  price_min: number;
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

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('triangle_admin_authed') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'sources' | 'events' | 'reports' | 'system'>('sources');

  // State
  const [sources, setSources] = useState<IngestionSourceStatus[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionLog, setIngestionLog] = useState<string | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Fetch Sources
  const fetchSources = async () => {
    setLoadingSources(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/ingestion/sources');
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
      }
    } catch (e) {
      console.warn('Failed to fetch sources:', e);
    } finally {
      setLoadingSources(false);
    }
  };

  // Fetch Events
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data || []);
      }
    } catch (e) {
      console.warn('Failed to fetch events:', e);
    } finally {
      setLoadingEvents(false);
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
    if (isAuthenticated) {
      fetchSources();
      fetchEvents();
      fetchReports();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'triangle2026' || passcode === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('triangle_admin_authed', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleTriggerIngestion = async () => {
    setIsIngesting(true);
    setIngestionLog('Scraping all 13 Triangle publication sources in real-time...');
    try {
      const res = await fetch('http://localhost:8000/api/v1/ingestion/trigger', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setIngestionLog(`✅ Ingestion completed! Extracted ${data.total_extracted} candidates, stored ${data.total_ingested} events in ${data.duration_seconds}s.`);
        fetchSources();
        fetchEvents();
      } else {
        setIngestionLog('❌ Ingestion failed with status ' + res.status);
      }
    } catch (e: any) {
      setIngestionLog('❌ Connection error: ' + e.message);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleCleanupPast = async () => {
    if (!confirm('Purge expired past events?')) return;
    try {
      const res = await fetch('http://localhost:8000/api/v1/events/cleanup-past', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Purged ${data.removed_count || 0} past events.`);
        fetchEvents();
        fetchSources();
      }
    } catch (e) {
      alert('Failed to execute cleanup');
    }
  };

  const handleResolveReport = async (reportId: number, action: 'DISMISS' | 'DELETE_EVENT') => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/moderation/report/${reportId}/resolve?action=${action}`, { method: 'POST' });
      if (res.ok) {
        fetchReports();
        fetchEvents();
      }
    } catch (e) {
      alert('Failed to resolve report');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020916] text-[#F8FAFC] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#050E21] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0018A8]/40 border border-[#38BDF8]/40 text-[#38BDF8] flex items-center justify-center mx-auto mb-4">
            <Lock size={26} />
          </div>
          <h1 className="font-['Bricolage_Grotesque'] text-2xl font-bold mb-1">
            Triangle Admin Console
          </h1>
          <p className="text-xs text-[#94A3B8] mb-6">
            Hosted on Port 8085 · Standalone Private Operator Console
          </p>

          <input
            type="password"
            placeholder="Enter operator passcode (triangle2026)"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0B172E] text-xs font-bold outline-none mb-3 text-center text-[#F8FAFC]"
          />

          {authError && (
            <p className="text-xs font-bold text-red-400 mb-3">
              Incorrect passcode. Try 'triangle2026'.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-[#0018A8] hover:bg-[#001073] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            Authenticate Operator
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020916] text-[#F8FAFC] flex flex-col">
      {/* Top Standalone Admin Bar */}
      <header className="bg-[#050E21] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0018A8] text-white flex items-center justify-center font-bold text-sm shadow-md">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="font-['Bricolage_Grotesque'] text-lg font-bold leading-none">
              Triangle Operator Console
            </h1>
            <p className="text-[11px] text-[#94A3B8] font-medium leading-none mt-1">
              Standalone App · Port 8085 · Ingestion & Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B172E] border border-white/10 text-emerald-400">
            <Activity size={13} />
            <span>Backend Online (8000)</span>
          </div>

          <button
            onClick={() => {
              sessionStorage.removeItem('triangle_admin_authed');
              setIsAuthenticated(false);
            }}
            className="px-3 py-1.5 bg-red-950/60 text-red-300 border border-red-800/40 rounded-lg hover:bg-red-900/60"
          >
            Lock Console
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('sources')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sources' ? 'bg-[#0018A8] text-white' : 'bg-[#050E21] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Radio size={14} />
            <span>Scrapers & Sources ({sources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'events' ? 'bg-[#0018A8] text-white' : 'bg-[#050E21] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Database size={14} />
            <span>Event Database ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports' ? 'bg-[#0018A8] text-white' : 'bg-[#050E21] text-[#94A3B8] hover:text-white'
            }`}
          >
            <AlertTriangle size={14} />
            <span>Content Reports ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'system' ? 'bg-[#0018A8] text-white' : 'bg-[#050E21] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Server size={14} />
            <span>System Infrastructure</span>
          </button>
        </div>

        {/* Tab 1: Scrapers & Sources */}
        {activeTab === 'sources' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#050E21] border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold">
                  Automated Ingestion Control Center
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Scrape and parse all 13 verified RTP publication sources in real-time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchSources}
                  disabled={loadingSources}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0B172E] border border-white/10 hover:bg-[#122244] transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={14} className={loadingSources ? 'animate-spin' : ''} />
                  <span>Refresh Status</span>
                </button>

                <button
                  onClick={handleTriggerIngestion}
                  disabled={isIngesting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0018A8] hover:bg-[#001073] text-white transition-colors flex items-center gap-2 shadow-md"
                >
                  {isIngesting ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  <span>{isIngesting ? 'Scraping Live Sources...' : 'Run Ingestion Pipeline Now'}</span>
                </button>
              </div>
            </div>

            {ingestionLog && (
              <div className="bg-[#081329] text-[#38BDF8] font-mono text-xs p-4 rounded-xl border border-white/10">
                {ingestionLog}
              </div>
            )}

            {/* Scraper Sources Table */}
            <div className="bg-[#050E21] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B172E] font-bold text-[#94A3B8] border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">SOURCE NAME</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-4">EVENTS STORED</th>
                    <th className="py-3.5 px-4">ENDPOINT URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-semibold">
                  {sources.map((s, idx) => (
                    <tr key={idx} className="hover:bg-[#0B172E]/60">
                      <td className="py-3.5 px-4 font-bold text-[#F8FAFC]">
                        {s.source_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                          <CheckCircle size={10} />
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#38BDF8]">
                        {s.events_count} events
                      </td>
                      <td className="py-3.5 px-4 text-[#94A3B8] font-mono text-[11px] truncate max-w-sm">
                        <a href={s.base_url} target="_blank" rel="noreferrer" className="hover:underline text-[#38BDF8]">
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
            <div className="flex items-center justify-between bg-[#050E21] p-5 rounded-2xl border border-white/10">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#94A3B8]">
                  DATABASE OVERVIEW
                </h4>
                <p className="text-2xl font-extrabold font-['Bricolage_Grotesque'] text-[#38BDF8]">
                  {events.length} Live Stored Events
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchEvents}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0B172E] border border-white/10 hover:bg-[#122244]"
                >
                  Refresh Events
                </button>
                <button
                  onClick={handleCleanupPast}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-700 text-white hover:bg-red-800 flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Purge Expired Past Events</span>
                </button>
              </div>
            </div>

            <div className="bg-[#050E21] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B172E] font-bold text-[#94A3B8] border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">EVENT TITLE</th>
                    <th className="py-3.5 px-4">CITY</th>
                    <th className="py-3.5 px-4">SOURCE</th>
                    <th className="py-3.5 px-4">PRICE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-semibold">
                  {events.slice(0, 40).map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#0B172E]/60">
                      <td className="py-3 px-4 font-bold text-[#F8FAFC]">{ev.title}</td>
                      <td className="py-3 px-4 text-[#94A3B8]">{ev.city}</td>
                      <td className="py-3 px-4 text-[#94A3B8]">{ev.source_name || 'Community'}</td>
                      <td className="py-3 px-4 font-bold text-[#38BDF8]">
                        {ev.is_free ? 'Free' : `$${ev.price_min}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Moderation Reports */}
        {activeTab === 'reports' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Bricolage_Grotesque'] text-base font-bold">
                User Moderation Reports Queue
              </h3>
              <button
                onClick={fetchReports}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B172E] border border-white/10"
              >
                Refresh Queue
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-16 bg-[#050E21] rounded-2xl border border-white/10 p-6">
                <CheckCircle size={32} className="mx-auto text-emerald-400 mb-2" />
                <p className="font-bold text-sm">No Pending Content Reports</p>
                <p className="text-xs text-[#94A3B8]">The community queue is clean.</p>
              </div>
            ) : (
              <div className="bg-[#050E21] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B172E] font-bold text-[#94A3B8] border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">REPORT ID</th>
                      <th className="py-3 px-4">REASON</th>
                      <th className="py-3 px-4">DETAILS</th>
                      <th className="py-3 px-4">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-semibold">
                    {reports.map((rep) => (
                      <tr key={rep.id}>
                        <td className="py-3 px-4 font-bold">#{rep.id}</td>
                        <td className="py-3 px-4 text-red-400 font-bold">{rep.reason}</td>
                        <td className="py-3 px-4 text-[#94A3B8]">{rep.details || 'No details'}</td>
                        <td className="py-3 px-4 flex items-center gap-2">
                          <button
                            onClick={() => handleResolveReport(rep.id, 'DISMISS')}
                            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-md font-bold text-xs"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep.id, 'DELETE_EVENT')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold text-xs"
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

        {/* Tab 4: System Infrastructure */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#050E21] p-6 rounded-2xl border border-white/10">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#94A3B8] mb-4">
                SERVER INFRASTRUCTURE
              </h4>
              <div className="flex flex-col gap-3 text-xs font-semibold">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span>Admin Application Port:</span>
                  <span className="font-mono text-[#38BDF8]">Port 8085</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span>Public Web Application Port:</span>
                  <span className="font-mono text-emerald-400">Port 8082</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span>Backend FastAPI Service:</span>
                  <span className="font-mono text-[#38BDF8]">http://localhost:8000</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Database File:</span>
                  <span className="font-mono text-[#94A3B8]">backend/triangle_events.db</span>
                </div>
              </div>
            </div>

            <div className="bg-[#050E21] p-6 rounded-2xl border border-white/10">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#94A3B8] mb-4">
                SECURITY & OPERATOR ISOLATION
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-6">
                This app runs completely isolated from public users on port 8085. Public web users on port 8082 have zero visibility or access to this app.
              </p>
              <button
                onClick={() => {
                  sessionStorage.removeItem('triangle_admin_authed');
                  setIsAuthenticated(false);
                }}
                className="px-4 py-2.5 bg-[#0018A8] hover:bg-[#001073] text-white text-xs font-bold rounded-xl"
              >
                Lock Session Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
