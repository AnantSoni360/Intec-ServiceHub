# Intec ServiceHub

**Intec ServiceHub** is a unified, multi-tenant Enterprise IT Service Desk & Asset Management SaaS Platform designed for modern organizations. It enables IT departments to resolve issues faster, manage hardware and software lifecycles securely, and maintain centralized control over their infrastructure across multiple distinct company workspaces.

## 🚀 Key Features

- **Multi-Tenant SaaS Architecture**: Built from the ground up to support multiple companies. Each organization gets its own secure, isolated workspace.
- **Automated Onboarding & Data Import**: New companies are seamlessly onboarded. Super Admins can download smart CSV templates, fill them with their existing Users, Assets, and Tickets, and upload them to instantly populate their workspace.
- **Intelligent Ticketing System**: Streamlined portal for employees to submit, track, and resolve IT issues. Engineers and IT Managers (Admins) can seamlessly assign, bulk-update, and resolve tickets.
- **Advanced Exporting**: Export ticket and asset data directly to formatted PDF reports or raw CSV files with a single click.
- **Lifecycle Asset Tracking**: Complete visibility into hardware and software inventory, assigned users, and deployment status.
- **Single Sign-On (SSO)**: Integrated Google OAuth 2.0 allows users to log in securely using their corporate Google accounts.
- **Dynamic Dashboard**: Real-time KPI insights, SLA breach tracking, and responsive data visualization using a stunning, modern glassmorphism UI design.
- **Master Admin Controls**: A hidden, highly-secured route allows system owners to instantly and completely wipe entire company workspaces and all associated data from the platform.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, React Router, Framer Motion (for micro-animations), Lucide React (for iconography), jsPDF (for PDF generation).
- **Backend**: Node.js, Express.js, Multer & csv-parser (for secure file parsing).
- **Database**: MongoDB (Mongoose ORM).
- **Security**: JWT Authentication, Google OAuth 2.0, bcryptjs, express-rate-limit, strict CORS policies, Mongoose strict sanitization (NoSQL injection prevention).

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v16.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas Cloud account)

## ⚙️ Local Installation & Setup

### 1. Clone the repository

If you haven't already, clone or download the repository to your local machine.

### 2. Backend Setup

Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory and populate it with your secure credentials:
```env
MONGO_URI=mongodb://<your_username>:<your_password>@your_cluster_address/servicehub
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm start
# or use nodemon for development:
npm run dev
```

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Access the Platform

Open your browser and navigate to `http://localhost:5173`. You can register a new company workspace, which will automatically guide you through downloading data templates and importing your initial infrastructure data.

## 🌐 Production Deployment (Vercel & Railway)

Intec ServiceHub is architected to seamlessly deploy to serverless platforms.

### 1. Backend (Railway)
- Create a new project in Railway and link it to this GitHub repository (pointing to the `backend/` directory).
- Set the following Environment Variables in Railway:
  - `NODE_ENV = production`
  - `MONGO_URI = <Your Production MongoDB Atlas String>`
  - `JWT_SECRET = <A secure random string>`
  - `GOOGLE_CLIENT_ID = <Your Google OAuth 2.0 Client ID>`
  - `FRONTEND_URL = <Your exact Vercel URL, e.g., https://intec-servicehub.vercel.app>`

### 2. Frontend (Vercel)
- Create a new project in Vercel and link it to this GitHub repository.
- Set the Framework Preset to **Vite**.
- Override the Root Directory to `frontend`.
- Set the following Environment Variables in Vercel:
  - `VITE_API_URL = <Your Railway Backend URL>/api` *(e.g., https://intec-backend.up.railway.app/api)*
  - `VITE_GOOGLE_CLIENT_ID = <Your Google OAuth 2.0 Client ID>`

## 🔒 Security Posture

This application has been hardened for production environments:
- **NoSQL Injection Prevention**: Enabled strict Mongoose query sanitization (`sanitizeFilter: true`) to actively block $in, $ne, and other malicious operator injections.
- **Rate Limiting**: Brute-force protections are enabled on all `/api` routes via `express-rate-limit`.
- **CORS Restricted**: The backend strictly only accepts requests from the designated `FRONTEND_URL`, dynamically trimming any malformed trailing slashes.
- **Dynamic Environments**: No hardcoded API endpoints; the frontend automatically routes traffic based on environment variables for seamless local-to-production deployment.

## 📄 License

&copy; Intec ServiceHub. All rights reserved.
