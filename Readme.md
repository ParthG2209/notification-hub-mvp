# Notification Hub MVP

A real-time notification aggregation platform that centralizes notifications from multiple services (Gmail, Slack, Google Drive, HubSpot) into a unified dashboard.

## Overview

Notification Hub is a modern web application designed to streamline your workflow by bringing all your important notifications into one place. Stop switching between multiple apps and tabs - manage everything from a single, beautiful interface.

## Key Features

### Core Functionality
- **Unified Dashboard**: View all notifications from multiple services in one centralized location
- **Real-time Synchronization**: Get instant updates as notifications arrive across your connected services
- **Smart Filtering**: Organize and filter notifications by source, read status, date, and custom criteria
- **One-Click Actions**: Mark as read, delete, or archive notifications without leaving the dashboard
- **Analytics & Insights**: Track notification patterns and understand your communication trends

### Authentication & Security
- **Multiple Auth Options**: Sign in with Google, GitHub, or email/password
- **Supabase Auth**: Secure authentication with OAuth 2.0 and PKCE flow
- **Session Management**: Automatic token refresh and session handling
- **Row Level Security**: Database-level security policies for data protection

### Integrations
- **Gmail**: Receive and manage email notifications
- **Slack**: Track team messages and mentions
- **Google Drive**: Monitor file changes and shares
- **HubSpot**: Stay updated on CRM activities

### Security & Privacy
- **Encrypted Token Storage**: All OAuth tokens are securely encrypted
- **Webhook Signature Validation**: Ensures authenticity of incoming notifications
- **CORS Protection**: Secure API endpoints with proper CORS configuration
- **Environment Variable Protection**: Sensitive credentials stored securely

## Tech Stack

### Frontend
- **React 18.2**: Modern React with hooks and concurrent features
- **Vite**: Lightning-fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Framer Motion**: Smooth animations and transitions
- **React Router DOM**: Client-side routing
- **Supabase JS Client**: Real-time subscriptions and authentication
- **Lucide React**: Beautiful, consistent icon set

### Backend
- **Supabase**: Backend-as-a-Service platform
  - PostgreSQL database with extensions
  - Real-time subscriptions via WebSockets
  - Authentication and user management
  - Edge Functions (Deno runtime)
- **Row Level Security (RLS)**: Database-level access control
- **Edge Functions**: Serverless functions for OAuth and webhooks

## Project Structure

```
notification-hub-mvp/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── common/     # Shared components (Button, Input, Toast)
│   │   │   ├── landing/    # Landing page sections
│   │   │   └── ui/         # UI-specific components
│   │   ├── contexts/       # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── IntegrationContext.jsx
│   │   ├── pages/          # Route pages
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Integrations.jsx
│   │   │   ├── OAuthCallback.jsx
│   │   │   └── Diagnostics.jsx
│   │   ├── services/       # API and OAuth services
│   │   │   ├── oauth/      # OAuth handlers
│   │   │   └── supabase/   # Supabase client
│   │   ├── styles/         # Global styles and CSS
│   │   ├── utils/          # Utility functions
│   │   └── layouts/        # Layout components
│   └── public/             # Static assets
│
└── backend/                 # Supabase backend
    └── supabase/
        ├── migrations/      # Database migrations
        │   ├── 20240101000000_initial_schema.sql
        │   ├── 20240101000001_rls_policies.sql
        │   └── 20240101000002_functions.sql
        └── functions/       # Edge Functions
            ├── _shared/     # Shared utilities
            ├── oauth-google/
            ├── oauth-hubspot/
            ├── oauth-slack/
            ├── sync-gmail/
            ├── token-refresh/
            └── webhook-*/    # Webhook handlers
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase CLI** (for local development)
- **Supabase Account** (for production deployment)
- **OAuth Credentials** from:
  - Google Cloud Console (for Gmail and Google Drive)
  - GitHub (for GitHub authentication)
  - Slack App Dashboard
  - HubSpot Developer Portal

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd notification-hub-mvp
```

#### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### 3. Configure Environment Variables

