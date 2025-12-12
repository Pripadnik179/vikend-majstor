# VikendMajstor Mobile App - Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required**: Yes - the app has multi-user functionality with owner and renter roles.

**Implementation:**
- Primary: Email/password authentication
- Secondary: Google Sign-In (Apple Sign-In for iOS App Store requirement)
- Include onboarding flow explaining the two user types (Vlasnik/Iznajmljivač)
- Auth screens required:
  - Welcome screen (choose login or register)
  - Email/password registration with role selection
  - Email verification confirmation screen
  - Login screen
  - Password reset flow
- Account management:
  - Profile settings with logout (confirmation alert)
  - Account deletion nested under Postavke > Nalog > Obriši nalog (double confirmation)
  - Privacy policy and terms of service links (placeholder URLs)

### Navigation Architecture
**Root Navigation**: Tab Navigation (4 tabs with floating action button)

**Tabs:**
1. **Početna** (Home) - Browse and search items
2. **Rezervacije** (Bookings) - User's active bookings and rental history
3. **[Floating Action Button]** - Dodaj Stvar (Add Item) - Central core action
4. **Poruke** (Messages) - In-app messaging
5. **Profil** (Profile) - User settings and account

**Modal Screens:**
- Item detail view (full-screen modal)
- Booking confirmation flow (modal stack)
- Photo gallery viewer
- Calendar picker for availability
- Payment checkout screen
- Review/rating submission

## Screen Specifications

### 1. Početna (Home Screen)
**Purpose**: Browse available items, search, and filter

**Layout:**
- Header: Custom transparent header with search bar and location selector
  - Left: Location pill button (e.g., "Beograd, Vračar")
  - Right: Filter icon button
- Main content: Scrollable grid view (2 columns)
  - Card-based item listings
  - Each card shows: image, title, price per day, location, average rating
- Safe area insets: 
  - Top: headerHeight + Spacing.xl
  - Bottom: tabBarHeight + Spacing.xl

**Components:**
- Search bar with category dropdown
- Filter sheet (modal): price range, distance, rating, deposit amount
- Item card with image, badge for "Dostupno", heart icon for favorites

### 2. Stranica Stavke (Item Detail Screen)
**Purpose**: View full item details, check availability, and initiate booking

**Layout:**
- Header: Standard navigation header with back button
  - Left: Back button
  - Right: Share and favorite icons
- Main content: Scrollable
  - Image gallery (horizontal swipeable, 1-4 images)
  - Title and price section
  - Owner info card (avatar, name, rating)
  - Description
  - Category and specifications
  - Calendar availability widget
  - Location map preview
  - Reviews section
- Floating element: "Rezerviši" (Book) button at bottom
- Safe area insets:
  - Top: Spacing.xl (standard header)
  - Bottom: insets.bottom + Spacing.xl

**Components:**
- Image carousel with pagination dots
- Calendar component (date range selector)
- Rating stars display
- Price breakdown card (days × rate + deposit = total)
- Message owner button

### 3. Dodaj Stvar (Add Item Flow)
**Purpose**: Owners add new items to rent

**Layout:**
- Header: Standard navigation header
  - Left: Cancel button (confirmation alert if data entered)
  - Title: "Nova Stvar"
  - Right: None (submit at bottom)
- Main content: Scrollable form
  - Photo upload section (up to 4 images, grid layout)
  - Text input: Naslov
  - Text area: Opis
  - Dropdown: Kategorija
  - Number input: Cena po danu (RSD)
  - Number input: Depozit (RSD)
  - Location picker (manual or map pin)
  - Calendar: Dostupnost
- Form buttons at bottom: "Sačuvaj" and "Odustani"
- Safe area insets:
  - Top: Spacing.xl
  - Bottom: insets.bottom + Spacing.xl

### 4. Rezervacije (Bookings Screen)
**Purpose**: View and manage bookings (both as renter and owner)

**Layout:**
- Header: Standard opaque header
  - Title: "Rezervacije"
  - Segmented control: "Iznajmljeno" / "Izdato"
- Main content: Scrollable list
  - Booking cards showing item image, dates, status, total price
  - Status badges: Aktivna, Završena, Otkazana
- Safe area insets:
  - Top: Spacing.xl
  - Bottom: tabBarHeight + Spacing.xl

**Components:**
- Segmented control for view toggle
- Booking cards with action buttons (Kontaktiraj, Potvrdi Preuzimanje, Oceni)
- Empty state when no bookings

### 5. Proces Rezervacije (Booking Flow)
**Purpose**: Complete a booking with date selection and payment

**Layout:**
- Modal stack navigation
- Screen 1: Date Selection
  - Calendar component for start/end dates
  - Price calculation preview
  - "Nastavi" button
- Screen 2: Payment Options
  - Stripe payment option (default)
  - "Plati Pri Preuzimanju" option
  - Price breakdown
  - "Potvrdi Rezervaciju" button
- Header: Modal header with close button (X) on right

### 6. Poruke (Messages Screen)
**Purpose**: In-app messaging between users

**Layout:**
- Header: Standard opaque header
  - Title: "Poruke"
- Main content: Scrollable list of conversation threads
  - Each thread shows: other user's avatar, name, last message preview, timestamp
  - Unread badge indicator
- Safe area insets:
  - Top: Spacing.xl
  - Bottom: tabBarHeight + Spacing.xl

