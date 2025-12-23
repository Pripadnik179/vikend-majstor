# VikendMajstor - P2P Tool Rental Platform

## Overview
VikendMajstor is a mobile peer-to-peer rental platform for tools and items, built with Expo (React Native). Its purpose is to connect users who need tools with neighbors willing to rent them out, fostering a sharing economy. The platform enables users to list items with photos, search and filter for tools, manage bookings via an in-app calendar, communicate through messaging, and provide reviews and ratings. The project aims to provide a robust, user-friendly experience for both tool owners and renters, monetized through a subscription-based model and an early adopter program.

## User Preferences
I prefer simple language. I want iterative development. Ask before making major changes. I prefer detailed explanations.

## System Architecture
The application is built using a modern full-stack JavaScript approach. The frontend is an Expo (React Native) app written in TypeScript, leveraging TanStack React Query for state management. The backend is an Express.js server, also in TypeScript, interacting with a PostgreSQL database via Drizzle ORM. Replit Object Storage is used for handling image uploads.

Key features include:
- **Authentication**: Supports Email/Password (with verification), Google OAuth, and Apple Sign-In (iOS only).
- **User Management**: Dual roles (Owner/Renter), profile management, and role switching.
- **Item Management**: CRUD operations for items, supporting up to 4 photos per item, categorized listings, and activity tags.
- **Location-Based Filtering**: Items can be filtered by distance from the user's GPS location, with a fallback to predefined city coordinates.
- **Booking System**: Date-based booking requests, availability calendar, and status management (pending, confirmed, cancelled, completed) with a "pay on pickup" option.
- **Communication**: In-app messaging with conversation threading and unread indicators.
- **Reviews & Ratings**: 1-5 star ratings and written reviews for items and users.
- **Monetization**:
    - **Ad Expiration**: All ads expire after 30 days.
    - **Free Ad Limit**: Free users have a lifetime limit of 5 created ads.
    - **Subscription Tiers**: "Besplatno" (Free), "Standard", and "Premium" with varying benefits like unlimited ads, advanced categories, and featured listings.
    - **Early Adopter Program**: First 100 registered users receive 1 month of free premium access.
    - **Promotional Modals**: Modals for subscription upgrades and reaching ad limits.
- **Admin Panel**: A web-based admin panel (`/admin`) and mobile admin screens, accessible only to users with `isAdmin=true`, offering user management (activation, subscription, duration) and statistics.
- **UI/UX**: The UI is in Serbian (Latin script) with a Caterpillar-inspired black-yellow color palette, aiming for an iOS 26 Liquid Glass design aesthetic with a mobile-first responsive approach. Custom SVG icons are used throughout the application, replacing font-based icons to ensure consistent rendering across platforms.
- **User Trust & Activation Features**:
    - **Onboarding Screen**: 3-step visual onboarding (Dodaj alat, Iznajmi, Zaradi) shown after registration, stored in AsyncStorage.
    - **Social Proof**: Statistics display showing 500+ users, 2000+ tools, 4.8 average rating on AuthScreen.
    - **Feature Preview**: Real-time horizontal scroll of available items on AuthScreen before registration.
    - **Testimonials Carousel**: Rotating testimonials from owners and renters with ratings and pagination.
    - **StickyCTA**: Mobile-only sticky CTA button with blur effect for encouraging registration.
    - **Trust Badges**: Security messaging ("scrypt enkripcija", "Email verifikacija", "0% provizije") on registration form.

Security measures include rate limiting, IP blocking for failed login attempts, XSS protection, input validation, and secure authentication practices (scrypt for password hashing, secure session cookies, token-based mobile auth).

## External Dependencies
- **PostgreSQL**: Primary database for application data.
- **Drizzle ORM**: Used for interacting with the PostgreSQL database.
- **Replit Object Storage**: Utilized for storing item images.
- **SMTP Service (mail.vikendmajstor.rs)**: For sending email verification links.
- **Google Cloud Console**: Required for Google OAuth integration (client IDs).
- **Apple Sign-In**: For Apple authentication on iOS devices.
- **Stripe**: Optional integration for payment processing (requires `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`).
- **Expo**: The framework for building the React Native application.
- **TanStack React Query**: For data fetching, caching, and state management.
- **Express.js**: Backend web framework.
- **Helmet**: Middleware for securing HTTP headers.
- **express-validator**: Middleware for input validation.
- **scrypt**: For secure password hashing.
- **expo-secure-store**: For securely storing authentication tokens on mobile devices.
- **react-native-svg**: For custom SVG icon rendering.