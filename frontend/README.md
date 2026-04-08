# TGd System - Frontend README

## Overview

TGd System frontend is a modern React application with Vite for rapid development and optimized production builds.

## Tech Stack

- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: TailwindCSS 3+
- **State Management**: React Context / Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

## Quick Start

### Prerequisites

- Node.js 16+
- npm 8+

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

3. **Edit .env**:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   App will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── index.jsx              # React entry point
├── App.jsx               # Root component
├── pages/                # Page components
│   ├── Dashboard.jsx
│   ├── AssetsPage.jsx
│   ├── MaintenancePage.jsx
│   ├── InventoryPage.jsx
│   ├── FleetPage.jsx
│   ├── DocumentsPage.jsx
│   └── LoginPage.jsx
├── components/           # Reusable components
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Modal.jsx
│   │   ├── Loading.jsx
│   │   └── DataTable.jsx
│   ├── forms/
│   │   ├── AssetForm.jsx
│   │   ├── MaintenanceForm.jsx
│   │   └── InventoryForm.jsx
│   └── charts/
│       ├── AssetChart.jsx
│       └── MaintenanceChart.jsx
├── services/             # API services
│   ├── api.js           # Axios instance
│   ├── authService.js
│   ├── assetService.js
│   └── dashboardService.js
├── hooks/                # Custom React hooks
│   ├── useAuth.js
│   ├── useFetch.js
│   └── useForm.js
├── context/              # React Context
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── layouts/              # Layout components
│   ├── MainLayout.jsx
│   ├── AuthLayout.jsx
│   └── AdminLayout.jsx
├── styles/               # Global styles
│   ├── globals.css
│   └── tailwind.config.js
└── utils/                # Utilities
    ├── formatters.js
    ├── validators.js
    └── constants.js
```

## Key Features

### Authentication

The app includes JWT-based authentication:

```javascript
// Login
const response = await authService.login({
  username: 'admin@tgd.com',
  password: 'password123'
})

// Token stored in localStorage
localStorage.setItem('access_token', response.data.access_token)
```

### API Services

All API calls go through service modules:

```javascript
// Asset service
import { assetService } from '../services/assetService'

// Get assets
const response = await assetService.getAssets({ skip: 0, limit: 20 })

// Create asset
const newAsset = await assetService.createAsset(assetData)

// Search
const results = await assetService.searchAssets('machinery', { skip: 0 })
```

### Custom Hooks

```javascript
// Authentication hook
const { user, loading, login, logout } = useAuth()

// Data fetching hook
const { data, loading, error } = useFetch(() => assetService.getAssets())
```

### Pages

#### Dashboard
- Overview statistics
- Asset distribution charts
- Quick access to key metrics

#### Assets
- List all assets with pagination
- Filter by type, status, location
- Create, edit, delete assets
- View asset hierarchy

#### Maintenance
- Maintenance schedules
- Maintenance history
- Cost tracking per asset

#### Inventory
- Inventory item list
- Low stock alerts
- Stock movements
- Supplier management

#### Fleet
- Vehicle list
- Usage logs
- Fuel efficiency
- Maintenance scheduling

#### Documents
- File upload and storage
- Document organization
- Link documents to assets
- Search and filter

## Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api/v1

# Feature Flags
VITE_ENABLE_WEBSOCKET=false
VITE_ENABLE_ANALYTICS=true
```

## Styling with Tailwind

The app uses TailwindCSS for styling. Custom utilities:

```css
.card { /* White card with shadow */
.btn-primary { /* Primary button */
.input-base { /* Form input */
.table-base { /* Table styling */
```

## Components

### Data Table

```jsx
<DataTable
  columns={columns}
  data={assets}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### Forms

```jsx
<AssetForm
  asset={selectedAsset}
  onSubmit={handleSave}
  isLoading={isLoading}
/>
```

### Charts

```jsx
<AssetChart
  data={chartData}
  type="pie"
/>
```

## State Management

### Context API (Authentication)

```jsx
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useContext(AuthContext)
  // ...
}
```

### Zustand (Optional)

For more complex state, consider adding Zustand:

```javascript
import create from 'zustand'

const useStore = create((set) => ({
  assets: [],
  setAssets: (assets) => set({ assets }),
}))
```

## API Integration

All API calls use the configured axios instance with:

- Automatic token injection
- Error handling
- Request/response interceptors
- Base URL configuration

```javascript
// Automatic token injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## Development Tips

### Hot Module Replacement

Changes are automatically reflected in the browser during development.

### Debugging

Use React Developer Tools browser extension for debugging React state and props.

### API Testing

Test API endpoints in isolation using the Swagger UI at http://localhost:8000/docs

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory ready for deployment.

### Production Checklist

- [ ] Run `npm run build` successfully
- [ ] Test production build locally with `npm run preview`
- [ ] Set correct API URL in `.env`
- [ ] Enable gzip compression on server
- [ ] Set up CDN for static assets
- [ ] Configure proper cache headers
- [ ] Set up monitoring/analytics
- [ ] Test on multiple browsers
- [ ] Mobile responsiveness verified

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Static Hosting

Deploy the `dist/` folder to any static hosting (Netlify, GitHub Pages, AWS S3, etc.)

## Performance

- Built with Vite for instant HMR
- Code splitting for faster initial load
- TailwindCSS production build optimization
- Lazy loaded routes with React Router

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes
3. Format code: `npm run format`
4. Lint code: `npm run lint`
5. Submit pull request

## License

Proprietary - All rights reserved

## Support

For issues and questions, contact: support@tgdsystem.com
