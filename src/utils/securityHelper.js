/**
 * Security & PDPA Helper Utilities
 * Referral Intelligence Dashboard - Thanyarak Khon Kaen Hospital
 */

// Local Storage Key for Audit Trail
const AUDIT_LOG_STORAGE_KEY = 'thanyarak_security_audit_logs';

// Available User Roles & Permissions
export const SECURITY_ROLES = [
  {
    id: 'doctor',
    name: 'นพ. วิชัย สุขสำราญ',
    title: 'แพทย์ประจำ / จิตแพทย์',
    roleLabel: 'Doctor / Psychiatrist',
    badgeColor: '#0ea5e9',
    canEditStatus: true,
    canExport: true,
    canViewRawPHI: true,
    canViewAuditLogs: true
  },
  {
    id: 'nurse',
    name: 'พว. สมหญิง ปัญญาดี',
    title: 'พยาบาลวิชาชีพชำนาญการ (งานส่งต่อ)',
    roleLabel: 'Referral Nurse',
    badgeColor: '#10b981',
    canEditStatus: true,
    canExport: true,
    canViewRawPHI: true,
    canViewAuditLogs: false
  },
  {
    id: 'executive',
    name: 'ดร. นพ. กิตติศักดิ์ อุ่นใจ',
    title: 'ผู้อำนวยการ / ผู้บริหารองค์กร',
    roleLabel: 'Executive Admin',
    badgeColor: '#8b5cf6',
    canEditStatus: false,
    canExport: true,
    canViewRawPHI: false,
    canViewAuditLogs: true
  },
  {
    id: 'auditor',
    name: 'คุณ วรพงษ์ ผู้ตรวจ HA',
    title: 'ผู้ตรวจประเมินคุณภาพ HA (Auditor)',
    roleLabel: 'HA Auditor (Read-Only)',
    badgeColor: '#f59e0b',
    canEditStatus: false,
    canExport: false,
    canViewRawPHI: false,
    canViewAuditLogs: true
  }
];

export const DEFAULT_SECURITY_PIN = '1234';

/**
 * OWASP A03: Input Sanitization & XSS Prevention Helper
 * Cleans search strings to prevent Script & HTML Injection
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>'"]/g, '')
    .trim();
}

/**
 * PDPA Data Masking for Patient Name

 * Example: "นาย สมชาย ใจดี" -> "นาย สม*** ใจ***"
 */
export function maskPatientName(name, isMasked = true) {
  if (!name || typeof name !== 'string') return 'ไม่ระบุชื่อ';
  if (!isMasked) return name;

  const parts = name.trim().split(/\s+/);
  return parts.map(part => {
    let prefix = '';
    let core = part;

    const prefixes = ['นาย', 'น.ส.', 'นาง', 'ด.ช.', 'ด.ญ.', 'ดร.', 'นพ.', 'พว.'];
    for (const p of prefixes) {
      if (part.startsWith(p)) {
        prefix = p;
        core = part.slice(p.length);
        break;
      }
    }

    if (core.length <= 2) {
      return prefix + core.charAt(0) + '***';
    }
    return prefix + core.substring(0, 2) + '***';
  }).join(' ');
}

/**
 * PDPA Data Masking for HN
 * Always displays full HN number as requested
 */
export function maskHN(hn, isMasked = true) {
  if (!hn) return '-';
  return String(hn);
}


/**
 * PDPA Data Masking for AN
 * Example: "IN-2037" -> "IN-***7"
 */
export function maskAN(an, isMasked = true) {
  if (!an) return '';
  const str = String(an);
  if (!isMasked || str.length < 4) return str;
  return str.substring(0, 3) + '***' + str.slice(-1);
}

/**
 * Log Security Event to Audit Trail
 */
export function logSecurityEvent(action, details = '', user = null) {
  try {
    const existingLogs = getAuditLogs();
    const newEntry = {
      id: 'SEC-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toLocaleString('th-TH'),
      action,
      details,
      userName: user?.name || 'นพ. วิชัย สุขสำราญ',
      userRole: user?.roleLabel || 'Doctor / Psychiatrist',
      ipAddress: '192.168.1.104 (Local Subnet)',
      status: 'SUCCESS'
    };

    // Keep max 100 recent audit logs
    const updatedLogs = [newEntry, ...existingLogs].slice(0, 100);
    localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
    return newEntry;
  } catch (e) {
    console.error("Failed to write audit log:", e);
    return null;
  }
}

/**
 * Retrieve Recorded Security Audit Logs
 */
export function getAuditLogs() {
  try {
    const data = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    if (!data) {
      const initialLogs = [
        {
          id: 'SEC-INIT-001',
          timestamp: new Date().toLocaleString('th-TH'),
          action: 'SYSTEM_BOOTUP',
          details: 'เริ่มต้นระบบความปลอดภัย PDPA Healthcare Security Guard v2.4',
          userName: 'SYSTEM',
          userRole: 'Administrator',
          ipAddress: '127.0.0.1',
          status: 'SUCCESS'
        }
      ];
      localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

/**
 * Clear Audit Logs
 */
export function clearAuditLogs() {
  try {
    localStorage.removeItem(AUDIT_LOG_STORAGE_KEY);
    logSecurityEvent('CLEAR_AUDIT_LOGS', 'ทำการล้างประวัติ Audit Logs');
  } catch (e) {
    console.error("Failed to clear audit logs:", e);
  }
}
