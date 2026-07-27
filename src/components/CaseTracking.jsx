import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Layers, 
  Phone, 
  ClipboardEdit, 
  AlertCircle, 
  CheckCircle, 
  Download,
  SlidersHorizontal,
  Sparkles,
  Filter,
  RotateCcw,
  Building2,
  ShieldAlert,
  Pill,
  UserCheck,
  UserX
} from 'lucide-react';
import { mapClinicalProgram, exportToCSV } from '../utils/dataHelper';
import { maskPatientName, maskHN, maskAN } from '../utils/securityHelper';


export default function CaseTracking({ data, provinceFilter, onUpdateStatus, isPdpaMasked = true }) {
  // Mode Switcher: 'pending' (Default Pending Follow-ups) | 'smart' (SMART Search & Advanced Filter)
  const [searchMode, setSearchMode] = useState('pending');


  // Basic Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [progFilter, setProgFilter] = useState('All');
  const [provFilterLocal, setProvFilterLocal] = useState(provinceFilter);
  
  // SMART Search Advanced Filters State
  const [statusFilter, setStatusFilter] = useState('All');
  const [referTypeFilter, setReferTypeFilter] = useState('All');
  const [wardFilter, setWardFilter] = useState('All');
  const [substanceFilter, setSubstanceFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  
  // Simulation Feedback
  const [notification, setNotification] = useState(null);

  // Sync prop filter changes
  React.useEffect(() => {
    setProvFilterLocal(provinceFilter);
  }, [provinceFilter]);

  // Reset SMART Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setProgFilter('All');
    setProvFilterLocal('All');
    setStatusFilter('All');
    setReferTypeFilter('All');
    setWardFilter('All');
    setSubstanceFilter('All');
    setRiskFilter('All');
  };

  // Compute dataset based on active mode & multi-criteria filters
  const filteredCases = data.filter(row => {
    // Mode condition: Pending mode only shows 'ยังไม่พบมาติดตาม'
    if (searchMode === 'pending' && row.status !== 'ยังไม่พบมาติดตาม') {
      return false;
    }

    // 1. Search keyword (HN, AN, or Name)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchHN = (row.hn || '').toLowerCase().includes(q);
      const matchAN = (row.an || '').toLowerCase().includes(q);
      const matchName = (row.name || '').toLowerCase().includes(q);
      const matchDiag = (row.primaryDiagnosis || '').toLowerCase().includes(q);
      if (!matchHN && !matchAN && !matchName && !matchDiag) return false;
    }

    // 2. Province Filter
    if (provFilterLocal !== 'All' && row.province !== provFilterLocal) {
      return false;
    }

    // 3. Clinical Program Filter
    if (progFilter !== 'All') {
      const program = mapClinicalProgram(row.diseaseGroup, row.primaryDiagnosis);
      if (program !== progFilter) return false;
    }

    // 4. Status Filter (SMART Mode)
    if (searchMode === 'smart' && statusFilter !== 'All' && row.status !== statusFilter) {
      return false;
    }

    // 5. Refer Type Filter (SMART Mode)
    if (searchMode === 'smart' && referTypeFilter !== 'All' && row.referType !== referTypeFilter) {
      return false;
    }

    // 6. Ward Filter (SMART Mode)
    if (searchMode === 'smart' && wardFilter !== 'All' && !(row.originWard || '').includes(wardFilter)) {
      return false;
    }

    // 7. Substance Filter (SMART Mode)
    if (searchMode === 'smart' && substanceFilter !== 'All') {
      const dGroup = String(row.diseaseGroup || row.substanceType || '').toLowerCase();
      if (!dGroup.includes(substanceFilter.toLowerCase())) return false;
    }

    // 8. Risk Filter (SMART Mode)
    if (searchMode === 'smart' && riskFilter !== 'All') {
      if (riskFilter === 'Suicide' && row.suicideRisk !== 'High') return false;
      if (riskFilter === 'Violence' && row.violenceRisk !== 'High') return false;
    }

    return true;
  });

  // Export filtered cases
  const handleExportCases = () => {
    const filename = searchMode === 'smart' 
      ? `SMART_Search_Export_${new Date().toISOString().slice(0, 10)}.csv`
      : `Pending_Followup_Cases_${provFilterLocal}.csv`;
    exportToCSV(filteredCases, filename);
  };

  // Lists for dropdown options (Sanitized against staff names & rights text)
  const VALID_PROVINCES = [
    'ขอนแก่น', 'มหาสารคาม', 'ร้อยเอ็ด', 'กาฬสินธุ์', 'ชัยภูมิ',
    'อุดรธานี', 'หนองคาย', 'บึงกาฬ', 'หนองบัวลำภู', 'เลย',
    'สกลนคร', 'นครพนม', 'มุกดาหาร', 'อุบลราชธานี', 'ยโสธร', 'ศรีสะเกษ',
    'สุรินทร์', 'บุรีรัมย์', 'นครราชสีมา', 'เชียงใหม่', 'กรุงเทพมหานคร'
  ];
  const allProvinces = [...new Set(data.map(r => r.province).filter(p => p && !p.includes('/') && !p.includes('UC') && !p.includes('ปกส') && (VALID_PROVINCES.includes(p) || p.length <= 12)))].sort();

  const allWards = [...new Set(data.map(r => r.originWard).filter(Boolean))].sort();
  const programs = [
    'Alcohol Withdrawal',
    'Alcohol Withdrawal Seizure',
    'Methamphetamine Psychosis',
    'SMI-V',
    'Suicide',
    'Opioid Overdose'
  ];

  // Action Handler: Status update & notification
  const triggerAction = (hn, actionType, currentStatus) => {
    let msg = '';
    if (actionType === 'phone') {
      msg = `📞 โทรประสานงานเคส HN: ${hn} เรียบร้อย บันทึกลงสมุดติดตามชุมชนแล้ว`;
    } else if (actionType === 'toggle') {
      const newStatus = currentStatus === 'มาติดตามแล้ว' ? 'ยังไม่พบมาติดตาม' : 'มาติดตามแล้ว';
      msg = `✅ อัปเดตสถานะเคส HN: ${hn} เป็น '${newStatus}' เรียบร้อย`;
      if (onUpdateStatus) {
        onUpdateStatus(hn, newStatus);
      }
    }
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="panel animate-fade-in">
      
      {/* Header Panel with Mode Switcher */}
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        
        {/* Title & Mode Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {searchMode === 'smart' ? (
            <Sparkles size={20} color="#0284c7" />
          ) : (
            <AlertCircle size={20} style={{ color: 'var(--color-yellow)' }} />
          )}
          <div>
            <h2 className="panel-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              {searchMode === 'smart' ? 'SMART Search & Advanced Filter System' : 'Level 5 Case Tracking (ระบบติดตามเคสค้าง)'}
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {searchMode === 'smart' ? 'ค้นหาและกรองข้อมูลคนไข้ทุกมิติเชิงลึก (PDPA Compliant)' : 'เฝ้าระวังผู้ป่วยกลุ่มเสี่ยงค้างติดตามในชุมชน'}
            </div>
          </div>
        </div>

        {/* Mode Switcher Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '10px', padding: '3px' }}>
            <button
              onClick={() => setSearchMode('pending')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.775rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: searchMode === 'pending' ? 'white' : 'transparent',
                color: searchMode === 'pending' ? '#0f172a' : '#64748b',
                boxShadow: searchMode === 'pending' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
            >
              <AlertCircle size={13} color={searchMode === 'pending' ? '#eab308' : '#64748b'} />
              <span>เคสค้างติดตาม</span>
            </button>

            <button
              onClick={() => setSearchMode('smart')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.775rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: searchMode === 'smart' ? '#0284c7' : 'transparent',
                color: searchMode === 'smart' ? 'white' : '#64748b',
                boxShadow: searchMode === 'smart' ? '0 2px 6px rgba(2,132,199,0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={13} color={searchMode === 'smart' ? 'white' : '#64748b'} />
              <span>SMART Search</span>
            </button>
          </div>

          {/* Case Count Badge */}
          <span style={{
            fontSize: '0.775rem',
            fontWeight: 700,
            backgroundColor: searchMode === 'smart' ? 'rgba(2, 132, 199, 0.1)' : 'var(--color-red-light)',
            color: searchMode === 'smart' ? '#0284c7' : 'var(--color-red)',
            padding: '0.3rem 0.7rem',
            borderRadius: '10px',
            border: `1px solid ${searchMode === 'smart' ? 'rgba(2, 132, 199, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}>
            พบ {filteredCases.length.toLocaleString()} ราย
          </span>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCases}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="ส่งออกผลการค้นหาเป็น CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Action Notification banner */}
      {notification && (
        <div 
          style={{ 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', 
            color: '#047857', 
            padding: '0.6rem 1rem', 
            borderRadius: '8px', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            marginBottom: '1rem', 
            fontSize: '0.825rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Filters Area - Table / Grid Layout */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '0.75rem', 
          marginBottom: '1.25rem', 
          backgroundColor: searchMode === 'smart' ? 'rgba(240, 249, 255, 0.9)' : 'var(--bg-primary)', 
          padding: '1rem', 
          borderRadius: '12px',
          border: `1px solid ${searchMode === 'smart' ? 'rgba(56, 189, 248, 0.5)' : 'var(--color-border)'}`,
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Header Title for Filter Table */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: searchMode === 'smart' ? '#0284c7' : '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <SlidersHorizontal size={14} />
            <span>ตารางตารางตัวกรองค้นหาผู้ป่วย (Filter Matrix)</span>
          </div>

          {(searchTerm || provFilterLocal !== 'All' || progFilter !== 'All' || statusFilter !== 'All' || referTypeFilter !== 'All' || wardFilter !== 'All' || substanceFilter !== 'All' || riskFilter !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.55rem', fontSize: '0.725rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <RotateCcw size={11} />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          )}
        </div>

        {/* Structured Grid/Table Layout for Filters */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: searchMode === 'smart' ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1.5fr 1fr 1fr',
            gap: '0.65rem',
            alignItems: 'center'
          }}
        >
          {/* Field 1: Keyword Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>ค้นหาด้วยคำสำคัญ (Search Keyword):</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'white', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <Search size={14} style={{ color: searchMode === 'smart' ? '#0284c7' : 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                placeholder="HN, AN, ชื่อ-สกุล, หรือ ICD-10..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.8rem', fontFamily: 'var(--font-family)' }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.75rem' }}>✕</button>
              )}
            </div>
          </div>

          {/* Field 2: Province */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>จังหวัด (Province):</label>
            <select 
              value={provFilterLocal} 
              onChange={(e) => setProvFilterLocal(e.target.value)}
              className="custom-select"
              style={{ padding: '0.35rem 1.75rem 0.35rem 0.65rem', fontSize: '0.775rem', width: '100%' }}
            >
              <option value="All">ทุกจังหวัดทั้งหมด</option>
              {allProvinces.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>

          {/* Field 3: Program */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>โปรแกรมการรักษา (Clinical Program):</label>
            <select 
              value={progFilter} 
              onChange={(e) => setProgFilter(e.target.value)}
              className="custom-select"
              style={{ padding: '0.35rem 1.75rem 0.35rem 0.65rem', fontSize: '0.775rem', width: '100%' }}
            >
              <option value="All">ทุกโปรแกรมการรักษา</option>
              {programs.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Additional Fields in SMART Mode */}
          {searchMode === 'smart' && (
            <>
              {/* Field 4: Follow-up Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>สถานะติดตาม (Status):</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="custom-select"
                  style={{ padding: '0.35rem 1.75rem 0.35rem 0.65rem', fontSize: '0.775rem', width: '100%', backgroundColor: statusFilter !== 'All' ? '#e0f2fe' : 'white' }}
                >
                  <option value="All">ทุกสถานะติดตาม</option>
                  <option value="มาติดตามแล้ว">มาติดตามแล้ว (Followed)</option>
                  <option value="ยังไม่พบมาติดตาม">ยังไม่พบมาติดตาม (Pending)</option>
                </select>
              </div>

              {/* Field 5: Refer Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>ประเภทส่งต่อ (Referral Type):</label>
                <select 
                  value={referTypeFilter} 
                  onChange={(e) => setReferTypeFilter(e.target.value)}
                  className="custom-select"
                  style={{ padding: '0.35rem 1.75rem 0.35rem 0.65rem', fontSize: '0.775rem', width: '100%', backgroundColor: referTypeFilter !== 'All' ? '#e0f2fe' : 'white' }}
                >
                  <option value="All">ทุกประเภทการส่งต่อ</option>
                  <option value="Refer In">Refer In (รับเข้า)</option>
                  <option value="Refer Back">Refer Back (ส่งกลับ)</option>
                  <option value="Refer Out">Refer Out (ส่งออก)</option>
                </select>
              </div>

              {/* Field 6: Ward */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>หอผู้ป่วย (Ward):</label>
                <select 
                  value={wardFilter} 
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="custom-select"
                  style={{ padding: '0.35rem 1.75rem 0.35rem 0.65rem', fontSize: '0.775rem', width: '100%', backgroundColor: wardFilter !== 'All' ? '#e0f2fe' : 'white' }}
                >
                  <option value="All">ทุกหอผู้ป่วย</option>
                  {allWards.map(w => (
                    <option key={w} value={w}>หอผู้ป่วย {w}</option>
                  ))}
                </select>
              </div>

              {/* Field 7: Substance */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>สารเสพติด (Substance):</label>
                <select 
                  value={substanceFilter} 
                  onChange={(e) => setSubstanceFilter(e.target.value)}
                  className="custom-select"
                  style={{ padding: '0.35rem 1.75rem 0.35rem 0.65rem', fontSize: '0.775rem', width: '100%', backgroundColor: substanceFilter !== 'All' ? '#e0f2fe' : 'white' }}
                >
                  <option value="All">ทุกประเภทสารเสพติด</option>
                  <option value="Amphetamine">ยาบ้า / เมทแอมเฟตามีน</option>
                  <option value="Alcohol">สุรา / แอลกอฮอล์</option>
                  <option value="Cannabis">กัญชา</option>
                  <option value="Poly">เสพหลายชนิด (Polysubstance)</option>
                </select>
              </div>

              {/* Field 8: Risk Level */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>ระดับความเสี่ยง (Risk Level):</label>
                <select 
                  value={riskFilter} 
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="custom-select"
                  style={{ padding: '0.35rem 1.75rem 0.35rem 0.65rem', fontSize: '0.775rem', width: '100%', backgroundColor: riskFilter !== 'All' ? '#fef3c7' : 'white' }}
                >
                  <option value="All">ทุกระดับความเสี่ยง</option>
                  <option value="Suicide">⚠️ High Risk Suicide (ทำร้ายตนเอง)</option>
                  <option value="Violence">⚠️ High Risk Violence (ก่อความรุนแรง)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Patient Table - Height Bounded Scroll Container */}
      {filteredCases.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '10px' }}>
          <Search size={34} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#475569' }}>ไม่พบรายชื่อผู้ป่วยตามเงื่อนไขการค้นหา</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>ลองปรับเปลี่ยนเงื่อนไขในตารางตัวกรอง หรือกดปุ่มล้างตัวกรอง</span>
        </div>
      ) : (
        <div 
          className="table-responsive" 
          style={{ 
            maxHeight: '460px', 
            overflowY: 'auto', 
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <table className="custom-table" style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>รหัส HN / AN</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>ชื่อ-สกุล (PDPA)</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', textAlign: 'center' }}>ประเภท / Ward</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>จังหวัด</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>โปรแกรม / การวินิจฉัย</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', textAlign: 'center' }}>ความเสี่ยง</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', textAlign: 'center' }}>สถานะติดตาม</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', width: '150px', textAlign: 'center' }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((row) => {
                const programName = mapClinicalProgram(row.diseaseGroup, row.primaryDiagnosis);

                return (
                  <tr key={row.an}>
                    <td style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#0284c7' }}>
                      {maskHN(row.hn, isPdpaMasked)}
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>{maskAN(row.an, isPdpaMasked)}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{maskPatientName(row.name, isPdpaMasked)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        backgroundColor: (row.referType || '').includes('In') ? 'rgba(16, 185, 129, 0.1)' : (row.referType || '').includes('Out') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                        color: (row.referType || '').includes('In') ? '#059669' : (row.referType || '').includes('Out') ? '#b45309' : '#0284c7'
                      }}>
                        {row.referType || 'Refer In'}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{row.originWard || 'OPD'}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{row.province}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{programName}</div>
                      <div style={{ fontSize: '0.725rem', color: '#475569', fontFamily: 'Inter, sans-serif' }}>{row.primaryDiagnosis}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {row.suicideRisk === 'High' && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#fee2e2', color: '#dc2626', padding: '1px 5px', borderRadius: '4px', display: 'inline-block', marginBottom: '2px' }}>
                          Suicide Risk
                        </span>
                      )}
                      {row.violenceRisk === 'High' && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: '4px', display: 'inline-block' }}>
                          Violence Risk
                        </span>
                      )}
                      {row.suicideRisk !== 'High' && row.violenceRisk !== 'High' && (
                        <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: row.status === 'มาติดตามแล้ว' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: row.status === 'มาติดตามแล้ว' ? '#047857' : '#b91c1c'
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', alignItems: 'center', paddingTop: '10px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem', borderRadius: '4px' }}
                        title="บันทึกการคุยโทรศัพท์ติดตาม"
                        onClick={() => triggerAction(row.hn, 'phone', row.status)}
                      >
                        <Phone size={11} />
                      </button>

                      <button 
                        className="btn btn-primary" 
                        style={{ 
                          padding: '0.25rem 0.5rem', 
                          fontSize: '0.7rem', 
                          borderRadius: '4px',
                          backgroundColor: row.status === 'มาติดตามแล้ว' ? '#f59e0b' : 'var(--color-green)'
                        }}
                        title={row.status === 'มาติดตามแล้ว' ? 'สลับเป็นยังไม่พบมาติดตาม' : 'ยืนยันการมาติดตามแล้ว'}
                        onClick={() => triggerAction(row.hn, 'toggle', row.status)}
                      >
                        {row.status === 'มาติดตามแล้ว' ? 'ยกเลิก' : 'อัปเดตติดตามแล้ว'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



