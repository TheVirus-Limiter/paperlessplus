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
- **Local Storage**: IndexedDB for client-side document storage with no server dependencies
- **Privacy-First**: All data stays on the user's device, no authentication or cloud storage required
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

### ✓ Simplified Local-Only App with Onboarding
- **Date**: July 10, 2025
- **Changes**: Removed authentication system, converted to local-only storage with onboarding slideshow
- **Impact**: App now works entirely offline with no server dependencies, pure privacy-focused approach
- **User Flow**: Onboarding slideshow → direct access to document tracking → all data stored locally
- **Technical Details**: IndexedDB storage, React state management, localStorage for onboarding tracking

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

### ✓ Interactive Document Timeline Visualization
- **Date**: July 10, 2025
- **Changes**: Added comprehensive timeline view for documents with interactive filtering and grouping
- **Impact**: Users can now visualize their document history and patterns chronologically
- **Features**: Monthly grouping, created/expiration date filtering, category filtering, expandable sections, document preview, image indicators, urgency markers, click-to-view/edit functionality

### ✓ Google Play Store Optimization
- **Date**: July 10, 2025
- **Changes**: Optimized PWA for Play Store deployment with enhanced manifest, icons, and meta tags
- **Impact**: App is now ready for Google Play Store publication via TWA (Trusted Web Activity)
- **Features**: Professional icons, optimized manifest.json, SEO meta tags, social media cards, enhanced PWA features
- **Documentation**: Complete deployment guide with step-by-step instructions for Play Store submission

### ✓ GitHub Pages Deployment & Logo Integration
- **Date**: July 11, 2025
- **Changes**: Fixed GitHub Pages routing issues and integrated custom logo throughout the app
- **Impact**: App now properly deploys to GitHub Pages with correct SPA routing and professional branding
- **Features**: Custom logo in onboarding and header, GitHub Pages SPA routing fix, 404 redirect handling
- **Technical Details**: Updated 404.html and spa-github-pages.js for proper path handling, logo asset integration

### ✓ Complete Logo Integration & Favicon Setup
- **Date**: July 11, 2025
- **Changes**: Resolved logo loading issues and implemented comprehensive favicon/PWA icon system
- **Impact**: Custom branding now appears consistently across all platforms and installation methods
- **Features**: Logo in onboarding slideshow, header, browser favicon, Android PWA icons, iOS home screen
- **Technical Details**: Consolidated logo references to single `logo.png` file, updated manifest.json with all icon sizes

### ✓ Fixed Reset Onboarding GitHub Pages Routing
- **Date**: July 11, 2025
- **Changes**: Fixed 404 error when clicking "Reset Onboarding" button in settings
- **Impact**: Users can now properly reset onboarding flow without encountering GitHub Pages routing errors
- **Features**: Proper redirect to home page, onboarding slideshow triggers correctly
- **Technical Details**: Changed from `window.location.reload()` to `window.location.href = '/'`, added storage event listener

### ✓ Complete GitHub Pages Subdirectory Routing
- **Date**: July 11, 2025
- **Changes**: Configured all routing to work with `/paperlessplus/` subdirectory for GitHub Pages deployment
- **Impact**: App now properly works under https://thevirus-limiter.github.io/paperlessplus/ with all routing functional
- **Features**: Custom router without Wouter, proper base path handling, GitHub Pages SPA routing
- **Technical Details**: Custom Router component, updated manifest.json, 404.html, index.html with base tag, service worker paths
- **Removed**: Reset onboarding button and notifications functionality to reduce complexity
