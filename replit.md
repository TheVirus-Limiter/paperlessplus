# PaperTrail - Document Tracker

## Overview

PaperTrail is a privacy-focused document management application that allows users to track and organize important documents without scanning or uploading them. The app is designed as a Progressive Web App (PWA) with a mobile-first approach, providing offline functionality and document reminder capabilities.

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **PWA Features**: Service Worker for offline functionality, Web App Manifest for installability

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Development**: Hot module replacement via Vite integration
- **API Design**: RESTful endpoints with consistent error handling

## Key Components

### Database Schema
- **Documents Table**: Stores document metadata including title, location, category, urgency tags, and expiration dates
- **Categories**: Predefined categories (ID, Legal, Medical, Financial) with associated icons and colors
- **Urgency Tags**: System for flagging documents (expires-soon, need-for-taxes, renewal-due)

### Storage Strategy
- **Production**: PostgreSQL via Neon Database (@neondatabase/serverless)
- **Development**: In-memory storage implementation for rapid development
- **Local Fallback**: IndexedDB wrapper for offline functionality and privacy-focused local storage

### UI Components
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interfaces
- **Bottom Navigation**: Primary navigation pattern for mobile app experience
- **Material Design Elements**: Card-based layouts with elevation shadows
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