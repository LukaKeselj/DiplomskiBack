const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(email){
    return typeof email === "string" && EMAIL_REGEX.test(email);
}

export function isValidPassword(password){
    return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}
