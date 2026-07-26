import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.heat';

const PROVINCE_COORDINATES = {
  'ขอนแก่น': { lat: 16.4322, lng: 102.8236, zoom: 10 },
  'มหาสารคาม': { lat: 16.1852, lng: 103.3007, zoom: 10 },
  'กาฬสินธุ์': { lat: 16.4344, lng: 103.5083, zoom: 10 },
  'ชัยภูมิ': { lat: 15.8064, lng: 102.0315, zoom: 10 },
  'หนองคาย': { lat: 17.8783, lng: 102.7420, zoom: 10 },
  'ร้อยเอ็ด': { lat: 16.0538, lng: 103.6520, zoom: 10 }
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
    if (mapInstanceRef.current) return; // Prevent double init

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

    // Invalidate map size after rendering to ensure all tile images load properly
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

    // 1. Prepare Heatmap points array
    const heatPoints = [];

    provinceStats.forEach((stat) => {
      const coords = PROVINCE_COORDINATES[stat.province];
      if (!coords) return;

      const statusDetails = getProvinceStatus(stat, mapMetric);

      // Determine intensity based on selected metric
      let intensity = 0.5;
      if (mapMetric === 'fuRate') {
        // High follow-up rate = green/blue (low risk), Low follow-up rate = high red intensity (high risk)
        intensity = stat.fuRate < 70 ? 0.95 : stat.fuRate < 80 ? 0.6 : 0.25;
      } else if (mapMetric === 'lostRate') {
        intensity = stat.lostRate >= 25 ? 0.95 : stat.lostRate >= 15 ? 0.6 : 0.25;
      } else {
        intensity = stat.readmRate >= 10 ? 0.95 : stat.readmRate >= 5 ? 0.6 : 0.25;
      }

      // Add central point with high weight
      heatPoints.push([coords.lat, coords.lng, intensity]);

      // Add surrounding jittered points to create smooth continuous heat density around the province
      const offsets = [
        [0.08, 0.08], [-0.08, -0.08], [0.08, -0.08], [-0.08, 0.08],
        [0.15, 0.0], [-0.15, 0.0], [0.0, 0.15], [0.0, -0.15],
        [0.04, 0.04], [-0.04, -0.04]
      ];

      offsets.forEach(([dLat, dLng]) => {
        heatPoints.push([coords.lat + dLat, coords.lng + dLng, intensity * 0.75]);
      });
    });

    // Render Heatmap Layer (L.heatLayer)
    if (heatPoints.length > 0 && typeof L.heatLayer === 'function') {
      const heatLayer = L.heatLayer(heatPoints, {
        radius: 45,
        blur: 25,
        maxZoom: 10,
        max: 1.0,
        gradient: {
          0.2: '#0284c7', // Sky Blue (Low Risk / High Performance)
          0.4: '#10b981', // Green
          0.65: '#f59e0b', // Yellow / Orange (Warning)
          0.85: '#ef4444', // Red (High Risk / Action Required)
          1.0: '#b91c1c'  // Dark Red
        }
      });
      layerGroup.addLayer(heatLayer);
    }

    // 2. Draw Interactive Province Markers and Tooltips/Popups
    provinceStats.forEach((stat) => {
      const coords = PROVINCE_COORDINATES[stat.province];
      if (!coords) return;

      const statusDetails = getProvinceStatus(stat, mapMetric);
      const isSelected = activeProvince === stat.province;

      let colorHex = '#10b981'; // green
      if (statusDetails.code === 'yellow') colorHex = '#f59e0b';
      if (statusDetails.code === 'red') colorHex = '#ef4444';

      let metricLabel = 'อัตราการติดตามสำเร็จ';
      if (mapMetric === 'lostRate') metricLabel = 'อัตรา Lost FU';
      if (mapMetric === 'readmRate') metricLabel = 'อัตรากลับเข้ารักษาซ้ำ';

      // Interactive Marker Badge
      const badgeIcon = L.divIcon({
        className: 'custom-leaflet-label',
        html: `<div style="
          background: ${isSelected ? '#0284c7' : 'rgba(255, 255, 255, 0.95)'};
          color: ${isSelected ? '#ffffff' : '#0f172a'};
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
          transition: transform 0.15s ease;
        ">
          <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${colorHex}; display: inline-block;"></span>
          ${stat.province}: ${stat[mapMetric].toFixed(1)}%
        </div>`,
        iconSize: [110, 28],
        iconAnchor: [55, 14]
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: badgeIcon });

      // Hover Tooltip
      marker.bindTooltip(
        `<div>
          <strong style="font-size:14px;">จังหวัด${stat.province}</strong><br/>
          <span>${metricLabel}: <strong>${stat[mapMetric].toFixed(1)}%</strong></span><br/>
          <small style="color:${colorHex}; font-weight:600;">${statusDetails.label}</small>
        </div>`,
        { permanent: false, direction: 'top' }
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
          • ติดตามสำเร็จ: <strong>${stat.fuRate.toFixed(1)}%</strong><br/>
          • Lost FU: <strong>${stat.lostRate.toFixed(1)}%</strong><br/>
          • Readmit 28 วัน: <strong>${stat.readmRate.toFixed(1)}%</strong><br/>
          • สถานะ: <span style="color:${colorHex}; font-weight:700;">${statusDetails.label}</span>
        </div>
        <button id="filter-btn-${stat.province}" style="
          margin-top: 8px;
          width: 100%;
          padding: 5px 8px;
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

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`filter-btn-${stat.province}`);
        if (btn) {
          btn.onclick = () => {
            onSelectProvince(isSelected ? 'All' : stat.province);
            map.closePopup();
          };
        }
      });

      marker.on('click', () => {
        onSelectProvince(isSelected ? 'All' : stat.province);
      });

      layerGroup.addLayer(marker);
    });

    // 3. Hospital Markers
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
          box-shadow: 0 0 4px rgba(0,0,0,0.3);
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
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '340px' }}>
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '340px',
          borderRadius: '12px',
          zIndex: 1 
        }} 
      />
    </div>
  );
}
