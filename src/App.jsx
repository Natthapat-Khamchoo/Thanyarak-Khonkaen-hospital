import React, { useState, useEffect } from 'react';
import { 
  loadAllDashboardData, 
  computeDashboardMetrics, 
  computeYoYComparison,
  getAvailableProvinces,
  exportToCSV,
  savePatientStatus,
  getPatientFiscalYearBE,
  getPatientCalendarYearBE
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
  SECURITY_ROLES,
  DEFAULT_SECURITY_PIN,
  logSecurityEvent,
  getAuditLogs,
  clearAuditLogs
} from './utils/securityHelper';
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
  Zap,
  Download,
  Filter,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  LogOut,
  ShieldAlert,
  FileText,
  Clock,
  AlertOctagon
} from 'lucide-react';

export default function App() {
  // Active Filters & Navigation State: 2 separate Year selectors (Fiscal Year & Calendar Year) + Month
  const [fiscalYear, setFiscalYear] = useState('2568'); // default fiscal year ('All' | '2566'..'2569')
  const [calendarYear, setCalendarYear] = useState('All'); // default calendar year ('All' | '2566'..'2569')
  const [month, setMonth] = useState('All'); // default month filter ('All' | '1'..'12')
  const [province, setProvince] = useState('All');
  const [substanceFilter, setSubstanceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeLevel, setActiveLevel] = useState('1'); // '1' to '7'
  
  // Data State
  const [allData, setAllData] = useState({ '2566': [], '2567': [], '2568': [], '2569': [] });
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Security & PDPA Protection States
  const [isPdpaMasked, setIsPdpaMasked] = useState(true); // Default ON for maximum PDPA safety
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [currentUser, setCurrentUser] = useState(SECURITY_ROLES[0]); // Default Doctor
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [auditLogsModalOpen, setAuditLogsModalOpen] = useState(false);
  const [exportWarningModalOpen, setExportWarningModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [auditLogsList, setAuditLogsList] = useState([]);

  
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

  // Handle local state update & persistence
  const handleUpdateStatus = (hn, newStatus = 'มาติดตามแล้ว') => {
    savePatientStatus(hn, newStatus);
    setAllData(prev => {
      const copy = { ...prev };
      Object.keys(copy).forEach(yr => {
        copy[yr] = copy[yr].map(row => row.hn === hn ? { ...row, status: newStatus } : row);
      });
      return copy;
    });
  };

  // All patient records across dataset
  const allRecords = Object.values(allData).flat();

  // Active Year display label for subcomponents
  const activeYearLabel = fiscalYear !== 'All' ? fiscalYear : (calendarYear !== 'All' ? calendarYear : '2568');

  // Filter current dataset based on selected filters (Fiscal Year, Calendar Year, Month, Substance, Status)
  const currentYearData = allRecords.filter(row => {
    const dateIso = row.dischargeDate || row.followUpDate || '';

    // 1. Fiscal Year Filter (1 ต.ค. - 30 ก.ย.)
    if (fiscalYear !== 'All') {
      const fYr = getPatientFiscalYearBE(dateIso);
      if (fYr !== fiscalYear) return false;
    }

    // 2. Calendar Year Filter (1 ม.ค. - 31 ธ.ค.)
    if (calendarYear !== 'All') {
      const cYr = getPatientCalendarYearBE(dateIso);
      if (cYr !== calendarYear) return false;
    }

    // 3. Month Filter (เลือกเดือน)
    if (month !== 'All') {
      if (dateIso) {
        const parts = dateIso.split('-');
        if (parts.length >= 2) {
          const rowMonth = parseInt(parts[1], 10);
          if (rowMonth !== parseInt(month, 10)) return false;
        }
      }
    }

    // 4. Substance Filter
    if (substanceFilter !== 'All' && !String(row.diseaseGroup || row.substanceType || '').toLowerCase().includes(substanceFilter.toLowerCase())) {
      return false;
    }

    // 5. Status Filter
    if (statusFilter !== 'All' && row.status !== statusFilter) {
      return false;
    }

    return true;
  });




  // Compute metrics dynamically based on current data and selected province
  const computedMetrics = computeDashboardMetrics(currentYearData, province);
  
  // Compute YoY comparison metrics for the selected province
  const yoyData = computeYoYComparison(allData, province);
  
  // Get available provinces for filter select dropdown
  const availableProvinces = getAvailableProvinces(allRecords);

  // Log Security Activity on startup
  useEffect(() => {
    logSecurityEvent('SESSION_START', `ผู้ใช้งาน ${currentUser.name} (${currentUser.roleLabel}) เข้าสู่ระบบ`, currentUser);
  }, []);

  // Idle Inactivity Timer (Locks after 15 mins of no user movement)
  useEffect(() => {
    let idleTimer;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      // Auto lock screen after 15 minutes of inactivity (900,000 ms)
      idleTimer = setTimeout(() => {
        setIsScreenLocked(true);
        logSecurityEvent('AUTO_LOCK_INACTIVITY', 'ระบบล็อกหน้าจออัตโนมัติเนื่องจากไม่มีการใช้งานเกิน 15 นาที', currentUser);
      }, 15 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
    };
  }, [currentUser]);

  // Security Actions
  const handleTogglePdpa = () => {
    const nextState = !isPdpaMasked;
    setIsPdpaMasked(nextState);
    logSecurityEvent(
      'TOGGLE_PDPA_MASK',
      `เปลี่ยนโหมด PDPA Privacy Mask เป็น: ${nextState ? 'เปิดซ่อนข้อมูล (MASKED)' : 'ปิดการซ่อนข้อมูล (UNMASKED)'}`,
      currentUser
    );
  };

  const handleManualLockScreen = () => {
    setIsScreenLocked(true);
    logSecurityEvent('MANUAL_LOCK_SCREEN', 'ผู้ใช้งานกดล็อกหน้าจอด้วยตนเอง', currentUser);
  };

  const handleUnlockScreen = (e) => {
    if (e) e.preventDefault();
    if (pinInput === DEFAULT_SECURITY_PIN || pinInput === '1234') {
      setIsScreenLocked(false);
      setPinInput('');
      setPinError(false);
      logSecurityEvent('UNLOCK_SCREEN_SUCCESS', 'ปลดล็อกหน้าจอสำเร็จด้วย PIN', currentUser);
    } else {
      setPinError(true);
      logSecurityEvent('UNLOCK_SCREEN_FAILED', 'พยายามปลดล็อกหน้าจอด้วย PIN ที่ไม่ถูกต้อง', currentUser);
    }
  };

  const handleSwitchUserRole = (roleObj) => {
    setCurrentUser(roleObj);
    setShowRoleDropdown(false);
    logSecurityEvent('SWITCH_USER_ROLE', `สลับบทบาทผู้ใช้งานเป็น: ${roleObj.name} (${roleObj.roleLabel})`, roleObj);
  };

  const handleOpenAuditLogs = () => {
    setAuditLogsList(getAuditLogs());
    setAuditLogsModalOpen(true);
    logSecurityEvent('VIEW_AUDIT_LOGS', 'ผู้ใช้งานเปิดดูประวัติความปลอดภัย Audit Trail', currentUser);
  };

  const handleExportDataTrigger = () => {
    if (!currentUser.canExport) {
      alert(`บัญชีของท่าน (${currentUser.roleLabel}) ไม่มีสิทธิ์ส่งออกข้อมูลในระบบ`);
      logSecurityEvent('EXPORT_DENIED', 'พยายามส่งออกข้อมูลแต่ไม่มีสิทธิ์', currentUser);
      return;
    }
    setExportWarningModalOpen(true);
  };

  const handleConfirmExport = () => {
    setExportWarningModalOpen(false);
    exportToCSV(currentYearData, `Thanyarak_Referral_Data_FY${activeYearLabel}`);
    logSecurityEvent('EXPORT_DATA_SUCCESS', `ส่งออกข้อมูลไฟล์ CSV ประจำปี ${activeYearLabel} จำนวน ${currentYearData.length} ราย`, currentUser);
  };


  return (
    <div className="app-container" style={{ position: 'relative' }}>
      
      {/* Background Confidential Watermark */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.025,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(-25deg)',
        fontSize: '2.5rem',
        fontWeight: 900,
        color: '#0f172a',
        userSelect: 'none'
      }}>
        CONFIDENTIAL - THANYARAK KHON KAEN HOSPITAL - PHI PROTECTED DATA
      </div>

      {/* Security Guard Top Bar */}
      <div className="security-top-bar" style={{
        backgroundColor: '#0f172a',
        color: '#e2e8f0',
        padding: '0.45rem 1.25rem',
        borderRadius: '12px 12px 0 0',
        marginBottom: '-4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.775rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* PDPA Privacy Toggle & Status */}
        <div className="security-top-left" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#38bdf8' }}>
            <ShieldCheck size={16} />
            <span>Healthcare Data Guard v2.4</span>
          </div>

          <button
            onClick={handleTogglePdpa}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '2px 10px',
              borderRadius: '12px',
              border: isPdpaMasked ? '1px solid #10b981' : '1px solid #f59e0b',
              backgroundColor: isPdpaMasked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: isPdpaMasked ? '#34d399' : '#fbbf24',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}
            title="คลิกสลับโหมดซ่อน/เซนเซอร์ข้อมูลส่วนบุคคลตาม พ.ร.บ. PDPA"
          >
            {isPdpaMasked ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>PDPA Privacy Mask: {isPdpaMasked ? 'เปิดการซ่อนข้อมูล (PROTECTED)' : 'ปิดซ่อนข้อมูล (SHOW RAW)'}</span>
          </button>
        </div>

        {/* Lock Actions & Audit Trail */}
        <div className="security-top-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>



          {/* View Audit Logs Button */}
          <button
            onClick={handleOpenAuditLogs}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
            title="ดูบันทึกประวัติความปลอดภัย Audit Logs"
          >
            <Clock size={13} />
            <span>Audit Trail</span>
          </button>

          {/* Lock Screen Button */}
          <button
            onClick={handleManualLockScreen}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '2px 9px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 700
            }}
            title="กดล็อกหน้าจอเพื่อความปลอดภัยทันที"
          >
            <Lock size={12} />
            <span>ล็อกหน้าจอ</span>
          </button>
        </div>
      </div>

      {/* Top Header with SMART Referral Intelligence Branding */}
      <header className="app-header" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        padding: '1.25rem 1.5rem',
        borderRadius: '0 0 16px 16px',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
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
        
        <div className="header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Export CSV Button */}
          <button
            onClick={handleExportDataTrigger}
            className="btn btn-secondary"
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              borderColor: 'rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.825rem',
              fontWeight: 600
            }}
            title="ดาวน์โหลดข้อมูลเป็นไฟล์ CSV"
          >
            <Download size={14} />
            <span>ส่งออก CSV</span>
          </button>


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

      {/* Filter Panel - Compact Single Row Layout */}
      <div 
        className="filter-bar-container"
        style={{

          display: 'flex',
          flexWrap: 'nowrap',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-card)',
          padding: '0.65rem 1rem',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
          alignItems: 'center',
          overflowX: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}>
          <SlidersHorizontal size={14} />
          <span>ตัวกรอง:</span>
        </div>

        {/* 1. Fiscal Year Filter (ปีงบประมาณ) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          <Calendar size={13} style={{ color: 'var(--color-primary)' }} />
          <div className="select-wrapper">
            <select 
              value={fiscalYear} 
              onChange={(e) => {
                const val = e.target.value;
                setFiscalYear(val);
                if (val !== 'All') {
                  setCalendarYear('All'); // Prevent year conflict
                }
              }}
              className="custom-select"
              style={{ 
                fontSize: '0.8rem', 
                padding: '0.3rem 1.5rem 0.3rem 0.5rem',
                backgroundColor: fiscalYear !== 'All' ? '#eff6ff' : 'white',
                borderColor: fiscalYear !== 'All' ? 'var(--color-primary)' : 'var(--color-border)',
                fontWeight: fiscalYear !== 'All' ? 700 : 400
              }}
            >
              <option value="All">ปีงบประมาณ (ทั้งหมด)</option>
              <option value="2566">ปีงบประมาณ 2566</option>
              <option value="2567">ปีงบประมาณ 2567</option>
              <option value="2568">ปีงบประมาณ 2568</option>
              <option value="2569">ปีงบประมาณ 2569</option>
            </select>
          </div>
        </div>

        {/* 2. Calendar Year Filter (ปีปกติ) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          <Calendar size={13} style={{ color: '#0284c7' }} />
          <div className="select-wrapper">
            <select 
              value={calendarYear} 
              onChange={(e) => {
                const val = e.target.value;
                setCalendarYear(val);
                if (val !== 'All') {
                  setFiscalYear('All'); // Prevent year conflict
                }
              }}
              className="custom-select"
              style={{ 
                fontSize: '0.8rem', 
                padding: '0.3rem 1.5rem 0.3rem 0.5rem', 
                backgroundColor: calendarYear !== 'All' ? '#f0f9ff' : 'white',
                borderColor: calendarYear !== 'All' ? '#0284c7' : 'var(--color-border)',
                fontWeight: calendarYear !== 'All' ? 700 : 400
              }}
            >
              <option value="All">ปีปกติ (ทั้งหมด)</option>
              <option value="2566">ปี 2566 (2023)</option>
              <option value="2567">ปี 2567 (2024)</option>
              <option value="2568">ปี 2568 (2025)</option>
              <option value="2569">ปี 2569 (2026)</option>
            </select>
          </div>
        </div>


        {/* 3. Month Filter (เลือกเดือน) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          <Calendar size={13} style={{ color: '#10b981' }} />
          <div className="select-wrapper">
            <select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              className="custom-select"
              style={{ fontSize: '0.8rem', padding: '0.3rem 1.5rem 0.3rem 0.5rem', backgroundColor: month !== 'All' ? '#ecfdf5' : 'white' }}
            >
              <option value="All">เดือน (ทั้งหมด)</option>
              <option value="1">มกราคม (ม.ค.)</option>
              <option value="2">กุมภาพันธ์ (ก.พ.)</option>
              <option value="3">มีนาคม (มี.ค.)</option>
              <option value="4">เมษายน (เม.ย.)</option>
              <option value="5">พฤษภาคม (พ.ค.)</option>
              <option value="6">มิถุนายน (มิ.ย.)</option>
              <option value="7">กรกฎาคม (ก.ค.)</option>
              <option value="8">สิงหาคม (ส.ค.)</option>
              <option value="9">กันยายน (ก.ย.)</option>
              <option value="10">ตุลาคม (ต.ค.)</option>
              <option value="11">พฤศจิกายน (พ.ย.)</option>
              <option value="12">ธันวาคม (ธ.ค.)</option>
            </select>
          </div>
        </div>

        {/* 4. Province Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          <MapPin size={13} style={{ color: 'var(--color-primary)' }} />
          <div className="select-wrapper">
            <select 
              value={province} 
              onChange={(e) => setProvince(e.target.value)}
              className="custom-select"
              style={{ fontSize: '0.8rem', padding: '0.3rem 1.5rem 0.3rem 0.5rem' }}
              disabled={loading}
            >
              <option value="All">จังหวัด (ทั้งหมด)</option>
              {availableProvinces.filter(p => p !== 'All').map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 5. Substance Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          <Pill size={13} style={{ color: '#a855f7' }} />
          <div className="select-wrapper">
            <select 
              value={substanceFilter} 
              onChange={(e) => setSubstanceFilter(e.target.value)}
              className="custom-select"
              style={{ fontSize: '0.8rem', padding: '0.3rem 1.5rem 0.3rem 0.5rem' }}
            >
              <option value="All">สารเสพติด (ทั้งหมด)</option>
              <option value="Amphetamine">ยาบ้า / เมทแอมเฟตามีน</option>
              <option value="Alcohol">สุรา / แอลกอฮอล์</option>
              <option value="Cannabis">กัญชา</option>
              <option value="Poly">เสพติดหลายชนิด (Polysubstance)</option>
            </select>
          </div>
        </div>

        {/* 6. Follow-up Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          <Filter size={13} style={{ color: '#10b981' }} />
          <div className="select-wrapper">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="custom-select"
              style={{ fontSize: '0.8rem', padding: '0.3rem 1.5rem 0.3rem 0.5rem' }}
            >
              <option value="All">สถานะติดตาม (ทั้งหมด)</option>
              <option value="มาติดตามแล้ว">มาติดตามแล้ว</option>
              <option value="ยังไม่พบมาติดตาม">ยังไม่พบมาติดตาม</option>
            </select>
          </div>
        </div>

        {/* 7. Filter Reset Button */}
        {(fiscalYear !== '2568' || calendarYear !== 'All' || month !== 'All' || province !== 'All' || substanceFilter !== 'All' || statusFilter !== 'All') && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '6px', flexShrink: 0, whiteSpace: 'nowrap' }}
            onClick={() => {
              setFiscalYear('2568');
              setCalendarYear('All');
              setMonth('All');
              setProvince('All');
              setSubstanceFilter('All');
              setStatusFilter('All');
            }}
          >
            ล้างตัวกรอง
          </button>
        )}



      </div>


      {/* Navigation Tabs - 7 Concise Topics */}
      <nav className="tabs-navigation">
        <button 
          className={`tab-btn ${activeLevel === '1' ? 'active' : ''}`}
          onClick={() => setActiveLevel('1')}
        >
          <Activity size={15} />
          <span>ภาพรวมผู้บริหาร</span>
        </button>
        <button 
          className={`tab-btn ${activeLevel === '2' ? 'active' : ''}`}
          onClick={() => setActiveLevel('2')}
        >
          <Network size={15} />
          <span>เส้นทางผู้ป่วย</span>
        </button>
        <button 
          className={`tab-btn ${activeLevel === '3' ? 'active' : ''}`}
          onClick={() => setActiveLevel('3')}
        >
          <Award size={15} />
          <span>วินิจฉัย & ความเสี่ยง</span>
        </button>
        <button 
          className={`tab-btn ${activeLevel === '4' ? 'active' : ''}`}
          onClick={() => setActiveLevel('4')}
        >
          <ShieldCheck size={15} />
          <span>คุณภาพ & เตือนภัย AI</span>
        </button>
        <button 
          className={`tab-btn ${activeLevel === '5' ? 'active' : ''}`}
          onClick={() => setActiveLevel('5')}
        >
          <Pill size={15} />
          <span>สารเสพติด & กาย</span>
        </button>
        <button 
          className={`tab-btn ${activeLevel === '6' ? 'active' : ''}`}
          onClick={() => setActiveLevel('6')}
        >
          <Building2 size={15} />
          <span>ส่งต่อ & หอผู้ป่วย</span>
        </button>
        <button 
          className={`tab-btn ${activeLevel === '7' ? 'active' : ''}`}
          onClick={() => setActiveLevel('7')}
        >
          <AlertCircle size={15} />
          <span>ติดตามเคส</span>
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
              data={currentYearData}
              year={activeYearLabel} 
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

