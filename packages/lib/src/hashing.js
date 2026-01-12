import * as bcrypt from 'bcryptjs';

const saltRounds = 10;

export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}
