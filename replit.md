# Jexpanel - Game Server Management Panel

## Overview

Jexpanel (formerly Jexactyl) is a modern, high-performance game server management panel built on Pterodactyl Panel. It offers enhanced security, advanced customization, and integrated billing supporting Stripe and PayPal out of the box.

## Project Architecture

This is a full-stack web application with:

### Backend
- **Framework**: Laravel 10.1.3 (PHP 8.1/8.2)
- **Database**: SQLite (development) - configured for MySQL/PostgreSQL in production
- **API**: RESTful API with Sanctum authentication
- **Features**: 
  - Advanced authentication and security
  - Integrated billing system (Stripe + PayPal)
  - Game server management
  - User management with roles and permissions
  - WebSocket support for real-time updates

### Frontend
- **Framework**: React 18.2.0 with TypeScript
- **Build Tool**: Vite 4.5.14
- **Styling**: Tailwind CSS 3.2.7 + Styled Components 5.3.6
- **State Management**: Easy-Peasy 5.2.0
- **UI Components**: Headless UI, Heroicons, Font Awesome
- **Features**:
  - Terminal emulation (xterm.js)
  - Code editor (CodeMirror)
  - Charts (Chart.js)
  - Real-time updates via WebSockets

## Current Configuration

### Development Environment
- **PHP Version**: 8.2.23
- **Node.js Version**: 20.x
- **Package Manager**: pnpm 9.0.6
- **Database**: SQLite (database/database.sqlite)
- **Dev Server**: Vite on http://0.0.0.0:5000

### Environment Variables
The project uses a `.env` file for configuration:
- `APP_ENV=local` - Development environment
- `APP_DEBUG=true` - Debug mode enabled
- `DB_CONNECTION=sqlite` - Using SQLite database
- `QUEUE_CONNECTION=sync` - Synchronous queue processing
- `SESSION_DRIVER=file` - File-based sessions

## Project Structure

```
├── app/                    # Laravel application code
│   ├── Http/              # Controllers, Middleware, Requests
│   ├── Models/            # Eloquent models
│   ├── Services/          # Business logic services
│   └── Providers/         # Service providers
├── config/                # Configuration files
├── database/              # Migrations, seeders, factories
├── public/                # Public assets and entry point
├── resources/             # Frontend source code
│   ├── scripts/           # TypeScript/React code
│   │   ├── api/          # API definitions and routes
│   │   ├── components/   # React components
│   │   └── assets/       # CSS and images
│   └── lang/             # Localization files
├── routes/                # API and web routes
├── storage/               # Application storage
└── vendor/                # PHP dependencies
```

## Recent Changes (Setup for Replit)

1. **Installed PHP 8.2 and Node.js 20 modules**
2. **Configured SQLite database** - Added SQLite connection to config/database.php
3. **Created database file** - database/database.sqlite
4. **Installed dependencies**:
   - PHP dependencies via Composer
   - Node.js dependencies via pnpm
5. **Ran database migrations** - All migrations completed successfully
6. **Configured Vite for Replit**:
   - Set host to 0.0.0.0
   - Set port to 5000
   - Configured HMR for WebSocket support
7. **Set up development workflow** - Vite dev server on port 5000
8. **Configured deployment** - Build with pnpm, run with Laravel artisan serve

## Development Workflow

The project is configured to run with a single workflow that starts the Vite development server on port 5000. The Vite server proxies requests to the Laravel backend through the laravel-vite-plugin.

### Running the Application

The application automatically starts when you open the Replit project. The workflow runs:
```bash
pnpm dev
```

This starts Vite on port 5000, which handles both frontend development and proxies backend requests to Laravel.

### Building for Production

For production deployment, the system will:
1. Build frontend assets: `pnpm build`
2. Start Laravel server: `php artisan serve --host=0.0.0.0 --port=5000`

## User Preferences

No specific user preferences have been documented yet.

## Notes

- This is a complex game server management panel with extensive features
- The application requires proper configuration before it can be used (admin account setup, node configuration, etc.)
- The current setup is configured for development/demonstration purposes
- For production use, consider:
  - Switching to MySQL or PostgreSQL
  - Configuring Redis for caching and queues
  - Setting up proper mail services
  - Configuring external storage (S3)
  - Setting up SSL/TLS
