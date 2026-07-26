import React from 'react';
import { 
  Users, 
  CheckCircle, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  AlertTriangle, 
  Activity 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import MetricCard from './MetricCard';

export default function ExecutiveSummary({ metrics, year, province }) {
  const {
    totalReferrals,
    completionRate,
    followUpRate,
    lossToFollowUpRate,
    readmissionRate,
    incidents,
    severeAdverseEvents,
    monthlyTrend
  } = metrics;

  // Calculate status levels
  const getFollowUpStatus = (val) => {
    if (val >= 90) return 'pass';
    if (val >= 80) return 'warn';
    return 'danger';
  };

  const getLossStatus = (val) => {
    if (val < 10) return 'pass';
    if (val < 20) return 'warn';
    return 'danger';
  };

  const getReadmissionStatus = (val) => {
    if (val < 10) return 'pass';
    if (val < 15) return 'warn';
    return 'danger';
  };

  // Pie chart data
  const pieData = [
    { name: 'ติดตามสำเร็จ (Followed)', value: totalReferrals * (followUpRate / 100) },
    { name: 'ยังไม่พบมาติดตาม (Lost FU)', value: totalReferrals * (lossToFollowUpRate / 100) }
  ];
  
  const COLORS = ['#0ea5e9', '#f59e0b']; // skyblue, yellow

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="custom-tooltip-title">{label}</p>
          {payload.map((pld, index) => (
            <p key={index} className="custom-tooltip-value" style={{ color: pld.color }}>
              {pld.name}: {pld.value.toLocaleString()} {pld.name.includes('Rate') || pld.name.includes('ร้อยละ') ? '%' : 'ราย'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      <div className="info-box">
        <Activity size={18} />
        <div>
          <strong>ข้อมูลภาพรวมทั้งองค์กร (Executive Summary)</strong> สำหรับ
          {province === 'All' ? ' ทุกจังหวัด ' : ` จังหวัด${province} `}
          ประจำปีงบประมาณ {year} คำนวณแบบเรียลไทม์จากระบบฐานข้อมูลการติดตามผู้ป่วยจำหน่าย IPD
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="cards-grid">
        <MetricCard
          title="จำนวนเคสรวมทั้งหมด"
          value={totalReferrals}
          unit="ราย"
          targetLabel="ข้อมูลรวมจากระบบ"
          status="pass"
          icon={Users}
        />
        <MetricCard
          title="รับส่งต่อเข้า (Refer In)"
          value={metrics.executiveKPIs?.referIn || 0}
          unit="ราย"
          targetLabel="รับเข้าบำบัดรักษา"
          status="pass"
          icon={UserCheck}
        />
        <MetricCard
          title="ส่งต่อออก (Refer Out)"
          value={metrics.executiveKPIs?.referOut || 0}
          unit="ราย"
          targetLabel="ส่งต่อ รพ.ศูนย์/แพทย์"
          status="warn"
          icon={UserX}
        />
        <MetricCard
          title="ส่งกลับ (Refer Back)"
          value={metrics.executiveKPIs?.referBack || 0}
          unit="ราย"
          targetLabel="ส่งกลับติดตามในชุมชน"
          status="pass"
          icon={CheckCircle}
        />
        <MetricCard
          title="Readmission 28 วัน"
          value={readmissionRate.toFixed(1)}
          unit="%"
          targetLabel="เป้าหมาย <10%"
          status={getReadmissionStatus(readmissionRate)}
          icon={RefreshCw}
        />
        <MetricCard
          title="Referral Incident"
          value={incidents}
          unit="ครั้ง"
          targetLabel="เป้าหมาย 0"
          status={incidents === 0 ? 'pass' : 'danger'}
          icon={AlertTriangle}
        />
      </div>

      {/* Charts section */}
      <div className="dashboard-layout-grid">
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">แนวโน้มจำนวนผู้ป่วยจำหน่ายและมาติดตามรายเดือน</h2>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <AreaChart
                data={monthlyTrend}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#bae6fd" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#bae6fd" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFollowed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Area 
                  type="monotone" 
                  name="ส่งต่อทั้งหมด (IPD)" 
                  dataKey="total" 
                  stroke="#38bdf8" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
                <Area 
                  type="monotone" 
                  name="มาติดตามสำเร็จ" 
                  dataKey="followed" 
                  stroke="var(--color-primary)" 
                  fillOpacity={1} 
                  fill="url(#colorFollowed)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">สัดส่วนผลลัพธ์การติดตามการรักษา</h2>
          </div>
          <div style={{ width: '100%', height: 260, display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Math.round(value)} ราย`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ fontSize: '0.8rem', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#0ea5e9', borderRadius: '50%' }}></div>
                <span>ติดตามสำเร็จ: {followUpRate.toFixed(1)}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
                <span>Lost FU: {lossToFollowUpRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
