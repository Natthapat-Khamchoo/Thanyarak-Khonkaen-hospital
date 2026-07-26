import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const PROVINCE_COORDINATES = {
  'ขอนแก่น': { lat: 16.4322, lng: 102.8236, zoom: 10 },
  'มหาสารคาม': { lat: 16.1852, lng: 103.3007, zoom: 10 },
  'กาฬสินธุ์': { lat: 16.4344, lng: 103.5083, zoom: 10 },
  'ชัยภูมิ': { lat: 15.8064, lng: 102.0315, zoom: 10 },
  'หนองคาย': { lat: 17.8783, lng: 102.7420, zoom: 10 },
  'ร้อยเอ็ด': { lat: 16.0538, lng: 103.6520, zoom: 10 }
};

// Precise Administrative Boundaries (Lat/Lng Polygons) for target provinces
const PROVINCE_POLYGONS = {
  'ขอนแก่น': [
    [16.88, 102.35], [16.92, 102.85], [16.70, 103.15], [16.25, 103.18],
    [15.95, 102.82], [15.92, 102.40], [16.30, 101.95], [16.72, 102.05]
  ],
  'มหาสารคาม': [
    [16.48, 103.02], [16.55, 103.32], [16.28, 103.48], [15.65, 103.42],
    [15.52, 103.15], [15.92, 102.88], [16.22, 103.00]
  ],
  'กาฬสินธุ์': [
    [17.02, 103.35], [16.98, 103.88], [16.62, 104.12], [16.25, 103.78],
    [16.32, 103.35], [16.72, 103.22]
  ],
  'ชัยภูมิ': [
    [16.52, 101.55], [16.62, 102.12], [16.28, 102.42], [15.85, 102.35],
    [15.38, 102.05], [15.45, 101.42], [16.02, 101.35]
  ],
  'หนองคาย': [
    [18.22, 102.38], [18.25, 103.32], [17.88, 103.38], [17.65, 102.75],
    [17.75, 102.15], [18.05, 102.18]
  ],
  'ร้อยเอ็ด': [
    [16.32, 103.45], [16.42, 104.05], [16.08, 104.22], [15.42, 103.85],
    [15.48, 103.42], [15.98, 103.40]
  ]
};

const HOSPITALS_DATA = [
  { name: 'โรงพยาบาลขอนแก่น', province: 'ขอนแก่น', lat: 16.4250, lng: 102.8360, type: 'รพ.ศูนย์' },
  { name: 'โรงพยาบาลจิตเวชขอนแก่นราชนครินทร์', province: 'ขอนแก่น', lat: 16.4278, lng: 102.8480, type: 'รพ.จิตเวช' },
  { name: 'โรงพยาบาลศรีนครินทร์', province: 'ขอนแก่น', lat: 16.4715, lng: 102.8270, type: 'รพ.โรงเรียนแพทย์' },
  { name: 'โรงพยาบาลชุมแพ', province: 'ขอนแก่น', lat: 16.5442, lng: 102.0991, type: 'รพ.ทั่วไป' },
  { name: 'สถาบันสุขภาพจิตเด็กและวัยรุ่นฯ', province: 'ขอนแก่น', lat: 16.4300, lng: 102.8350, type: 'สถาบันเฉพาะทาง' },
  { name: 'โรงพยาบาลหนองกุงศรี', province: 'กาฬสินธุ์', lat: 16.6570, lng: 103.3030, type: 'รพ.ชุมชน' },
  { name: 'โรงพยาบาลชัยภูมิ', province: 'ชัยภูมิ', lat: 15.8090, lng: 102.0290, type: 'รพ.ศูนย์' },
  { name: 'โรงพยาบาลภูเขียวเฉลิมพระเกียรติ', province: 'ชัยภูมิ', lat: 16.3680, lng: 102.1270, type: 'รพ.ทั่วไป' },
  { name: 'โรงพยาบาลนาเชือก', province: 'มหาสารคาม', lat: 15.7950, lng: 103.0250, type: 'รพ.ชุมชน' }
];

