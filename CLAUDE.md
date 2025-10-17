# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Matcha is a dating web application built as a full-stack project with separate frontend and backend directories. The application allows users to create profiles, browse other users, like/unlike, chat, and receive notifications.

## Development Commands

### Docker Development (Recommended)
```bash
# Quick setup - builds, starts and initializes everything
npm run setup

# Development mode with live logs
npm run dev

# Container management
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:restart   # Restart services
npm run docker:clean     # Full cleanup (containers, volumes, images)

# Database operations
npm run docker:db:init   # Create PostgreSQL tables
npm run docker:db:seed   # Populate with sample data

# Logs
npm run docker:logs              # All services logs
npm run docker:backend:logs      # Backend logs only
npm run docker:frontend:logs     # Frontend logs only
npm run docker:postgres:logs     # PostgreSQL logs only
```

### Local Development (Alternative)
```bash
# Frontend (Vue.js)
cd frontend
npm run serve     # Start development server
npm run dev       # Alternative development command
npm run build     # Build for production
npm run lint      # Run ESLint

# Backend (Node.js/Express)
cd backend
npm start         # Start backend with nodemon (auto-reload)

# Database Setup (requires local PostgreSQL)
cd backend
node scripts/createTables.js    # Create PostgreSQL database and tables
node scripts/fillDatabase.js    # Populate database with sample data
```

## Architecture

### Technology Stack
- **Frontend**: Vue 3 + Vue Router + Vuex + Tailwind CSS + FontAwesome
- **Backend**: Node.js + Express + Twig templating
- **Database**: PostgreSQL (single database, MongoDB removed)
- **Containerization**: Docker + Docker Compose
- **Real-time**: WebSockets for chat and notifications
- **Authentication**: JWT tokens with refresh mechanism
- **Web Server**: Nginx (for frontend in production)

### Directory Structure

**Backend (`/backend/`)**:
- `routes/` - API endpoints (index.js, users.js)
- `utils/` - Business logic modules (user management, chat, photos, etc.)
- `models/` - Database models (User.js, Chat.js, userProfile.js)
- `config/` - Database connections (connectBdd.js)
- `middlewares/` - JWT authentication, geolocation, DB testing
- `scripts/` - Database initialization scripts
- `photos/` - User uploaded images storage
- `templates/` - Email templates (Twig)

**Frontend (`/frontend/src/`)**:
- `pages/` - Vue page components
- `components/` - Reusable Vue components organized by feature
- `router/` - Vue Router configuration
- `store/` - Vuex state management
- `config/` - API configuration with JWT token handling
- `i18n/` - Internationalization setup

### Key Features
- User registration/login with email verification
- Profile creation with photo uploads
- Geolocation-based user browsing
- Like/unlike system with match notifications
- Real-time chat system
- User blocking and reporting
- Password reset functionality

### Database Configuration
The application uses PostgreSQL as the single database for all data storage.

Environment variables required:
- `PGUSER`, `PGHOST`, `PGDATABASE`, `PGPASSWORD`, `PGPORT` for PostgreSQL
- `FRONT_URL` for CORS configuration
- `VUE_APP_API_URL` for frontend API calls
- `VUE_APP_WS_URL` for WebSocket connections
- `JWT_SECRET` for token signing
- `BREVO_API_KEY` for email sending via Brevo API

### Docker Services
The application runs in containers with the following services:
- **Frontend**: Vue.js app served by Nginx (port 8080)
- **Backend**: Node.js/Express API (port 3000)
- **PostgreSQL**: Database server (port 5435 -> 5432)
- **Adminer**: Database management interface (port 8081)

### Authentication Flow
- JWT-based authentication with access tokens
- Automatic token refresh mechanism in `frontend/src/config/api.js`
- Tokens stored in localStorage on frontend
- Backend JWT middleware in `backend/middlewares/jwt.js`

### File Upload System
- Images stored in `backend/photos/` directory
- Sharp.js for image processing
- Multer for handling multipart uploads

### Real-time Features
- WebSocket implementation in `backend/utils/websockets.js`
- Chat system with real-time messaging
- Notification system for likes, matches, profile views

### CORS Configuration
- Robust CORS policy in `backend/app.js` supporting multiple origins
- Dynamic origin validation for development and production
- Supports localhost, Docker containers, and custom domains
- Headers: Authorization, Content-Type, etc.
- Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH

### Docker Development Workflow
1. Use `npm run setup` for initial setup
2. Use `npm run dev` for development with live logs
3. Use `npm run docker:db:init` and `npm run docker:db:seed` for database initialization
4. Access services at documented ports
5. Use `npm run docker:clean` for complete reset when needed