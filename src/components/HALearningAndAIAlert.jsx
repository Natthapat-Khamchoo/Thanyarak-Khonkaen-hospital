import React, { useState } from 'react';
import { 
  RefreshCw, 
  Bell, 
  ShieldCheck, 
  HeartHandshake, 
  PhoneCall, 
  Home, 
  Video, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  X,
  ExternalLink,
  AlertTriangle,
  FileText,
  Clock,
  ShieldAlert
} from 'lucide-react';

export default function HALearningAndAIAlert({ aiAlerts = [], continuityOfCare = {} }) {
  const [selectedAlert, setSelectedAlert] = useState(null);

  const {
    dischargePlanningRate = 92.5,
    telemedicineCount = 38,
    phoneFollowUpCount = 42,
    homeVisitCount = 14,
    familyMeetingCount = 28
  } = continuityOfCare || {};

  // PDCA Quality Learning Steps
  const pdcaSteps = [
    { num: '1', title: 'Referral & Admission', desc: 'รับตัวคัดกรองประเมิน' },
    { num: '2', title: 'Treatment & Care', desc: 'รักษาฟื้นฟูสมรรถภาพ' },
    { num: '3', title: 'Final Diagnosis', desc: 'วินิจฉัยสรุปโรคทางคลินิก' },
    { num: '4', title: 'Diagnostic Review', desc: 'ทบทวนความคลาดเคลื่อน' },
    { num: '5', title: 'Feedback Loop', desc: 'ส่งผลการรักษากลับ รพ.ต้นทาง' },
    { num: '6', title: 'Network Coaching', desc: 'อบรมและเพิ่มศักยภาพเครือข่าย' }
  ];

  // Complete 9 AI Alert Triggers
  const fullAiAlerts = [
    { 
      code: 'READM28', 
      title: '🔴 Readmission 28 วัน', 
      status: 'เฝ้าระวัง 4 ราย', 
      level: 'danger',
      desc: 'ผู้ป่วยกลับเข้ารับการรักษาซ้ำภายใน 28 วันหลังจำหน่าย ต้องการการทบทวนแผนการดูแล (Care Plan)',
      patients: [
        { hn: 'HN621868', name: 'นาย ณัฐ***', ward: '1ก', diag: 'Amphetamine Dependence (F19.2)', date: '12/10/2568', action: 'ทบทวน Care Plan ร่วมกับ รพ.สต.' },
        { hn: 'HN660132', name: 'นาย สุ***', ward: '4ก', diag: 'Alcohol Withdrawal Seizure (F10.4)', date: '18/10/2568', action: 'นัด Home Visit ด่วน' },
        { hn: 'HN650431', name: 'นาย ธี***', ward: '2ก', diag: 'Polysubstance Dependence (F19.1)', date: '22/10/2568', action: 'ปรับขนาดยาและให้คำปรึกษาครอบครัว' },
        { hn: 'HN641015', name: 'นาย ชน***', ward: 'แสงอรุณ', diag: 'Schizophrenia SMI-V (F20.0)', date: '25/10/2568', action: 'ประสานงาน Case Manager ติดตามประจำสัปดาห์' }
      ]
    },
    { 
      code: 'LOST_FU', 
      title: '🔴 Lost Follow-up เกินกำหนด', 
      status: 'ติดตาม 6 ราย', 
      level: 'warning',
      desc: 'ผู้ป่วยยังไม่พบการมาติดตามผลตามวันนัดหมายเกิน 14 วัน',
      patients: [
        { hn: 'HN660808', name: 'นาย สม***', ward: 'OPD', diag: 'Alcohol Withdrawal (F10.2)', date: '05/10/2568', action: 'โทรติดตามสำเร็จแล้ว 1 ครั้ง' },
        { hn: 'HN661713', name: 'นาย อน***', ward: 'OPD', diag: 'Cannabis Psychosis (F12.5)', date: '10/10/2568', action: 'ส่งหนังสือแจ้ง รพ.สต. ลงพื้นที่' },
        { hn: 'HN621900', name: 'นาย วร***', ward: 'OPD', diag: 'Amphetamine Psychosis (F15.5)', date: '14/10/2568', action: 'นัดหมาย Telemed ทดแทน' },
        { hn: 'HN632110', name: 'นาย ปร***', ward: 'OPD', diag: 'Opioid Dependence (F11.2)', date: '19/10/2568', action: 'อยู่ระหว่างติดต่อญาติ' },
        { hn: 'HN641200', name: 'นาย กิต***', ward: 'OPD', diag: 'Depressive Disorder (F32.1)', date: '21/10/2568', action: 'โทรประสาน อสม. ในพื้นที่' },
        { hn: 'HN650990', name: 'นาย ธน***', ward: 'OPD', diag: 'Alcohol Dependence (F10.2)', date: '24/10/2568', action: 'รอผลตอบกลับจาก รพ.สต.' }
      ]
    },
    { 
      code: 'SUICIDE', 
      title: '🔴 High Risk Suicide', 
      status: 'เฝ้าระวังเข้มงวด 2 ราย', 
      level: 'danger',
      desc: 'ผู้ป่วยประเมินความเสี่ยงทำร้ายตนเองระดับสูง (High Risk Suicide)',
      patients: [
        { hn: 'HN670112', name: 'นาย พง***', ward: '4ก', diag: 'Major Depression with Suicide Attempt (F32.3)', date: '20/10/2568', action: 'เฝ้าระวัง 24 ชม. + ทีมจิตแพทย์ประเมิน' },
        { hn: 'HN670405', name: 'นาย อนุ***', ward: '2ก', diag: 'Severe Depression & Alcohol Abuse (F10.1)', date: '23/10/2568', action: 'จัดทำ Safety Plan และให้ข้อมูลญาติใกล้ชิด' }
      ]
    },
    { 
      code: 'VIOLENCE', 
      title: '🔴 High Risk Violence', 
      status: 'ต้องมีทีมนำส่ง 3 ราย', 
      level: 'danger',
      desc: 'ผู้ป่วยมีภาวะก้าวร้าวรุนแรง ต้องใช้มาตรการความปลอดภัยในการนำส่ง',
      patients: [
        { hn: 'HN680012', name: 'นาย สุร***', ward: '1ก', diag: 'Amphetamine Induced Psychosis (F15.5)', date: '15/10/2568', action: 'ใช้อุปกรณ์จำกัดการเคลื่อนไหวตามมาตรฐาน' },
        { hn: 'HN680220', name: 'นาย ชา***', ward: 'แสงอรุณ', diag: 'Active Methamphetamine Mania (F15.2)', date: '19/10/2568', action: 'ทีมตำรวจ/กู้ภัยร่วมส่งตัว' },
        { hn: 'HN680450', name: 'นาย นพ***', ward: '1ก', diag: 'Psychotic Disorder with Agitation (F28)', date: '26/10/2568', action: 'ฉีดยาสยบอาการตามแผนรักษา' }
      ]
    },
    { 
      code: 'TIME_OVER', 
      title: '🔴 Refer เกินระยะเวลามาตรฐาน', 
      status: 'ปกติ (<24 นาที)', 
      level: 'pass',
      desc: 'ระยะเวลาตอบรับการส่งต่อและประสานงานเตียงมาตรฐาน (เป้าหมาย <30 นาที)',
      patients: [
        { hn: 'HN690100', name: 'นาย กา***', ward: 'OPD', diag: 'Methamphetamine Psychosis', date: '22/10/2568', action: 'ตอบรับใน 18 นาที (ผ่านเกณฑ์)' },
        { hn: 'HN690105', name: 'นาย ชัย***', ward: 'OPD', diag: 'Alcohol Withdrawal', date: '24/10/2568', action: 'ตอบรับใน 22 นาที (ผ่านเกณฑ์)' }
      ]
    },
    { 
      code: 'DOC_MISSING', 
      title: '🔴 Missing Document เอกสารไม่ครบ', 
      status: 'ประสาน รพ.ต้นทาง 5 ราย', 
      level: 'warning',
      desc: 'ขาดใบประเมินแรกรับ หรือผลตรวจทางห้องปฏิบัติการจากโรงพยาบาลต้นทาง',
      patients: [
        { hn: 'HN650111', name: 'นาย วี***', ward: 'OPD', diag: 'Amphetamine Abuse', date: '12/10/2568', action: 'ขอเอกสาร Lab U/A เพิ่มเติม' },
        { hn: 'HN650222', name: 'นาย ภาน***', ward: 'OPD', diag: 'Alcohol Abuse', date: '14/10/2568', action: 'ขอประวัติการได้รับยาเดิม' },
        { hn: 'HN650333', name: 'นาย ทร***', ward: 'OPD', diag: 'Polysubstance', date: '17/10/2568', action: 'รอใบ Refer ฉบับจริง' },
        { hn: 'HN650444', name: 'นาย มง***', ward: 'OPD', diag: 'Cannabis Abuse', date: '20/10/2568', action: 'โทรประสานงานพยาบาล Refer ต้นทาง' },
        { hn: 'HN650555', name: 'นาย อดิ***', ward: 'OPD', diag: 'Opioid Abuse', date: '25/10/2568', action: 'ได้รับเอกสารครบถ้วนแล้ว' }
      ]
    },
    { 
      code: 'DIAG_MISMATCH', 
      title: '🔴 Diagnostic Mismatch', 
      status: 'อยู่ระหว่างทบทวน 3 ราย', 
      level: 'warning',
      desc: 'การวินิจฉัยขั้นต้นจาก รพ.ต้นทาง ไม่ตรงกับการวินิจฉัยสรุปทางคลินิก',
      patients: [
        { hn: 'HN630123', name: 'นาย สุพ***', ward: '2ก', diag: 'ต้นทาง: F19.2 ➔ สรุป: F20.0 (Schizophrenia)', date: '11/10/2568', action: 'ทบทวนในเวชระเบียน CQI' },
        { hn: 'HN630456', name: 'นาย ปรา***', ward: '4ก', diag: 'ต้นทาง: F10.1 ➔ สรุป: F10.4 (Withdrawal Seizure)', date: '16/10/2568', action: 'จัดทำ Coaching Note ให้ รพ.ชุมชน' },
        { hn: 'HN630789', name: 'นาย วิศ***', ward: '1ก', diag: 'ต้นทาง: F12.2 ➔ สรุป: F15.2 (Amphetamine)', date: '22/10/2568', action: 'ส่งข้อมูล Feedback กลับต้นทาง' }
      ]
    },
    { 
      code: 'WRONG_LEVEL', 
      title: '🔴 Wrong Referral / ส่งผิดระดับ', 
      status: 'ทบทวนเกณฑ์ Admit 1 ราย', 
      level: 'warning',
      desc: 'ระดับความรุนแรงของผู้ป่วยไม่ตรงกับเกณฑ์การรับตัวเข้าบำบัด IPD',
      patients: [
        { hn: 'HN610999', name: 'นาย อาน***', ward: 'OPD', diag: 'Mild Alcohol Abuse (F10.0)', date: '19/10/2568', action: 'ปรับรูปแบบเป็น OPD Clinic บำบัดชั่วคราว' }
      ]
    },
    { 
      code: 'OVERDUE_FU', 
      title: '🔴 Follow-up เกินกำหนดนัด', 
      status: 'โทรติดตามสำเร็จ 92%', 
      level: 'pass',
      desc: 'การติดตามผลหลังจำหน่ายเกินวันนัดหมาย 1-7 วัน (ติดตามสำเร็จเกือบทั้งหมด)',
      patients: [
        { hn: 'HN600111', name: 'นาย ไพ***', ward: 'OPD', diag: 'Alcohol Withdrawal', date: '23/10/2568', action: 'โทรติดตามเรียบร้อย อาการคงที่' },
        { hn: 'HN600222', name: 'นาย เจน***', ward: 'OPD', diag: 'Amphetamine Dependence', date: '25/10/2568', action: 'ญาติยืนยันรับยาต่อเนื่องที่ รพ.สต.' }
      ]
    }
  ];

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
          <RefreshCw size={22} color="var(--color-primary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Level 4: Quality, Learning & AI Alert Dashboard (วงจรเรียนรู้ PDCA, COC & สัญญาณเตือน AI ⭐⭐⭐)
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
          ระบบเรียนรู้เพื่อการพัฒนาคุณภาพ (HA Edition), วงจรการทบทวนทางคลินิก (PDCA Loop), การดูแลต่อเนื่อง (COC) และสัญญาณเตือน AI Safety Alerts
        </p>
      </div>

      {/* PDCA Learning Loop Diagram (HA Highlight ⭐⭐⭐) */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="panel-header">
          <h3 className="panel-title" style={{ fontSize: '1rem' }}>
            <RefreshCw size={18} />
            วงจรพัฒนาคุณภาพการรับส่งต่อ (HA Learning Cycle: PDCA Feedback Loop)
          </h3>
        </div>

        <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
          แสดงการใช้ข้อมูลจากการรับส่งต่อเพื่อขับเคลื่อนกระบวนการเรียนรู้และพัฒนาคุณภาพอย่างต่อเนื่องสำหรับ HA Re-accreditation
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.85rem',
          marginTop: '0.5rem'
        }}>
          {pdcaSteps.map((step, idx) => (
            <div key={step.num} style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--color-primary-light)',
              borderRadius: '8px',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '6px'
              }}>
                {step.num}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a', marginBottom: '2px' }}>
                {step.title}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Continuity of Care (Left) + 9 AI Alerts (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Left: Continuity of Care (COC) Panel */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1rem' }}>
              <HeartHandshake size={18} />
              ระบบการดูแลต่อเนื่องในชุมชน (Continuity of Care - COC)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                <Video size={14} color="#0284c7" /> Telemedicine
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
                {telemedicineCount} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>ครั้ง</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                <PhoneCall size={14} color="#10b981" /> Phone Follow-up
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                {phoneFollowUpCount} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>ครั้ง</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                <Home size={14} color="#f59e0b" /> Home Visit ลงพื้นที่
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>
                {homeVisitCount} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>เคส</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                <Users size={14} color="#a855f7" /> Family Meeting
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#a855f7', marginTop: '2px' }}>
                {familyMeetingCount} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>เคส</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(2, 132, 199, 0.05)',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.8rem',
            color: '#0f172a'
          }}>
            <strong>Discharge Planning Rate:</strong> <span style={{ color: '#0284c7', fontWeight: 700 }}>{dischargePlanningRate}%</span> ของผู้ป่วยดิสชาร์จได้รับการจัดทำแผนการดูแลต่อเนื่องร่วมกับ รพ.สต. และ อสม.
          </div>
        </div>

        {/* Right: 9 Real-time AI Safety Alerts Panel (CLICKABLE) */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1rem' }}>
              <Bell size={18} />
              ระบบแจ้งเตือนอัจฉริยะ (Real-time AI Safety Alerts)
            </h3>
            <span style={{ fontSize: '0.725rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
              คลิกที่แต่ละรายการเพื่อดูรายชื่อเคส 👆
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {fullAiAlerts.map(alert => (
              <div 
                key={alert.code} 
                onClick={() => setSelectedAlert(alert)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: alert.level === 'danger' ? 'rgba(239, 68, 68, 0.06)' : alert.level === 'warning' ? 'rgba(245, 158, 11, 0.06)' : 'rgba(16, 185, 129, 0.06)',
                  borderLeft: `4px solid ${alert.level === 'danger' ? '#ef4444' : alert.level === 'warning' ? '#f59e0b' : '#10b981'}`,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
                className="hover-card-row"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{alert.title}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: alert.level === 'danger' ? '#ef4444' : alert.level === 'warning' ? '#b45309' : '#047857'
                  }}>
                    {alert.status}
                  </span>
                  <ArrowRight size={14} color="#94a3b8" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Liquid Glass Interactive Alert Detail Modal */}
      {selectedAlert && (
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
        onClick={() => setSelectedAlert(null)}
        >
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '780px',
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
              background: selectedAlert.level === 'danger' ? 'linear-gradient(135deg, #fee2e2 0%, #ffffff 100%)' : selectedAlert.level === 'warning' ? 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)' : 'linear-gradient(135deg, #d1fae5 0%, #ffffff 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldAlert size={24} color={selectedAlert.level === 'danger' ? '#ef4444' : selectedAlert.level === 'warning' ? '#f59e0b' : '#10b981'} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    รายละเอียด: {selectedAlert.title}
                  </h3>
                  <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px' }}>
                    รหัสการเตือนภัย: <strong>{selectedAlert.code}</strong> | สถานะ: <strong style={{ color: selectedAlert.level === 'danger' ? '#ef4444' : '#b45309' }}>{selectedAlert.status}</strong>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedAlert(null)}
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
              
              {/* Alert Description Banner */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                fontSize: '0.85rem',
                color: '#334155',
                lineHeight: 1.5
              }}>
                <strong style={{ color: '#0f172a' }}>คำอธิบายและแนวทางมาตรการ:</strong><br />
                {selectedAlert.desc}
              </div>

              {/* Patient Cases Breakdown Table */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={16} color="#0284c7" />
                  รายชื่อเคสผู้ป่วยในหมวดหมู่นี้ ({selectedAlert.patients.length} ราย)
                </h4>

                <div className="table-responsive" style={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>HN</th>
                        <th>ชื่อ-สกุล</th>
                        <th>หอผู้ป่วย</th>
                        <th>การวินิจฉัย / สารเสพติด</th>
                        <th>วันที่</th>
                        <th style={{ textAlign: 'center' }}>แนวทางปฏิบัติการ (Action)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAlert.patients.map((pt, pIdx) => (
                        <tr key={pIdx}>
                          <td style={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#0284c7' }}>{pt.hn}</td>
                          <td style={{ fontWeight: 600 }}>{pt.name}</td>
                          <td>
                            <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#f1f5f9', fontSize: '0.75rem', fontWeight: 600 }}>
                              {pt.ward}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#334155' }}>{pt.diag}</td>
                          <td style={{ fontSize: '0.775rem', color: '#64748b' }}>{pt.date}</td>
                          <td style={{ textAlign: 'center', fontSize: '0.775rem' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              backgroundColor: selectedAlert.level === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                              color: selectedAlert.level === 'danger' ? '#ef4444' : '#b45309',
                              fontWeight: 600,
                              display: 'inline-block'
                            }}>
                              {pt.action}
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
                onClick={() => setSelectedAlert(null)}
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
