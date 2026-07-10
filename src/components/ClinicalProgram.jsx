import React from 'react';
import { Layers, AlertTriangle, ShieldCheck, HeartPulse } from 'lucide-react';

export default function ClinicalProgram({ clinicalProgramStats }) {
  // Format Thai labels for clinical programs
  const getThaiProgramName = (prog) => {
    switch (prog) {
      case 'Alcohol Withdrawal': return 'Alcohol Withdrawal (ถอนพิษสุรา)';
      case 'Alcohol Withdrawal Seizure': return 'Alcohol Withdrawal Seizure (ถอนพิษสุราเฉียบพลัน/ชัก)';
      case 'Methamphetamine Psychosis': return 'Methamphetamine Psychosis (จิตเวชจากยาบ้า)';
      case 'SMI-V': return 'SMI-V (ผู้ป่วยจิตเวชที่มีความเสี่ยงสูงต่อการก่อความรุนแรง)';
      case 'Suicide': return 'Suicide (ภาวะเสี่ยงต่อการฆ่าตัวตาย)';
      case 'Opioid Overdose': return 'Opioid Overdose (ภาวะเสพติดหรือเกิดพิษจากฝิ่น/สารสกัดฝิ่น)';
      default: return prog;
    }
  };

  // Helper to format values
  const formatVal = (val, isRate = false) => {
    if (isNaN(val)) return '0.0%';
    return isRate ? `${val.toFixed(1)}%` : val.toLocaleString();
  };

  return (
    <div className="panel animate-fade-in">
      <div className="panel-header">
        <h2 className="panel-title">
          <Layers size={18} />
          Level 3 Clinical Program (แยกตาม 6 กลุ่มโรคสำคัญ)
        </h2>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Clinical Program (กลุ่มโรคสำคัญ)</th>
              <th style={{ textAlign: 'center' }}>จำนวนผู้ป่วยทั้งหมด</th>
              <th style={{ textAlign: 'center' }}>ติดตามสำเร็จ (Follow-up)</th>
              <th style={{ textAlign: 'center' }}>การกลับมารับบริการซ้ำ (Relapse)</th>
              <th style={{ textAlign: 'center' }}>Readmission 28 วัน</th>
            </tr>
          </thead>
          <tbody>
            {clinicalProgramStats.map((stat) => (
              <tr key={stat.program}>
                <td style={{ fontWeight: 600 }}>{getThaiProgramName(stat.program)}</td>
                <td style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                  {formatVal(stat.total)}
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                  {formatVal(stat.followed)} ({formatVal(stat.fuRate, true)})
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', color: 'var(--color-yellow)', fontWeight: 600 }}>
                  {formatVal(stat.relapse)} ({formatVal(stat.relapseRate, true)})
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', color: 'var(--color-red)', fontWeight: 600 }}>
                  {formatVal(stat.readmissions)} ({formatVal(stat.readmRate, true)})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pathway Connection Flow Chart */}
      <div className="pathway-diagram">
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
          <HeartPulse size={16} />
          <span>Referral Link to Clinical Program (กระบวนการส่งต่อผู้ป่วยรายกลุ่มโรค)</span>
        </div>
        
        <div className="pathway-flow">
          <div className="pathway-node">
            <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.2rem' }}>STEP 1</div>
            <div>ส่งต่อผู้ป่วย (Referral)</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 400, marginTop: '0.2rem' }}>
              รับส่งต่อผู้ป่วยจำหน่าย IPD
            </div>
          </div>
          
          <div className="pathway-arrow"></div>
          
          <div className="pathway-node">
            <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.2rem' }}>STEP 2</div>
            <div>คัดกรองรายโรค (Clinical Match)</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 400, marginTop: '0.2rem' }}>
              แยกตาม 6 กลุ่มโรคหลักสำคัญ
            </div>
          </div>
          
          <div className="pathway-arrow"></div>
          
          <div className="pathway-node">
            <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.2rem' }}>STEP 3</div>
            <div>ติดตามผล (Clinical Pathway)</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 400, marginTop: '0.2rem' }}>
              ประเมิน Follow-up, Relapse และ Readmit
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.4', backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          💡 <strong>หมายเหตุ:</strong> ระบบจะคำนวณอัตราการกลับเข้ารักษาซ้ำ (Relapse Rate) จากจำนวนผู้ป่วยสะสมที่มีการบันทึกประวัติการรับเข้าโรงพยาบาลซ้ำซ้อนกันในชุดข้อมูล และประเมินร่วมกับการกลับเข้ารักษาตัวซ้ำภายในระยะเวลา 28 วันหลังจำหน่าย เพื่อใช้ในการวางแผนเชิงป้องกันของทีมสุขภาพชุมชนต่อไป
        </div>
      </div>
    </div>
  );
}
