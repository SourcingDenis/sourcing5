# Sourcer OS

A scalable, modular recruitment platform built with Next.js, Supabase, and TypeScript.

## Project Overview

Sourcer OS is a comprehensive platform designed to manage the entire recruitment lifecycle through a collection of specialized modules. The architecture prioritizes scalability, type safety, and clear domain separation.

## Features

### Current Modules

- **Dashboard**: Central hub for monitoring platform metrics
- **Capacity OS**: Manage team capacity and resource allocation
- **Funnel Radar**: Monitor recruitment funnel metrics
- **OneOnOne Engine**: Manage one-on-one meetings and feedback
- **Quality Lab**: Monitor and improve hire quality metrics
- **Experiment Hub**: Run and analyze recruitment experiments
- **AI Executive Insights**: Intelligent analysis and recommendations

## Technology Stack

- **Frontend**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **Charts**: Recharts
- **Language**: TypeScript (strict mode)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and layouts
├── lib/
│   ├── db/                # Database client and repositories
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utilities and validators
│   ├── metrics/           # Metrics calculation layer
│   ├── auth/              # Authentication helpers
│   └── supabase/          # Supabase utilities
├── modules/               # Feature modules (capacity, funnel, etc.)
└── components/            # Reusable UI components
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sourcing5
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side operations)

### Database Setup

1. Create a new Supabase project at https://supabase.com
2. Run the migration:
   - In Supabase dashboard, go to SQL Editor
   - Create a new query
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the query

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Architecture

### Database Layer

All database access goes through the repository pattern located in `src/lib/db/repositories/`:
- `users.ts` - User management
- `teams.ts` - Team management
- `reqs.ts` - Requisition management
- `assignments.ts` - Assignment management

### Type System

Strict TypeScript is enforced throughout:
- `src/lib/types/` contains all domain types
- No `any` types allowed
- Full type coverage for database models and API responses

### Module Structure

Each module (`src/modules/{moduleName}/`) includes:
- `index.ts` - Public API exports
- `service.ts` - Business logic
- `types.ts` - Module-specific types
- `routes.ts` - Route configuration
- `components/` - Module UI components

### Metrics Layer

Metrics are calculated in `src/lib/metrics/`:
- `capacity.ts` - Capacity calculations
- `aggregator.ts` - Aggregates metrics for AI insights

## Key Features

### Authentication

- Supabase Auth integration
- Protected routes with server-side session validation
- OAuth callback handling

### Capacity Management

Functions to calculate:
- User load ratio
- Available capacity
- Team utilization metrics

### AI Insights

The AI module provides:
- `getExecutiveSummary()` - Generates executive summaries from aggregated metrics
- Type-safe inputs and outputs
- Recommendations and insights

## Database Schema

### Users Table
- `id` (UUID, PK)
- `name` (TEXT)
- `email` (TEXT, UNIQUE)
- `role` (ENUM: lead, sourcer)
- `manager_id` (UUID, FK - nullable)
- `weekly_capacity_hours` (INT, default: 40)
- `created_at`, `updated_at` (TIMESTAMP)

### Teams Table
- `id` (UUID, PK)
- `name` (TEXT)
- `lead_id` (UUID, FK)
- `created_at` (TIMESTAMP)

### Requisitions Table (reqs)
- `id` (TEXT, PK)
- `title`, `function`, `level`, `location` (TEXT)
- `priority` (ENUM: low, medium, high, critical)
- `created_at` (TIMESTAMP)

### Assignments Table
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `req_id` (TEXT, FK)
- `estimated_hours_per_week` (INT)
- `status` (ENUM: active, paused, closed)
- `created_at`, `updated_at` (TIMESTAMP)

## Development Guidelines

### Code Style

- Use functional components
- Prefer server components (Next.js 14)
- Client components marked with `'use client'`
- No global state (prefer server-side fetching)
- All DB access through repositories

### TypeScript

- Strict mode enabled
- No implicit any types
- Full type coverage required
- Zod schemas for runtime validation

### Module Development

When adding new module functionality:
1. Add types to `src/modules/{moduleName}/types.ts`
2. Implement logic in `src/modules/{moduleName}/service.ts`
3. Create UI components in `src/modules/{moduleName}/components/`
4. Export public API via `src/modules/{moduleName}/index.ts`

## API Patterns

### Repository Pattern

All database operations follow the repository pattern:

```typescript
// Example: getUserById
const user = await usersRepository.getUserById(userId);

// Example: listUsers with filters
const users = await usersRepository.listUsers({ role: 'lead' });

// Example: createUser
const newUser = await usersRepository.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'sourcer'
});
```

### Metrics Calculation

```typescript
import { calculateUserLoadRatio, getAvailableCapacity } from '@/lib/metrics/capacity';

const loadRatio = await calculateUserLoadRatio(userId);
const available = await getAvailableCapacity(userId);
```

### AI Insights

```typescript
import { aggregateMetricsForInsights } from '@/lib/metrics/aggregator';
import { aiService } from '@/modules/ai';

const metrics = await aggregateMetricsForInsights();
const summary = await aiService.getExecutiveSummary(metrics);
```

## Environment Variables

Required variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_APP_NAME=Sourcer OS
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Performance Considerations

- Server-side data fetching reduces client bundle size
- Repository pattern enables caching strategies
- Type safety catches errors at compile time
- Metrics calculated on-demand (can be cached/batched)

## Testing

To add tests, create test files alongside source files:
```
src/lib/db/repositories/users.ts
src/lib/db/repositories/users.test.ts
```

Run tests with:
```bash
npm run test
```

## Contributing

Guidelines:
1. Create a feature branch from `main`
2. Implement feature with tests
3. Update types if adding new domain concepts
4. Update README if adding new functionality
5. Submit PR for review

## Roadmap

- [ ] Module-specific views and dashboards
- [ ] Advanced metrics and analytics
- [ ] Real-time collaboration features
- [ ] Mobile app support
- [ ] Advanced filtering and search

## Support

For issues or questions, please create an issue in the repository.

## License

MIT
