import React from 'react';
import { ArrowDown, Clock, AlertTriangle, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import LeafletMap from './LeafletMap';

export default function OperationalPatientJourney({ 
  journeyData = [], 
  provinceStats = [], 
  onSelectProvince, 
  activeProvince 
}) {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <UserCheck size={22} color="var(--color-primary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Level 2: Operational & Patient Journey Dashboard (การติดตามเส้นทางบริการผู้ป่วย)
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
          ติดตามเส้นทางผู้ป่วยรับ-ส่งต่อ (Patient Journey Flow) ตั้งแต่การรับตัว คัดกรอง การรักษา จนถึงการส่งกลับชุมชนและการฟื้นฟูสภาพ
        </p>
      </div>

      {/* Main Grid: Funnel Flow Left + Leaflet Map Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem' }}>
        
        {/* Left Side: Patient Journey Funnel */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1rem' }}>
              <ArrowDown size={18} />
              วงจรเส้นทางผู้ป่วย (Patient Journey Funnel)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {journeyData.map((step, idx) => {
              const maxCount = journeyData[0]?.count || 1;
              const widthPct = Math.max(35, (step.count / maxCount) * 100);

              return (
                <div key={step.stage} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  
                  {/* Step Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span style={{ color: '#0f172a' }}>{step.stage}</span>
                    <span style={{ color: 'var(--color-primary)' }}>{step.count} ราย</span>
                  </div>

                  {/* Funnel Bar Container */}
                  <div style={{
                    width: '100%',
                    height: '32px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {/* Active Funnel Bar */}
                    <div style={{
                      width: `${widthPct}%`,
                      height: '100%',
                      backgroundColor: idx === 0 ? '#0284c7' : idx === journeyData.length - 1 ? '#10b981' : '#38bdf8',
                      borderRadius: '6px',
                      transition: 'width 0.5s ease',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '10px',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.775rem'
                    }}>
                      {step.count} ราย
                    </div>

                    {/* Stage Metrics Badges */}
                    <div style={{
                      position: 'absolute',
                      right: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.725rem'
                    }}>
                      {step.dropOff > 0 && (
                        <span style={{ color: '#ef4444', fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                          Drop-off: -{step.dropOff}
                        </span>
                      )}
                      <span style={{ color: '#475569', fontWeight: 500, backgroundColor: 'white', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                        {step.avgTime}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Journey Insight Card */}
          <div style={{
            marginTop: '0.5rem',
            backgroundColor: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.8rem',
            color: '#0f172a',
            lineHeight: 1.5
          }}>
            <strong style={{ color: '#10b981' }}>จุดเน้นการบริหารจัดการ (Process Improvement):</strong><br />
            สถิติแสดงว่ามี Drop-off รวมเพียง <strong>7.5%</strong> ในช่วงเปลี่ยนผ่านจาก Discharge Planning สู่การติดตามในชุมชน แสดงถึงประสิทธิภาพของระบบ Refer Back ในเขตสุขภาพที่ 7
          </div>
        </div>

        {/* Right Side: Leaflet Map */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '440px' }}>
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1rem' }}>
              แผนที่แสดงผลการส่งต่อรายจังหวัด (Choropleth Map)
            </h3>
          </div>

          <div style={{ flexGrow: 1, width: '100%', height: '100%', minHeight: '360px' }}>
            <LeafletMap 
              provinceStats={provinceStats} 
              activeProvince={activeProvince} 
              onSelectProvince={onSelectProvince} 
              mapMetric="fuRate" 
              getProvinceStatus={(stat) => {
                if (stat.total === 0) return { label: 'ไม่มีข้อมูลการส่งต่อ (0 ราย)', code: 'nodata' };
                if (stat.fuRate >= 80) return { label: 'ผ่านเกณฑ์ (≥80%)', code: 'green' };
                if (stat.fuRate >= 70) return { label: 'เฝ้าระวัง (70-79%)', code: 'yellow' };
                return { label: 'ต้องปรับปรุง (<70%)', code: 'red' };
              }} 
            />
          </div>
        </div>

      </div>

    </div>
  );
}
