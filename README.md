#  My Authentication API

A Node.js backend API built with **Express**, **Prisma**, and **PostgreSQL**.  
Features user registration, login, email verification, and JWT authentication.

---

## Setup Instructions
git clone <repo-url>
cd project
npx prisma migrate dev --name init
npx prisma generate
npm run dev

### Install Dependencies

npm install Express Prisma @prisma/client jsonwebtoken Nodemailer dotenv bcryptjs