export default function LeafletMap({ 
  provinceStats, 
  activeProvince, 
  onSelectProvince, 
  mapMetric, 
  getProvinceStatus 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [16.4, 102.8],
      zoom: 8,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // OpenStreetMap Standard Tiles (Fast, 100% Reliable)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map layers on stats / active province / metric change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    map.invalidateSize();
    layerGroup.clearLayers();

    // 1. Draw Choropleth Provincial Boundary Heatmap Polygons
    provinceStats.forEach((stat) => {
      const polygonCoords = PROVINCE_POLYGONS[stat.province];
      const coords = PROVINCE_COORDINATES[stat.province];
      if (!polygonCoords || !coords) return;

      const isNoData = stat.total === 0;
      const statusDetails = getProvinceStatus(stat, mapMetric);
      const isSelected = activeProvince === stat.province;

      let colorHex = '#10b981'; // green
      if (isNoData) {
        colorHex = '#94a3b8'; // slate grey
      } else if (statusDetails.code === 'yellow') {
        colorHex = '#f59e0b';
      } else if (statusDetails.code === 'red') {
        colorHex = '#ef4444';
      }

      let metricLabel = 'อัตราการติดตามสำเร็จ';
      if (mapMetric === 'lostRate') metricLabel = 'อัตรา Lost FU';
      if (mapMetric === 'readmRate') metricLabel = 'อัตรากลับเข้ารักษาซ้ำ';

      // Choropleth Polygon
      const polygon = L.polygon(polygonCoords, {
        color: isSelected ? '#0284c7' : colorHex,
        weight: isSelected ? 4 : (isNoData ? 1.5 : 2),
        fillColor: isNoData ? '#f1f5f9' : colorHex,
        fillOpacity: isNoData ? 0.4 : (isSelected ? 0.65 : 0.4),
        dashArray: isNoData ? '4, 4' : (isSelected ? null : '4')
      });

      // Hover Effects
      polygon.on('mouseover', function () {
        this.setStyle({
          fillOpacity: 0.75,
          weight: 3,
          color: '#0284c7'
        });
      });

      polygon.on('mouseout', function () {
        polygon.setStyle({
          color: isSelected ? '#0284c7' : colorHex,
          weight: isSelected ? 4 : (isNoData ? 1.5 : 2),
          fillOpacity: isNoData ? 0.4 : (isSelected ? 0.65 : 0.4)
        });
      });

      // Tooltip on Hover
      polygon.bindTooltip(
        `<div>
          <strong style="font-size:14px;">จังหวัด${stat.province}</strong><br/>
          <span>${isNoData ? 'ไม่มีข้อมูลการส่งต่อในปีงบประมาณนี้' : `${metricLabel}: <strong>${stat[mapMetric].toFixed(1)}%</strong>`}</span><br/>
          <small style="color:${colorHex}; font-weight:600;">${statusDetails.label}</small>
        </div>`,
        { permanent: false, direction: 'center' }
      );

      // Popup on Click
      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'Prompt, sans-serif';
      popupContent.style.padding = '4px';
      popupContent.innerHTML = `
        <div style="font-size:14px; font-weight:700; margin-bottom:6px; color:#0f172a;">
          📍 จังหวัด${stat.province} (เขตสุขภาพที่ 7)
        </div>
        <div style="font-size:12px; line-height:1.6; color:#334155;">
          • เคสส่งต่อทั้งหมด: <strong>${stat.total} ราย</strong><br/>
          ${isNoData ? '<span style="color:#64748b;">• ยังไม่มีข้อมูลการส่งต่อในปีงบประมาณที่เลือก</span>' : `
          • ติดตามสำเร็จ: <strong>${stat.fuRate.toFixed(1)}%</strong><br/>
          • Lost FU: <strong>${stat.lostRate.toFixed(1)}%</strong><br/>
          • Readmit 28 วัน: <strong>${stat.readmRate.toFixed(1)}%</strong><br/>
          • สถานะ: <span style="color:${colorHex}; font-weight:700;">${statusDetails.label}</span>
          `}
        </div>
        <button id="filter-btn-${stat.province}" style="
          margin-top: 8px;
          width: 100%;
          padding: 6px 8px;
          background: #0ea5e9;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        ">
          ${isSelected ? 'ยกเลิกการกรอง' : 'กรองแสดงเฉพาะจังหวัดนี้'}
        </button>
      `;

      polygon.bindPopup(popupContent);

      polygon.on('popupopen', () => {
        const btn = document.getElementById(`filter-btn-${stat.province}`);
        if (btn) {
          btn.onclick = () => {
            onSelectProvince(isSelected ? 'All' : stat.province);
            map.closePopup();
          };
        }
      });

      polygon.on('click', () => {
        onSelectProvince(isSelected ? 'All' : stat.province);
      });

      layerGroup.addLayer(polygon);

      // Label Marker Badge at Center of Province
      const badgeIcon = L.divIcon({
        className: 'custom-leaflet-label',
        html: `<div style="
          background: ${isSelected ? '#0284c7' : 'rgba(255, 255, 255, 0.95)'};
          color: ${isSelected ? '#ffffff' : (isNoData ? '#64748b' : '#0f172a')};
          border: 2px solid ${colorHex};
          padding: 4px 8px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 3px 8px rgba(0,0,0,0.25);
          white-space: nowrap;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        ">
          <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${colorHex}; display: inline-block;"></span>
          ${stat.province}: ${isNoData ? 'ไม่มีข้อมูล' : `${stat[mapMetric].toFixed(1)}%`}
        </div>`,
        iconSize: [110, 28],
        iconAnchor: [55, 14]
      });

      const labelMarker = L.marker([coords.lat, coords.lng], { icon: badgeIcon });
      labelMarker.on('click', () => {
        onSelectProvince(isSelected ? 'All' : stat.province);
      });
      layerGroup.addLayer(labelMarker);
    });

    // 2. Draw Hospital Pin Markers
    HOSPITALS_DATA.forEach((hosp) => {
      const isProvinceSelected = activeProvince === 'All' || activeProvince === hosp.province;
      if (!isProvinceSelected) return;

      const hospIcon = L.divIcon({
        className: 'custom-hosp-icon',
        html: `<div style="
          width: 10px;
          height: 10px;
          background-color: #0284c7;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([hosp.lat, hosp.lng], { icon: hospIcon });
      marker.bindTooltip(`<b>${hosp.name}</b> (${hosp.type})`, { permanent: false, direction: 'top' });
      layerGroup.addLayer(marker);
    });

    // Center map view if a specific province is selected
    if (activeProvince !== 'All' && PROVINCE_COORDINATES[activeProvince]) {
      const coords = PROVINCE_COORDINATES[activeProvince];
      map.flyTo([coords.lat, coords.lng], coords.zoom, { duration: 0.8 });
    } else {
      map.flyTo([16.4, 102.8], 8, { duration: 0.8 });
    }

  }, [provinceStats, activeProvince, mapMetric, getProvinceStatus, onSelectProvince]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px' }}>
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '380px',
          borderRadius: '12px',
          zIndex: 1 
        }} 
      />

      {/* Floating Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '11px',
        fontFamily: 'Prompt, sans-serif'
      }}>
        <div style={{ fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>เกณฑ์ระดับสีแผนที่</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '3px', display: 'inline-block' }}></span>
          <span>ผ่านเกณฑ์ (≥80% สำหรับติดตาม)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '3px', display: 'inline-block' }}></span>
          <span>เฝ้าระวัง (70-79%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '3px', display: 'inline-block' }}></span>
          <span>ต้องปรับปรุง (&lt;70%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#94a3b8', borderRadius: '3px', display: 'inline-block' }}></span>
          <span>ไม่มีข้อมูลการส่งต่อ (0 ราย)</span>
        </div>
      </div>
    </div>
  );
}
