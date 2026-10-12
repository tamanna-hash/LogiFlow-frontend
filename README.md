# 📦 LogiFlow Frontend

**LogiFlow** — a comprehensive courier and logistics management platform for Bangladesh.

<img src="https://i.ibb.co.com/N2wTZn61/Screenshot-2026-10-11-004642.png" height="300px" width="400px">


![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- 🔐 **Multi-role authentication** (Customer, Courier, Hub Manager, Operations Manager, Admin)
- 📍 **Real-time shipment tracking** with status updates
- 💳 **bKash payment integration** with secure callback handling
- 🎨 **Modern UI** with shadcn/ui components and Radix primitives
- 📱 **Fully responsive** design for mobile, tablet, and desktop
- 🌙 **Dark mode** support with next-themes
- ♿ **Accessible** components following WCAG guidelines
- 🔄 **Automatic token refresh** with Axios interceptors
- ⚡ **Server & client components** optimized with Next.js 16 App Router

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to frontend directory
cd LogiFlow_Frontend

# Install dependencies
npm install --legacy-peer-deps

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 (strict mode) |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI + shadcn/ui |
| **State Management** | TanStack Query v5 + Zustand |
| **Forms** | React Hook Form + Zod |
| **HTTP Client** | Axios |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Notifications** | Sonner |
| **Testing** | Vitest + React Testing Library |
| **E2E Testing** | Playwright |

---

## 📁 Project Structure

```
LogiFlow_Frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── dashboard/         # Role-based dashboards
│   │   ├── track/             # Public shipment tracking
│   │   └── payment/           # Payment callback pages
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui primitives
│   │   └── shared/           # Custom shared components
│   ├── lib/                   # Core utilities
│   │   ├── api/              # API client & endpoints
│   │   └── utils.ts          # Helper functions
│   ├── store/                 # Zustand stores
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── docs/                      # Documentation
└── tests/                     # Test files
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API URL (required)
NEXT_PUBLIC_API_URL=https://logiflow-backend-ai0r.onrender.com/api/v1

# Frontend URL (required for CORS)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Security Note:** Never include backend secrets (JWT keys, database URLs, API secrets) in frontend environment variables. Only `NEXT_PUBLIC_*` variables are exposed to the browser.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run type-check` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests in interactive UI mode |

---

## 👥 User Roles & Dashboards

| Role | Dashboard Route | Capabilities |
|------|----------------|--------------|
| **Customer** | `/dashboard/customer` | Create shipments, track packages, make payments |
| **Courier** | `/dashboard/courier` | View assignments, confirm pickups, update delivery status |
| **Hub Manager** | `/dashboard/hub` | Manage hub operations, transfers, and couriers |
| **Operations Manager** | `/dashboard/operations` | Assign couriers, monitor operations, update shipment statuses |
| **Admin** | `/dashboard/admin` | Full platform control, user management, analytics |

---

## 🔐 Authentication Flow

1. **Registration:** User signs up → receives OTP via email → verifies email
2. **Login:** User enters credentials → backend issues JWT access token (15 min) + refresh token (7 days)
3. **Token Storage:** Tokens stored in `localStorage` + routing hints in cookies
4. **Auto Refresh:** Axios interceptor automatically refreshes expired access tokens
5. **Google OAuth:** Alternative login via Google (auto-links existing accounts)

---

## 💳 Payment Integration

### bKash Payment Flow

1. Customer creates a shipment
2. Clicks **"Pay with bKash"** button
3. Frontend calls `POST /payments/bkash/initiate` → receives `bkashURL`
4. User redirected to bKash payment gateway
5. After payment, bKash redirects to backend callback
6. Backend verifies payment with bKash API
7. Backend redirects to frontend success page: `/payment/success?shipmentId=xxx`
8. Frontend polls backend to confirm payment status

> **Security:** Frontend never trusts redirect URLs alone — always verifies payment status with backend.

---

## 🧪 Testing

### Unit Tests (Vitest + React Testing Library)

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Stats:** 37 tests passing ✅

### E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests headless
npm run test:e2e

# Run E2E tests with UI (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/auth.spec.ts
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Connect GitHub repository** to Vercel
2. **Set environment variables:**
   - `NEXT_PUBLIC_API_URL` = Your backend production URL
   - `NEXT_PUBLIC_APP_URL` = Your frontend production URL
3. **Deploy** - Vercel auto-detects Next.js and builds

### Backend Configuration

Ensure your backend has:
- `FRONTEND_URL` set to your Vercel domain (for CORS)
- `GOOGLE_CALLBACK_URL` set to `https://your-backend.onrender.com/api/v1/auth/google/callback`
- bKash callback URL configured correctly

**Detailed guide:** See `docs/DEPLOYMENT_CHECKLIST.md`

---

## 📚 Documentation

- [`docs/API_AUDIT.md`](docs/API_AUDIT.md) - Complete backend API reference
- [`docs/ROLE_PERMISSIONS.md`](docs/ROLE_PERMISSIONS.md) - Role-based permission matrix
- [`docs/PAYMENT_FLOW.md`](docs/PAYMENT_FLOW.md) - Payment integration details
- [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) - Feature implementation status
- [`docs/DEPLOYMENT_CHECKLIST.md`](docs/DEPLOYMENT_CHECKLIST.md) - Production deployment guide
## 🐛 Known Limitations

- **E2E tests** - Playwright is installed but test cases not yet written
- **Email verification required** - Cannot login without verifying email via OTP
- **Demo accounts** - Demo buttons require pre-configured backend accounts
- **E2E tests** - Scaffolded but require live backend and test accounts to run

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 💙 A Note from the Developer

Hello! I'm **Tamanna**.

Building the LogiFlow frontend gave me the opportunity to deepen my understanding of **Next.js App Router architecture**, **server components and server actions**, **role-based UI design**, **JWT-based authentication** on the client, and crafting **responsive, accessible interfaces** with **Tailwind CSS** and **shadcn/ui**.

Every feature — from the **multi-role authentication system** to the **real-time shipment tracking**, **bKash payment integration**, and **courier assignment workflows** — pushed me to think carefully about **user experience**, **state management**, **API integration**, and the boundary between **server and client rendering**.

I believe great interfaces are built through **continuous learning**, **attention to detail**, and a genuine care for the people using them. This project challenged me to handle complex business logic, manage multiple user roles with distinct permissions, implement secure payment flows, and ensure the application is both performant and accessible.

Thank you for taking the time to explore my work. I hope you find it useful and well-structured!

Thank you for checking out this project! ❤️

---

## 📞 Contact

**Developer:** Tamanna  
**Project:** LogiFlow - Courier & Logistics Management Platform  
**Backend Repository:** [LogiFlow Backend](../LogiFlow_Backend)

---

<div align="center">
  <strong>Built with ❤️ using Next.js, TypeScript, and Tailwind CSS</strong>
</div>
