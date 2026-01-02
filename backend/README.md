# MetalHub Backend API

Production-ready backend for MetalHub Marketplace built with NestJS, PostgreSQL, Prisma, and Redis.

## 🚀 Tech Stack

- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache/Sessions**: Redis
- **Authentication**: JWT
- **Payments**: Razorpay
- **OTP**: Twilio (WhatsApp)

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   ├── users/           # User management
│   ├── listings/        # Listing CRUD
│   ├── chat/            # Chat & messaging
│   ├── offers/           # Price negotiation
│   ├── membership/       # Membership plans
│   ├── payment/          # Razorpay integration
│   ├── admin/           # Admin panel
│   ├── security/         # Rate limiting & security
│   ├── prisma/           # Prisma service
│   └── redis/            # Redis service
├── prisma/
│   └── schema.prisma     # Database schema
└── package.json
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up database**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

4. **Start Redis**
```bash
redis-server
```

5. **Start development server**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/whatsapp-otp` - Send WhatsApp OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/google` - Google OAuth (TODO)
- `POST /api/auth/apple` - Apple OAuth (TODO)

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create listing (auth required)
- `PUT /api/listings/:id` - Update listing (auth required)
- `DELETE /api/listings/:id` - Delete listing (auth required)
- `GET /api/listings/my` - Get my listings (auth required)

### Chat
- `POST /api/chat` - Create/Get chat
- `GET /api/chat` - Get user chats
- `GET /api/chat/:id` - Get chat messages
- `POST /api/chat/:id/messages` - Send message

### Offers
- `POST /api/offers/listing/:listingId` - Create offer
- `GET /api/offers/listing/:listingId` - Get listing offers (seller only)
- `GET /api/offers/my` - Get my offers
- `POST /api/offers/:id/accept` - Accept offer (seller only)
- `POST /api/offers/:id/reject` - Reject offer (seller only)

### Membership & Payment
- `GET /api/membership/current` - Get current membership
- `GET /api/membership/limits` - Get membership limits
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/webhook` - Razorpay webhook

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/:id/ban` - Ban user
- `POST /api/admin/users/:id/suspend` - Suspend user
- `GET /api/admin/listings/pending` - Get pending listings
- `POST /api/admin/listings/:id/approve` - Approve listing
- `POST /api/admin/listings/:id/reject` - Reject listing
- `POST /api/admin/listings/:id/feature` - Feature listing

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## 📊 Database Schema

See `prisma/schema.prisma` for complete schema definition.

Key tables:
- `users` - User accounts
- `profiles` - User profiles
- `listings` - Metal product listings
- `listing_images` - Listing images (URLs only)
- `chats` - Chat conversations
- `messages` - Chat messages
- `offers` - Price negotiation offers
- `memberships` - User memberships
- `payments` - Payment records
- `login_activity` - Login tracking
- `admin_logs` - Admin audit trail

## 🔒 Security Features

- JWT authentication
- Rate limiting (Redis-based)
- Login attempt tracking
- Device fingerprinting
- OTP expiry (10 minutes)
- Password hashing (bcrypt)
- Admin audit logs
- Session blacklisting

## 💳 Payment Integration

Razorpay integration includes:
- Order creation
- Webhook verification
- Payment status tracking
- Automatic membership activation

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🐳 Docker (Optional)

```bash
docker-compose up -d
```

## 🧪 Testing

```bash
npm run test
```

## 📚 Documentation

API documentation will be available at `/api/docs` (when Swagger is configured).

## 🚧 TODO

- [ ] Implement Google OAuth
- [ ] Implement Apple OAuth
- [ ] Add image upload endpoint (S3 integration)
- [ ] Add ML image verification hook
- [ ] Add email notifications
- [ ] Add search functionality (Meilisearch/Elasticsearch)
- [ ] Add Swagger documentation
- [ ] Add unit tests
- [ ] Add integration tests

## 📄 License

Proprietary - MetalHub Marketplace

