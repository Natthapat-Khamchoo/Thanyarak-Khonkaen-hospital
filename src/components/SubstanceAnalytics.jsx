import React, { useState } from 'react';
import { Pill, Activity, AlertTriangle, ShieldCheck, PieChart, BarChart2, Layers } from 'lucide-react';

export default function SubstanceAnalytics({ data }) {
  const [selectedSubstance, setSelectedSubstance] = useState('All');

  // Compute Substance analytics from dataset
  const total = data ? data.length : 0;

  const substanceCounts = {
    'Amphetamine (ยาบ้า)': 0,
    'Alcohol (สุรา)': 0,
    'Poly-substance (เสพหลายชนิด)': 0,
    'Marijuana (กัญชา)': 0,
    'ทั่วไป/ไม่ระบุ': 0
  };

  const categoryCounts = {
    'กาย (Physical Care)': 0,
    'จิต (Psychiatric Care)': 0
  };

  // Diagnosis complications mapping
  const complications = {
    'Delirium / Alteration of Consciousness': 0,
    'Seizure / Epilepsy': 0,
    'Septic Shock / Severe Infection': 0,
    'Drug Overdose / Intoxication': 0,
    'Fracture / Physical Trauma': 0,
    'Psychosis / Severe SMI': 0
  };

  data.forEach(row => {
    const drug = row.diseaseGroup || '';
    const diag = (row.primaryDiagnosis || '').toLowerCase();

    // Substance classification
    let sKey = 'ทั่วไป/ไม่ระบุ';
    if (drug.includes('Poly') || drug.includes('+') || drug.includes(',') || diag.includes('multiple')) {
      sKey = 'Poly-substance (เสพหลายชนิด)';
    } else if (drug.includes('Amp') || diag.includes('amp')) {
      sKey = 'Amphetamine (ยาบ้า)';
    } else if (drug.includes('Alc') || diag.includes('alcohol')) {
      sKey = 'Alcohol (สุรา)';
    } else if (drug.includes('Mari') || diag.includes('cannab')) {
      sKey = 'Marijuana (กัญชา)';
    }
    substanceCounts[sKey] = (substanceCounts[sKey] || 0) + 1;

    // Care Category classification
    if (drug.includes('จิต') || diag.includes('schiz') || diag.includes('psycho')) {
      categoryCounts['จิต (Psychiatric Care)']++;
    } else {
      categoryCounts['กาย (Physical Care)']++;
    }

    // Complications
    if (diag.includes('delirium') || diag.includes('consciousness') || diag.includes('alteration')) {
      complications['Delirium / Alteration of Consciousness']++;
    } else if (diag.includes('seizure') || diag.includes('epilepsy')) {
      complications['Seizure / Epilepsy']++;
    } else if (diag.includes('septic') || diag.includes('shock') || diag.includes('infection') || diag.includes('pneumonia')) {
      complications['Septic Shock / Severe Infection']++;
    } else if (diag.includes('overdose') || diag.includes('intoxication')) {
      complications['Drug Overdose / Intoxication']++;
    } else if (diag.includes('fx') || diag.includes('fracture') || diag.includes('wound') || diag.includes('trauma')) {
      complications['Fracture / Physical Trauma']++;
    } else {
      complications['Psychosis / Severe SMI']++;
    }
  });

  const ampPct = total > 0 ? ((substanceCounts['Amphetamine (ยาบ้า)'] / total) * 100).toFixed(1) : 0;
  const alcPct = total > 0 ? ((substanceCounts['Alcohol (สุรา)'] / total) * 100).toFixed(1) : 0;
  const polyPct = total > 0 ? ((substanceCounts['Poly-substance (เสพหลายชนิด)'] / total) * 100).toFixed(1) : 0;
  const physicalPct = total > 0 ? ((categoryCounts['กาย (Physical Care)'] / total) * 100).toFixed(1) : 0;
  const psychPct = total > 0 ? ((categoryCounts['จิต (Psychiatric Care)'] / total) * 100).toFixed(1) : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* KPI Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="kpi-card">
          <div className="kpi-header">
            <span>ยาบ้า (Amphetamine)</span>
            <Pill size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ef4444' }}>
            {substanceCounts['Amphetamine (ยาบ้า)']} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>ราย ({ampPct}%)</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            สารเสพติดอันดับ 1 ที่พบในเคสส่งต่อ
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>สุรา (Alcohol)</span>
            <Activity size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>
            {substanceCounts['Alcohol (สุรา)']} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>ราย ({alcPct}%)</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            พบบ่อยในเคส Delirium & Seizure
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>เสพผสม (Poly-substance)</span>
            <Layers size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#a855f7' }}>
            {substanceCounts['Poly-substance (เสพหลายชนิด)']} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>ราย ({polyPct}%)</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            ความเสี่ยงซับซ้อนสูง ต้องเฝ้าระวังพิเศษ
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>สัดส่วนดูแล กาย vs จิต</span>
            <BarChart2 size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
            กาย <span style={{ color: '#0284c7' }}>{physicalPct}%</span> / จิต <span style={{ color: '#10b981' }}>{psychPct}%</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            เคสส่วนใหญ่ส่งต่อด้วยภาวะแทรกซ้อนทางกาย
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="dashboard-layout-grid">

        
        {/* Left Panel: Care Ratio & Substance Breakdown */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <PieChart size={18} />
              สัดส่วนประเภทสารเสพติดและกลุ่มการรักษา
            </h2>
          </div>

          {/* Care Ratio Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              <span>ด้านการดูแลทางกาย (Physical Care)</span>
              <span>ด้านจิตเวช/ยาเสพติด (Psychiatric)</span>
            </div>
            <div style={{ width: '100%', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${physicalPct}%`, backgroundColor: '#0284c7', transition: 'width 0.5s ease' }} title={`ทางกาย: ${physicalPct}%`} />
              <div style={{ width: `${psychPct}%`, backgroundColor: '#10b981', transition: 'width 0.5s ease' }} title={`ทางจิต: ${psychPct}%`} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              <span>{categoryCounts['กาย (Physical Care)']} ราย ({physicalPct}%)</span>
              <span>{categoryCounts['จิต (Psychiatric Care)']} ราย ({psychPct}%)</span>
            </div>
          </div>

          {/* Substance Category List Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>จำแนกตามชนิดสารเสพติดหลัก</div>

            {Object.entries(substanceCounts).map(([sName, sCount]) => {
              const pct = total > 0 ? ((sCount / total) * 100).toFixed(1) : 0;
              let barColor = '#64748b';
              if (sName.includes('Amp')) barColor = '#ef4444';
              if (sName.includes('Alc')) barColor = '#f59e0b';
              if (sName.includes('Poly')) barColor = '#a855f7';
              if (sName.includes('Mari')) barColor = '#10b981';

              return (
                <div key={sName} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 500 }}>{sName}</span>
                    <span style={{ fontWeight: 700, color: barColor }}>{sCount} ราย ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Medical Complications Matrix */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <AlertTriangle size={18} />
              ภาวะแทรกซ้อนทางกายและวิกฤตทางคลินิก (Top Complications)
            </h2>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            สถิติการวินิจฉัยภาวะแทรกซ้อนทางกายที่พบบ่อยในผู้ป่วยบำบัดสารเสพติดที่ต้องส่งต่อ รพ.ศูนย์
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ภาวะแทรกซ้อนทางคลินิก</th>
                  <th style={{ textAlign: 'center' }}>จำนวน (ราย)</th>
                  <th style={{ textAlign: 'center' }}>สัดส่วน (%)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(complications)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cName, cCount]) => {
                    const pct = total > 0 ? ((cCount / total) * 100).toFixed(1) : 0;
                    return (
                      <tr key={cName}>
                        <td style={{ fontWeight: 600, fontSize: '0.825rem' }}>{cName}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                          {cCount}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem', 
                            fontWeight: 700,
                            backgroundColor: cCount > 10 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                            color: cCount > 10 ? '#ef4444' : '#0284c7'
                          }}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Clinical Guidance Banner */}
      <div style={{
        backgroundColor: 'rgba(14, 165, 233, 0.05)',
        border: '1px solid rgba(14, 165, 233, 0.25)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem'
      }}>
        <ShieldCheck size={24} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.6 }}>
          <strong style={{ color: '#0284c7' }}>ข้อเสนอแนะเชิงคลินิกสำหรับทีมบำบัด (Clinical Action Plan):</strong><br />
          เนื่องจากเคสส่งต่อมากกว่า <strong>79%</strong> เกิดจากภาวะแทรกซ้อนทางกาย (เช่น Delirium, Seizure จาก Alcohol Withdrawal และ Septic Shock) เสนอให้จัดตั้ง **Medical Complication Pre-warning Protocol** ในหอผู้ป่วยจิตเวช/บำบัดยา เพื่อประเมิน Vitals & Lab ล่วงหน้า ช่วยลดอัตราเคสวิกฤตที่ต้องส่งต่อไปยัง รพ.ขอนแก่น
        </div>
      </div>

    </div>
  );
}
