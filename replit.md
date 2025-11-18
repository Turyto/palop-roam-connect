# PALOP Roam Connect - eSIM Platform

## Overview
BuéChama eSIM is a comprehensive eSIM platform designed for PALOP (Portuguese-speaking African countries) communities. The platform provides affordable data and voice roaming plans specifically for travelers and communities from Angola, Cape Verde, Guinea-Bissau, Mozambique, and São Tomé and Príncipe.

## Current State
**Status:** ✅ Fully migrated from Lovable to Replit and running successfully

The application has been successfully migrated from Lovable's environment to Replit. All features are functional:
- Frontend running on Vite + React with full CSS styling
- Supabase integration for authentication and database
- Admin dashboard for managing eSIM plans, orders, and inventory
- Customer portal for browsing plans and managing orders
- Integration with eSIM Access API for provisioning

## Recent Changes (Migration from Lovable - Nov 18, 2024)
1. **Project Structure Reorganization**
   - Moved all frontend code from `src/` to `client/src/`
   - Moved `index.html` and `public/` to `client/` directory
   - Updated all configuration files to reflect new structure

2. **Configuration Updates**
   - `vite.config.ts`: Updated to serve from `client/` directory and bind to port 5000
   - `tailwind.config.ts`: Updated content paths to scan `client/` directory
   - `tsconfig.json` and `tsconfig.app.json`: Updated path aliases for new structure
   - `package.json`: Updated project name and scripts

3. **Workflow Configuration**
   - Configured "Start application" workflow to run `npm run dev` on port 5000
   - Set output type to webview for proper frontend display

## Project Architecture

### Frontend (client/src/)
- **Framework:** React 18 with TypeScript
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS with custom PALOP color scheme
- **UI Components:** Shadcn/ui component library
- **State Management:** TanStack Query (React Query) for server state
- **Authentication:** Supabase Auth with role-based access control

### Backend & Database
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth
- **Edge Functions:** Supabase Functions for eSIM provisioning
- **API Integration:** eSIM Access API for real eSIM provisioning

### Key Features
1. **Customer Features:**
   - Browse eSIM plans by country and data amount
   - Purchase eSIM plans
   - View order history and eSIM activations
   - Download QR codes for eSIM activation
   - Top-up existing eSIMs
   - Referral system

2. **Admin Features:**
   - Manage plans catalog with supplier rates
   - View and process orders
   - Monitor eSIM provisioning status
   - Manage inventory (plan-based and carrier-based)
   - View QR codes and activations
   - User management
   - Support ticket system

### Database Schema
The database includes these main tables:
- `profiles` - User profiles with role management (admin/customer)
- `orders` - eSIM purchase orders
- `esim_activations` - eSIM activation records with QR codes
- `plans` - Available eSIM plans catalog
- `supplier_rates` - Wholesale costs from suppliers
- `pricing_rules` - Dynamic pricing configuration
- `qr_codes` - QR code generation and tracking
- `topup_orders` - Top-up purchases
- `referral_codes` & `referral_rewards` - Referral program
- `support_tickets` - Customer support tickets

## User Preferences
- **Code Style:** TypeScript with React functional components
- **UI Library:** Shadcn/ui components
- **Styling:** Tailwind CSS with PALOP color scheme (green, yellow, red)
- **Database:** Supabase with RLS policies

## Development Workflow
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run start
```

## Environment Variables
The following Supabase secrets are already configured:
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL (configured in client code)
- `SUPABASE_ANON_KEY` - Supabase anonymous key (configured in client code)
- `ESIM_ACCESS_SECRET_KEY` - eSIM Access API key (for edge functions)

## Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **UI:** Shadcn/ui, Radix UI primitives, Lucide icons
- **Data Fetching:** TanStack Query
- **Forms:** React Hook Form with Zod validation
- **Maps:** Mapbox GL
- **Charts:** Recharts
- **Backend:** Supabase (Auth, PostgreSQL, Edge Functions)
- **eSIM Provisioning:** eSIM Access API integration

## Important Notes
1. The project uses Supabase migrations located in `supabase/migrations/`
2. Edge functions are in `supabase/functions/` for eSIM API integration
3. The admin dashboard requires `admin` role in the profiles table
4. All sensitive API keys should be managed through Supabase secrets
5. The Tailwind config removes the deprecated `@tailwindcss/line-clamp` plugin warning

## Next Steps
The project is ready for development. You can:
1. Continue building new features
2. Test the eSIM provisioning flow with real API credentials
3. Deploy to production using Replit's deployment features
4. Set up environment variables for production Supabase instance
