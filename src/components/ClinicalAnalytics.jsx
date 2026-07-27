import React from 'react';
import { TrendingUp, BarChart3, Clock, Hourglass, Thermometer, ShieldAlert } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';

export default function ClinicalAnalytics({ yoyData, advancedMetrics, province }) {
  const {
    avgDaysToFollowUp,
    daysToFUDistribution,
    losStats,
    icdBreakdown
  } = advancedMetrics;

  const COLORS = ['#38bdf8', '#0ea5e9', '#0284c7', '#0369a1'];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top YoY Panel */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">
            <TrendingUp size={18} />
            วิเคราะห์เปรียบเทียบผลลัพธ์รายปีงบประมาณ (YoY Trend Analysis) - จังหวัด{province === 'All' ? 'ทั้งหมด' : province}
          </h2>
        </div>
        
        <div className="dashboard-layout-grid">
          <div style={{ width: '100%', height: 280 }}>

            <ResponsiveContainer>
              <LineChart data={yoyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="year" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Line 
                  type="monotone" 
                  name="อัตราติดตามสำเร็จ (Follow-up Rate)" 
                  dataKey="fuRate" 
                  stroke="var(--color-primary)" 
                  strokeWidth={3} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  name="อัตรากลับรักษาซ้ำ (Readmit Rate)" 
                  dataKey="readmRate" 
                  stroke="var(--color-red)" 
                  strokeWidth={3} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justify: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
              สรุปพัฒนาการย้อนหลัง
            </h3>
            {yoyData.map((yr, idx) => (
              <div key={yr.year} style={{ fontSize: '0.8rem', borderBottom: idx < yoyData.length - 1 ? '1px solid var(--color-border)' : 'none', paddingBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-text-dark)' }}>ปีงบประมาณ {yr.year}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                  <span>คัดกรองส่งต่อ: <strong>{yr.total} ราย</strong></span>
                  <span>ติดตาม: <strong style={{ color: 'var(--color-primary)' }}>{yr.fuRate.toFixed(1)}%</strong></span>
                  <span>กลับรักษาซ้ำ: <strong style={{ color: 'var(--color-red)' }}>{yr.readmRate.toFixed(1)}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Days to Follow Up and Length of Stay (Double Panel) */}
      <div className="dashboard-layout-grid">

        
        {/* Panel 1: Duration to Follow Up */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Clock size={18} />
              ระยะเวลาเฉลี่ยก่อนการติดตามครั้งแรก
            </h2>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-dark)', backgroundColor: 'var(--color-primary-light)', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
              เฉลี่ย {avgDaysToFollowUp.toFixed(1)} วัน
            </span>
          </div>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={daysToFUDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="range" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value, name, props) => props.payload.range === props.dataKey ? `${value.toFixed(1)}%` : `${value} ราย`} />
                <Bar name="สัดส่วนผู้ป่วย (%)" dataKey="pct" radius={[4, 4, 0, 0]}>
                  {daysToFUDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
            💡 สัดส่วนเวลาในการรับเข้าพบแพทย์/เจ้าหน้าที่สาธารณสุขครั้งแรกหลังออกจากโรงพยาบาล
          </div>
        </div>

        {/* Panel 2: Length of Stay vs Readmission */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Thermometer size={18} />
              ความสัมพันธ์ของวันนอน (LOS) กับอัตราการกลับรักษาซ้ำ
            </h2>
          </div>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={losStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="range" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Bar name="อัตรากลับรักษาซ้ำ (%)" dataKey="rate" fill="var(--color-red)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
            💡 แสดงให้เห็นผลกระทบของความรีบร้อนจำหน่ายผู้ป่วย (วันนอนสั้น) ต่อโอกาสที่จะชักหรือกลับมารักษาตัวซ้ำ
          </div>
        </div>

      </div>

      {/* Bottom ICD-10 breakdown */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">
            <ShieldAlert size={18} />
            สัดส่วนการวินิจฉัยรหัสโรคหลัก 8 อันดับแรก (Top 8 ICD-10 Diagnosis Breakdown)
          </h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {icdBreakdown.map((icd, idx) => (
            <div 
              key={icd.code}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--bg-primary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--color-primary-light)', 
                  color: 'var(--color-primary-dark)', 
                  fontWeight: 700, 
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {idx + 1}
                </span>
                <span style={{ fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                  {icd.code}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{icd.count} ราย</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>คิดเป็น {icd.pct.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
