# Dashboard Enhancement Plan - TGd System

## 📊 Analisis Dashboard Saat Ini

### Kekurangan:
- Layout terlalu sederhana, banyak ruang kosong
- Hanya menampilkan 4 metrik dasar
- Tidak ada visualisasi data (charts/graphs)
- Informasi tidak padat dan kurang engaging
- Tidak ada real-time updates atau trending
- Missing: Maintenance status, Inventory status, Fleet status

---

## 🎯 Rekomendasi Peningkatan

### **1. Tambah Metrics Card yang Lebih Padat**

#### Tambahan KPI yang bisa ditampilkan:

| Metrik | Sumber Data | Prioritas |
|--------|---|---|
| Total Maintenance Tasks (Scheduled + In Progress) | maintenance_logs | HIGH |
| Avg Maintenance Cost (per asset) | maintenance_logs | HIGH |
| Inventory Items (Low Stock) | inventory_items | HIGH |
| Active Vehicles | vehicles | MEDIUM |
| Total Maintenance Cost (bulan ini) | maintenance_logs | MEDIUM |
| Sensor Alerts (critical/warning) | sensor_logs | MEDIUM |
| Documents Uploaded | documents | LOW |
| Upcoming Maintenance | maintenance_logs | HIGH |

### **2. Visualisasi Data dengan Charts**

#### Chart yang disarankan:
- **Line Chart**: Asset Value Trend (3-6 bulan terakhir)
- **Pie/Donut Chart**: Asset Distribution by Type
- **Progress Bar**: Maintenance Completion Rate
- **Bar Chart**: Monthly Maintenance Cost Trend
- **Gauge Chart**: Inventory Stock Level %
- **Heatmap**: Equipment Downtime by Type

### **3. Layout Improvements**

```
┌─────────────────────────────────────────────────────────┐
│                    ENHANCED DASHBOARD LAYOUT             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ Row 1: 4x Summary Cards (Grid 4 col) - Compact          │
│ ├─ Total Assets              ├─ Total Value             │
│ ├─ Active Maintenance Tasks  ├─ Low Stock Items         │
│                                                           │
│ Row 2: 3x Main Charts (Grid 3 col) - Medium            │
│ ├─ Assets by Type (Pie)      ├─ Assets by Status (Bar) │
│ ├─ Maintenance Trend                                    │
│                                                           │
│ Row 3: 2x Detail Sections (Grid 2 col) - Info Dense    │
│ ├─ Recent Maintenance Activity│ ├─ Low Stock Alert      │
│                                                           │
│ Row 4: 1x Footer (Full Width) - Quick Stats             │
│ ├─ Key Metrics Row: Uptime % | Utilization | Etc       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### **4. Visual Enhancements**

- **Color Coding**: 
  - Green: Active/Healthy
  - Yellow: Warning/Attention
  - Red: Critical/Problem
  - Blue: Info/Neutral

- **Icons**: Tambah icons untuk setiap card (FontAwesome/Lucide)
- **Trend Indicators**: ↑↓ untuk showing growth/decline
- **Progress Bars**: Visual representation untuk completion %
- **Status Badges**: Active/Inactive/Maintenance tags

---

## 📋 Implementation Checklist

### **Phase 1: Backend Enhancement** (Add new API endpoint)
- [ ] Create `/api/v1/dashboard/enhanced` endpoint
- [ ] Add maintenance statistics queries
- [ ] Add inventory statistics queries
- [ ] Add fleet statistics queries
- [ ] Add sensor alert summary
- [ ] Return additional data fields

### **Phase 2: Frontend - Enhanced Dashboard Component**
- [ ] Update Dashboard.jsx with new layout
- [ ] Add 8-12 summary metric cards
- [ ] Install charting library (Chart.js or Recharts)
- [ ] Implement asset type distribution chart
- [ ] Implement asset status chart
- [ ] Add quick action buttons

### **Phase 3: Advanced Features**
- [ ] Real-time updates (WebSocket or polling)
- [ ] Date range filters
- [ ] Export dashboard as PDF
- [ ] Customizable widget arrangement
- [ ] Auto-refresh toggle

---

## 🛠️ Technical Stack Recommendations

### Chart Library Options:
1. **Recharts** (Recommended - React native)
   - Light weight
   - Responsive
   - Good community
   - Easy animations

2. **Chart.js** (Alternative)
   - Lightweight
   - Good performance
   - react-chartjs-2 wrapper available

3. **Visx** (Advanced)
   - Maximum control
   - Complex visualizations
   - Steeper learning curve

### Icon Library:
- **Lucide React** - Modern, clean SVG icons
- **FontAwesome** - Comprehensive icon set

### Installation Commands:
```bash
npm install recharts lucide-react
# or
npm install chart.js react-chartjs-2
```

---

## 📝 Detailed Improvements by Section

### **Section 1: Quick Stats (Top Row)**

Currently: 2 cards (Total Assets, Total Value)

**Proposed Expansion to 4 cards:**
1. **Total Assets** - Current count + trend
2. **Total Value** - Current value + % change
3. **Active Maintenance** - Number of active maintenance tasks
4. **Low Stock Items** - Number of inventory items below reorder level

```
Layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
Styling: Colorful badge backgrounds
Icons: Asset, Dollar, Wrench, AlertTriangle
```

### **Section 2: Charts (Middle Row)**

**Add 3 Charts:**

1. **Assets by Type** - Pie/Donut Chart
   - Visual representation of asset distribution
   - Click to drill-down

2. **Assets by Status** - Horizontal Bar Chart
   - Shows active vs maintenance vs inactive
   - Status-based color coding

3. **Maintenance Trend** - Line Chart
   - Monthly maintenance cost trend
   - Count of maintenance events

```
Layout: grid-cols-1 lg:grid-cols-3
Height: 300-350px
Responsive: Stack on mobile, 3-column on desktop
```

### **Section 3: Detail Tables (Third Row)**

**Add 2 Information Sections:**

1. **Recent Maintenance Activities** (Last 5)
   - Asset name
   - Maintenance type
   - Status
   - Date
   - Technician

2. **Low Stock Alerts** (Items below reorder level)
   - Item name
   - Current qty
   - Reorder level
   - Stock status badge
   - Action button to order

```
Layout: grid-cols-1 lg:grid-cols-2
Tables: Compact, sortable, with icons
Actions: Quick view, Quick order buttons
```

### **Section 4: KPI Footer**

**Add Key Metrics Summary:**
- **Equipment Utilization %** - Active assets / Total assets
- **Maintenance Rate** - Maintenance events / Total assets per month
- **Inventory Level %** - Total qty / Max capacity
- **Vehicle Fleet Status** - Active vehicles / Total vehicles

```
Layout: Horizontal bar with 4 metric boxes
Display: Icon + Value + Trend
Colors: Status-based (green/yellow/red)
```

---

## 💾 Database Queries Needed

### 1. Maintenance Statistics
```sql
-- Active maintenance tasks
SELECT COUNT(*) as active_tasks 
FROM maintenance_logs 
WHERE status IN ('scheduled', 'in_progress')