Create `frontend/.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:3000
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_SLACK_CLIENT_ID=your_slack_client_id
VITE_HUBSPOT_CLIENT_ID=your_hubspot_client_id
```

#### 4. Initialize Supabase
```bash
cd backend
supabase init
supabase start
```

#### 5. Apply Database Migrations
```bash
supabase db push
```

#### 6. Configure Supabase Secrets

Set the following secrets in your Supabase project:
```bash
supabase secrets set HUBSPOT_CLIENT_ID=your_hubspot_client_id
supabase secrets set HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
supabase secrets set SLACK_CLIENT_ID=your_slack_client_id
supabase secrets set SLACK_CLIENT_SECRET=your_slack_client_secret
supabase secrets set GOOGLE_CLIENT_ID=your_google_client_id
supabase secrets set GOOGLE_CLIENT_SECRET=your_google_client_secret
supabase secrets set FRONTEND_URL=http://localhost:3000
supabase secrets set SLACK_SIGNING_SECRET=your_slack_signing_secret
```

#### 7. Deploy Edge Functions
```bash
supabase functions deploy oauth-google
supabase functions deploy oauth-hubspot
supabase functions deploy oauth-slack
supabase functions deploy webhook-hubspot
supabase functions deploy webhook-slack
supabase functions deploy webhook-google-drive
supabase functions deploy webhook-gmail
supabase functions deploy sync-gmail
supabase functions deploy token-refresh
```

### Development

#### Start the Frontend Development Server
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

#### Start Supabase Locally
```bash
cd backend
supabase start
```

Supabase Studio will be available at `http://localhost:54323`

## Database Schema

### Users Table
Managed automatically by Supabase Auth with the following structure:
- id (uuid, primary key)
- email (text)
- encrypted_password (text)
- email_confirmed_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)

### Integrations Table
Stores OAuth integration credentials:
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- integration_type (text: gmail, slack, google-drive, hubspot)
- access_token (text, encrypted)
- refresh_token (text, encrypted)
- token_expires_at (timestamptz)
- status (text: active, inactive, error)
- metadata (jsonb)
- created_at (timestamptz)
- updated_at (timestamptz)
- UNIQUE constraint on (user_id, integration_type)
```

### Notifications Table
Stores notification data:
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- integration_id (uuid, foreign key to integrations)
- title (text)
- body (text)
- source (text)
- source_id (text)
- read (boolean, default false)
- read_at (timestamptz)
- metadata (jsonb)
- created_at (timestamptz)
```

### Database Indexes
- `idx_integrations_user_id` on integrations(user_id)
- `idx_integrations_status` on integrations(status)
- `idx_integrations_expires` on integrations(token_expires_at)
- `idx_notifications_user_id` on notifications(user_id)
- `idx_notifications_read` on notifications(read)
- `idx_notifications_created` on notifications(created_at DESC)
- `idx_notifications_source` on notifications(source)

## OAuth Flow

### Integration Connection Flow
1. User clicks "Connect" button for a service
2. Frontend generates OAuth URL with appropriate scopes
3. User is redirected to OAuth provider (Google, Slack, HubSpot)
4. User authorizes the application
5. OAuth provider redirects back with authorization code
6. Edge Function exchanges code for access and refresh tokens
7. Tokens are encrypted and stored in database
8. Webhooks are registered for real-time notifications (where applicable)

### Token Management
- Access tokens are automatically refreshed when expired
- Token refresh handled by `token-refresh` Edge Function
- Can be triggered manually or via cron job
- Refresh tokens are stored securely and encrypted

## Webhook Flow

### Real-time Notification Processing
1. External service sends notification to webhook endpoint
2. Edge Function validates webhook signature
3. Notification data is normalized to common format
4. Notification is stored in database with proper relationships
5. Supabase Realtime pushes update to connected clients
6. Frontend displays notification in real-time

### Supported Webhooks
- **Gmail**: Push notifications via Google Cloud Pub/Sub (requires additional setup)
- **Slack**: Event subscriptions for messages and mentions
- **Google Drive**: File change notifications
- **HubSpot**: CRM activity webhooks

## API Endpoints

