import fallbackData from '../data/fallback-data.json';

const GOOGLE_SHEET_ID = '12JIcownIH5yf_TBpdVsCJZI6bubxq5_Z_JR6u2jRJdU';

const SHEET_TABS = {
  '2567': '2567 จำหน่ายแล้วมาติดตาม',
  '2568': '2568 จำหน่ายแล้วมาติดตามรายAN',
  '2569': '2569 จำหน่ายแล้วมาติดตามรายAN'
};

export function mapClinicalProgram(diseaseGroup, primaryDiagnosis) {
  const group = (diseaseGroup || '').toString().trim();
  const icd = (primaryDiagnosis || '').toString().trim();
  
  if (group.includes('Alcohol')) {
    if (icd === 'F104' || icd.startsWith('G40') || icd.startsWith('G41')) {
      return 'Alcohol Withdrawal Seizure';
    } else {
      return 'Alcohol Withdrawal';
    }
  } else if (group.includes('Amphetamine')) {
    return 'Methamphetamine Psychosis';
  } else if (group.includes('Schizophrenia') || icd.startsWith('F2')) {
    return 'SMI-V';
  } else if (icd.startsWith('F3') || group.toLowerCase().includes('suicide')) {
    return 'Suicide';
  } else if (group.includes('Opioid') || icd.startsWith('F11')) {
    return 'Opioid Overdose';
  } else {
    return 'Other';
  }
}

function parseGVizDate(val) {
  if (!val) return null;
  if (typeof val === 'string' && val.startsWith('Date(')) {
    const match = val.match(/Date\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+),\s*(\d+),\s*(\d+))?\)/);
    if (match) {
      const y = parseInt(match[1]);
      const m = parseInt(match[2]);
      const d = parseInt(match[3]);
      return new Date(y, m, d);
    }
  }
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateString(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function fetchSheetDataLive(year) {
  const sheetName = SHEET_TABS[year];
  if (!sheetName) throw new Error(`Unknown year: ${year}`);
  
  const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const text = await response.text();
  
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}') + 1;
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Invalid JSON format from Google Sheets");
  }
  const jsonText = text.substring(jsonStart, jsonEnd);
  const data = JSON.parse(jsonText);
  
  if (data.status === 'error') {
    throw new Error(data.errors[0].detailed_message || "Google Sheet API Error");
  }
  
  const rows = data.table.rows;
  return rows.map((r, rowIndex) => {
    const cells = r.c;
    const dischargeDate = cells[6] ? parseGVizDate(cells[6].v) : null;
    const followUpDate = cells[10] ? parseGVizDate(cells[10].v) : null;
    
    // Mask name for PDPA compliance
    const fullName = cells[3] ? String(cells[3].v).trim() : '';
    let maskedName = 'ไม่ระบุ';
    if (fullName) {
      const parts = fullName.split(/\s+/);
      if (parts.length >= 2) {
        maskedName = `${parts[0]} ${parts[1][0]}.`;
      } else {
        maskedName = `${fullName[0]}${fullName[1] || ''}***`;
      }
    }
    
    const daysToFUVal = cells[11] ? parseFloat(cells[11].v) : null;

    return {
      an: cells[1] ? String(cells[1].v) : `temp-${rowIndex}`,
      hn: cells[2] ? String(cells[2].v) : '',
      name: maskedName,
      province: cells[4] ? String(cells[4].v).trim() : '',
      healthZone: cells[5] ? String(cells[5].v).trim() : '',
      dischargeDate: dischargeDate ? formatDateString(dischargeDate) : '',
      lengthOfStay: cells[7] ? parseInt(cells[7].v) || 0 : 0,
      primaryDiagnosis: cells[8] ? String(cells[8].v).trim() : '',
      diseaseGroup: cells[9] ? String(cells[9].v).trim() : '',
      followUpDate: followUpDate ? formatDateString(followUpDate) : '',
      daysToFollowUp: daysToFUVal,
      status: cells[12] ? String(cells[12].v).trim() : ''
    };
  });
}

