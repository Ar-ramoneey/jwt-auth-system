import express from "express";
import dotenv from "dotenv";
import router from './routes/auth.js'
import protectedRoute from './routes/protected.js'

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json())
app.use(router)
app.use("/api", protectedRoute)

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API URL: http://localhost:${port}`);
});
