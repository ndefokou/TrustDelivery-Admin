# TrustDelivery Admin Panel

A modern, enterprise-grade logistics administration platform for TrustDelivery in Yaoundé, Cameroon.

## Overview

TrustDelivery Admin Panel is the operational control center for managing deliveries, riders, merchants, and payments. It provides:

- **Delivery transparency** - Full visibility into delivery lifecycle
- **Rider accountability** - Track rider performance and expenses
- **Proof of delivery** - OTP verification for completed deliveries
- **Merchant visibility** - Business insights for merchants
- **Operational control** - Centralized management of all operations

## Tech Stack

### Backend
- **Rust** with Actix-web framework
- **PostgreSQL** (Supabase) for database
- **JWT** for authentication
- **SQLx** for database queries

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **Zustand** for state management
- **Recharts** for charts
- **React Router** for navigation
- **Lucide Icons** for icons

## Project Structure

```
TrustDelivery-Admin/
├── backend/                 # Rust backend
│   ├── src/
│   │   ├── config/          # App configuration
│   │   ├── handlers/        # API handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/         # Data models
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── main.rs          # Entry point
│   ├── migrations/          # SQL migrations
│   ├── Cargo.toml           # Rust dependencies
│   └── .env                 # Environment variables
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # App component
│   │   └── main.tsx         # Entry point
│   ├── package.json         # Node dependencies
│   ├── tailwind.config.js   # Tailwind config
│   └── .env                 # Environment variables
└── README.md                # This file
```

## Setup Instructions

### Prerequisites

- **Rust** (1.70+) - Install from https://rustup.rs
- **Node.js** (18+) - Install from https://nodejs.org
- **PostgreSQL** (15+) or Supabase account
- **pnpm/npm/yarn** package manager

### Database Setup (Supabase)

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor
3. Run `backend/migrations/001_initial_schema.sql`
4. Run `backend/migrations/002_seed_data.sql` for sample data
5. Copy your database connection string

### Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your Supabase credentials
# DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres

# Build and run
cargo build --release
cargo run
```

Backend will run at http://localhost:8080

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed
# VITE_API_URL=http://localhost:8080/api

# Run development server
npm run dev
```

Frontend will run at http://localhost:3000

## Features

### Dashboard
- KPI cards with trend indicators
- Deliveries per day chart
- Revenue per day chart
- Delivery status distribution pie chart
- Top performing riders leaderboard

### Deliveries Management
- Full deliveries list with filtering
- Delivery details with timeline
- Assign riders to deliveries
- Bulk assignment for awaiting queue
- Print delivery receipts

### Awaiting Assignment Queue
- Priority list of deliveries waiting for riders
- Bulk selection and assignment
- Waiting time indicators
- Urgent delivery highlighting

### Rider Management
- Rider list with performance metrics
- Add/edit/suspend/activate riders
- Rider profile with statistics
- Expense management and approval

### Merchant Management
- Merchant list with statistics
- Suspend/activate merchants
- Business information tracking
- Activity monitoring

### Reports
- Daily/Weekly/Monthly reports
- Revenue tracking
- Failed deliveries analysis
- Rider performance reports

### Payments
- Payment history
- Filter by status/date/merchant
- Orange Money & MTN Mobile Money tracking

### Settings
- Company information
- Distance-based pricing rules
- User management

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new admin

### Deliveries
- `GET /api/deliveries` - List deliveries
- `GET /api/deliveries/awaiting` - Get awaiting assignments
- `GET /api/deliveries/:id` - Get delivery details
- `POST /api/deliveries` - Create delivery
- `PUT /api/deliveries/:id` - Update delivery
- `POST /api/deliveries/:id/assign` - Assign rider
- `DELETE /api/deliveries/:id` - Cancel delivery

### Riders
- `GET /api/riders` - List riders
- `GET /api/riders/:id` - Get rider details
- `POST /api/riders` - Create rider
- `PUT /api/riders/:id` - Update rider
- `POST /api/riders/:id/suspend` - Suspend rider
- `POST /api/riders/:id/activate` - Activate rider
- `GET /api/riders/:id/expenses` - Get rider expenses

### Merchants
- `GET /api/merchants` - List merchants
- `GET /api/merchants/:id` - Get merchant details
- `POST /api/merchants` - Create merchant
- `PUT /api/merchants/:id` - Update merchant
- `POST /api/merchants/:id/suspend` - Suspend merchant

### Dashboard
- `GET /api/dashboard` - Get dashboard data

### Reports
- `GET /api/reports/daily` - Daily report
- `GET /api/reports/weekly` - Weekly report
- `GET /api/reports/monthly` - Monthly report
- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/rider-performance` - Rider performance
- `GET /api/reports/failed-deliveries` - Failed deliveries report

## Demo Credentials

```
Email: admin@trustdelivery.cm
Password: admin123
```

## Design System

### Colors
- **Primary**: `#0F172A` - Dark backgrounds
- **Secondary**: `#2563EB` - Buttons, links
- **Success**: `#16A34A` - Completed, active
- **Warning**: `#F59E0B` - Pending, awaiting
- **Danger**: `#DC2626` - Errors, failed

### Typography
- System font stack
- Monospace for IDs and codes

## License

MIT License - Copyright 2024 TrustDelivery