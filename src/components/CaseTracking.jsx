import React, { useState } from 'react';
import { Search, MapPin, Layers, Phone, ClipboardEdit, AlertCircle, CheckCircle } from 'lucide-react';
import { mapClinicalProgram } from '../utils/dataHelper';

export default function CaseTracking({ data, provinceFilter, onUpdateStatus }) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [progFilter, setProgFilter] = useState('All');
  const [provFilterLocal, setProvFilterLocal] = useState(provinceFilter);
  
  // Simulation Feedback
  const [notification, setNotification] = useState(null);

  // Sync prop filter changes
  React.useEffect(() => {
    setProvFilterLocal(provinceFilter);
  }, [provinceFilter]);

  // Filter cases: Only show "ยังไม่พบมาติดตาม" (Pending)
  const pendingCases = data.filter(row => row.status === 'ยังไม่พบมาติดตาม');

  const filteredCases = pendingCases.filter(row => {
    // 1. Search term (HN or AN)
    const matchesSearch = row.hn.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          row.an.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Province Filter
    const matchesProv = provFilterLocal === 'All' || row.province === provFilterLocal;
    
    // 3. Clinical Program Filter
    const program = mapClinicalProgram(row.diseaseGroup, row.primaryDiagnosis);
    const matchesProg = progFilter === 'All' || program === progFilter;
    
    return matchesSearch && matchesProv && matchesProg;
  });

  // Unique list of provinces in pending data
  const pendingProvinces = [...new Set(pendingCases.map(r => r.province).filter(Boolean))].sort();
  const programs = [
    'Alcohol Withdrawal',
    'Alcohol Withdrawal Seizure',
    'Methamphetamine Psychosis',
    'SMI-V',
    'Suicide',
    'Opioid Overdose'
  ];

  // Action Simulations
  const triggerAction = (hn, actionType) => {
    let msg = '';
    if (actionType === 'phone') {
      msg = `📞 โทรประสานงานเคส HN: ${hn} เรียบร้อย บันทึกลงสมุดติดตามชุมชนแล้ว`;
    } else if (actionType === 'complete') {
      msg = `✅ ปรับปรุงสถานะเคส HN: ${hn} เป็น 'มาติดตามแล้ว' สำเร็จ (ข้อมูลตัวเลขจะคำนวณใหม่)`;
      if (onUpdateStatus) {
        onUpdateStatus(hn);
      }
    }
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="panel animate-fade-in">
      <div className="panel-header">
        <h2 className="panel-title">
          <AlertCircle size={18} style={{ color: 'var(--color-yellow)' }} />
          Level 5 Case Tracking ระบบลงพื้นที่และค้างติดตาม (PDPA Compliant)
        </h2>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
          พบเคสค้างติดตาม {filteredCases.length} ราย
        </span>
      </div>

      {/* Action Notification banner */}
      {notification && (
        <div 
          style={{ 
            backgroundColor: 'var(--color-primary-light)', 
            color: 'var(--color-primary-dark)', 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            border: '1px solid var(--color-border-active)', 
            marginBottom: '1rem', 
            fontSize: '0.85rem',
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

      {/* Filters Area */}
      <div 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          marginBottom: '1.5rem', 
          backgroundColor: 'var(--bg-primary)', 
          padding: '1rem', 
          borderRadius: '10px',
          alignItems: 'center'
        }}
      >
        {/* Search HN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'white', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="ค้นหาด้วยรหัส HN หรือ AN..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.8rem', fontFamily: 'var(--font-family)' }}
          />
        </div>

        {/* Filter Province */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
          <select 
            value={provFilterLocal} 
            onChange={(e) => setProvFilterLocal(e.target.value)}
            className="custom-select"
            style={{ padding: '0.35rem 2rem 0.35rem 0.75rem' }}
          >
            <option value="All">ทุกจังหวัด</option>
            {pendingProvinces.map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </div>

        {/* Filter Program */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Layers size={14} style={{ color: 'var(--color-primary)' }} />
          <select 
            value={progFilter} 
            onChange={(e) => setProgFilter(e.target.value)}
            className="custom-select"
            style={{ padding: '0.35rem 2rem 0.35rem 0.75rem' }}
          >
            <option value="All">ทุกโปรแกรมการรักษา</option>
            {programs.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Table */}
      {filteredCases.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
          <span>ไม่พบรายชื่อผู้ป่วยค้างติดตามตามเงื่อนไขการค้นหา</span>
        </div>
      ) : (
        <div className="table-responsive table-scroll-container">
          <table className="custom-table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--color-border)', boxShadow: '0 1px 0 var(--color-border)' }}>รหัส HN</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--color-border)', boxShadow: '0 1px 0 var(--color-border)' }}>ชื่อ-สกุล (PDPA)</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--color-border)', boxShadow: '0 1px 0 var(--color-border)' }}>จังหวัด</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--color-border)', boxShadow: '0 1px 0 var(--color-border)' }}>กลุ่มโปรแกรมการรักษา</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--color-border)', boxShadow: '0 1px 0 var(--color-border)', textAlign: 'center' }}>รหัสโรคหลัก</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--color-border)', boxShadow: '0 1px 0 var(--color-border)', textAlign: 'center' }}>วันที่จำหน่าย</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--color-border)', boxShadow: '0 1px 0 var(--color-border)', textAlign: 'center' }}>ค้างติดตามแล้ว</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--color-border)', boxShadow: '0 1px 0 var(--color-border)', width: '180px', textAlign: 'center' }}>การปฏิบัติการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((row) => {
                const programName = mapClinicalProgram(row.diseaseGroup, row.primaryDiagnosis);
                
                // Calculate days elapsed from discharge until today (or assume a reference date)
                // Let's calculate days elapsed since discharge
                const dDate = new Date(row.dischargeDate);
                const today = new Date('2026-07-10'); // using current local date in metadata context
                const diffTime = Math.abs(today - dDate);
                const diffDays = !isNaN(diffTime) ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : null;

                return (
                  <tr key={row.an}>
                    <td style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{row.hn}</td>
                    <td style={{ fontWeight: 500 }}>{row.name}</td>
                    <td>{row.province}</td>
                    <td style={{ fontSize: '0.8rem', fontWeight: 500 }}>{programName}</td>
                    <td style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{row.primaryDiagnosis}</td>
                    <td style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{row.dischargeDate}</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-red)', fontWeight: 700 }}>
                      {diffDays !== null ? `${diffDays} วัน` : 'ไม่ระบุ'}
                    </td>
                    <td style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}
                        title="บันทึกบันทึกการคุยโทรศัพท์"
                        onClick={() => triggerAction(row.hn, 'phone')}
                      >
                        <Phone size={11} />
                        โทร
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px', backgroundColor: 'var(--color-green)' }}
                        title="ยืนยันการติดตามสำเร็จ"
                        onClick={() => triggerAction(row.hn, 'complete')}
                      >
                        <CheckCircle size={11} />
                        อัปเดตติดตามแล้ว
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
