# GymPulse - Gym Management System

A modern, responsive gym management system built with React, TypeScript, and Supabase.

## Features

- **Member Management**: Add, edit, and manage gym members
- **Visitor Tracking**: Track gym visitors and their subscriptions
- **Dashboard Analytics**: View comprehensive statistics and insights
- **Expiry Alerts**: Get notified about expiring memberships
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Authentication**: Secure user authentication with Supabase
- **Real-time Updates**: Live data synchronization

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd gym-pulse
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Environment Variables

Make sure to set these environment variables in your Vercel project settings:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Database Setup

The application uses Supabase as the backend. The database schema includes:

- **visitors**: Store visitor information and subscriptions
- **Row Level Security (RLS)**: Enabled for secure data access
- **Authentication**: Built-in Supabase auth system

## Features Overview

### Dashboard
- Overview of total members and visitors
- Recent activity tracking
- Membership expiry alerts
- Statistics and analytics

### Member Management
- Add new members with detailed information
- Track membership types (Basic, Premium, VIP)
- Emergency contact information
- Medical conditions tracking

### Visitor Management
- Register new visitors
- Track subscription details
- Monitor expiry dates
- Comprehensive visitor database

### Alerts System
- Real-time expiry notifications
- Visual alerts for urgent renewals
- Dismissible alert banners
- Automatic refresh capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.