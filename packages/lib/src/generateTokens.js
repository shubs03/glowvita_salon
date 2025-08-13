import jwt from "jsonwebtoken";

import { JWT_ACCESS_TOKEN_EXPIRY, JWT_REFRESH_SECRET_ADMIN, JWT_REFRESH_SECRET_USER, JWT_REFRESH_SECRET_VENDOR, JWT_REFRESH_TOKEN_EXPIRY, JWT_SECRET_ADMIN, JWT_SECRET_USER, JWT_SECRET_VENDOR } from "../../config/config.js";


function generateTokens(_id, role = "user") {
  let secretKey;
  let refreshSecret;

  switch (role) {
    case "admin":
      secretKey = JWT_SECRET_ADMIN;
      refreshSecret = JWT_REFRESH_SECRET_ADMIN;
      break;
    case "Vendor":
      secretKey = JWT_SECRET_VENDOR;
      refreshSecret = JWT_REFRESH_SECRET_VENDOR;
      break;
    default:
      secretKey = JWT_SECRET_USER;
      refreshSecret = JWT_REFRESH_SECRET_USER;
      break;
  }

  if (!secretKey || !refreshSecret) {
    throw new Error("JWT secrets are missing");
  }

  const payload = {
     userId: _id,
     role,
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
