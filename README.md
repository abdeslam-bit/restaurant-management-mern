# 🍽 Maison Cuisine — Restaurant Management System

A full-stack MERN restaurant management platform with a beautiful guest-facing ordering app and a secure admin dashboard.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- A MongoDB URI (MongoDB Atlas free tier works perfectly)

---

## 1. Configure Environment Variables

Open `server/.env` and set your MongoDB connection string:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/maison-cuisine
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
ADMIN_DEFAULT_EMAIL=admin@restaurant.com
ADMIN_DEFAULT_PASSWORD=Admin@123456
ADMIN_DEFAULT_NAME=Admin
NODE_ENV=development
```

---

## 2. Install Dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

---

## 3. Seed the Database (Optional but Recommended)

Seeds 16 curated menu items and creates the default admin user:

```bash
cd server && npm run seed
```

Expected terminal output:
```
✅  Connected to MongoDB

🗑   Cleared existing admin users and menu items

👤  Default Admin Created:
    ┌─────────────────────────────────────────┐
    │  Email:    admin@restaurant.com         │
    │  Password: Admin@123456                 │
    └─────────────────────────────────────────┘

🍽   Seeded 16 menu items

🎉  Database seeded successfully!
```

> **Note:** The default admin is also **auto-created on server boot** if no admin exists in the database — no manual seeding required.

---

## 4. Start the Application

**Backend** (Terminal 1):
```bash
cd server && npm run dev
```
Server runs at: http://localhost:5000

**Frontend** (Terminal 2):
```bash
cd client && npm run dev
```
Client runs at: http://localhost:5173

---

## 🔐 Admin Login

Navigate to: **http://localhost:5173/admin/login**

| Field    | Value                   |
|----------|-------------------------|
| Email    | `admin@restaurant.com`  |
| Password | `Admin@123456`          |

---

## 📱 Features

### Client App (Guest — No Login Required)
| Feature | Route |
|---------|-------|
| Home / Hero | `/` |
| Full Menu with Filters | `/menu` |
| Cart (persistent sidebar) | (nav icon) |
| Guest Checkout | `/checkout` |
| Live Order Tracking | `/order/:id` |
| Table Reservation | `/reservation` |

### Admin Dashboard (JWT Protected)
| Feature | Route |
|---------|-------|
| Login | `/admin/login` |
| Analytics Overview | `/admin` |
| Order Management | `/admin/orders` |
| Menu CRUD | `/admin/menu` |
| Reservation Management | `/admin/reservations` |

---

## 🏗 Project Structure

```
ai-restaurant/
├── client/                    # React + Vite Frontend
│   └── src/
│       ├── api/               # Axios API functions
│       ├── components/        # Shared UI (Navbar, Cart, Cards)
│       │   └── admin/         # Admin-specific components
│       ├── context/           # CartContext, AuthContext, ToastContext
│       ├── pages/
│       │   ├── client/        # HomePage, MenuPage, CheckoutPage, etc.
│       │   └── admin/         # Dashboard, Orders, Menu, Reservations
│       └── index.css          # Full design system (tokens, components)
│
└── server/                    # Node.js + Express Backend
    ├── controllers/           # Business logic
    ├── middleware/            # Auth (JWT), Error handler
    ├── models/               # Mongoose schemas
    ├── routes/               # Express routers
    ├── seed.js               # Database seeder
    └── index.js              # Entry point
```

---

## 🎨 Design System

- **Palette**: Charcoal `#1C1C1E` · Terracotta `#C0533A` · Gold `#D4A853` · Cream `#FAF7F2`
- **Typography**: Playfair Display (headings) + Inter (body) via Google Fonts
- **Animations**: Scroll-aware navbar, image zoom, slide-in cart, step tracker pulse

---

## 🔌 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items (filterable) |
| GET | `/api/menu/:id` | Get single item |
| POST | `/api/orders` | Place order (guest) |
| GET | `/api/orders/:id` | Track order (guest) |
| POST | `/api/reservations` | Submit reservation |
| POST | `/api/auth/login` | Admin login |

### Protected (Bearer Token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| PATCH | `/api/orders/:id/status` | Update order status |
| POST | `/api/menu` | Create menu item |
| PUT | `/api/menu/:id` | Update menu item |
| DELETE | `/api/menu/:id` | Delete menu item |
| PATCH | `/api/menu/:id/toggle` | Toggle availability |
| GET | `/api/reservations` | List all reservations |
| PATCH | `/api/reservations/:id/status` | Update reservation |
| DELETE | `/api/reservations/:id` | Delete reservation |
| GET | `/api/analytics/overview` | Dashboard analytics |

---

## 📝 Notes

- **Payment**: Cash on Delivery / Dine-in only (no payment gateway)
- **Images**: URL-based — paste any image URL when creating menu items
- **Order Tracking**: Polls every 5 seconds for live status updates
- **Real-time**: Upgrade to Socket.io for true WebSocket updates if needed

---

*Built with ❤️ using React, Node.js, Express, and MongoDB.*
# restaurant-for-houssem
