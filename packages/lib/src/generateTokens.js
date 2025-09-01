
import jwt from "jsonwebtoken";

import { 
  JWT_ACCESS_TOKEN_EXPIRY, 
  JWT_REFRESH_SECRET_ADMIN, 
  JWT_REFRESH_SECRET_USER, 
  JWT_REFRESH_SECRET_VENDOR, 
  JWT_REFRESH_SECRET_DOCTOR,
  JWT_REFRESH_SECRET_SUPPLIER,
  JWT_REFRESH_TOKEN_EXPIRY, 
  JWT_SECRET_ADMIN, 
  JWT_SECRET_USER, 
  JWT_SECRET_VENDOR,
  JWT_SECRET_DOCTOR,
  JWT_SECRET_SUPPLIER
} from "../../config/config.js";


function generateTokens(_id, role = "user", permissions = []) {
  let secretKey;
  let refreshSecret;

  switch (role) {
    case "admin":
      secretKey = JWT_SECRET_ADMIN;
      refreshSecret = JWT_REFRESH_SECRET_ADMIN;
      break;
    case "vendor":
      secretKey = JWT_SECRET_VENDOR;
      refreshSecret = JWT_REFRESH_SECRET_VENDOR;
      break;
    case "doctor":
      secretKey = JWT_SECRET_DOCTOR;
      refreshSecret = JWT_REFRESH_SECRET_DOCTOR;
      break;
    case "supplier":
      secretKey = JWT_SECRET_SUPPLIER;
      refreshSecret = JWT_REFRESH_SECRET_SUPPLIER;
      break;
    case "staff": // Staff use the vendor secret
      secretKey = JWT_SECRET_VENDOR;
      refreshSecret = JWT_REFRESH_SECRET_VENDOR;
      break;
    default:
      secretKey = JWT_SECRET_USER;
      refreshSecret = JWT_REFRESH_SECRET_USER;
      break;
  }

  if (!secretKey || !refreshSecret) {
    throw new Error("JWT secrets are missing for role: " + role);
  }

  const payload = {
     userId: _id,
     role,
     permissions,
     };

  const accessToken = jwt.sign(payload, secretKey, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
}

export default generateTokens;
