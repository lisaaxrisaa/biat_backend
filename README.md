# 📌 Pack Ahead - Backend

This is the backend API for the **Pack Ahead** travel planning application. It handles user authentication, itinerary management, budget tracking, weather integration, and more.

## 🚀 Tech Stack

### **Backend**

- [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
- [![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
- [![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
- [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
- [![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

## 🛠 Installation & Setup

### **Clone the repository**

```sh
git clone https://github.com/lisaaxrisaa/biat_backend.git
cd biat_backend
```

### **Install dependencies**

```sh
npm install
```

### **Set up environment variables**

```sh
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_secret_key
```

### **Run the development server**

```sh
npm run dev
```

## 📡 API Endpoints

The API is deployed on Render.com and accessible at:<br>
👉 https://biat-backend.onrender.com

Example Endpoints:<br>
POST /api/auth/register - Register a new user<br>
POST /api/auth/login - Login and receive a JWT token<br>
GET /api/itinerary - Retrieve user itineraries<br>
For a full list of API endpoints, check out the **Postman Collection**:  
👉 **[Pack Ahead API - Postman Collection](https://www.postman.com/collection/)**

## 🌍 Want to check out the frontend?

👉 **[Pack Ahead Frontend Repository](https://github.com/lisaaxrisaa/biat_frontend.git)**
