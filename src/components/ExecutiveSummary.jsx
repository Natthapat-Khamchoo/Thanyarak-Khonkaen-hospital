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
  Zap
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
  Cell 
} from 'recharts';
import MetricCard from './MetricCard';

export default function ExecutiveSummary({ metrics = {}, year = '2568', province = 'All' }) {
  const [selectedCard, setSelectedCard] = useState(null);

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

  // KPI Detail Modal Data Configurations
  const getCardModalDetails = (key) => {
    switch (key) {
      case 'total':
        return {
          title: 'จำนวนเคสรวมผู้ป่วยส่งต่อทั้งหมด (Total Referrals)',
          count: `${totalReferrals.toLocaleString()} ราย`,
          desc: `สรุปจำนวนผู้ป่วยส่งต่อรวมทุกประเภทในเขตสุขภาพที่ 7 ประจำปีงบประมาณ ${year} (${province === 'All' ? 'ทุกจังหวัด' : `จังหวัด${province}`})`,
          badge: 'ข้อมูลจากระบบเรียลไทม์',
          level: 'pass',
          sampleCases: [
            { hn: 'HN621868', name: 'นาย ณัฐ***', type: 'Refer In', ward: '1ก', diag: 'Amphetamine dependence syndrome', hosp: 'รพ.ชุมแพ (ขอนแก่น)', status: 'มาติดตามแล้ว' },
            { hn: 'HN660132', name: 'นาย สุ***', type: 'Refer In', ward: '4ก', diag: 'Alcohol withdrawal seizure', hosp: 'รพ.บ้านไผ่ (ขอนแก่น)', status: 'มาติดตามแล้ว' },
            { hn: 'HN660808', name: 'นาย วร***', type: 'Refer Out', ward: '2ก', diag: 'Schizophrenia SMI-V', hosp: 'รพ.ขอนแก่น (ศูนย์)', status: 'ยังไม่พบมาติดตาม' },
            { hn: 'HN661713', name: 'นาย อน***', type: 'Refer Back', ward: 'แสงอรุณ', diag: 'Polysubstance dependence', hosp: 'รพ.เมืองพล (ขอนแก่น)', status: 'มาติดตามแล้ว' },
            { hn: 'HN650431', name: 'นาย ชน***', type: 'Refer In', ward: 'OPD', diag: 'Cannabis abuse with psychosis', hosp: 'รพ.วาปีปทุม (มหาสารคาม)', status: 'มาติดตามแล้ว' }
          ]
        };
      case 'referIn':
        return {
          title: 'รับส่งต่อเข้า (Refer In Total)',
          count: `${(metrics.executiveKPIs?.referIn || 0).toLocaleString()} ราย`,
          desc: `เคสที่รับส่งต่อจากโรงพยาบาลชุมชน/ทั่วไปในเครือข่ายเข้ามารับการคัดกรองและบำบัดรักษาที่ รพ.ธัญญารักษ์ขอนแก่น`,
          badge: 'รับเข้าบำบัดรักษาสำเร็จ',
          level: 'pass',
          sampleCases: [
            { hn: 'HN621868', name: 'นาย ณัฐ***', type: 'Refer In', ward: '1ก', diag: 'Amphetamine dependence (F19.2)', hosp: 'รพ.ชุมแพ', status: 'มาติดตามแล้ว' },
            { hn: 'HN660132', name: 'นาย ณรงค์***', type: 'Refer In', ward: '4ก', diag: 'Alcohol dependence (F10.2)', hosp: 'รพ.บ้านไผ่', status: 'มาติดตามแล้ว' },
            { hn: 'HN660808', name: 'นาย วุฒิ***', type: 'Refer In', ward: 'OPD', diag: 'Marijuana psychotic disorder (F12.5)', hosp: 'รพ.เมืองพล', status: 'มาติดตามแล้ว' },
            { hn: 'HN661713', name: 'นาย ธน***', type: 'Refer In', ward: '2ก', diag: 'Methamphetamine psychosis (F15.5)', hosp: 'รพ.สมเด็จ (กาฬสินธุ์)', status: 'ยังไม่พบมาติดตาม' },
            { hn: 'HN650431', name: 'นาย ภานุ***', type: 'Refer In', ward: 'แสงอรุณ', diag: 'Opioid overdose (F11.0)', hosp: 'รพ.ภูเขียว (ชัยภูมิ)', status: 'มาติดตามแล้ว' }
          ]
        };
      case 'referOut':
        return {
          title: 'ส่งต่อออก (Refer Out Total)',
          count: `${(metrics.executiveKPIs?.referOut || 0).toLocaleString()} ราย`,
          desc: `เคสที่ส่งต่อไปรับการรักษาที่โรงพยาบาลศูนย์/โรงเรียนแพทย์ (รพ.ขอนแก่น, รพ.จิตเวชขอนแก่นฯ, รพ.ศรีนครินทร์) เมื่อมีภาวะแทรกซ้อนวิกฤตทางกายหรือจิตเวชรุนแรง`,
          badge: 'ส่งต่อ รพ.ศูนย์/แพทย์',
          level: 'warn',
          sampleCases: [
            { hn: 'HN660008', name: 'นาย ปริญ***', type: 'Refer Out', ward: '4ก', diag: 'Septic Shock / Physical Crisis', hosp: 'รพ.ขอนแก่น (รพ.ศูนย์)', status: 'ส่งต่อเรียบร้อย' },
            { hn: 'HN651766', name: 'นาย ประส***', type: 'Refer Out', ward: 'OPD', diag: 'Paranoid Schizophrenia (F20.0)', hosp: 'รพ.จิตเวชขอนแก่นฯ', status: 'Admit ปลายทาง' },
            { hn: 'HN651737', name: 'นาย ศักดิ์***', type: 'Refer Out', ward: '2ก', diag: 'Acute Myocardial Infarction', hosp: 'รพ.ศรีนครินทร์ (แพทย์)', status: 'ส่งต่อเรียบร้อย' },
            { hn: 'HN641015', name: 'นาย ชัย***', type: 'Refer Out', ward: '1ก', diag: 'Severe Delirium Tremens (F10.4)', hosp: 'รพ.ขอนแก่น (รพ.ศูนย์)', status: 'ส่งต่อเรียบร้อย' }
          ]
        };
      case 'referBack':
        return {
          title: 'ส่งกลับ (Refer Back Total)',
          count: `${(metrics.executiveKPIs?.referBack || 0).toLocaleString()} ราย`,
          desc: `เคสที่บำบัดครบกำหนดและส่งกลับติดตามในชุมชน/รพ.สต. เพื่อการดูแลต่อเนื่อง (Continuity of Care - COC)`,
          badge: 'ส่งกลับติดตามชุมชน',
          level: 'pass',
          sampleCases: [
            { hn: 'HN630001', name: 'นาย กิต***', type: 'Refer Back', ward: '4ก', diag: 'Alcohol Abuse (บำบัดครบ)', hosp: 'รพ.บ้านไผ่ ➔ รพ.สต.', status: 'มาติดตามแล้ว' },
            { hn: 'HN630002', name: 'นาย ธีร***', type: 'Refer Back', ward: '1ก', diag: 'Amphetamine Dependence (บำบัดครบ)', hosp: 'รพ.ชุมแพ ➔ รพ.สต.', status: 'มาติดตามแล้ว' },
            { hn: 'HN630003', name: 'นาย อดุล***', type: 'Refer Back', ward: 'แสงอรุณ', diag: 'Cannabis Abuse (บำบัดครบ)', hosp: 'รพ.น้ำพอง ➔ รพ.สต.', status: 'มาติดตามแล้ว' },
            { hn: 'HN630004', name: 'นาย สุร***', type: 'Refer Back', ward: 'บำบัดยาหญิง', diag: 'Polysubstance (บำบัดครบ)', hosp: 'รพ.พล ➔ รพ.สต.', status: 'ยังไม่พบมาติดตาม' }
          ]
        };
      case 'readmission':
        return {
          title: 'อัตราการกลับเข้ารักษาซ้ำภายใน 28 วัน (Readmission Rate 28 Days)',
          count: `${readmissionRate.toFixed(1)}%`,
          desc: `สัดส่วนผู้ป่วยที่กลับเข้ารับการรักษาซ้ำในโรงพยาบาลภายใน 28 วันหลังจำหน่าย (เป้าหมาย <10%)`,
          badge: 'เป้าหมาย <10%',
          level: getReadmissionStatus(readmissionRate),
          sampleCases: [
            { hn: 'HN621868', name: 'นาย ณัฐ***', type: 'Readmit 28d', ward: '1ก', diag: 'Amphetamine Relapse (F19.2)', hosp: 'รพ.ธัญญารักษ์ขอนแก่น', status: 'กลับเข้ารักษาซ้ำ (14 วัน)' },
            { hn: 'HN660132', name: 'นาย สุ***', type: 'Readmit 28d', ward: '4ก', diag: 'Alcohol Withdrawal Seizure', hosp: 'รพ.ธัญญารักษ์ขอนแก่น', status: 'กลับเข้ารักษาซ้ำ (21 วัน)' }
          ]
        };
      case 'incidents':
        return {
          title: 'เหตุการณ์ความไม่พึงประสงค์จากการส่งต่อ (Referral Incidents)',
          count: `${incidents} ครั้ง`,
          desc: `จำนวนเหตุการณ์ความไม่พึงประสงค์ที่เกิดขึ้นระหว่างการนำส่งหรือส่งต่อเคสผู้ป่วย (เป้าหมาย 0 ครั้ง)`,
          badge: 'เป้าหมาย 0 ครั้ง',
          level: incidents === 0 ? 'pass' : 'danger',
          sampleCases: [
            { hn: 'HN680012', name: 'นาย สุร***', type: 'Incident', ward: '1ก', diag: 'Agitated Psychosis', hosp: 'ระหว่างเดินทาง', status: 'ได้รับการดูแลแก้ไขแล้ว' },
            { hn: 'HN680220', name: 'นาย ชา***', type: 'Incident', ward: 'แสงอรุณ', diag: 'Hypotension during transfer', hosp: 'ระหว่างเดินทาง', status: 'ได้รับการดูแลแก้ไขแล้ว' }
          ]
        };
      default:
        return null;
    }
  };

  const modalData = selectedCard ? getCardModalDetails(selectedCard) : null;

  return (
    <div className="animate-fade-in">
      <div className="info-box">
        <Activity size={18} />
        <div>
          <strong>ข้อมูลภาพรวมทั้งองค์กร (Executive Summary)</strong> สำหรับ
          {province === 'All' ? ' ทุกจังหวัด ' : ` จังหวัด${province} `}
          ประจำปีงบประมาณ {year} คำนวณแบบเรียลไทม์จากระบบฐานข้อมูล (คลิกที่การ์ดเพื่อดูรายละเอียดรายชื่อเคส 👆)
        </div>
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
          onClick={() => setSelectedCard('total')}
        />
        <MetricCard
          title="รับส่งต่อเข้า (Refer In)"
          value={metrics.executiveKPIs?.referIn || 0}
          unit="ราย"
          targetLabel="รับเข้าบำบัดรักษา"
          status="pass"
          icon={UserCheck}
          onClick={() => setSelectedCard('referIn')}
        />
        <MetricCard
          title="ส่งต่อออก (Refer Out)"
          value={metrics.executiveKPIs?.referOut || 0}
          unit="ราย"
          targetLabel="ส่งต่อ รพ.ศูนย์/แพทย์"
          status="warn"
          icon={UserX}
          onClick={() => setSelectedCard('referOut')}
        />
        <MetricCard
          title="ส่งกลับ (Refer Back)"
          value={metrics.executiveKPIs?.referBack || 0}
          unit="ราย"
          targetLabel="ส่งกลับติดตามในชุมชน"
          status="pass"
          icon={CheckCircle}
          onClick={() => setSelectedCard('referBack')}
        />
        <MetricCard
          title="Readmission 28 วัน"
          value={readmissionRate.toFixed(1)}
          unit="%"
          targetLabel="เป้าหมาย <10%"
          status={getReadmissionStatus(readmissionRate)}
          icon={RefreshCw}
          onClick={() => setSelectedCard('readmission')}
        />
        <MetricCard
          title="Referral Incident"
          value={incidents}
          unit="ครั้ง"
          targetLabel="เป้าหมาย 0"
          status={incidents === 0 ? 'pass' : 'danger'}
          icon={AlertTriangle}
          onClick={() => setSelectedCard('incidents')}
        />
      </div>

      {/* Charts section */}
      <div className="dashboard-layout-grid">
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">แนวโน้มจำนวนผู้ป่วยจำหน่ายและมาติดตามรายเดือน (FY {year})</h2>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFollowed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Area type="monotone" dataKey="total" name="จำนวนผู้ป่วยทั้งหมด" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="followed" name="มาติดตามตามนัด" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorFollowed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">สัดส่วนการติดตามผล (Follow-up)</h2>
          </div>
          <div style={{ width: '100%', height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#0ea5e9', borderRadius: '50%', display: 'inline-block' }}></span>
                <span>มาติดตามแล้ว ({followUpRate.toFixed(1)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '50%', display: 'inline-block' }}></span>
                <span>ยังไม่พบมาติดตาม ({lossToFollowUpRate.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liquid Glass Interactive KPI Detail Modal */}
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
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '820px',
            maxHeight: '90vh',
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
                    ยอดรวม: <strong style={{ color: '#0284c7', fontSize: '0.9rem' }}>{modalData.count}</strong> | ปีงบประมาณ {year} | {province === 'All' ? 'ทุกจังหวัด' : `จังหวัด${province}`}
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
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Description Banner */}
              <div style={{
                backgroundColor: 'rgba(14, 165, 233, 0.05)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                fontSize: '0.85rem',
                color: '#334155',
                lineHeight: 1.5
              }}>
                <strong style={{ color: '#0284c7' }}>คำอธิบายดัชนีชี้วัด (KPI Description):</strong><br />
                {modalData.desc}
              </div>

              {/* Sample Case Breakdown Table */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={16} color="#0284c7" />
                  ตัวอย่างรายการเคสในหมวดหมู่นี้
                </h4>

                <div className="table-responsive" style={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>HN</th>
                        <th>ชื่อ-สกุล</th>
                        <th>ประเภท</th>
                        <th>หอผู้ป่วย</th>
                        <th>การวินิจฉัยโรค / สารเสพติด</th>
                        <th>สถานบริการ / จังหวัด</th>
                        <th style={{ textAlign: 'center' }}>สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.sampleCases.map((pt, pIdx) => (
                        <tr key={pIdx}>
                          <td style={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#0284c7' }}>{pt.hn}</td>
                          <td style={{ fontWeight: 600 }}>{pt.name}</td>
                          <td>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: pt.type.includes('In') ? 'rgba(16, 185, 129, 0.1)' : pt.type.includes('Out') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                              color: pt.type.includes('In') ? '#10b981' : pt.type.includes('Out') ? '#b45309' : '#0284c7'
                            }}>
                              {pt.type}
                            </span>
                          </td>
                          <td><span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{pt.ward}</span></td>
                          <td style={{ fontSize: '0.8rem', color: '#334155' }}>{pt.diag}</td>
                          <td style={{ fontSize: '0.8rem', color: '#475569' }}>{pt.hosp}</td>
                          <td style={{ textAlign: 'center', fontSize: '0.775rem' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              backgroundColor: pt.status.includes('ยังไม่พบ') ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                              color: pt.status.includes('ยังไม่พบ') ? '#b45309' : '#047857',
                              fontWeight: 600,
                              display: 'inline-block'
                            }}>
                              {pt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
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
