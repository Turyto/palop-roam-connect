# PALOP Roam Connect - eSIM Platform

## Project Overview
PALOP Roam Connect is a comprehensive eSIM platform designed to provide connectivity solutions for PALOP (Portuguese-speaking African countries) and neighboring regions. The platform enables users to purchase, manage, and activate eSIM plans with integrated payment processing and administrative tools.

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM v7
- **State Management**: TanStack Query (React Query v5)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Styling**: Tailwind CSS with custom theme system
- **Maps**: Mapbox GL
- **Icons**: Lucide React

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── admin/       # Admin dashboard components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   └── ...          # Feature components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React contexts (Auth, etc)
│   │   ├── integrations/    # Supabase integration
│   │   └── lib/             # Utilities
│   ├── public/              # Static assets
│   └── index.html           # HTML entry point
├── supabase/
│   ├── functions/           # Edge functions
│   │   ├── esim-access/    # eSIM provider integration
│   │   ├── check-esim-status/ # Status checker
│   │   └── get-esim-package/  # Package retrieval
│   └── migrations/          # Database migrations
└── package.json             # Dependencies
```

## Key Features

### Customer Features
- **eSIM Plans**: Browse and purchase data plans for various regions
- **Order Management**: View order history and track eSIM activations
- **QR Code Access**: Download QR codes for eSIM activation
- **Top-ups**: Recharge existing plans with data or validity extensions
- **Referral System**: Earn rewards by referring new users
- **Coverage Maps**: Interactive maps showing network coverage
- **Country Information**: Detailed information about supported countries

### Admin Features
- **Dashboard Analytics**: Overview of orders, revenue, and users
- **Order Management**: Process and manage customer orders
- **eSIM Provisioning**: Provision and manage eSIM activations
- **Inventory Management**: Track plan and carrier inventory
- **QR Code Management**: Generate and manage QR codes
- **User Management**: Manage customer and admin accounts
- **Support Tickets**: Handle customer support requests
- **Plans Catalog**: Manage available plans and pricing
- **Supplier Integration**: Manage wholesale supplier rates

## Database Schema

### Core Tables
- `profiles` - User profiles with role management (admin/customer)
- `orders` - eSIM purchase orders
- `order_items` - Order line items
- `esim_activations` - eSIM activation records
- `esim_packages` - Plan-to-provider package mappings
- `qr_codes` - QR code generation and tracking
- `plans` - Plans catalog
- `supplier_rates` - Wholesale supplier pricing
- `pricing_rules` - Pricing and markup rules
- `topup_orders` - Recharge orders
- `topup_options` - Available top-up options
- `referral_codes` - Referral tracking
- `referral_rewards` - Referral rewards
- `support_tickets` - Customer support tickets
- `carrier_integrations` - eSIM provider integrations

## Environment Variables

The following environment variables are available (managed by Replit):
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - PostgreSQL credentials

Additional required secrets (to be configured):
- `ESIM_ACCESS_SECRET_KEY` - eSIM Access API key for provisioning

## Running the Project

### Development
```bash
npm run dev
```
Starts the Vite dev server on port 5000

### Production Build
```bash
npm run build
npm start
```

### Deployment
The project is configured for Replit deployment with:
- Deployment target: `autoscale`
- Build command: `npm run build`
- Run command: `npm run start`

## Key User Flows

### Customer Purchase Flow
1. Browse available plans on `/plans`
2. Select a plan and proceed to `/purchase`
3. Complete payment and order creation
4. eSIM provisioning happens automatically
5. Download QR code from `/orders`

### Admin Management Flow
1. Access admin dashboard at `/admin/dashboard`
2. Monitor orders and provisioning status
3. Process pending eSIM activations
4. Manage inventory and pricing
5. Handle support tickets

## Supabase Integration

The project uses Supabase for:
- **Authentication**: User signup/login with email/password
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Edge Functions**: eSIM provider API integration
- **Real-time**: Order status updates

## Recent Changes (Migration to Replit)

- ✅ Migrated from Lovable to Replit environment
- ✅ Restructured project with `client/` directory for frontend
- ✅ Updated Vite config to bind to `0.0.0.0:5000`
- ✅ Configured workflow for webview output
- ✅ Updated TypeScript paths for new structure
- ✅ Maintained Supabase integration and migrations
- ✅ PostgreSQL database created and ready

## User Preferences

_To be updated as preferences are discovered_

## Architecture Notes

- **Frontend-Only Architecture**: The app uses Supabase for all backend functionality
- **Edge Functions**: Supabase Edge Functions handle eSIM provider integrations
- **RLS Security**: All database access is secured with Row Level Security policies
- **Role-Based Access**: Admin and customer roles with different permissions
- **Real-time Updates**: Uses Supabase real-time for live order updates

## Next Steps

1. Configure `ESIM_ACCESS_SECRET_KEY` for eSIM provisioning
2. Test eSIM purchase and activation flow
3. Verify admin dashboard functionality
4. Configure Stripe for payment processing (if needed)
5. Test deployment to production
