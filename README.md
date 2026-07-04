# Intec ServiceHub

**Intec ServiceHub** is a unified Enterprise IT Service Desk & Asset Management Platform designed for modern organizations. It enables IT departments to resolve issues faster, manage hardware and software lifecycles securely, and maintain centralized control over their infrastructure.

## 🚀 Features

- **Intelligent Ticketing System**: Streamlined portal for employees to submit, track, and resolve IT issues.
- **Lifecycle Asset Tracking**: Complete visibility into hardware and software inventory, assigned users, and deployment status.
- **Admin Command Center**: Role-based access control (Admin, Engineer, Employee) for granular permission management.
- **Dynamic Dashboard**: Real-time insights and responsive data visualization using modern glassmorphism UI design.
- **Account & Security**: Secure, robust password management and profile handling built into the user portal.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, React Router, Framer Motion (for dynamic animations), Lucide React (for iconography).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ORM).
- **Security**: JWT Authentication, bcryptjs, express-rate-limit, strict CORS policies.

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v16.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas Cloud account)

## ⚙️ Installation & Setup

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
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Access the Platform

Open your browser and navigate to `http://localhost:5173`. You can log in using one of the pre-configured demo accounts or register a new one.

## 🔒 Security Posture

This application has been hardened for production environments:
- **Rate Limiting**: Brute-force protections are enabled on all `/api` routes via `express-rate-limit`.
- **CORS Restricted**: The backend strictly only accepts requests from the designated `FRONTEND_URL`.
- **Dynamic Environments**: No hardcoded API endpoints; the frontend automatically routes traffic based on environment variables for seamless local-to-production deployment.

## 📄 License

&copy; Intec ServiceHub. All rights reserved.
