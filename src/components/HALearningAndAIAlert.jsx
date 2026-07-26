import React from 'react';
import { RefreshCw, Bell, ShieldCheck, HeartHandshake, PhoneCall, Home, Video, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HALearningAndAIAlert({ aiAlerts = [], continuityOfCare = {} }) {
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
    { code: 'READM28', title: '🔴 Readmission 28 วัน', status: 'เฝ้าระวัง 4 ราย', level: 'danger' },
    { code: 'LOST_FU', title: '🔴 Lost Follow-up เกินกำหนด', status: 'ติดตาม 6 ราย', level: 'warning' },
    { code: 'SUICIDE', title: '🔴 High Risk Suicide', status: 'เฝ้าระวังเข้มงวด 2 ราย', level: 'danger' },
    { code: 'VIOLENCE', title: '🔴 High Risk Violence', status: 'ต้องมีทีมนำส่ง 3 ราย', level: 'danger' },
    { code: 'TIME_OVER', title: '🔴 Refer เกินระยะเวลามาตรฐาน', status: 'ปกติ (<24 นาที)', level: 'pass' },
    { code: 'DOC_MISSING', title: '🔴 Missing Document เอกสารไม่ครบ', status: 'ประสาน รพ.ต้นทาง 5 ราย', level: 'warning' },
    { code: 'DIAG_MISMATCH', title: '🔴 Diagnostic Mismatch', status: 'อยู่ระหว่างทบทวน 3 ราย', level: 'warning' },
    { code: 'WRONG_LEVEL', title: '🔴 Wrong Referral / ส่งผิดระดับ', status: 'ทบทวนเกณฑ์ Admit 1 ราย', level: 'warning' },
    { code: 'OVERDUE_FU', title: '🔴 Follow-up เกินกำหนดนัด', status: 'โทรติดตามสำเร็จ 92%', level: 'pass' }
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

        {/* Right: 9 Real-time AI Safety Alerts Panel */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1rem' }}>
              <Bell size={18} />
              ระบบแจ้งเตือนอัจฉริยะ (Real-time AI Safety Alerts)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {fullAiAlerts.map(alert => (
              <div key={alert.code} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: alert.level === 'danger' ? 'rgba(239, 68, 68, 0.06)' : alert.level === 'warning' ? 'rgba(245, 158, 11, 0.06)' : 'rgba(16, 185, 129, 0.06)',
                borderLeft: `4px solid ${alert.level === 'danger' ? '#ef4444' : alert.level === 'warning' ? '#f59e0b' : '#10b981'}`
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{alert.title}</span>
                <span style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: alert.level === 'danger' ? '#ef4444' : alert.level === 'warning' ? '#b45309' : '#047857'
                }}>
                  {alert.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
