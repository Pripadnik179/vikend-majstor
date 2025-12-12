# VikendMajstor - P2P Tool Rental Platform

## Overview
VikendMajstor is a mobile P2P rental platform for tools and items built with Expo (React Native). The app allows users to rent tools from neighbors with features like dual user roles (Owner/Renter), item listings with photos, search/filter capabilities, booking system with calendar, in-app messaging, and reviews/ratings.

## Tech Stack
- **Frontend**: Expo (React Native) with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Replit Object Storage for image uploads
- **State Management**: TanStack React Query

## Project Structure
```
├── client/              # Expo React Native app
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (Auth, Theme)
│   ├── hooks/           # Custom hooks
│   ├── navigation/      # React Navigation setup
│   ├── screens/         # App screens
│   └── lib/             # Utilities (query-client)
├── server/              # Express backend
│   ├── auth.ts          # Authentication routes
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database storage layer
│   └── db.ts            # Database connection
├── shared/              # Shared types and schema
│   └── schema.ts        # Drizzle schema definitions
└── assets/              # App icons and images
```

## Authentication Methods
The app supports multiple authentication methods:

### 1. Email/Password Authentication
- Standard email and password login/registration
- Passwords are securely hashed using scrypt

### 2. Google OAuth (Requires Configuration)
- Requires Google Cloud Console credentials:
  - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` - Web client ID
  - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` - iOS client ID
  - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` - Android client ID

### 3. Apple Sign-In (iOS Only)
- Uses expo-apple-authentication
- Available only on iOS devices (iOS 13+)
- Automatically shows on iOS when available
- Backend validates Apple JWT identity token
- Extracts user email and name from Apple credentials

## Environment Variables

### Required Secrets
- `SESSION_SECRET` - Express session secret (configured)
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)

### Optional (For Payment Integration)
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### Optional (For Google OAuth)
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

## Key Features Implemented

### User Features
- User registration/login (Email, Google, Apple)
- Profile management
- Role switching (Owner/Renter)

### Item Management
- Create/edit/delete items
- Up to 4 photos per item with Object Storage
- Category and location-based organization
- Advanced filtering (price range, rating, deposit)

### Booking System
- Date-based booking requests
- Availability calendar on item detail page
- Booking status management (pending, confirmed, cancelled, completed)
- Pay on pickup option

### Messaging
- In-app messaging between users
- Conversation threading
- Unread message indicators

### Reviews & Ratings
- Star ratings (1-5)
- Written reviews
- Average rating calculation for items and users

## Design Guidelines
- UI in Serbian (Latin script)
- Caterpillar-inspired black-yellow color palette (#FFCC00 primary yellow, #1A1A1A accent black)
- iOS 26 Liquid Glass interface design
- Mobile-first responsive design

## Running the App
The app runs with `npm run all:dev` which starts:
- Expo dev server on port 8081
- Express API server on port 5000

## Monetization System

### Subscription Tiers
1. **Besplatno (Free)**: 0 RSD/mesec
   - Do 2 oglasa
   - Osnovne kategorije
   - Poruke sa zakupcima
   
2. **Standard**: 500 RSD/mesec
   - Neograničen broj oglasa
   - Pristup svim kategorijama
   - Statistika oglasa

3. **Premium**: 1000 RSD/mesec
   - Sve iz Standard paketa
   - 1 istaknuti oglas na vrhu pretrage
   - Premium značka na oglasima
   - Prioritet u rezultatima pretrage

### Early Adopter Program
- First 100 registered users automatically become early adopters
- Early adopters receive FREE premium access for 1 month
- Registration automatically sets: isEarlyAdopter=true, subscriptionType="premium", 30-day subscriptionEndDate
- Counter shows remaining slots on homepage banner and subscription page

## Recent Changes (December 2024)
- Added Apple Sign-In support for iOS users
- Implemented Google OAuth infrastructure
- Added availability calendar to item detail page
- Added advanced filtering (price range, rating, deposit)
- Added booking endpoints for item availability
- Added homepage promotional banner (PromoBanner component)
  - Early adopter program banner with remaining slots
  - Premium items carousel for premium subscribers
- Added /api/home endpoint for homepage data
- Fixed SearchScreen to pass all filters (category, subcategory, toolType, powerSource) to backend
- Fixed BookingFlowScreen to block dates for both 'confirmed' and 'pending' bookings
- Fixed SubscriptionScreen to show plan comparison with FREE, Standard, and Premium tiers
- Added "Pretplata" menu item in Profile with subscription badge
- Automatic early adopter registration for first 100 users across all auth methods
