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

Create a `.env` file in the root of the project and add the following:

```sh
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_secret_key
```

### **Run the development server**

```sh
npm run dev
```

## 📡 API Endpoints

The API is deployed on Render.com:  
👉 **[https://biat-backend.onrender.com](https://biat-backend.onrender.com)**

| Method   | Endpoint             | Description                   |
| -------- | -------------------- | ----------------------------- |
| **POST** | `/api/auth/register` | Register a new user           |
| **POST** | `/api/auth/login`    | Login and receive a JWT token |
| **GET**  | `/api/itinerary`     | Retrieve user itineraries     |

**For a full list of API endpoints, check out the Postman Collection:**  
👉 **[Pack Ahead API - Postman Collection](https://www.postman.com/collection/)**

## 🌍 Want to check out the frontend?

The frontend for Pack Ahead is built with **React, Vite, and Redux Toolkit**.  
Check out the repository here:  
👉 **[Pack Ahead Frontend Repository](https://github.com/lisaaxrisaa/biat_frontend.git)**

## 📜 License

This project is open-source and available under the **MIT License**.  
📖 See the full license details in the [LICENSE](./LICENSE) file.
