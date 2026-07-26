import React from 'react';
import { Building2, ArrowRightLeft, Truck, Compass, CheckCircle2 } from 'lucide-react';

export default function ReferralDestinationChart({ data }) {
  const total = data ? data.length : 0;

  // Ward counts
  const wardCounts = {
    'แผนกผู้ป่วยนอก (OPD)': 0,
    'หอผู้ป่วย 4ก (จิตเวชชาย)': 0,
    'หอผู้ป่วย 1ก': 0,
    'หอผู้ป่วยบำบัดยาหญิง': 0,
    'หอผู้ป่วย 2ก': 0,
    'หอผู้ป่วยแสงอรุณ': 0,
    'อื่นๆ/IPD': 0
  };

  // Target hospital counts
  const hospitalCounts = {
    'โรงพยาบาลขอนแก่น (รพ.ศูนย์)': 0,
    'โรงพยาบาลจิตเวชขอนแก่นฯ': 0,
    'โรงพยาบาลศรีนครินทร์': 0,
    'สถาบันสุขภาพจิตเด็กฯ': 0,
    'รพ.ชุมชน/ทั่วไปในเครือข่าย': 0
  };

  // Transport mode counts
  const transportCounts = {
    'รถโรงพยาบาล (Hospital Ambulance)': 0,
    'รถกู้ชีพ/เครือข่าย (EMS Network)': 0,
    'ญาติพาไปเอง/อื่นๆ': 0
  };

  // Matrix: Ward -> Hospital
  const flowMatrix = {};

  data.forEach(row => {
    const wardRaw = String(row.diseaseGroup || row.originWard || '').trim();
    const diag = (row.primaryDiagnosis || '').toLowerCase();
    const hospRaw = String(row.province || row.destHospitalName || '').trim();

    // Ward Normalization
    let wKey = 'อื่นๆ/IPD';
    if (wardRaw.includes('4')) wKey = 'หอผู้ป่วย 4ก (จิตเวชชาย)';
    else if (wardRaw.includes('1')) wKey = 'หอผู้ป่วย 1ก';
    else if (wardRaw.includes('2')) wKey = 'หอผู้ป่วย 2ก';
    else if (wardRaw.includes('แสงอรุณ')) wKey = 'หอผู้ป่วยแสงอรุณ';
    else if (wardRaw.includes('หญิง')) wKey = 'หอผู้ป่วยบำบัดยาหญิง';
    else if (wardRaw.toLowerCase().includes('opd')) wKey = 'แผนกผู้ป่วยนอก (OPD)';
    wardCounts[wKey] = (wardCounts[wKey] || 0) + 1;

    // Hospital Normalization
    let hKey = 'โรงพยาบาลขอนแก่น (รพ.ศูนย์)';
    if (hospRaw.includes('จิตเวช')) hKey = 'โรงพยาบาลจิตเวชขอนแก่นฯ';
    else if (hospRaw.includes('ศรีนครินทร์')) hKey = 'โรงพยาบาลศรีนครินทร์';
    else if (hospRaw.includes('เด็ก')) hKey = 'สถาบันสุขภาพจิตเด็กฯ';
    else if (hospRaw.includes('นาเชือก') || hospRaw.includes('ชัยภูมิ') || hospRaw.includes('กาฬสิน')) hKey = 'รพ.ชุมชน/ทั่วไปในเครือข่าย';
    hospitalCounts[hKey] = (hospitalCounts[hKey] || 0) + 1;

    // Flow Matrix
    if (!flowMatrix[wKey]) flowMatrix[wKey] = {};
    flowMatrix[wKey][hKey] = (flowMatrix[wKey][hKey] || 0) + 1;

    // Transport Normalization
    const tRaw = String(row.transport || '').trim();
    if (tRaw.includes('กู้ชีพ') || tRaw.includes('มูลนิธิ')) {
      transportCounts['รถกู้ชีพ/เครือข่าย (EMS Network)']++;
    } else if (tRaw.includes('ญาติ')) {
      transportCounts['ญาติพาไปเอง/อื่นๆ']++;
    } else {
      transportCounts['รถโรงพยาบาล (Hospital Ambulance)']++;
    }
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="kpi-card">
          <div className="kpi-header">
            <span>ส่งต่อไป รพ.ขอนแก่น (ศูนย์)</span>
            <Building2 size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0284c7' }}>
            {hospitalCounts['โรงพยาบาลขอนแก่น (รพ.ศูนย์)']} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>ราย</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            คิดเป็น {total > 0 ? ((hospitalCounts['โรงพยาบาลขอนแก่น (รพ.ศูนย์)'] / total) * 100).toFixed(1) : 0}% ของเคสส่งต่อทั้งหมด
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>ส่งต่อไป รพ.จิตเวชฯ</span>
            <Building2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>
            {hospitalCounts['โรงพยาบาลจิตเวชขอนแก่นฯ']} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>ราย</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            เคสรักษาทางจิตเวชเฉพาะทาง
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>ส่งต่อจาก OPD (ผู้ป่วยนอก)</span>
            <Compass size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>
            {wardCounts['แผนกผู้ป่วยนอก (OPD)']} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>ราย</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            เคสคัดกรองหน้างาน OPD
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>ส่งต่อจาก หอผู้ป่วย 4ก</span>
            <Compass size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#a855f7' }}>
            {wardCounts['หอผู้ป่วย 4ก (จิตเวชชาย)']} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>ราย</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            หอผู้ป่วยที่มีสถิติส่งต่อสูงสุด
          </div>
        </div>

      </div>

      {/* Main Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
        
        {/* Left: Origin Wards & Target Hospital Distributions */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <Building2 size={18} />
              สัดส่วนโรงพยาบาลปลายทางผู้รับการส่งต่อ
            </h2>
          </div>

          {/* Hospital Share Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(hospitalCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([hName, hCount]) => {
                const pct = total > 0 ? ((hCount / total) * 100).toFixed(1) : 0;
                let color = '#0284c7';
                if (hName.includes('จิตเวช')) color = '#10b981';
                if (hName.includes('ศรีนครินทร์')) color = '#a855f7';
                if (hName.includes('ชุมชน')) color = '#f59e0b';

                return (
                  <div key={hName} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600 }}>{hName}</span>
                      <span style={{ fontWeight: 700, color }}>{hCount} ราย ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
          </div>

          <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} color="#0284c7" /> ยานพาหนะที่ใช้ในการส่งต่อ (Logistics Mode)
            </div>
            {Object.entries(transportCounts).map(([tName, tCount]) => {
              const pct = total > 0 ? ((tCount / total) * 100).toFixed(1) : 0;
              return (
                <div key={tName} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '4px', color: '#334155' }}>
                  <span>• {tName}</span>
                  <strong>{tCount} ราย ({pct}%)</strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Origin Ward -> Target Hospital Flow Matrix */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <ArrowRightLeft size={18} />
              ตารางเชื่อมโยงเส้นทางส่งต่อ (Ward-to-Hospital Referral Matrix)
            </h2>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            แสดงการไหลเวียนของผู้ป่วยจากหอผู้ป่วยต้นทางใน รพ.ธัญญารักษ์ขอนแก่น ไปยังโรงพยาบาลปลายทาง
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>หอผู้ป่วยต้นทาง</th>
                  <th style={{ textAlign: 'center' }}>รพ.ขอนแก่น</th>
                  <th style={{ textAlign: 'center' }}>รพ.จิตเวชฯ</th>
                  <th style={{ textAlign: 'center' }}>ศรีนครินทร์</th>
                  <th style={{ textAlign: 'center' }}>รวม (ราย)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(wardCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([wName, wTotal]) => {
                    const rowFlows = flowMatrix[wName] || {};
                    const toKK = rowFlows['โรงพยาบาลขอนแก่น (รพ.ศูนย์)'] || 0;
                    const toPsych = rowFlows['โรงพยาบาลจิตเวชขอนแก่นฯ'] || 0;
                    const toSri = rowFlows['โรงพยาบาลศรีนครินทร์'] || 0;

                    return (
                      <tr key={wName}>
                        <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{wName}</td>
                        <td style={{ textAlign: 'center', color: '#0284c7', fontWeight: toKK > 0 ? 700 : 400 }}>{toKK}</td>
                        <td style={{ textAlign: 'center', color: '#10b981', fontWeight: toPsych > 0 ? 700 : 400 }}>{toPsych}</td>
                        <td style={{ textAlign: 'center', color: '#a855f7', fontWeight: toSri > 0 ? 700 : 400 }}>{toSri}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, backgroundColor: 'rgba(14, 165, 233, 0.05)' }}>{wTotal}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
