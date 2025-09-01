
import jwt from "jsonwebtoken";

import { 
  JWT_ACCESS_TOKEN_EXPIRY, 
  JWT_REFRESH_TOKEN_EXPIRY,
  JWT_SECRET_ADMIN,
  JWT_SECRET_VENDOR,
  JWT_SECRET_USER
} from "../../config/config.js";


function generateTokens(_id, role = "user", permissions = []) {
  let secretKey;
  let refreshSecret; // This seems unused in the current setup, but keeping for completeness

  switch (role) {
    case "admin":
      secretKey = JWT_SECRET_ADMIN;
      refreshSecret = JWT_SECRET_ADMIN; // Use the same for simplicity unless separate refresh secrets are implemented
      break;
    case "vendor":
    case "staff":
    case "doctor":
    case "supplier":
      secretKey = JWT_SECRET_VENDOR;
      refreshSecret = JWT_SECRET_VENDOR;
      break;
    default:
      secretKey = JWT_SECRET_USER;
      refreshSecret = JWT_SECRET_USER;
      break;
  }

  if (!secretKey) {
    throw new Error("JWT secret is missing for role: " + role);
  }

  const payload = {
     userId: _id,
     role,
     permissions: permissions || [],
  };

  const accessToken = jwt.sign(payload, secretKey, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRY || '1d', // Default to 1 day
  });

  const refreshToken = jwt.sign(payload, refreshSecret || secretKey, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRY || '7d', // Default to 7 days
  });

  return { accessToken, refreshToken };
}

export default generateTokens;
