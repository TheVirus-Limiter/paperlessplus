# Paperless+ - Document Tracker

## Overview

Paperless+ is a privacy-focused document management application that allows users to track and organize important documents without scanning or uploading them. The app is designed as a Progressive Web App (PWA) with a mobile-first approach, providing offline functionality and document reminder capabilities.

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with modern dark theme as default, glassmorphism effects
- **Routing**: Wouter for lightweight client-side routing with authentication protection
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **PWA Features**: Service Worker for offline functionality, Web App Manifest for installability
- **Authentication**: Replit Auth integration with session management

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OpenID Connect with Passport.js and session storage
- **Development**: Hot module replacement via Vite integration
- **API Design**: RESTful endpoints with authentication middleware and error handling

## Key Components

### Database Schema
- **Users Table**: Stores user authentication data from Replit Auth (id, email, name, profile)
- **Sessions Table**: Manages user sessions for authentication persistence
- **Documents Table**: Stores document metadata including title, location, category, urgency tags, and expiration dates with user ownership
- **Categories**: Predefined categories (ID, Legal, Medical, Financial) with associated icons and colors
- **Urgency Tags**: System for flagging documents (expires-soon, need-for-taxes, renewal-due)

### Storage Strategy
- **Production**: PostgreSQL via Neon Database (@neondatabase/serverless) with user-scoped data
- **Authentication**: Replit Auth with PostgreSQL session storage
- **Camera**: Client-side camera capture with base64 image storage for document photos

### UI Components
- **Modern Dark Theme**: Default dark interface with glassmorphism effects and purple accent colors
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interfaces
- **Bottom Navigation**: Primary navigation pattern for mobile app experience
- **Authentication Flow**: Landing page for unauthenticated users, protected routes for authenticated users
- **Camera Integration**: Native camera access for document photo capture with privacy-focused local storage
- **Responsive Components**: Adaptive layouts that work across different screen sizes

## Data Flow

1. **Document Creation**: Users input document metadata through forms validated with Zod schemas
2. **Storage**: Documents are stored in PostgreSQL with automatic timestamping
3. **Retrieval**: TanStack Query manages caching and synchronization of document data
4. **Search**: Real-time search functionality across document titles, locations, descriptions, and categories
5. **Filtering**: Category-based and expiration-based filtering with quick filter buttons
6. **Reminders**: Automatic detection of expiring documents with configurable notification thresholds

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL for production deployment
- **Drizzle ORM**: Type-safe database queries and migrations

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Font Awesome**: Additional icons for specific document categories

### Development Tools
- **Vite**: Build tool with HMR and optimized bundling
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundling for production builds

### Progressive Web App
- **Service Worker**: Offline functionality and caching strategies
- **Web App Manifest**: Native app-like installation experience

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds the React application to `dist/public`
- **Backend**: ESBuild bundles the Express server to `dist/index.js`
- **Database**: Drizzle migrations handle schema changes

### Production Deployment
- **Environment Variables**: `DATABASE_URL` for PostgreSQL connection
- **Static Assets**: Served directly by Express in production
- **Process Management**: Single Node.js process serving both API and static files

### Development Workflow
- **Hot Reloading**: Vite development server with proxy to Express backend
- **Database**: Drizzle Kit for schema management and migrations
- **Type Safety**: Shared TypeScript types between frontend and backend

### Privacy & Offline Considerations
- **No File Uploads**: Documents are tracked by metadata only, ensuring user privacy
- **Local Storage**: IndexedDB for offline functionality without compromising privacy
- **Export Functionality**: JSON export for data portability and backup
- **Notification System**: Local browser notifications for document reminders
- **PWA Features**: Service worker for offline functionality and app installability
- **Authentication**: Secure user sessions with automatic token refresh

## Recent Changes (July 2025)

### ✓ Google Sign-In Integration with Onboarding Flow
- **Date**: July 10, 2025
- **Changes**: Added Google OAuth authentication alongside email/password, restructured app to show onboarding slideshow before authentication
- **Impact**: Users now see welcome slideshow introduction before choosing Google Sign-In or email authentication
- **Authentication Flow**: Onboarding slideshow → authentication choice → secure login → app access
- **Technical Details**: Passport.js Google OAuth strategy, conditional route handling, fallback for unconfigured credentials

### ✓ Working Email/Password Authentication System
- **Date**: July 10, 2025
- **Changes**: Replaced non-functional Replit Auth with working email/password authentication
- **Impact**: Users can now create accounts and securely log in to access personalized document storage
- **Authentication Flow**: Professional auth page with login/register forms, session-based authentication
- **Technical Details**: Uses pbkdf2 password hashing, PostgreSQL session storage, comprehensive API endpoints

### ✓ App Rebranding to Paperless+
- **Date**: July 10, 2025
- **Changes**: Rebranded app from PaperTrail to Paperless+ across all files and components
- **Impact**: Updated app name throughout interface, manifest, meta tags, and documentation
- **Components Updated**: HTML title/meta tags, manifest.json, auth page, header, landing page, onboarding page

### ✓ Completed Authentication System (Previous)
- **Date**: July 9, 2025
- **Changes**: Initially integrated Replit Auth with PostgreSQL session storage
- **Impact**: Users can now securely log in and access personalized document storage
- **Authentication Flow**: Landing page for unauthenticated users, protected routes for logged-in users

### ✓ Modern Dark Theme Implementation
- **Date**: July 9, 2025
- **Changes**: Implemented glassmorphism effects with purple accent colors as default theme
- **Impact**: Stunning modern interface optimized for mobile devices
- **Design Elements**: Dark background with glass-like transparency effects, smooth animations

### ✓ Camera Functionality
- **Date**: July 9, 2025
- **Changes**: Added secure camera capture for document photos with local storage
- **Impact**: Users can take photos of documents with privacy-focused approach
- **Privacy**: All photos stored locally on device, no cloud uploads

### ✓ PWA Configuration
- **Date**: July 9, 2025
- **Changes**: Service worker registration and web app manifest for Google Play Store deployment
- **Impact**: App is now installable and ready for TWA deployment to Play Store
- **Features**: Offline functionality, push notifications, background sync capabilities

### ✓ Complete Dark Mode Implementation
- **Date**: July 9, 2025
- **Changes**: Fixed all remaining white backgrounds and poor text contrast issues
- **Impact**: Professional Google Play Store-ready dark theme throughout entire app
- **Components Fixed**: Bottom navigation, stats cards, document list, progress bars, input fields, placeholders
- **Styling**: All text now properly visible with slate colors, purple accents maintained

### ✓ Modern Onboarding Questionnaire
- **Date**: July 9, 2025  
- **Changes**: Replaced landing page with interactive questionnaire flow
- **Impact**: Modern app experience with personalized setup process
- **Features**: Multi-step form, progress tracking, document type selection, reminder preferences, privacy explanation, multi-auth options (Google/email/phone)