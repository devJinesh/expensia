# Expensia - Expense Tracker Frontend

A modern, feature-rich expense tracking application built with Next.js, TypeScript, and Tailwind CSS.

## Features

### User Features
- **Authentication & Authorization**: Secure sign-in, sign-up, email verification, and password reset
- **Dashboard**: Financial overview with income, expense, and cash-in-hand statistics
- **Transaction Management**: Add, edit, delete, search, and filter transactions
- **Saved Transactions**: Manage recurring and planned transactions
- **Statistics**: Visual charts showing income vs expense trends over 12 months
- **Budget Tracking**: Set monthly budgets and track spending
- **Profile Management**: Update profile picture and change password
- **Dark/Light Mode**: Toggle between themes

### Admin Features
- **User Management**: View, enable, and disable user accounts
- **Transaction Monitoring**: View all system transactions
- **Category Management**: Create, edit, enable/disable categories
- **Admin Dashboard**: System overview and quick actions

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Theme**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:8080`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file (already created):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/expensia
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/
├── app/                      # Next.js app directory
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # User dashboard
│   ├── transactions/        # Transaction management
│   ├── saved-transactions/  # Recurring transactions
│   ├── statistics/          # Financial statistics
│   ├── settings/            # User settings
│   ├── admin/               # Admin pages
│   └── unauthorized/        # Access denied page
├── components/              # React components
│   ├── ui/                  # UI components
│   ├── layout/              # Layout components
│   ├── auth/                # Auth components
│   ├── dashboard/           # Dashboard components
│   └── transactions/        # Transaction components
├── context/                 # React context providers
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions
│   ├── api-client.ts       # API client with interceptors
│   └── utils.ts            # Helper functions
└── types/                   # TypeScript type definitions

```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with the backend API using Axios with JWT token authentication. All API calls are handled through the centralized API client (`lib/api-client.ts`) which includes:

- Automatic JWT token injection
- Request/response interceptors
- Error handling
- Token refresh logic

## Authentication Flow

1. User signs up with username, email, and password
2. Verification code sent to email
3. User verifies email with code
4. User can log in with credentials
5. JWT token stored in localStorage
6. Token automatically included in API requests
7. Protected routes check authentication status

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: http://localhost:8080/expensia)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the Expensia expense tracker application.
