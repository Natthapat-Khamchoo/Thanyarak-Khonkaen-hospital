import React, { useState, useEffect } from 'react';
import { 
  loadAllDashboardData, 
  computeDashboardMetrics, 
  computeYoYComparison,
  getAvailableProvinces 
} from './utils/dataHelper';
import ExecutiveSummary from './components/ExecutiveSummary';
import OperationalPatientJourney from './components/OperationalPatientJourney';
import DiagnosticQualityHA from './components/DiagnosticQualityHA';
import HALearningAndAIAlert from './components/HALearningAndAIAlert';
import SubstanceAnalytics from './components/SubstanceAnalytics';
import ReferralDestinationChart from './components/ReferralDestinationChart';
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
  AlertCircle,
  Pill,
  Building2,
  Award,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function App() {
  // Active Filters & Navigation State
  const [year, setYear] = useState('2568'); // default year
  const [province, setProvince] = useState('All');
  const [activeLevel, setActiveLevel] = useState('1'); // '1' to '7'
  
  // Data State
  const [allData, setAllData] = useState({ '2566': [], '2567': [], '2568': [], '2569': [] });
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

  // Handle local state update
  const handleUpdateStatus = (hn) => {
    setAllData(prev => {
      const updatedYearData = (prev[year] || []).map(row => {
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
      {/* Top Header with SMART Referral Intelligence Branding */}
      <header className="app-header" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)'
      }}>
        <div className="header-title-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Zap size={26} color="#38bdf8" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'white', letterSpacing: '-0.02em' }}>
              SMART Referral Intelligence Dashboard
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: 'rgba(56, 189, 248, 0.2)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.4)'
            }}>
              HA Re-accreditation Edition
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: 500 }}>
            "From Referral to Recovery" — รับส่งต่ออย่างไร้รอยต่อ ขับเคลื่อนด้วยข้อมูล พัฒนาคุณภาพด้วยการเรียนรู้ (โรงพยาบาลธัญญารักษ์ขอนแก่น)
          </p>
        </div>
        
        <div className="header-actions">
          {/* Connection Status Badge */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.775rem',
              fontWeight: 600,
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              backgroundColor: isLive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: isLive ? '#34d399' : '#fbbf24',
              border: `1px solid ${isLive ? 'rgba(52, 211, 153, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`
            }}
          >
            <Database size={13} />
            <span>{isLive ? 'Live: Google Sheet' : 'Offline: Local Database'}</span>
          </div>

          {/* Sync Button */}
          <button 
            onClick={handleSync} 
            className={`btn btn-secondary ${syncing ? 'btn-syncing' : ''}`}
            disabled={syncing}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <RefreshCw size={14} className={syncing ? 'spinner' : ''} />
            <span>{syncing ? 'กำลังซิงค์...' : 'ดึงข้อมูลล่าสุด'}</span>
          </button>
        </div>
      </header>

      {/* Filter Panel */}
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
          marginBottom: '1.5rem',
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
                setProvince('All');
              }}
              className="custom-select"
            >
              <option value="2566">ปีงบประมาณ 2566</option>
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

        {/* Province Reset */}
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

      {/* Navigation Tabs - 4 Core HA Master Levels */}
      <nav className="tabs-navigation" style={{ maxWidth: '100%', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button 
          className={`tab-btn ${activeLevel === '1' ? 'active' : ''}`}
          onClick={() => setActiveLevel('1')}
        >
          <Activity size={16} />
          Level 1: Executive Dashboard (ผู้บริหาร)
        </button>
        <button 
          className={`tab-btn ${activeLevel === '2' ? 'active' : ''}`}
          onClick={() => setActiveLevel('2')}
        >
          <Network size={16} />
          Level 2: Operational & Patient Journey
        </button>
        <button 
          className={`tab-btn ${activeLevel === '3' ? 'active' : ''}`}
          onClick={() => setActiveLevel('3')}
        >
          <Award size={16} />
          Level 3: Diagnostic Quality (HA ⭐⭐)
        </button>
        <button 
          className={`tab-btn ${activeLevel === '4' ? 'active' : ''}`}
          onClick={() => setActiveLevel('4')}
        >
          <ShieldCheck size={16} />
          Level 4: HA Learning & AI Alert (HA ⭐⭐⭐)
        </button>
        <button 
          className={`tab-btn ${activeLevel === '5' ? 'active' : ''}`}
          onClick={() => setActiveLevel('5')}
        >
          <Pill size={16} />
          สารเสพติด & ภาวะทางกาย
        </button>
        <button 
          className={`tab-btn ${activeLevel === '6' ? 'active' : ''}`}
          onClick={() => setActiveLevel('6')}
        >
          <Building2 size={16} />
          เส้นทางส่งต่อ & หอผู้ป่วย
        </button>
        <button 
          className={`tab-btn ${activeLevel === '7' ? 'active' : ''}`}
          onClick={() => setActiveLevel('7')}
        >
          <AlertCircle size={16} />
          ติดตามเคส (Case Tracking)
        </button>
      </nav>

      {/* Loading Overlay */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderLeftColor: 'var(--color-primary)', borderWidth: '4px' }}></div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>กำลังประมวลผลข้อมูล SMART Referral Intelligence...</p>
        </div>
      ) : (
        /* Main Content */
        <main>
          {activeLevel === '1' && (
            <ExecutiveSummary 
              metrics={computedMetrics} 
              year={year} 
              province={province} 
            />
          )}

          {activeLevel === '2' && (
            <OperationalPatientJourney 
              journeyData={computedMetrics.patientJourney} 
              provinceStats={computedMetrics.provinceStats} 
              onSelectProvince={setProvince} 
              activeProvince={province} 
            />
          )}

          {activeLevel === '3' && (
            <DiagnosticQualityHA 
              diagnosticData={computedMetrics.diagnosticQuality} 
              data={currentYearData} 
            />
          )}

          {activeLevel === '4' && (
            <HALearningAndAIAlert 
              aiAlerts={computedMetrics.aiAlerts} 
              continuityOfCare={computedMetrics.continuityOfCare} 
            />
          )}

          {activeLevel === '5' && (
            <SubstanceAnalytics 
              data={currentYearData} 
            />
          )}

          {activeLevel === '6' && (
            <ReferralDestinationChart 
              data={currentYearData} 
            />
          )}

          {activeLevel === '7' && (
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