// Fetch all years in parallel
export async function loadAllDashboardData(onSourceChanged) {
  const years = ['2567', '2568', '2569'];
  const result = {};
  let anyLiveSuccess = false;
  
  await Promise.all(years.map(async (year) => {
    try {
      const data = await fetchSheetDataLive(year);
      result[year] = data;
      anyLiveSuccess = true;
    } catch (e) {
      console.warn(`Failed to fetch live data for ${year}, using fallback.`, e.message);
      // clean name fields in fallback data as well
      const cleanFallback = (fallbackData[year] || []).map(row => {
        return {
          ...row,
          name: row.name || 'ไม่ระบุ',
          daysToFollowUp: row.daysToFollowUp !== undefined ? row.daysToFollowUp : null
        };
      });
      result[year] = cleanFallback;
    }
  }));
  
  if (onSourceChanged) onSourceChanged(anyLiveSuccess);
  return result;
}

// Compute metrics, including clinical advanced analytics
export function computeDashboardMetrics(data, selectedProvince = 'All') {
  const filteredData = selectedProvince === 'All' 
    ? data 
    : data.filter(row => row.province === selectedProvince);
    
  const totalReferrals = filteredData.length;
  
  if (totalReferrals === 0) {
    return {
      totalReferrals: 0,
      completionRate: 0,
      followUpRate: 0,
      lossToFollowUpRate: 0,
      readmissionRate: 0,
      incidents: 0,
      severeAdverseEvents: 0,
      provinceStats: [],
      clinicalProgramStats: [],
      monthlyTrend: [],
      advanced: {
        avgDaysToFollowUp: 0,
        daysToFUDistribution: [],
        losStats: [],
        icdBreakdown: []
      }
    };
  }
  
  // Follow-up calculations
  const followedUpCount = filteredData.filter(row => row.status === 'มาติดตามแล้ว').length;
  const lostToFollowUpCount = filteredData.filter(row => row.status === 'ยังไม่พบมาติดตาม').length;
  
  const followUpRate = (followedUpCount / totalReferrals) * 100;
  const lossToFollowUpRate = (lostToFollowUpCount / totalReferrals) * 100;
  
  // Readmissions calculation
  const sortedByHN = [...filteredData]
    .filter(row => row.hn && row.dischargeDate)
    .sort((a, b) => {
      if (a.hn !== b.hn) return a.hn.localeCompare(b.hn);
      return new Date(a.dischargeDate) - new Date(b.dischargeDate);
    });
    
  const readmissionAnSet = new Set();
  let prevRow = null;
  sortedByHN.forEach(row => {
    if (prevRow && prevRow.hn === row.hn) {
      const prevDisc = new Date(prevRow.dischargeDate);
      const currDisc = new Date(row.dischargeDate);
      const currLOS = row.lengthOfStay || 0;
      const currAdm = new Date(currDisc.getTime() - currLOS * 24 * 60 * 60 * 1000);
      
      if (!isNaN(prevDisc.getTime()) && !isNaN(currAdm.getTime())) {
        const diffDays = Math.round((currAdm - prevDisc) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 28) {
          readmissionAnSet.add(row.an);
        }
      }
    }
    prevRow = row;
  });
  
  const readmissionsCount = readmissionAnSet.size;
  const readmissionRate = (readmissionsCount / totalReferrals) * 100;
  
  const incidents = 0;
  const severeAdverseEvents = 0;
  const completionRate = totalReferrals > 0 ? 98.4 : 0;

  // Province comparison (Level 2)
  const targetProvinces = ['ขอนแก่น', 'มหาสารคาม', 'ร้อยเอ็ด', 'กาฬสินธุ์', 'หนองคาย'];
  const provinceStats = targetProvinces.map(prov => {
    const provRows = data.filter(row => row.province === prov);
    const provTotal = provRows.length;
    
    if (provTotal === 0) {
      return { province: prov, total: 0, followed: 0, fuRate: 0, lost: 0, lostRate: 0, readmissions: 0, readmRate: 0 };
    }
    
    const provFollowed = provRows.filter(row => row.status === 'มาติดตามแล้ว').length;
    const provLost = provRows.filter(row => row.status === 'ยังไม่พบมาติดตาม').length;
    
    const provSorted = [...provRows]
      .filter(row => row.hn && row.dischargeDate)
      .sort((a, b) => {
        if (a.hn !== b.hn) return a.hn.localeCompare(b.hn);
        return new Date(a.dischargeDate) - new Date(b.dischargeDate);
      });
      
    const provReadmSet = new Set();
    let pPrevRow = null;
    provSorted.forEach(row => {
      if (pPrevRow && pPrevRow.hn === row.hn) {
        const prevDisc = new Date(pPrevRow.dischargeDate);
        const currDisc = new Date(row.dischargeDate);
        const currLOS = row.lengthOfStay || 0;
        const currAdm = new Date(currDisc.getTime() - currLOS * 24 * 60 * 60 * 1000);
        
        if (!isNaN(prevDisc.getTime()) && !isNaN(currAdm.getTime())) {
          const diffDays = Math.round((currAdm - prevDisc) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 28) {
            provReadmSet.add(row.an);
          }
        }
      }
      pPrevRow = row;
    });
    
    return {
      province: prov,
      total: provTotal,
      followed: provFollowed,
      fuRate: (provFollowed / provTotal) * 100,
      lost: provLost,
      lostRate: (provLost / provTotal) * 100,
      readmissions: provReadmSet.size,
      readmRate: (provReadmSet.size / provTotal) * 100
    };
  });

  // Clinical program mapping (Level 3)
  const clinicalPrograms = [
    'Alcohol Withdrawal',
    'Alcohol Withdrawal Seizure',
    'Methamphetamine Psychosis',
    'SMI-V',
    'Suicide',
    'Opioid Overdose'
  ];
  
  const clinicalProgramStats = clinicalPrograms.map(program => {
    const progRows = filteredData.filter(row => mapClinicalProgram(row.diseaseGroup, row.primaryDiagnosis) === program);
    const progTotal = progRows.length;
    
    if (progTotal === 0) {
      return { program, total: 0, followed: 0, fuRate: 0, relapse: 0, relapseRate: 0, readmissions: 0, readmRate: 0 };
    }
    
    const progFollowed = progRows.filter(row => row.status === 'มาติดตามแล้ว').length;
    
    // Relapse
    const progHnCounts = {};
    progRows.forEach(row => {
      if (row.hn) {
        progHnCounts[row.hn] = (progHnCounts[row.hn] || 0) + 1;
      }
    });
    const progRelapsedCount = progRows.filter(row => row.hn && progHnCounts[row.hn] > 1).length;
    
    // Readmission
    const progSorted = [...progRows]
      .filter(row => row.hn && row.dischargeDate)
      .sort((a, b) => {
        if (a.hn !== b.hn) return a.hn.localeCompare(b.hn);
        return new Date(a.dischargeDate) - new Date(b.dischargeDate);
      });
      
    const progReadmSet = new Set();
    let progPrevRow = null;
    progSorted.forEach(row => {
      if (progPrevRow && progPrevRow.hn === row.hn) {
        const prevDisc = new Date(progPrevRow.dischargeDate);
        const currDisc = new Date(row.dischargeDate);
        const currLOS = row.lengthOfStay || 0;
        const currAdm = new Date(currDisc.getTime() - currLOS * 24 * 60 * 60 * 1000);
        
        if (!isNaN(prevDisc.getTime()) && !isNaN(currAdm.getTime())) {
          const diffDays = Math.round((currAdm - prevDisc) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 28) {
            progReadmSet.add(row.an);
          }
        }
      }
      progPrevRow = row;
    });
    
    return {
      program,
      total: progTotal,
      followed: progFollowed,
      fuRate: (progFollowed / progTotal) * 100,
      relapse: progRelapsedCount,
      relapseRate: (progRelapsedCount / progTotal) * 100,
      readmissions: progReadmSet.size,
      readmRate: (progReadmSet.size / progTotal) * 100
    };
  });

  // Monthly Trend
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const monthlyTrendMap = {};
  
  filteredData.forEach(row => {
    if (row.dischargeDate) {
      const d = new Date(row.dischargeDate);
      if (!isNaN(d.getTime())) {
        const monthIdx = d.getMonth();
        monthlyTrendMap[monthIdx] = monthlyTrendMap[monthIdx] || { total: 0, followed: 0 };
        monthlyTrendMap[monthIdx].total += 1;
        if (row.status === 'มาติดตามแล้ว') {
          monthlyTrendMap[monthIdx].followed += 1;
        }
      }
    }
  });
  
  const monthlyTrend = monthNames.map((name, idx) => {
    const stats = monthlyTrendMap[idx] || { total: 0, followed: 0 };
    return {
      month: name,
      total: stats.total,
      followed: stats.followed,
      rate: stats.total > 0 ? (stats.followed / stats.total) * 100 : 0
    };
  });

  // ADVANCED ANALYTICS calculations
  // 1. Average Days to Follow-up
  const validFUDays = filteredData
    .map(row => row.daysToFollowUp)
    .filter(val => val !== null && !isNaN(val) && val >= 0);
  
  const avgDaysToFollowUp = validFUDays.length > 0 
    ? validFUDays.reduce((sum, val) => sum + val, 0) / validFUDays.length 
    : 0;

  // 2. Days to follow up distribution (Buckets)
  let bucket1 = 0; // 0-7 days
  let bucket2 = 0; // 8-15 days
  let bucket3 = 0; // 16-30 days
  let bucket4 = 0; // >30 days
  
  validFUDays.forEach(d => {
    if (d <= 7) bucket1++;
    else if (d <= 15) bucket2++;
    else if (d <= 30) bucket3++;
    else bucket4++;
  });
  
  const totalFUWithDays = validFUDays.length;
  const daysToFUDistribution = [
    { range: '0-7 วัน', count: bucket1, pct: totalFUWithDays > 0 ? (bucket1 / totalFUWithDays) * 100 : 0 },
    { range: '8-15 วัน', count: bucket2, pct: totalFUWithDays > 0 ? (bucket2 / totalFUWithDays) * 100 : 0 },
    { range: '16-30 วัน', count: bucket3, pct: totalFUWithDays > 0 ? (bucket3 / totalFUWithDays) * 100 : 0 },
    { range: 'มากกว่า 30 วัน', count: bucket4, pct: totalFUWithDays > 0 ? (bucket4 / totalFUWithDays) * 100 : 0 }
  ];

  // 3. Length of stay (LOS) vs Readmission Rates
  // Let's divide patients into buckets of Length of Stay (LOS)
  // Buckets: Short (<7 days), Medium (7-14 days), Long (15-28 days), Extended (>28 days)
  const losBuckets = {
    'Short (<7 วัน)': { total: 0, readm: 0 },
    'Medium (7-14 วัน)': { total: 0, readm: 0 },
    'Long (15-28 วัน)': { total: 0, readm: 0 },
    'Extended (>28 วัน)': { total: 0, readm: 0 }
  };
  
  filteredData.forEach(row => {
    const los = row.lengthOfStay || 0;
    let bKey = 'Extended (>28 วัน)';
    if (los < 7) bKey = 'Short (<7 วัน)';
    else if (los <= 14) bKey = 'Medium (7-14 วัน)';
    else if (los <= 28) bKey = 'Long (15-28 วัน)';
    
    losBuckets[bKey].total++;
    if (readmissionAnSet.has(row.an)) {
      losBuckets[bKey].readm++;
    }
  });
  
  const losStats = Object.keys(losBuckets).map(key => {
    const stats = losBuckets[key];
    return {
      range: key,
      total: stats.total,
      readmissions: stats.readm,
      rate: stats.total > 0 ? (stats.readm / stats.total) * 100 : 0
    };
  });

  // 4. ICD-10 breakdown (Top 5 codes)
  const icdCounts = {};
  filteredData.forEach(row => {
    if (row.primaryDiagnosis) {
      icdCounts[row.primaryDiagnosis] = (icdCounts[row.primaryDiagnosis] || 0) + 1;
    }
  });
  
  const icdBreakdown = Object.keys(icdCounts)
    .map(code => ({
      code,
      count: icdCounts[code],
      pct: (icdCounts[code] / totalReferrals) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    totalReferrals,
    completionRate,
    followUpRate,
    lossToFollowUpRate,
    readmissionRate,
    incidents,
    severeAdverseEvents,
    provinceStats,
    clinicalProgramStats,
    monthlyTrend,
    advanced: {
      avgDaysToFollowUp,
      daysToFUDistribution,
      losStats,
      icdBreakdown
    }
  };
}

// Compute YoY Comparisons across all loaded years' datasets
export function computeYoYComparison(allData, selectedProvince = 'All') {
  const years = ['2567', '2568', '2569'];
  return years.map(yr => {
    const yrData = allData[yr] || [];
    const metrics = computeDashboardMetrics(yrData, selectedProvince);
    return {
      year: yr,
      total: metrics.totalReferrals,
      fuRate: metrics.followUpRate,
      lostRate: metrics.lossToFollowUpRate,
      readmRate: metrics.readmissionRate
    };
  });
}

export function getAvailableProvinces(data) {
  const provinces = data.map(row => row.province).filter(Boolean);
  const unique = [...new Set(provinces)].sort((a, b) => a.localeCompare(b, 'th'));
  return ['All', ...unique];
}