**Chat Detail Screen:**
- Header: Custom header with user info
- Main content: Scrollable message list (inverted)
- Input bar: Fixed at bottom with text input and send button
- Safe area insets:
  - Bottom: insets.bottom + Spacing.md

### 7. Profil (Profile Screen)
**Purpose**: User account management and settings

**Layout:**
- Header: Transparent header
  - Right: Settings icon
- Main content: Scrollable
  - Profile section: avatar, name, role badge, rating
  - Stats section: Total rentals, items listed, reviews
  - List items: Moje Stvari, Postavke, Pomoć, O Aplikaciji
- Safe area insets:
  - Top: headerHeight + Spacing.xl
  - Bottom: tabBarHeight + Spacing.xl

### 8. Ocenjivanje (Review Screen)
**Purpose**: Submit rating and review after completed booking

**Layout:**
- Modal screen
- Header: Modal header with "Otkaži" on left
  - Title: "Oceni Rezervaciju"
- Main content: Scrollable form
  - Item/user info card
  - Star rating selector (1-5)
  - Text area for comment
  - "Pošalji Ocenu" button at bottom
- Safe area insets:
  - Bottom: insets.bottom + Spacing.xl

## Design System

### Color Palette (Caterpillar-inspired Black & Yellow)
**Primary (Yellow):**
- Primary 500: `#FFCC00` (Caterpillar Yellow - main brand color)
- Primary 600: `#E6B800` (Pressed state)
- Primary 50: `#FFF9E6` (Light backgrounds)

**Accent (Black):**
- Accent 500: `#1A1A1A` (Industrial Black)
- Accent 600: `#333333` (Pressed state)
- Accent 50: `#F0F0F0` (Light backgrounds)

**Neutral:**
- Black: `#1A1A1A` (Primary text)
- Gray 700: `#4A4A4A` (Secondary text)
- Gray 500: `#7A7A7A` (Tertiary text, placeholders)
- Gray 300: `#E0E0E0` (Borders)
- Gray 100: `#F5F5F5` (Background)
- White: `#FFFFFF`

**Semantic:**
- Success: `#22C55E`
- Error: `#EF4444`
- Warning: `#FFCC00` (matches primary)

### Typography
**Font Family:** System default (SF Pro for iOS, Roboto for Android)

**Scales:**
- Heading 1: 28px, Bold
- Heading 2: 24px, Bold
- Heading 3: 20px, Semibold
- Body Large: 17px, Regular
- Body: 15px, Regular
- Body Small: 13px, Regular
- Caption: 12px, Regular
- Button: 16px, Semibold

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px

### Border Radius
- Small: 8px (buttons, inputs)
- Medium: 12px (cards)
- Large: 16px (modals, sheets)
- Circle: 999px (avatars, badges)

### Shadows (for floating buttons only)
- shadowOffset: { width: 0, height: 2 }
- shadowOpacity: 0.10
- shadowRadius: 2

## Visual Design

### Icons
- Use Feather icons from @expo/vector-icons
- Navigation: home, calendar, message-circle, user
- Actions: plus-circle (FAB), search, filter, heart, share-2, x
- System: check, alert-circle, chevron-right, chevron-left

### Components

**Buttons:**
- Primary: Solid yellow (#FFCC00) background, black text, 48px height
- Secondary: Yellow outline, yellow text, 48px height
- Text: No background, yellow text
- All buttons: 8px border radius, subtle scale animation on press (0.95)

**Cards:**
- White background, 12px border radius
- 1px border in Gray 200
- Subtle press state: scale to 0.98

**Inputs:**
- 48px height, 8px border radius
- Gray 200 border, focus state: blue border
- Placeholder text in Gray 400

**Item Cards (Home Grid):**
- 2-column grid with 12px gap
- Image aspect ratio: 4:3
- Rounded corners: 12px
- Badge overlay for "Dostupno" (green background)
- Price in bold, location and rating below

**Floating Action Button:**
- 56px diameter circle
- Yellow (#FFCC00) background
- Black plus icon
- Position: Center of tab bar with -28px offset
- Shadow as specified above

### Critical Assets

**Generate:**
1. **User Avatars (6 presets)** - Illustrated avatars in blue-orange color scheme representing tools/handyman theme (e.g., wrench, hammer, drill silhouettes)
2. **Category Icons (8)** - Custom illustrated icons for:
   - Bušilice (Drills)
   - Merdevine (Ladders)
   - Agregati (Generators)
   - Šatori (Tents)
   - Alat za baštu (Garden tools)
   - Alat za auto (Car tools)
   - Građevinski alat (Construction tools)
   - Ostalo (Other)
3. **Empty State Illustrations (3)**:
   - No items found (search)
   - No bookings yet
   - No messages

**Use System Icons For:**
- Navigation, buttons, common actions (search, filter, share, etc.)

### Accessibility
- Minimum touch target: 44×44px (iOS) / 48×48px (Android)
- Color contrast ratio: 4.5:1 for body text, 3:1 for large text
- All icons paired with text labels in navigation
- Form inputs with clear labels above field
- Error states in red with descriptive text
- Loading states with activity indicators
- Serbian language support (Latin script) throughout

### Interaction Design
- Card press: Scale to 0.98, 150ms duration
- Button press: Scale to 0.95, 100ms duration
- Tab switch: Fade transition, 200ms
- Modal present: Slide up from bottom, 300ms
- All touchable elements: Visual feedback (opacity 0.7 or scale)
- Pull-to-refresh on scrollable lists
- Swipe gestures: Dismiss modals, navigate image galleries