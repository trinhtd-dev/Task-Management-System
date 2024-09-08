import crypto from "crypto";

export const generateToken = () => {
    return crypto.randomBytes(20).toString('hex');
}

export const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000);
}
