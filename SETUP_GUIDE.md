# MetalHub Backend Setup Guide

Complete setup guide for MetalHub Marketplace Backend.

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Redis 6+ installed and running
- npm or yarn package manager

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/metalhub_db?schema=public"

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Razorpay (get from Razorpay dashboard)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Twilio (for WhatsApp OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database (if not exists)
createdb metalhub_db

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Start Redis

**Linux/Mac:**
```bash
redis-server
```

**Windows:**
```bash
# Download Redis for Windows or use WSL
# Or use Docker:
docker run -d -p 6379:6379 redis:7-alpine
```

### 5. Start Backend Server

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001`

## 🐳 Docker Setup (Alternative)

If you prefer Docker:

```bash
# Start PostgreSQL and Redis
cd backend
docker-compose up -d

# Then follow steps 1-5 above
```

## 📡 API Testing

### Test Authentication

```bash
# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "SELLER",
    "fullName": "Test User"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Listings (with auth token)

```bash
# Get token from login response, then:
curl -X GET http://localhost:3001/api/listings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create listing
curl -X POST http://localhost:3001/api/listings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MS Steel Plates",
    "description": "High quality steel plates",
    "metalType": "STEEL",
    "price": 45000,
    "quantity": 50,
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India"
    }
  }'
```

## 🔧 Common Issues

### Database Connection Error

**Problem:** `Can't reach database server`

**Solution:**
- Ensure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env`
- Verify database exists: `psql -l`

### Redis Connection Error

**Problem:** `Redis connection failed`

**Solution:**
- Ensure Redis is running: `redis-cli ping`
- Check REDIS_HOST and REDIS_PORT in `.env`
- Try: `redis-cli` to test connection

### Prisma Migration Error

**Problem:** `Migration failed`

**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npm run prisma:migrate reset

# Or create new migration
npm run prisma:migrate dev --name init
```

### Port Already in Use

**Problem:** `Port 3001 already in use`

**Solution:**
- Change PORT in `.env`
- Or kill process using port: `lsof -ti:3001 | xargs kill`

## 📚 Next Steps

1. **Connect Frontend**: Update frontend API URL to `http://localhost:3001/api`
2. **Set up Razorpay**: Get credentials from Razorpay dashboard
3. **Configure Twilio**: Set up WhatsApp OTP (or use mock for development)
4. **Set up Object Storage**: Configure S3/Hostinger for image uploads
5. **Deploy**: Follow deployment guide for production

## 🧪 Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] JWT token is generated
- [ ] Protected routes require auth
- [ ] Listings CRUD works
- [ ] Chat creation works
- [ ] Offers can be created
- [ ] Admin routes require admin role
- [ ] Rate limiting works
- [ ] OTP can be sent (if Twilio configured)

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] Database password is secure
- [ ] Redis password set (if needed)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Environment variables not committed
- [ ] HTTPS enabled in production

## 📞 Support

For issues or questions:
- Check backend/README.md
- Review Prisma documentation
- Check NestJS documentation

---

**Happy Coding! 🚀**