### Edge Functions

#### OAuth Handlers
- `POST /oauth-google` - Handle Google OAuth (Gmail & Drive)
- `POST /oauth-hubspot` - Handle HubSpot OAuth
- `POST /oauth-slack` - Handle Slack OAuth

#### Webhook Handlers
- `POST /webhook-hubspot` - Receive HubSpot webhooks
- `POST /webhook-slack` - Receive Slack webhooks
- `POST /webhook-google-drive` - Receive Google Drive webhooks
- `POST /webhook-gmail` - Receive Gmail push notifications

#### Utility Functions
- `POST /sync-gmail` - Manually sync Gmail messages
- `POST /token-refresh` - Refresh expired OAuth tokens

## Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git push origin main
   ```

2. **Import to Vercel**
   - Go to vercel.com and import your repository
   - Select the `frontend` directory as the root

3. **Configure Environment Variables**
   Add all variables from `.env.local` in Vercel dashboard

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at `https://your-app.vercel.app`

### Backend Deployment (Supabase)

1. **Create Supabase Project**
   ```bash
   # Link your local project to Supabase
   supabase link --project-ref your-project-ref
   ```

2. **Push Database Schema**
   ```bash
   supabase db push --linked
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy --linked
   ```

4. **Configure Secrets**
   Set all required secrets in Supabase Dashboard under Project Settings > Edge Functions

5. **Update Frontend Environment**
   Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with production values

## Environment Variables

### Frontend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_APP_URL` | Application URL | `http://localhost:3000` |
| `VITE_OAUTH_REDIRECT_URI` | OAuth callback URL | `http://localhost:3000/auth/callback` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `VITE_SLACK_CLIENT_ID` | Slack OAuth client ID | `xxx.xxx` |
| `VITE_HUBSPOT_CLIENT_ID` | HubSpot OAuth client ID | `xxx-xxx-xxx` |

### Backend Secrets (Supabase)
| Secret | Description |
|--------|-------------|
| `HUBSPOT_CLIENT_ID` | HubSpot OAuth client ID |
| `HUBSPOT_CLIENT_SECRET` | HubSpot OAuth client secret |
| `SLACK_CLIENT_ID` | Slack OAuth client ID |
| `SLACK_CLIENT_SECRET` | Slack OAuth client secret |
| `SLACK_SIGNING_SECRET` | Slack webhook signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FRONTEND_URL` | Frontend application URL |

## Features Roadmap

### Completed
- User authentication (Google, GitHub, Email/Password)
- Gmail integration with manual sync
- Slack integration
- Google Drive integration
- HubSpot integration
- Real-time notification updates
- Notification filtering and search
- Dashboard analytics
- Responsive design
- Dark mode support

### In Progress
- Automatic Gmail sync via Pub/Sub
- Notification preferences
- Email digest notifications
- Mobile app (React Native)

### Planned
- Microsoft Teams integration
- Trello integration
- Asana integration
- Custom notification rules
- AI-powered notification prioritization
- Browser extension
- Desktop app (Electron)

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## Troubleshooting

### Common Issues

**Issue**: OAuth callback fails with 401 error
**Solution**: 
- Ensure `FRONTEND_URL` is set correctly in Supabase secrets
- Verify redirect URI matches in OAuth provider settings
- Check that Edge Functions have been redeployed after setting secrets

**Issue**: Notifications not appearing in real-time
**Solution**:
- Check Supabase Realtime is enabled for notifications table
- Verify browser WebSocket connection is active
- Check browser console for connection errors

**Issue**: Token refresh fails
**Solution**:
- Verify refresh token exists in database
- Check token expiration time
- Ensure `token-refresh` function is deployed correctly

### Debug Mode

Run diagnostics page at `/diagnostics` to check:
- Frontend configuration
- Session status
- Token validity
- Edge Function connectivity

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review closed issues for solutions

## Acknowledgments

- Supabase for the backend infrastructure
- Tailwind CSS for the styling system
- Framer Motion for animations
- Lucide React for icons
- The open-source community for inspiration and tools

---

Built with care by the Notification Hub team