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
      <div className="dashboard-layout-grid">

        
        {/* Left Side: Patient Journey Funnel */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="panel-title" style={{ fontSize: '1rem', margin: 0 }}>
              <ArrowDown size={18} color="var(--color-primary)" />
              เส้นทางบริการผู้ป่วย (Patient Journey)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              6 ขั้นตอนหลัก
            </span>
          </div>

          {/* Stepper / Funnel Stage Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {journeyData.map((step, idx) => {
              const maxCount = journeyData[0]?.count || 1;
              const widthPct = Math.max(15, (step.count / maxCount) * 100);

              const stageTitles = [
                '1. รับส่งต่อ & คัดกรอง',
                '2. ประเมินการรักษา',
                '3. บำบัดรักษา (OPD/IPD)',
                '4. วางแผนจำหน่าย (COC)',
                '5. ส่งกลับติดตามชุมชน',
                '6. ฟื้นฟูสภาพสมบูรณ์'
              ];

              const stageName = stageTitles[idx] || step.stage;

              return (
                <div 
                  key={step.stage} 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    backgroundColor: 'rgba(241, 245, 249, 0.5)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {/* Top Row: Title, Drop-off badge, Count */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                      {stageName}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {step.dropOff > 0 && (
                        <span style={{
                          color: '#dc2626',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          backgroundColor: '#fee2e2',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          border: '1px solid #fca5a5'
                        }}>
                          -{step.dropOff} ราย
                        </span>
                      )}
                      <span style={{ color: '#0284c7', fontWeight: 800, fontSize: '0.875rem' }}>
                        {step.count.toLocaleString()} <span style={{ fontSize: '0.725rem', fontWeight: 500, color: '#64748b' }}>ราย</span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Slim Visual Progress Bar & Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${widthPct}%`,
                        height: '100%',
                        background: idx === journeyData.length - 1 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                        borderRadius: '3px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                      <Clock size={10} /> {step.avgTime}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Concise Journey KPI Chips (Replaces Long Paragraph) */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'space-between',
            marginTop: '0.25rem'
          }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600 }}>บำบัด & ติดตามสำเร็จ</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669' }}>92.5%</div>
            </div>
            
            <div style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 600 }}>อัตราเคสหลุดระบบ</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626' }}>7.5%</div>
            </div>

            <div style={{ flex: 1, backgroundColor: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 600 }}>เวลารอคอยรวมเฉลี่ย</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7' }}>35 นาที</div>
            </div>
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
