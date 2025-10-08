import * as jose from 'jose';
import * as bcrypt from 'bcryptjs';

const saltRounds = 10;

function getSecret() {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return new TextEncoder().encode(JWT_SECRET);
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export async function createJwt(payload) {
  const secret = getSecret();
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyJwt(token) {
  try {
    const secret = getSecret();
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}