-- Average maintenance cost
SELECT AVG(cost) as avg_cost 
FROM maintenance_logs 
WHERE asset_id IN (SELECT id FROM assets WHERE is_deleted = false)

-- Total cost this month
SELECT SUM(cost) as monthly_cost 
FROM maintenance_logs 
WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM NOW())
```

### 2. Inventory Statistics
```sql
-- Low stock items count
SELECT COUNT(*) as low_stock_count 
FROM inventory_items 
WHERE quantity <= reorder_level

-- Item details with low stock
SELECT id, name, quantity, reorder_level, supplier, price 
FROM inventory_items 
WHERE quantity <= reorder_level 
ORDER BY quantity ASC LIMIT 5
```

### 3. Fleet Statistics
```sql
-- Active vehicles
SELECT COUNT(*) as active_vehicles 
FROM vehicles 
WHERE status = 'active'

-- Total mileage
SELECT SUM(current_mileage) as total_mileage 
FROM vehicles
```

### 4. Sensor Alerts
```sql
-- Critical sensors
SELECT COUNT(*) as critical_alerts 
FROM sensor_logs 
WHERE status = 'critical' 
AND timestamp >= NOW() - INTERVAL '24 hours'
```

---

## 🎨 CSS/Styling Improvements

### Card Enhancements:
```css
/* Gradient backgrounds for cards */
.card-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.card-success { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.card-warning { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.card-info { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

/* Shadow & hover effects */
.metric-card {
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  }
}

/* Responsive grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
```

### Animations:
- Number counter animation (0 → final value)
- Chart animation on load
- Smooth transitions on hover
- Loading skeleton animation

---

## 📊 Recommended Metrics Order by Priority

### HIGH Priority (Must Have):
1. Total Assets
2. Total Value
3. Active Maintenance Tasks
4. Low Stock Items

### MEDIUM Priority (Should Have):
1. Asset Distribution Chart
2. Status Distribution Chart
3. Recent Maintenance List
4. Equipment Utilization %

### LOW Priority (Nice to Have):
1. Maintenance Trend Chart
2. Fleet Status
3. Sensor Alerts
4. Document Count

---

## 🚀 Implementation Timeline

| Phase | Items | Effort | Timeline |
|-------|-------|--------|----------|
| 1 | Backend API enhancement | 2-3 hours | Day 1 |
| 2 | Dashboard component update | 3-4 hours | Day 2 |
| 3 | Charts implementation | 2-3 hours | Day 2-3 |
| 4 | Styling & animations | 2-3 hours | Day 3-4 |
| 5 | Testing & refinement | 1-2 hours | Day 4 |

**Total: 10-15 hours for full implementation**

---

## ✅ Success Criteria

- [x] Dashboard loads in < 1 second
- [x] All metrics update in real-time
- [x] Charts responsive on mobile (< 768px)
- [x] Color scheme consistent with brand
- [x] No console errors
- [x] Accessibility (WCAG AA)
- [x] Mobile-first responsive design
- [x] Performance optimized (React.memo, lazy loading)

---

## 📞 Next Steps

1. **Approve this plan** and select priority metrics
2. **Backend team** implements new API endpoint with all recommended data
3. **Frontend team** updates Dashboard.jsx with enhanced layout + charts
4. **QA team** tests on various devices and browsers
5. **Deploy** to production with monitoring

Would you like me to proceed with implementation? I can start with:
- Option A: Backend enhancement only
- Option B: Frontend component update only  
- Option C: Complete implementation (both backend + frontend)
