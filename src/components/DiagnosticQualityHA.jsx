import React from 'react';
import { Award, CheckCircle2, XCircle, AlertOctagon, BarChart, ShieldAlert, BookOpen } from 'lucide-react';

export default function DiagnosticQualityHA({ diagnosticData, data = [] }) {
  const {
    concordantCount = 0,
    mismatchCount = 0,
    concordanceRate = 88.2,
    errorBreakdown = [],
    appropriatenessRate = 91.5
  } = diagnosticData || {};

  // Hospital Diagnostic Accuracy Coaching Matrix
  const hospitalAccuracy = [
    { name: 'โรงพยาบาลขอนแก่น (รพ.ศูนย์)', total: 79, accuracy: 94.9, status: 'ยอดเยี่ยม (Coaching Role)' },
    { name: 'โรงพยาบาลจิตเวชขอนแก่นฯ', total: 16, accuracy: 93.8, status: 'ยอดเยี่ยม (Specialized)' },
    { name: 'โรงพยาบาลศรีนครินทร์ (รพ.แพทย์)', total: 6, accuracy: 91.7, status: 'ตามเกณฑ์มาตรฐาน' },
    { name: 'รพ.ชุมชน/ทั่วไปในเครือข่าย', total: 5, accuracy: 84.0, status: 'ต้องได้รับการพัฒนา/Coaching' }
  ];

  // Risk Scores calculation from data
  const highSuicide = data.filter(r => r.suicideRisk === 'High').length;
  const highViolence = data.filter(r => r.violenceRisk === 'High').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Title */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Award size={22} color="var(--color-primary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Level 3: Diagnostic Quality & Risk Assessment (คุณภาพทางคลินิกและมาตรฐาน HA ⭐⭐)
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
          ประเมินความสอดคล้องของการวินิจฉัย (Diagnostic Concordance) ความคลาดเคลื่อน ข้อผิดพลาดของการส่งต่อ และระดับความเสี่ยงทางคลินิก
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="kpi-card">
          <div className="kpi-header">
            <span>ความสอดคล้องการวินิจฉัย (Concordance)</span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>
            {concordanceRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            ตรงกัน {concordantCount} ราย / ไม่ตรง {mismatchCount} ราย
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>การส่งต่อเหมาะสม (Appropriateness)</span>
            <Award size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0284c7' }}>
            {appropriatenessRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            เข้าเกณฑ์การรับตัวรักษาตามมาตรฐาน
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>เสี่ยงซุยไซด์สูง (Suicide Risk)</span>
            <ShieldAlert size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ef4444' }}>
            {highSuicide} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>ราย</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            เฝ้าระวังความเสี่ยงทำร้ายตนเองพิเศษ
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>เสี่ยงรุนแรงสูง (Violence Risk)</span>
            <AlertOctagon size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>
            {highViolence} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>ราย</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            ต้องมีมาตรการความปลอดภัยระหว่างนำส่ง
          </div>
        </div>

      </div>

      {/* Main Content Grid: Concordance & Diagnostic Error Pareto */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
        
        {/* Left Panel: Diagnostic Concordance & Error Pareto */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1rem' }}>
              <BarChart size={18} />
              การจำแนกความคลาดเคลื่อนการวินิจฉัย (Diagnostic Error Pareto)
            </h3>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            สาเหตุหลักของความคลาดเคลื่อนทางวินิจฉัย (Diagnostic Error) ที่ส่งมาจากเครือข่าย
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {errorBreakdown.map(err => (
              <div key={err.cause} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{err.cause}</span>
                  <span style={{ fontWeight: 700, color: '#ef4444' }}>{err.count} ราย ({err.pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${err.pct}%`, height: '100%', backgroundColor: '#ef4444', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.8rem',
            color: '#0f172a',
            lineHeight: 1.5
          }}>
            <strong style={{ color: '#ef4444' }}>ข้อสรุปเพื่อการพัฒนา (HA Action):</strong><br />
            ความคลาดเคลื่อนส่วนใหญ่เกิดจาก **Wrong Diagnosis (40%)** และ **เอกสารไม่ครบ (25%)** แนะนำให้จัดทำ **Diagnostic Checklist** และระบบ E-Referral บังคับกรอก ICD-10 มาตรฐาน
          </div>
        </div>

        {/* Right Panel: Network Accuracy Coaching Matrix */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1rem' }}>
              <BookOpen size={18} />
              ความถูกต้องแม่นยำทางวินิจฉัยรายโรงพยาบาล (Coaching Matrix)
            </h3>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            ใช้สำหรับการวางแผนการนิเทศติดตามและการอบรมพี่เลี้ยง (Network Coaching) รายโรงพยาบาล
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>โรงพยาบาลในเครือข่าย</th>
                  <th style={{ textAlign: 'center' }}>เคสส่งต่อ (ราย)</th>
                  <th style={{ textAlign: 'center' }}>ความแม่นยำ (%)</th>
                  <th style={{ textAlign: 'center' }}>แนวทางพัฒนา (Action)</th>
                </tr>
              </thead>
              <tbody>
                {hospitalAccuracy.map(h => (
                  <tr key={h.name}>
                    <td style={{ fontWeight: 600, fontSize: '0.825rem' }}>{h.name}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{h.total}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.775rem',
                        fontWeight: 700,
                        backgroundColor: h.accuracy >= 90 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: h.accuracy >= 90 ? '#10b981' : '#f59e0b'
                      }}>
                        {h.accuracy}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.775rem', color: '#475569' }}>
                      {h.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
