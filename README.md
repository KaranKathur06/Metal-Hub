# MetalHub - Metal Marketplace Platform

A professional, industrial-focused e-commerce marketplace platform for metal buyers and sellers, built with Next.js, TypeScript, and Tailwind CSS.

## 🎯 Project Overview

MetalHub is a dedicated marketplace platform connecting buyers and sellers of metal products in India. The platform focuses on steel, iron, aluminium, copper, brass, and other industrial metals, providing a clean, professional interface for B2B metal trading.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI / shadcn/ui
- **Authentication**: NextAuth.js (ready for OAuth)
- **State Management**: React Query / SWR (ready for integration)
- **Icons**: Lucide React

## 📁 Project Structure

```
metal-manufacturing/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel
│   ├── dashboard/         # User dashboards (buyer/seller)
│   ├── listings/          # Browse and detail pages
│   ├── login/             # Authentication pages
│   ├── register/
│   ├── pricing/           # Membership plans
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/
│   ├── layout/            # Header, Footer
│   └── ui/                # Reusable UI components
├── lib/
│   ├── api/               # API client (placeholders)
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

## 🎨 Design System

### Colors
- **Primary**: Steel blue / dark gray (`hsl(210 40% 30%)`)
- **Secondary**: Light gray / white
- **Accent**: Blue tones
- **Neutral**: Professional grays

### Typography
- **Font**: Inter (sans-serif)
- **Sizes**: Responsive, large and readable

### Components
- Card-based layouts
- Soft shadows
- Clean borders
- Professional spacing

## 📄 Pages & Features

### 1. Landing Page (`/`)
- Hero section with value proposition
- Search bar
- Featured metal categories
- Featured listings grid
- "How it works" section
- Membership preview

### 2. Authentication (`/login`, `/register`)
- Email/password login
- Google OAuth (UI ready)
- Apple OAuth (UI ready)
- WhatsApp OTP login (UI ready)
- Step-by-step registration flow

### 3. Browse Listings (`/listings`)
- Grid/List view toggle
- Advanced filters (metal type, price, location)
- Sort options (newest, price)
- Pagination
- Responsive design

### 4. Listing Details (`/listings/[id]`)
- Image gallery
- Product specifications table
- Seller profile
- Action panel (chat, make offer)
- Safety tips

### 5. Seller Dashboard (`/dashboard/seller`)
- Overview stats (views, inquiries)
- Listing management (create, edit, delete)
- Messages & offers
- Membership status
- Multi-step listing creation wizard

### 6. Buyer Dashboard (`/dashboard/buyer`)
- Saved listings
- Messages & negotiations
- Recently viewed
- Profile settings

### 7. Membership & Pricing (`/pricing`)
- Plan comparison (Free, Silver, Gold)
- Feature lists
- Razorpay-ready buttons
- FAQ section

### 8. Admin Panel (`/admin`)
- Dashboard overview
- User management
- Listing approval queue
- Flagged items review
- Reports & analytics
- System logs

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 🔌 API Integration

The project includes placeholder API client structure in `lib/api/client.ts`. Replace mock data with actual API calls:

```typescript
// Example API call
import { api } from '@/lib/api/client'

const listings = await api.get<Listing[]>('/listings')
```

## 🔐 Authentication Setup

The UI is ready for NextAuth.js integration. Configure providers in your NextAuth setup:

- Google OAuth
- Apple OAuth  
- Email/Password
- WhatsApp OTP (custom provider)

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactions
- Optimized for all screen sizes

## 🎯 Key Features

✅ Clean, professional UI  
✅ Mobile-responsive design  
✅ Role-based dashboards  
✅ Multi-step forms with validation  
✅ Search and filtering  
✅ Membership tiers  
✅ Admin panel structure  
✅ API-ready architecture  
✅ SEO-friendly pages  

## 🚧 TODO / Next Steps

- [ ] Connect backend API endpoints
- [ ] Implement NextAuth.js authentication
- [ ] Add image upload functionality
- [ ] Integrate Razorpay payment gateway
- [ ] Add real-time chat (Socket.io ready)
- [ ] Implement search functionality
- [ ] Add analytics tracking
- [ ] Set up error boundaries
- [ ] Add loading states
- [ ] Implement form validation with Zod

## 📝 Notes

- All pages use mock data - replace with API calls
- Image placeholders are used - implement image upload
- OAuth buttons are UI-only - configure providers
- Payment buttons ready for Razorpay integration
- Chat UI structure ready for Socket.io

## 📄 License

This project is proprietary and confidential.

---

Built with ❤️ for the metal manufacturing industry

