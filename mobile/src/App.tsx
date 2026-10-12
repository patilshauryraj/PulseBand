import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Home, TrendingUp, Activity, Cpu, Settings, HeartPulse, Zap } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TrendsScreen } from './screens/TrendsScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { DeviceScreen } from './screens/DeviceScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TopBar } from './components/TopBar';
import { ProfileModal } from './components/ProfileModal';
import { FallAlertModal } from './components/FallAlertModal';
import { AnomalyEvent, AnomalyType } from './types';

type Tab = 'home' | 'trends' | 'insights' | 'activity' | 'device' | 'settings';

const ANOMALY_CATALOG: AnomalyType[] = [
  {
    label: "Atypical Tachycardia-like Spike",
    detail: "A brief, sharp pulse elevation was detected outside the patient's resting baseline corridor.",
    severity: "high"
  },
  {
    label: "Irregular Inter-Beat Interval (rMSSD Variance)",
    detail: "Consecutive pulse arrival intervals exhibited elevated beat-to-beat variability flagging possible arrhythmia.",
    severity: "medium"
  },
  {
    label: "Photoplethysmogram Signal Dropout",
    detail: "PPG signal amplitude dropped temporarily due to wrist movement or sensor displacement.",
    severity: "low"
  },
  {
    label: "Nocturnal Bradycardia Dip",
    detail: "A transient pulse decrease below baseline was recorded during a resting observation interval.",
    severity: "medium"
  }
];

function MainApp() {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [now, setNow] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFallModalOpen, setIsFallModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Maintain list of detected anomalies
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(() => {
    const current = Date.now();
    return [
      {
        id: "seed-1",
        type: ANOMALY_CATALOG[0],
        time: new Date(current - 22 * 60000),
        bpm: 114,
        confidence: 89,
        quality: 91
      },
      {
        id: "seed-2",
        type: ANOMALY_CATALOG[1],
        time: new Date(current - 75 * 60000),
        bpm: 86,
        confidence: 78,
        quality: 84
      },
      {
        id: "seed-3",
        type: ANOMALY_CATALOG[2],
        time: new Date(current - 190 * 60000),
        bpm: 62,
        confidence: 65,
        quality: 58
      }
    ];
  });

  const nextId = useRef(4);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Run on-demand ML analysis
  const handleTriggerAnalysis = useCallback(() => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const randomType = ANOMALY_CATALOG[Math.floor(Math.random() * ANOMALY_CATALOG.length)];
      const newEvent: AnomalyEvent = {
        id: `anom-${nextId.current++}`,
        type: randomType,
        time: new Date(),
        bpm: Math.floor(Math.random() * 40 + 80),
        confidence: Math.floor(Math.random() * 30 + 68),
        quality: Math.floor(Math.random() * 20 + 78)
      };
      setAnomalies(prev => [newEvent, ...prev].slice(0, 15));
    }, 1400);
  }, [isAnalyzing]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#04060A] text-[#EEF2F9] flex flex-col font-sans select-none antialiased">
      {/* Container wrapper for mobile frame */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#080B12] border-x border-[#1A263C] relative shadow-2xl">
        {/* Sticky Unified Top Bar */}
        <TopBar
          now={now}
          connected={true}
          battery={85}
          isSimulated={isSimulated}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Scrollable Screen Content */}
        <main className="flex-1 pb-20 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeScreen
              isSimulated={isSimulated}
              onNavigateToTab={(t) => setActiveTab(t as Tab)}
              onTriggerFallModal={() => setIsFallModalOpen(true)}
              anomalies={anomalies}
            />
          )}

          {activeTab === 'trends' && (
            <TrendsScreen
              onNavigateToInsights={() => setActiveTab('insights')}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsScreen
              anomalies={anomalies}
              onTriggerAnalysis={handleTriggerAnalysis}
              isAnalyzing={isAnalyzing}
            />
          )}

          {activeTab === 'activity' && <ActivityScreen />}

          {activeTab === 'device' && <DeviceScreen />}

          {activeTab === 'settings' && (
            <SettingsScreen
              isSimulated={isSimulated}
              setIsSimulated={setIsSimulated}
              onOpenProfile={() => setIsProfileOpen(true)}
              onLogoutConfirm={() => {
                setIsProfileOpen(false);
                logout();
              }}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#080B12]/95 backdrop-blur-xl border-t border-[#1A263C] flex justify-around items-center py-2 px-1 z-40">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 p-1.5 transition ${
              activeTab === 'home' ? 'text-[#3EE8D3] scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.3 : 1.8} />
            <span className="text-[10px] font-semibold">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex flex-col items-center gap-1 p-1.5 transition ${
              activeTab === 'trends' ? 'text-[#3EE8D3] scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-5 h-5" strokeWidth={activeTab === 'trends' ? 2.3 : 1.8} />
            <span className="text-[10px] font-semibold">Trends</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex flex-col items-center gap-1 p-1.5 transition ${
              activeTab === 'insights' ? 'text-amber-400 scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-5 h-5" strokeWidth={activeTab === 'insights' ? 2.3 : 1.8} />
            <span className="text-[10px] font-semibold">Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex flex-col items-center gap-1 p-1.5 transition ${
              activeTab === 'activity' ? 'text-emerald-400 scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-5 h-5" strokeWidth={activeTab === 'activity' ? 2.3 : 1.8} />
            <span className="text-[10px] font-semibold">Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('device')}
            className={`flex flex-col items-center gap-1 p-1.5 transition ${
              activeTab === 'device' ? 'text-sky-400 scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-5 h-5" strokeWidth={activeTab === 'device' ? 2.3 : 1.8} />
            <span className="text-[10px] font-semibold">Device</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 p-1.5 transition ${
              activeTab === 'settings' ? 'text-slate-100 scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-5 h-5" strokeWidth={activeTab === 'settings' ? 2.3 : 1.8} />
            <span className="text-[10px] font-semibold">Settings</span>
          </button>
        </nav>

        {/* User Profile Drawer/Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onLogoutConfirm={() => {
            setIsProfileOpen(false);
            logout();
          }}
        />

        {/* Emergency Fall Alert Countdown Modal */}
        <FallAlertModal
          isOpen={isFallModalOpen}
          onClose={() => setIsFallModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}