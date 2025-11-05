import jwt from "jsonwebtoken";
import jwtConfig from "../configs/jwt.config.js";
import prisma from '../configs/prisma.js'

async function verifyToken(req, res, next) {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  
  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  try {
    
    const decoded = jwt.verify(token, jwtConfig.secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, email: true } 
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
   
    req.user = user;
    
    next();

  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default verifyToken;
