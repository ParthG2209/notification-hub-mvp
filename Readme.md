# Notification Hub MVP

A real-time notification aggregation platform that centralizes notifications from multiple services (Gmail, Slack, Google Drive, HubSpot) into a unified dashboard.

## Features

- **Authentication**: Supabase Auth with OAuth (Google, GitHub) and email/password
- **OAuth Integrations**: Connect Gmail, Slack, Google Drive, and HubSpot
- **Real-time Notifications**: Live notification updates using Supabase Realtime
- **Token Management**: Secure storage and automatic refresh of OAuth tokens
- **Webhook Handling**: Process incoming notifications from connected services
- **Modern UI**: Beautiful, responsive interface with dark mode support

## Tech Stack

### Frontend
- React 18.2
- Vite (Build tool)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- React Router DOM (Routing)
- Supabase JS Client
- Lucide React (Icons)

### Backend
- Supabase (Database, Auth, Realtime)
- Supabase Edge Functions (Serverless functions)
- PostgreSQL (Database)
- Row Level Security (RLS)

## Project Structure

```
notification-hub-mvp/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React Context providers
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global styles
│   └── public/             # Static assets
│
└── backend/                 # Supabase backend
    └── supabase/
        ├── migrations/      # Database migrations
        └── functions/       # Edge Functions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase CLI
- Supabase account
- OAuth credentials (Google, GitHub, HubSpot, Slack)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd notification-hub-mvp
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Set up environment variables

Create `frontend/.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:3000
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
```

4. Initialize Supabase
```bash
cd backend
supabase init
supabase start
```

5. Apply database migrations
```bash
supabase db push
```

6. Deploy Edge Functions
```bash
supabase functions deploy oauth-google
supabase functions deploy oauth-hubspot
supabase functions deploy oauth-slack
supabase functions deploy webhook-hubspot
supabase functions deploy webhook-slack
supabase functions deploy webhook-google-drive
supabase functions deploy token-refresh
```

### Development

1. Start the frontend development server
```bash
cd frontend
npm run dev
```

2. Start Supabase locally
```bash
cd backend
supabase start
```

The application will be available at `http://localhost:3000`

## Database Schema

### Users Table
Managed by Supabase Auth

### Integrations Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- integration_type (text: gmail, slack, google-drive, hubspot)
- access_token (text, encrypted)
- refresh_token (text, encrypted)
- token_expires_at (timestamp)
- status (text: active, inactive, error)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### Notifications Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- integration_id (uuid, foreign key)
- title (text)
- body (text)
- source (text)
- source_id (text)
- read (boolean)
- read_at (timestamp)
- metadata (jsonb)
- created_at (timestamp)
```

## OAuth Flow

1. User clicks "Connect" for a service
2. Frontend redirects to OAuth authorization URL
3. User authorizes the application
4. Service redirects back with authorization code
5. Edge Function exchanges code for tokens
6. Tokens are securely stored in database
7. Webhooks are registered for real-time notifications

## Webhook Flow

1. External service sends notification to webhook endpoint
2. Edge Function validates webhook signature
3. Notification data is normalized
4. Notification is stored in database
5. Supabase Realtime pushes to connected clients
6. Frontend displays notification in real-time

## Security

- Row Level Security (RLS) on all tables
- Encrypted token storage
- Webhook signature validation
- CORS protection on Edge Functions
- Secure OAuth flows with PKCE
- Environment variable protection

## API Endpoints

### Edge Functions

- `POST /oauth-google` - Handle Google OAuth
- `POST /oauth-hubspot` - Handle HubSpot OAuth
- `POST /oauth-slack` - Handle Slack OAuth
- `POST /webhook-hubspot` - Receive HubSpot webhooks
- `POST /webhook-slack` - Receive Slack webhooks
- `POST /webhook-google-drive` - Receive Google Drive webhooks
- `POST /token-refresh` - Refresh expired tokens

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Backend (Supabase)

1. Create Supabase project
2. Run migrations: `supabase db push --linked`
3. Deploy functions: `supabase functions deploy --linked`
4. Set function secrets in Supabase Dashboard

## Environment Variables

### Frontend
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_APP_URL` - Application URL
- `VITE_OAUTH_REDIRECT_URI` - OAuth callback URL

### Backend (Supabase Secrets)
- `HUBSPOT_CLIENT_ID` - HubSpot OAuth client ID
- `HUBSPOT_CLIENT_SECRET` - HubSpot OAuth client secret
- `SLACK_CLIENT_ID` - Slack OAuth client ID
- `SLACK_CLIENT_SECRET` - Slack OAuth client secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `FRONTEND_URL` - Frontend application URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Supabase for the backend infrastructure
- Tailwind CSS for the styling system
- Framer Motion for animations
- Lucide React for icons