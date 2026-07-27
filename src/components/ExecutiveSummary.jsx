import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  AlertTriangle, 
  Activity,
  X,
  FileText,
  Building2,
  MapPin,
  Calendar,
  ShieldCheck,
  Zap,
  Search
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import MetricCard from './MetricCard';
import { mapClinicalProgram } from '../utils/dataHelper';
import { maskPatientName, maskHN, maskAN, sanitizeInput } from '../utils/securityHelper';



const safeToFixed = (val, digits = 1) => {
  const num = Number(val);
  return isNaN(num) ? '0.0' : num.toFixed(digits);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e2e8f0',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        fontSize: '0.825rem'
      }}>
        <p className="custom-tooltip-title" style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{label}</p>
        {payload.map((pld, index) => (
          <p key={index} className="custom-tooltip-value" style={{ color: pld.color, margin: '2px 0', fontWeight: 600 }}>
            {pld.name}: {typeof pld.value === 'number' ? pld.value.toLocaleString() : pld.value} {pld.name.includes('Rate') || pld.name.includes('ร้อยละ') ? '%' : 'ราย'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ExecutiveSummary({ metrics = {}, data = [], year = '2568', province = 'All', isPdpaMasked = true }) {

  const [selectedCard, setSelectedCard] = useState(null);
  const [provChartMode, setProvChartMode] = useState('referType'); // 'referType' | 'substance' | 'status'

  // In-Modal Filter & Search States
  const [modalSearchText, setModalSearchText] = useState('');
  const [modalStatusFilter, setModalStatusFilter] = useState('All');
  const [modalSubstanceFilter, setModalSubstanceFilter] = useState('All');

  const handleOpenCardModal = (cardKey) => {
    setSelectedCard(cardKey);
    setModalSearchText('');
    setModalStatusFilter('All');
    setModalSubstanceFilter('All');
  };

  // Get all real cases matching selectedCard category
  const getModalCases = () => {
    if (!selectedCard) return [];
    
    let filtered = [...data];
    if (province !== 'All') {
      filtered = filtered.filter(r => r.province === province);
    }

    switch (selectedCard) {
      case 'total':
        return filtered;
      case 'referIn':
        return filtered.filter(r => r.referType === 'Refer In' || (!r.referType && r.direction === 'In'));
      case 'referOut':
        return filtered.filter(r => r.referType === 'Refer Out' || (!r.referType && r.direction === 'Out'));
      case 'referBack':
        return filtered.filter(r => r.referType === 'Refer Back' || (!r.referType && r.direction === 'Back'));
      case 'readmission':
        return filtered.filter(r => r.isReadmission || (r.an && String(r.an).length > 0));
      case 'incidents':
        return filtered.filter(r => r.incident || r.suicideRisk === 'High' || r.isConcordant === false);
      default:
        return filtered;
    }
  };

  const rawModalCases = getModalCases();

  const filteredModalCases = rawModalCases.filter(pt => {
    // 1. Text Search (HN, Patient Name, Hospital, Diagnosis, Ward) - OWASP A03 Sanitized
    if (modalSearchText.trim()) {
      const q = sanitizeInput(modalSearchText).toLowerCase();
      if (!q) return true;
      const matchHN = String(pt.hn || '').toLowerCase().includes(q);

      const matchName = String(pt.patientName || pt.name || '').toLowerCase().includes(q);
      const matchHosp = String(pt.referringHospital || pt.hospital || pt.hosp || pt.province || '').toLowerCase().includes(q);
      const matchDiag = String(pt.primaryDiagnosis || pt.diag || pt.diseaseGroup || '').toLowerCase().includes(q);
      const matchWard = String(pt.originWard || pt.ward || '').toLowerCase().includes(q);
      if (!matchHN && !matchName && !matchHosp && !matchDiag && !matchWard) return false;
    }

    // 2. Status Filter
    if (modalStatusFilter !== 'All') {
      if (pt.status !== modalStatusFilter) return false;
    }

    // 3. Substance Filter
    if (modalSubstanceFilter !== 'All') {
      const g = String(pt.diseaseGroup || pt.substanceType || '').toLowerCase();
      if (!g.includes(modalSubstanceFilter.toLowerCase())) return false;
    }

    return true;
  });

  const getCardModalTitle = (cardKey) => {
    switch (cardKey) {
      case 'total':
        return { title: 'จำนวนเคสรวมส่งต่อทั้งหมด (Total Referrals)', desc: 'รวมรายการเคสผู้ป่วยทั้งหมดที่ผ่านการรับส่งต่อในระบบโรงพยาบาลธัญญารักษ์ขอนแก่น' };
      case 'referIn':
        return { title: 'รับส่งต่อเข้า (Refer In Total)', desc: 'เคสผู้ป่วยที่รับส่งต่อจากโรงพยาบาลชุมชน/โรงพยาบาลศูนย์ เข้ามารับการบำบัดรักษา' };
      case 'referOut':
        return { title: 'ส่งต่อออก (Refer Out Total)', desc: 'เคสผู้ป่วยที่ส่งต่อไปยังโรงพยาบาลศูนย์ หรือแพทย์เฉพาะทาง' };
      case 'referBack':
        return { title: 'ส่งกลับ (Refer Back Total)', desc: 'เคสที่บำบัดครบกำหนดและส่งกลับติดตามในชุมชน/รพ.สต. เพื่อการดูแลต่อเนื่อง (COC)' };
      case 'readmission':
        return { title: 'อัตราการกลับเข้ารักษาซ้ำภายใน 28 วัน (Readmission Rate 28 Days)', desc: 'สัดส่วนผู้ป่วยที่กลับเข้ารับการรักษาซ้ำในโรงพยาบาลภายใน 28 วันหลังจำหน่าย' };
      case 'incidents':
        return { title: 'เหตุการณ์ความไม่พึงประสงค์จากการส่งต่อ (Referral Incidents)', desc: 'รายการเคสที่มีเหตุการณ์ความไม่พึงประสงค์หรือประเมินความเสี่ยงสูง' };
      default:
        return { title: 'ข้อมูลผู้ป่วย', desc: 'รายการเคสในหมวดหมู่ที่เลือก' };
    }
  };

  const modalData = selectedCard ? getCardModalTitle(selectedCard) : null;




  const {
    totalReferrals = 0,
    completionRate = 0,
    followUpRate = 0,
    lossToFollowUpRate = 0,
    readmissionRate = 0,
    incidents = 0,
    severeAdverseEvents = 0,
    monthlyTrend = [],
    executiveKPIs = {}
  } = metrics || {};

  // Calculate status levels
  const getFollowUpStatus = (val) => {
    if (val >= 90) return 'pass';
    if (val >= 80) return 'warn';
    return 'danger';
  };

  const getLossStatus = (val) => {
    if (val < 10) return 'pass';
    if (val < 20) return 'warn';
    return 'danger';
  };

  const getReadmissionStatus = (val) => {
    if (val < 10) return 'pass';
    if (val < 15) return 'warn';
    return 'danger';
  };

  // Pie chart data
  const pieData = [
    { name: 'ติดตามสำเร็จ (Followed)', value: Math.round(totalReferrals * (followUpRate / 100)) || 0 },
    { name: 'ยังไม่พบมาติดตาม (Lost FU)', value: Math.round(totalReferrals * (lossToFollowUpRate / 100)) || 0 }
  ];
  
  const COLORS = ['#0ea5e9', '#f59e0b']; // skyblue, yellow



  return (
    <div className="animate-fade-in">
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-card)',
          padding: '0.6rem 1rem',
          borderRadius: '10px',
          border: '1px solid var(--color-border)',
          marginBottom: '1rem',
          fontSize: '0.825rem',
          color: 'var(--color-text)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Activity size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <span style={{ margin: 0, padding: 0 }}>
          <strong>ภาพรวมทั้งองค์กร (FY {year})</strong> | {province === 'All' ? 'ทุกจังหวัด' : `จังหวัด${province}`} — คลิกที่การ์ด KPI เพื่อดูรายชื่อผู้ป่วยเชิงลึก 👆
        </span>
      </div>


      {/* KPI Cards Grid - Single Row Symmetrical Layout */}
      <div className="cards-grid">
        <MetricCard
          title="จำนวนเคสรวมทั้งหมด"
          value={totalReferrals}
          unit="ราย"
          targetLabel="ข้อมูลรวมจากระบบ"
          status="pass"
          icon={Users}
          onClick={() => handleOpenCardModal('total')}
        />
        <MetricCard
          title="รับส่งต่อเข้า (Refer In)"
          value={metrics.executiveKPIs?.referIn || 0}
          unit="ราย"
          targetLabel="รับเข้าบำบัดรักษา"
          status="pass"
          icon={UserCheck}
          onClick={() => handleOpenCardModal('referIn')}
        />
        <MetricCard
          title="ส่งต่อออก (Refer Out)"
          value={metrics.executiveKPIs?.referOut || 0}
          unit="ราย"
          targetLabel="ส่งต่อ รพ.ศูนย์/แพทย์"
          status="warn"
          icon={UserX}
          onClick={() => handleOpenCardModal('referOut')}
        />
        <MetricCard
          title="ส่งกลับ (Refer Back)"
          value={metrics.executiveKPIs?.referBack || 0}
          unit="ราย"
          targetLabel="ส่งกลับติดตามในชุมชน"
          status="pass"
          icon={CheckCircle}
          onClick={() => handleOpenCardModal('referBack')}
        />
        <MetricCard
          title="Readmission 28 วัน"
          value={safeToFixed(readmissionRate)}
          unit="%"
          targetLabel="เป้าหมาย <10%"
          status={getReadmissionStatus(readmissionRate)}
          icon={RefreshCw}
          onClick={() => handleOpenCardModal('readmission')}
        />
        <MetricCard
          title="Referral Incident"
          value={incidents}
          unit="ครั้ง"
          targetLabel="เป้าหมาย 0"
          status={incidents === 0 ? 'pass' : 'danger'}
          icon={AlertTriangle}
          onClick={() => handleOpenCardModal('incidents')}
        />
      </div>


      {/* Executive Analytics Charts section - Swapped positions & custom grid ratio */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.85fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Chart 1 (Left - Wider 1.25fr): Referrals by Province Network (Health Region 7) */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 className="panel-title" style={{ fontSize: '0.975rem', fontWeight: 700, margin: 0 }}>
                ปริมาณผู้ป่วยรับ-ส่งต่อจำแนกตามจังหวัดในเครือข่าย
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                เขตสุขภาพที่ 7 (ขอนแก่น, มหาสารคาม, ร้อยเอ็ด, กาฬสินธุ์, ชัยภูมิ, หนองคาย)
              </span>
            </div>

            {/* Dimension Switcher Pills */}
            <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button
                onClick={() => setProvChartMode('referType')}
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: provChartMode === 'referType' ? 'white' : 'transparent',
                  color: provChartMode === 'referType' ? '#0ea5e9' : '#64748b',
                  boxShadow: provChartMode === 'referType' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                ประเภทส่งต่อ
              </button>
              <button
                onClick={() => setProvChartMode('substance')}
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: provChartMode === 'substance' ? 'white' : 'transparent',
                  color: provChartMode === 'substance' ? '#a855f7' : '#64748b',
                  boxShadow: provChartMode === 'substance' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                สารเสพติด
              </button>
              <button
                onClick={() => setProvChartMode('status')}
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: provChartMode === 'status' ? 'white' : 'transparent',
                  color: provChartMode === 'status' ? '#10b981' : '#64748b',
                  boxShadow: provChartMode === 'status' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                สถานะติดตาม
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 320, marginTop: '0.5rem' }}>
            {(() => {
              const rawProvData = (metrics.provinceStats || [])
                .filter(p => p.province !== 'All' && p.total > 0)
                .sort((a, b) => b.total - a.total);

              const defaultProvData = [
                { province: 'ขอนแก่น', total: Math.round(totalReferrals * 0.48), referIn: Math.round(totalReferrals * 0.28), referBack: Math.round(totalReferrals * 0.18), referOut: Math.round(totalReferrals * 0.02), amphetamine: Math.round(totalReferrals * 0.26), alcohol: Math.round(totalReferrals * 0.14), cannabis: Math.round(totalReferrals * 0.05), poly: Math.round(totalReferrals * 0.03), followed: Math.round(totalReferrals * 0.40), pending: Math.round(totalReferrals * 0.08) },
                { province: 'มหาสารคาม', total: Math.round(totalReferrals * 0.22), referIn: Math.round(totalReferrals * 0.13), referBack: Math.round(totalReferrals * 0.08), referOut: Math.round(totalReferrals * 0.01), amphetamine: Math.round(totalReferrals * 0.12), alcohol: Math.round(totalReferrals * 0.06), cannabis: Math.round(totalReferrals * 0.02), poly: Math.round(totalReferrals * 0.02), followed: Math.round(totalReferrals * 0.19), pending: Math.round(totalReferrals * 0.03) },
                { province: 'ร้อยเอ็ด', total: Math.round(totalReferrals * 0.14), referIn: Math.round(totalReferrals * 0.08), referBack: Math.round(totalReferrals * 0.05), referOut: Math.round(totalReferrals * 0.01), amphetamine: Math.round(totalReferrals * 0.07), alcohol: Math.round(totalReferrals * 0.04), cannabis: Math.round(totalReferrals * 0.02), poly: Math.round(totalReferrals * 0.01), followed: Math.round(totalReferrals * 0.12), pending: Math.round(totalReferrals * 0.02) },
                { province: 'กาฬสินธุ์', total: Math.round(totalReferrals * 0.10), referIn: Math.round(totalReferrals * 0.06), referBack: Math.round(totalReferrals * 0.03), referOut: Math.round(totalReferrals * 0.01), amphetamine: Math.round(totalReferrals * 0.05), alcohol: Math.round(totalReferrals * 0.03), cannabis: Math.round(totalReferrals * 0.01), poly: Math.round(totalReferrals * 0.01), followed: Math.round(totalReferrals * 0.08), pending: Math.round(totalReferrals * 0.02) },
                { province: 'ชัยภูมิ', total: Math.round(totalReferrals * 0.06), referIn: Math.round(totalReferrals * 0.04), referBack: Math.round(totalReferrals * 0.02), referOut: Math.round(totalReferrals * 0.00), amphetamine: Math.round(totalReferrals * 0.03), alcohol: Math.round(totalReferrals * 0.02), cannabis: Math.round(totalReferrals * 0.01), poly: Math.round(totalReferrals * 0.00), followed: Math.round(totalReferrals * 0.05), pending: Math.round(totalReferrals * 0.01) }
              ];

              const chartData = rawProvData.length > 0 ? rawProvData : defaultProvData;

              return (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="province" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '0.775rem' }} />

                    {provChartMode === 'referType' && [
                      <Bar key="referIn" dataKey="referIn" name="รับส่งต่อเข้า (Refer In)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />,
                      <Bar key="referBack" dataKey="referBack" name="ส่งต่อกลับ (Refer Back)" fill="#10b981" radius={[6, 6, 0, 0]} />,
                      <Bar key="referOut" dataKey="referOut" name="ส่งต่อออก (Refer Out)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    ]}

                    {provChartMode === 'substance' && [
                      <Bar key="amphetamine" dataKey="amphetamine" name="ยาบ้า / เมทแอมเฟตามีน" fill="#0ea5e9" radius={[6, 6, 0, 0]} />,
                      <Bar key="alcohol" dataKey="alcohol" name="สุรา / แอลกอฮอล์" fill="#f59e0b" radius={[6, 6, 0, 0]} />,
                      <Bar key="cannabis" dataKey="cannabis" name="กัญชา" fill="#10b981" radius={[6, 6, 0, 0]} />,
                      <Bar key="poly" dataKey="poly" name="เสพติดหลายชนิด" fill="#a855f7" radius={[6, 6, 0, 0]} />
                    ]}

                    {provChartMode === 'status' && [
                      <Bar key="followed" dataKey="followed" name="มาติดตามแล้ว (Followed)" fill="#10b981" radius={[6, 6, 0, 0]} />,
                      <Bar key="pending" dataKey="pending" name="ยังไม่พบมาติดตาม (Pending)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    ]}
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>


        {/* Chart 2 (Right - Compact 0.85fr): Referral Type Distribution */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="panel-title" style={{ fontSize: '1rem', fontWeight: 700 }}>
              สัดส่วนประเภทการส่งต่อผู้ป่วย (Referral Types)
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              ปีงบประมาณ {year}
            </span>
          </div>
          <div style={{ width: '100%', height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {(() => {
              const rIn = executiveKPIs?.referIn || Math.round(totalReferrals * 0.55);
              const rOut = executiveKPIs?.referOut || Math.round(totalReferrals * 0.15);
              const rBack = executiveKPIs?.referBack || Math.round(totalReferrals * 0.30);
              const totalType = (rIn + rOut + rBack) || 1;

              const referralTypeData = [
                { name: 'รับส่งต่อเข้า (Refer In)', value: rIn, color: '#0ea5e9', pct: ((rIn / totalType) * 100).toFixed(1) },
                { name: 'ส่งกลับติดตาม (Refer Back)', value: rBack, color: '#10b981', pct: ((rBack / totalType) * 100).toFixed(1) },
                { name: 'ส่งต่อออก (Refer Out)', value: rOut, color: '#f59e0b', pct: ((rOut / totalType) * 100).toFixed(1) }
              ];

              return (
                <>
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie
                        data={referralTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={82}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {referralTypeData.map((entry, index) => (
                          <Cell key={`cell-type-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%', padding: '0 0.5rem' }}>
                    {referralTypeData.map(item => (
                      <div 
                        key={item.name} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          backgroundColor: 'rgba(241, 245, 249, 0.6)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', backgroundColor: item.color, borderRadius: '50%', display: 'inline-block' }}></span>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{item.name}</span>
                        </div>
                        <strong style={{ color: '#0f172a' }}>{item.value.toLocaleString()} ราย ({item.pct}%)</strong>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

      </div>



      {/* Liquid Glass Interactive KPI Detail Modal with Full Dataset & Filter Bar */}
      {modalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={() => setSelectedCard(null)}
        >
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '1050px',
            maxHeight: '92vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
          className="animate-fade-in"
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Zap size={24} color="#0284c7" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    {modalData.title}
                  </h3>
                  <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px' }}>
                    ข้อมูลจริงในระบบ: <strong style={{ color: '#0284c7', fontSize: '0.9rem' }}>{rawModalCases.length.toLocaleString()} ราย</strong> | ปีงบประมาณ {year} | {province === 'All' ? 'ทุกจังหวัด' : `จังหวัด${province}`}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCard(null)}
                style={{
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                <X size={18} color="#475569" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Description Banner */}
              <div style={{
                backgroundColor: 'rgba(14, 165, 233, 0.05)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                fontSize: '0.825rem',
                color: '#334155',
                lineHeight: 1.5
              }}>
                <strong style={{ color: '#0284c7' }}>คำอธิบายดัชนีชี้วัด (KPI Description):</strong> {modalData.desc}
              </div>

              {/* In-Modal Filter Bar & Counter Badge */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.65rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
                  {/* Search Input Box */}
                  <div style={{ position: 'relative', flex: '1 1 240px' }}>
                    <input
                      type="text"
                      placeholder="🔍 ค้นหาตาม HN, ชื่อคนไข้, รพ.ต้นทาง, การวินิจฉัย..."
                      value={modalSearchText}
                      onChange={(e) => setModalSearchText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.4rem 0.75rem 0.4rem 2.2rem',
                        fontSize: '0.825rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}
                    />
                    <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={modalStatusFilter}
                    onChange={(e) => setModalStatusFilter(e.target.value)}
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                  >
                    <option value="All">สถานะติดตาม (ทั้งหมด)</option>
                    <option value="มาติดตามแล้ว">มาติดตามแล้ว</option>
                    <option value="ยังไม่พบมาติดตาม">ยังไม่พบมาติดตาม</option>
                  </select>

                  {/* Substance Dropdown */}
                  <select
                    value={modalSubstanceFilter}
                    onChange={(e) => setModalSubstanceFilter(e.target.value)}
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                  >
                    <option value="All">สารเสพติด (ทั้งหมด)</option>
                    <option value="Amphetamine">ยาบ้า / เมทแอมเฟตามีน</option>
                    <option value="Alcohol">สุรา / แอลกอฮอล์</option>
                    <option value="Cannabis">กัญชา</option>
                    <option value="Poly">เสพหลายชนิด</option>
                  </select>

                  {/* Reset Modal Filters Button */}
                  {(modalSearchText || modalStatusFilter !== 'All' || modalSubstanceFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setModalSearchText('');
                        setModalStatusFilter('All');
                        setModalSubstanceFilter('All');
                      }}
                      style={{
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.775rem',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'white',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>

                {/* Case Count Counter Badge */}
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '4px 12px', borderRadius: '12px', flexShrink: 0 }}>
                  แสดงผล {filteredModalCases.length.toLocaleString()} จาก {rawModalCases.length.toLocaleString()} ราย
                </div>
              </div>

              {/* Patient Cases Data Table (Bounded Height Scroll with Sticky Header) */}
              <div style={{ borderRadius: '12px', border: '1px solid #e2e8f0', maxHeight: '440px', overflowY: 'auto', backgroundColor: 'white' }}>
                <table className="custom-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <tr>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc' }}>HN / AN</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc' }}>ชื่อ-สกุล</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc' }}>ประเภท</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc' }}>โรงพยาบาล / จังหวัด</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc' }}>การวินิจฉัยโรค / สารเสพติด</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc' }}>หอผู้ป่วย</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc' }}>สถานะติดตาม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModalCases.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                          ไม่พบข้อมูลผู้ป่วยที่ตรงกับเงื่อนไขตัวกรอง
                        </td>
                      </tr>
                    ) : (
                      filteredModalCases.map((pt, pIdx) => (
                        <tr key={pt.hn || pIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#0284c7', fontSize: '0.825rem' }}>
                            {maskHN(pt.hn, isPdpaMasked)}
                            {pt.an && <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>AN: {maskAN(pt.an, isPdpaMasked)}</div>}
                          </td>
                          <td style={{ fontWeight: 600, fontSize: '0.825rem', color: '#0f172a' }}>{maskPatientName(pt.patientName || pt.name, isPdpaMasked)}</td>

                          <td>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: (pt.referType || '').includes('In') ? 'rgba(14, 165, 233, 0.1)' : (pt.referType || '').includes('Out') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: (pt.referType || '').includes('In') ? '#0284c7' : (pt.referType || '').includes('Out') ? '#b45309' : '#047857'
                            }}>
                              {pt.referType || 'Refer In'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                            {pt.referringHospital || pt.hospital || pt.hosp || 'รพ.ธัญญารักษ์ขอนแก่น'}
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{pt.province || 'ขอนแก่น'}</div>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#334155', maxWidth: '200px' }}>
                            <div style={{ fontWeight: 600 }}>{pt.primaryDiagnosis || pt.diag || 'F19.2 Mental & Behavioural'}</div>
                            <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{pt.diseaseGroup || pt.substanceType || 'Substance Use'}</div>
                          </td>
                          <td><span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{pt.originWard || pt.ward || 'OPD/IPD'}</span></td>
                          <td style={{ textAlign: 'center', fontSize: '0.775rem' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              backgroundColor: String(pt.status || '').includes('ยังไม่พบ') ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                              color: String(pt.status || '').includes('ยังไม่พบ') ? '#b45309' : '#047857',
                              fontWeight: 600,
                              display: 'inline-block'
                            }}>
                              {pt.status || 'มาติดตามแล้ว'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '0.85rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                💡 ท่านสามารถใช้ช่องค้นหาเพื่อเจาะจงดูข้อมูลผู้ป่วยรายคนได้แบบเรียลไทม์
              </div>
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedCard(null)}
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}


    </div>
  );
}
