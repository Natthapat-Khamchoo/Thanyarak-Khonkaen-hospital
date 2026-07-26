import React, { useState } from 'react';
import { Network, HelpCircle, ArrowRight, Lightbulb, Map, FileText, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import LeafletMap from './LeafletMap';

// Mapping from SVG IDs to Thai Province Names in our database
const provinceIdToThai = {
  'kkn': 'ขอนแก่น',
  'mkm': 'มหาสารคาม',
  'ret': 'ร้อยเอ็ด',
  'ksn': 'กาฬสินธุ์',
  'nki': 'หนองคาย'
};

export default function NetworkPerformance({ provinceStats, onSelectProvince, activeProvince }) {
  // Map Metric Selector
  const [mapMetric, setMapMetric] = useState('fuRate'); // 'fuRate', 'lostRate', 'readmRate'
  
  // Hover State for Tooltip
  const [hoveredProvince, setHoveredProvince] = useState(null); // { id, name, val, status, isActive }

  // Threshold calculators for cell colors
  const getFollowUpStatus = (rate, total = 1) => {
    if (total === 0) return { label: 'ไม่มีข้อมูล (0 ราย)', color: '#64748b', bg: '#f1f5f9', code: 'nodata' };
    if (rate >= 80) return { label: 'ผ่านเกณฑ์ (≥80%)', color: 'var(--color-green)', bg: 'var(--color-green-light)', code: 'green' };
    if (rate >= 70) return { label: 'เฝ้าระวัง (70-79%)', color: 'var(--color-yellow)', bg: 'var(--color-yellow-light)', code: 'yellow' };
    return { label: 'ต้องปรับปรุง (<70%)', color: 'var(--color-red)', bg: 'var(--color-red-light)', code: 'red' };
  };

  const getLostStatus = (rate, total = 1) => {
    if (total === 0) return { label: 'ไม่มีข้อมูล (0 ราย)', color: '#64748b', bg: '#f1f5f9', code: 'nodata' };
    if (rate < 15) return { label: 'ผ่านเกณฑ์ (<15%)', color: 'var(--color-green)', bg: 'var(--color-green-light)', code: 'green' };
    if (rate < 25) return { label: 'เฝ้าระวัง (15-24%)', color: 'var(--color-yellow)', bg: 'var(--color-yellow-light)', code: 'yellow' };
    return { label: 'ต้องปรับปรุง (≥25%)', color: 'var(--color-red)', bg: 'var(--color-red-light)', code: 'red' };
  };

  const getReadmissionStatus = (rate, total = 1) => {
    if (total === 0) return { label: 'ไม่มีข้อมูล (0 ราย)', color: '#64748b', bg: '#f1f5f9', code: 'nodata' };
    if (rate < 5) return { label: 'ผ่านเกณฑ์ (<5%)', color: 'var(--color-green)', bg: 'var(--color-green-light)', code: 'green' };
    if (rate < 10) return { label: 'เฝ้าระวัง (5-9%)', color: 'var(--color-yellow)', bg: 'var(--color-yellow-light)', code: 'yellow' };
    return { label: 'ต้องปรับปรุง (≥10%)', color: 'var(--color-red)', bg: 'var(--color-red-light)', code: 'red' };
  };

  // Get status details based on selected metric
  const getProvinceStatus = (stat, metric) => {
    const total = stat ? stat.total : 0;
    const rate = stat ? stat[metric] || 0 : 0;
    if (metric === 'fuRate') return getFollowUpStatus(rate, total);
    if (metric === 'lostRate') return getLostStatus(rate, total);
    return getReadmissionStatus(rate, total);
  };

  // Generate recommendations dynamically based on stats
  const generateRecommendations = () => {
    return provinceStats.map(stat => {
      const recs = [];
      if (stat.total === 0) {
        recs.push({
          type: 'info',
          text: `ยังไม่มีเคสส่งต่อจากจังหวัด${stat.province} ในปีงบประมาณที่เลือก`
        });
        return { province: stat.province, recs };
      }

      const fu = getFollowUpStatus(stat.fuRate, stat.total);
      const readm = getReadmissionStatus(stat.readmRate, stat.total);

      if (fu.code === 'red') {
        recs.push({
          type: 'danger',
          text: `อัตราการติดตามสำเร็จต่ำกว่าเกณฑ์ (${stat.fuRate.toFixed(1)}%) เสนอให้ผู้ตรวจราชการฯ มีข้อสั่งการเร่งรัด จัดตั้งทีมแพทย์/พยาบาลจิตเวชร่วมกับ รพ.สต. และ อสม. ลงพื้นที่แบบเคาะประตูบ้านเพื่อติดตามผู้ป่วย และประสานส่งต่อข้อมูลผ่านระบบสุขภาพเครือข่ายปฐมภูมิ`
        });
      } else if (fu.code === 'yellow') {
        recs.push({
          type: 'warning',
          text: `อัตราการติดตามสำเร็จอยู่ในช่วงเฝ้าระวัง (${stat.fuRate.toFixed(1)}%) เสนอให้จัดตั้งระบบโทรติดตามผู้นัดล่วงหน้า 3 วัน และใช้แอปพลิเคชันหรือสายด่วนเพื่อให้ผู้ป่วย/ญาติแจ้งปัญหาเบื้องต้นได้`
        });
      }

      if (readm.code === 'red') {
        recs.push({
          type: 'danger',
          text: `อัตราการกลับเข้ารักษาตัวซ้ำ (Readmission 28 วัน) สูงเกินเกณฑ์มาตรฐาน (${stat.readmRate.toFixed(1)}%) บ่งบอกถึงอาการกำเริบหลังจำหน่ายอย่างรวดเร็ว ทีมนำทางคลินิก (PCT) และเภสัชกรรมโรงพยาบาลควรเข้าทบทวนแผนจัดการยา (Medication Reconciliation) และกำกับการกินยาอย่างเคร่งครัดร่วมกับญาติ`
        });
      } else if (readm.code === 'yellow') {
        recs.push({
          type: 'warning',
          text: `เริ่มมีแนวโน้มการกลับเข้ารักษาตัวซ้ำสูงขึ้นในระยะเฝ้าระวัง (${stat.readmRate.toFixed(1)}%) เสนอให้เพิ่มโปรแกรมฟื้นฟูสมรรถภาพและการประเมินความเครียดซ้ำเป็นระยะโดยศูนย์บริการสาธารณสุขใกล้บ้าน`
        });
      }

      if (fu.code === 'green' && readm.code === 'green') {
        recs.push({
          type: 'success',
          text: `ผลการดำเนินงานอยู่ในเกณฑ์ยอดเยี่ยม (ติดตามสำเร็จ ${stat.fuRate.toFixed(1)}%, กลับรักษาซ้ำ ${stat.readmRate.toFixed(1)}%) แนะนำให้รักษามาตรฐานการดูแลส่งต่อและสามารถถอดบทเรียนเป็น Best Practice ในการบริหารเครือข่ายของเขตสุขภาพได้`
        });
      }

      return {
        province: stat.province,
        recs
      };
    });
  };

  const recommendations = generateRecommendations();

  // Handle hover events on map
  const handleMouseEnter = (pathId, label) => {
    const thaiName = provinceIdToThai[pathId];
    if (thaiName) {
      const stat = provinceStats.find(s => s.province === thaiName);
      if (stat) {
        const statusDetails = getProvinceStatus(stat, mapMetric);
        let metricLabel = 'อัตราการติดตามสำเร็จ';
        if (mapMetric === 'lostRate') metricLabel = 'อัตรา Lost FU';
        if (mapMetric === 'readmRate') metricLabel = 'อัตรากลับเข้ารักษาซ้ำ';
        
        setHoveredProvince({
          id: pathId,
          name: thaiName,
          val: stat.total === 0 ? 'ไม่มีข้อมูล (0 ราย)' : `${stat[mapMetric].toFixed(1)}%`,
          valRaw: stat[mapMetric],
          statusLabel: statusDetails.label,
          statusColor: statusDetails.color,
          isActive: true
        });
        return;
      }
    }
    
    // Non-active province
    setHoveredProvince({
      id: pathId,
      name: label,
      val: 'ไม่มีข้อมูลในเครือข่ายส่งต่อ',
      isActive: false
    });
  };

  const handleMouseLeave = () => {
    setHoveredProvince(null);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Level 2 Visual & Interactive Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        
        {/* Left Side: Province Table */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="panel-header">
              <h2 className="panel-title">
                <Network size={18} />
                เปรียบเทียบผลการดำเนินงานเครือข่ายรายจังหวัด
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <HelpCircle size={14} />
                คลิกเลือกแถวเพื่อเจาะลึกเฉพาะจังหวัด
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>จังหวัด</th>
                    <th style={{ textAlign: 'center' }}>ส่งต่อ (ราย)</th>
                    <th style={{ textAlign: 'center' }}>ติดตามสำเร็จ (%)</th>
                    <th style={{ textAlign: 'center' }}>Lost FU (%)</th>
                    <th style={{ textAlign: 'center' }}>Readmit 28 วัน (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {provinceStats.map((stat) => {
                    const isSelected = activeProvince === stat.province;
                    const fuStatus = getFollowUpStatus(stat.fuRate, stat.total);
                    const lostStatus = getLostStatus(stat.lostRate, stat.total);
                    const readmStatus = getReadmissionStatus(stat.readmRate, stat.total);
                    const isNoData = stat.total === 0;

                    return (
                      <tr 
                        key={stat.province} 
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
                          borderLeft: isSelected ? '4px solid var(--color-primary)' : 'none',
                          transition: 'var(--transition-fast)'
                        }}
                        onClick={() => onSelectProvince(isSelected ? 'All' : stat.province)}
                      >
                        <td style={{ fontWeight: 600 }}>{stat.province}</td>
                        <td style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                          {stat.total.toLocaleString()}
                        </td>
                        <td className={`heatmap-cell status-${fuStatus.code}`}>
                          {isNoData ? '-' : `${stat.fuRate.toFixed(1)}%`}
                        </td>
                        <td className={`heatmap-cell status-${lostStatus.code}`}>
                          {isNoData ? '-' : `${stat.lostRate.toFixed(1)}%`}
                        </td>
                        <td className={`heatmap-cell status-${readmStatus.code}`}>
                          {isNoData ? '-' : `${stat.readmRate.toFixed(1)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="legend-container" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <div className="legend-item"><div className="legend-color green"></div><span>ผ่านเกณฑ์</span></div>
            <div className="legend-item"><div className="legend-color yellow"></div><span>เฝ้าระวัง</span></div>
            <div className="legend-item"><div className="legend-color red"></div><span>ต้องปรับปรุง</span></div>
            <div className="legend-item"><div className="legend-color nodata" style={{ backgroundColor: '#94a3b8' }}></div><span>ไม่มีข้อมูล (0 ราย)</span></div>
          </div>
        </div>

        {/* Right Side: Interactive Leaflet Map Visualization */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '520px' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <Map size={18} />
              แผนที่ตอบโต้เครือข่ายส่งต่อ (Interactive Leaflet Map)
            </h2>
          </div>

          {/* Metric Selector for Map */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button 
              className={`btn ${mapMetric === 'fuRate' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={() => setMapMetric('fuRate')}
            >
              อัตราการติดตามสำเร็จ
            </button>
            <button 
              className={`btn ${mapMetric === 'lostRate' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={() => setMapMetric('lostRate')}
            >
              อัตรา Lost FU
            </button>
            <button 
              className={`btn ${mapMetric === 'readmRate' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={() => setMapMetric('readmRate')}
            >
              อัตรากลับรักษาซ้ำ
            </button>
          </div>

          {/* Interactive Leaflet Map Container */}
          <div style={{ 
            flexGrow: 1, 
            minHeight: '380px',
            backgroundColor: 'var(--bg-primary)', 
            borderRadius: '12px', 
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            position: 'relative'
          }}>
            <LeafletMap 
              provinceStats={provinceStats} 
              activeProvince={activeProvince} 
              onSelectProvince={onSelectProvince} 
              mapMetric={mapMetric} 
              getProvinceStatus={getProvinceStatus} 
            />
          </div>
        </div>

      </div>

      {/* Dynamic Clinical Insights & Recommendations Panel */}
      <div className="panel animate-fade-in">
        <div className="panel-header">
          <h2 className="panel-title" style={{ color: 'var(--color-primary-dark)' }}>
            <Lightbulb size={18} style={{ color: 'var(--color-yellow)' }} />
            ข้อแนะนำและการวิเคราะห์เชิงลึกเพื่อการตัดสินใจของผู้บริหาร
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recommendations.map(pRec => {
            if (pRec.recs.length === 0) return null;
            const isFilterActive = activeProvince !== 'All';
            const isThisProvinceSelected = activeProvince === pRec.province;
            
            // If user filtered by a province, only show that province's recommendations. Else show all.
            if (isFilterActive && !isThisProvinceSelected) return null;

            return (
              <div 
                key={pRec.province}
                style={{ 
                  padding: '1rem', 
                  borderRadius: '10px', 
                  border: `1px solid var(--color-border)`,
                  backgroundColor: 'white',
                  borderLeft: `5px solid ${activeProvince === pRec.province ? 'var(--color-primary)' : 'var(--color-border)'}`
                }}
              >
                <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    คำแนะนำสำหรับการสั่งการเชิงนโยบาย: จังหวัด{pRec.province}
                  </h3>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', borderRadius: '4px' }}
                    onClick={() => onSelectProvince(pRec.province)}
                  >
                    กรองดูข้อมูลจังหวัดนี้
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {pRec.recs.map((rec, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                      {rec.type === 'danger' && <AlertCircle size={15} style={{ color: 'var(--color-red)', flexShrink: 0, marginTop: '0.15rem' }} />}
                      {rec.type === 'warning' && <AlertTriangle size={15} style={{ color: 'var(--color-yellow)', flexShrink: 0, marginTop: '0.15rem' }} />}
                      {rec.type === 'success' && <CheckCircle2 size={15} style={{ color: 'var(--color-green)', flexShrink: 0, marginTop: '0.15rem' }} />}
                      <span style={{ color: 'var(--color-text-dark)', lineHeight: '1.4' }}>{rec.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
