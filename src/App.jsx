import React, { useState, useEffect } from 'react';
import { 
  loadAllDashboardData, 
  computeDashboardMetrics, 
  computeYoYComparison,
  getAvailableProvinces 
} from './utils/dataHelper';
import ExecutiveSummary from './components/ExecutiveSummary';
import NetworkPerformance from './components/NetworkPerformance';
import ClinicalProgram from './components/ClinicalProgram';
import ClinicalAnalytics from './components/ClinicalAnalytics';
import CaseTracking from './components/CaseTracking';
import { 
  Database, 
  RefreshCw, 
  MapPin, 
  Calendar, 
  SlidersHorizontal,
  Layers,
  Network,
  Activity,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // Active Filters & Navigation State
  const [year, setYear] = useState('2568'); // default middle year
  const [province, setProvince] = useState('All');
  const [activeLevel, setActiveLevel] = useState('1'); // '1', '2', '3', '4', '5'
  
  // Data State
  const [allData, setAllData] = useState({ '2567': [], '2568': [], '2569': [] });
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Load data for all years
  const loadData = async (isManualSync = false) => {
    if (isManualSync) setSyncing(true);
    else setLoading(true);

    try {
      const data = await loadAllDashboardData((liveStatus) => {
        setIsLive(liveStatus);
      });
      setAllData(data);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  // Load all years data on startup
  useEffect(() => {
    loadData();
  }, []);

  // Sync / reload data
  const handleSync = () => {
    loadData(true);
  };

  // Handle local state update (e.g. marking a case as followed up in Level 5)
  const handleUpdateStatus = (hn) => {
    setAllData(prev => {
      const updatedYearData = prev[year].map(row => {
        if (row.hn === hn) {
          return { ...row, status: 'มาติดตามแล้ว' };
        }
        return row;
      });
      return {
        ...prev,
        [year]: updatedYearData
      };
    });
  };

  // Get data for currently selected year
  const currentYearData = allData[year] || [];

  // Compute metrics dynamically based on current data and selected province
  const computedMetrics = computeDashboardMetrics(currentYearData, province);
  
  // Compute YoY comparison metrics for the selected province
  const yoyData = computeYoYComparison(allData, province);
  
  // Get available provinces for filter select dropdown
  const availableProvinces = getAvailableProvinces(currentYearData);

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-title-section">
          <h1>
            <Activity size={24} style={{ color: 'var(--color-primary)' }} />
            Referral Clinical Dashboard
          </h1>
          <p>ระบบติดตามผลการคัดกรองและการเข้าสู่ระบบบริการแบบหมุนเวียน (Referral Loop) รายจังหวัด</p>
        </div>
        
        <div className="header-actions">
          {/* Connection Status Badge */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.775rem',
              fontWeight: 500,
              padding: '0.4rem 0.75rem',
              borderRadius: '20px',
              backgroundColor: isLive ? 'var(--color-green-light)' : 'var(--color-yellow-light)',
              color: isLive ? 'var(--color-green)' : 'var(--color-yellow)',
              border: `1px solid ${isLive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`
            }}
          >
            <Database size={12} />
            <span>{isLive ? 'Live: Google Sheet' : 'Offline: Local Database'}</span>
          </div>

          {/* Sync Button */}
          <button 
            onClick={handleSync} 
            className={`btn btn-secondary ${syncing ? 'btn-syncing' : ''}`}
            disabled={syncing}
          >
            <RefreshCw size={14} className={syncing ? 'spinner' : ''} />
            <span>{syncing ? 'กำลังซิงค์...' : 'ดึงข้อมูลล่าสุด'}</span>
          </button>
        </div>
      </header>

      {/* Filter and Settings Panel */}
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-card)',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
          <SlidersHorizontal size={14} />
          <span>ตัวกรองข้อมูล:</span>
        </div>

        {/* Year Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
          <div className="select-wrapper">
            <select 
              value={year} 
              onChange={(e) => {
                setYear(e.target.value);
                setProvince('All'); // Reset province on year change
              }}
              className="custom-select"
            >
              <option value="2567">ปีงบประมาณ 2567</option>
              <option value="2568">ปีงบประมาณ 2568</option>
              <option value="2569">ปีงบประมาณ 2569</option>
            </select>
          </div>
        </div>

        {/* Province Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
          <div className="select-wrapper">
            <select 
              value={province} 
              onChange={(e) => setProvince(e.target.value)}
              className="custom-select"
              disabled={loading}
            >
              <option value="All">ทุกจังหวัดทั้งหมด</option>
              {availableProvinces.filter(p => p !== 'All').map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Province Reset Indicator */}
        {province !== 'All' && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '6px' }}
            onClick={() => setProvince('All')}
          >
            ล้างตัวกรองจังหวัด (แสดงทั้งหมด)
          </button>
        )}
      </div>

      {/* Dashboard Level Navigation Tabs */}
      <nav className="tabs-navigation" style={{ maxWidth: '100%' }}>
        <button 
          className={`tab-btn ${activeLevel === '1' ? 'active' : ''}`}
          onClick={() => setActiveLevel('1')}
        >
          <Activity size={16} />
          Level 1: Summary
        </button>
        <button 
          className={`tab-btn ${activeLevel === '2' ? 'active' : ''}`}
          onClick={() => setActiveLevel('2')}
        >
          <Network size={16} />
          Level 2: Network
        </button>
        <button 
          className={`tab-btn ${activeLevel === '3' ? 'active' : ''}`}
          onClick={() => setActiveLevel('3')}
        >
          <Layers size={16} />
          Level 3: Program
        </button>
        <button 
          className={`tab-btn ${activeLevel === '4' ? 'active' : ''}`}
          onClick={() => setActiveLevel('4')}
        >
          <TrendingUp size={16} />
          Level 4: Analytics
        </button>
        <button 
          className={`tab-btn ${activeLevel === '5' ? 'active' : ''}`}
          onClick={() => setActiveLevel('5')}
        >
          <AlertCircle size={16} />
          Level 5: Tracking
        </button>
      </nav>

      {/* Loading Overlay */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderLeftColor: 'var(--color-primary)', borderWidth: '4px' }}></div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>กำลังโหลดและประมวลผลข้อมูล 3 ปีงบประมาณ...</p>
        </div>
      ) : (
        /* Main Dashboard Level Content */
        <main>
          {activeLevel === '1' && (
            <ExecutiveSummary 
              metrics={computedMetrics} 
              year={year} 
              province={province} 
            />
          )}

          {activeLevel === '2' && (
            <NetworkPerformance 
              provinceStats={computedMetrics.provinceStats} 
              onSelectProvince={setProvince} 
              activeProvince={province} 
            />
          )}

          {activeLevel === '3' && (
            <ClinicalProgram 
              clinicalProgramStats={computedMetrics.clinicalProgramStats} 
            />
          )}

          {activeLevel === '4' && (
            <ClinicalAnalytics 
              yoyData={yoyData} 
              advancedMetrics={computedMetrics.advanced} 
              province={province} 
            />
          )}

          {activeLevel === '5' && (
            <CaseTracking 
              data={currentYearData} 
              provinceFilter={province} 
              onUpdateStatus={handleUpdateStatus} 
            />
          )}
        </main>
      )}
    </div>
  );
}
