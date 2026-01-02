# MetalHub API Endpoints Reference

Complete API reference for MetalHub Backend.

Base URL: `http://localhost:3001/api`

## 🔐 Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "BUYER" | "SELLER",
  "fullName": "John Doe",
  "phone": "+919876543210" // optional
}

Response: {
  "accessToken": "jwt_token",
  "user": { ... }
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "accessToken": "jwt_token",
  "user": { ... }
}
```

### Send WhatsApp OTP
```
POST /auth/whatsapp-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "deviceFingerprint": "optional_device_hash"
}

Response: {
  "message": "OTP sent successfully"
}
```

### Verify OTP
```
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456"
}

Response: {
  "accessToken": "jwt_token",
  "user": { ... }
}
```

---

## 📦 Listing Endpoints

### Get All Listings
```
GET /listings?metalType=STEEL&minPrice=10000&maxPrice=100000&location=Mumbai&sortBy=newest&page=1&limit=20

Response: {
  "listings": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Get Listing Details
```
GET /listings/:id

Response: {
  "id": "uuid",
  "title": "...",
  "description": "...",
  "metalType": "STEEL",
  "price": 45000,
  "seller": { ... },
  "images": [...]
}
```

### Create Listing (Auth Required)
```
POST /listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "MS Steel Plates",
  "description": "High quality steel",
  "metalType": "STEEL",
  "grade": "Grade A",
  "price": 45000,
  "isNegotiable": true,
  "quantity": 50,
  "unit": "MT",
  "location": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India"
  },
  "imageUrls": ["https://..."] // optional
}
```

### Update Listing (Auth Required)
```
PUT /listings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 50000
  // ... other fields
}
```

### Delete Listing (Auth Required)
```
DELETE /listings/:id
Authorization: Bearer <token>
```

### Get My Listings (Auth Required)
```
GET /listings/my
Authorization: Bearer <token>
```

---

## 💬 Chat Endpoints

### Create/Get Chat (Auth Required)
```
POST /chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "listingId": "uuid",
  "initialMessage": "Hello, I'm interested" // optional
}
```

### Get User Chats (Auth Required)
```
GET /chat
Authorization: Bearer <token>
```

### Get Chat Messages (Auth Required)
```
GET /chat/:id
Authorization: Bearer <token>
```

### Send Message (Auth Required)
```
POST /chat/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Hello, is this still available?"
}
```

---

## 💰 Offer Endpoints

### Create Offer (Auth Required)
```
POST /offers/listing/:listingId
Authorization: Bearer <token>
Content-Type: application/json

{
  "offerPrice": 40000
}
```

### Get Listing Offers (Seller Only, Auth Required)
```
GET /offers/listing/:listingId
Authorization: Bearer <token>
```

### Get My Offers (Auth Required)
```
GET /offers/my
Authorization: Bearer <token>
```

### Accept Offer (Seller Only, Auth Required)
```
POST /offers/:id/accept
Authorization: Bearer <token>
```

### Reject Offer (Seller Only, Auth Required)
```
POST /offers/:id/reject
Authorization: Bearer <token>
```

---

## 👤 User Endpoints

### Get My Profile (Auth Required)
```
GET /users/me
Authorization: Bearer <token>
```

### Update Profile (Auth Required)
```
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe",
  "companyName": "Metal Corp",
  "location": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India"
  },
  "bio": "Metal trader since 2010"
}
```

---

## 💳 Membership Endpoints

### Get Current Membership (Auth Required)
```
GET /membership/current
Authorization: Bearer <token>
```

### Get Membership Limits (Auth Required)
```
GET /membership/limits
Authorization: Bearer <token>

Response: {
  "maxListings": 3,
  "canFeature": false,
  "maxImagesPerListing": 3
}
```

---

## 💵 Payment Endpoints

### Create Payment Order (Auth Required)
```
POST /payment/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "SILVER" | "GOLD"
}

Response: {
  "orderId": "razorpay_order_id",
  "amount": 99900,
  "currency": "INR",
  "paymentId": "uuid"
}
```

### Razorpay Webhook (Public)
```
POST /payment/webhook
X-Razorpay-Signature: <signature>
Content-Type: application/json

{
  "event": "payment.captured",
  "payload": { ... }
}
```

---

## 🛡️ Admin Endpoints (Admin Only)

### Dashboard Stats
```
GET /admin/dashboard
Authorization: Bearer <admin_token>
```

### Get All Users
```
GET /admin/users?page=1&limit=20
Authorization: Bearer <admin_token>
```

### Ban User
```
POST /admin/users/:id/ban
Authorization: Bearer <admin_token>
```

### Suspend User
```
POST /admin/users/:id/suspend
Authorization: Bearer <admin_token>
```

### Get Pending Listings
```
GET /admin/listings/pending?page=1&limit=20
Authorization: Bearer <admin_token>
```

### Approve Listing
```
POST /admin/listings/:id/approve
Authorization: Bearer <admin_token>
```

### Reject Listing
```
POST /admin/listings/:id/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Inappropriate content"
}
```

### Feature Listing
```
POST /admin/listings/:id/feature
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "days": 7
}
```

---

## 📝 Notes

- All endpoints return JSON
- Protected endpoints require `Authorization: Bearer <token>` header
- Admin endpoints require admin role
- Rate limiting: 100 requests per 15 minutes per IP
- Pagination: Default page=1, limit=20

---

## 🔄 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Server Error

