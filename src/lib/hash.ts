import crypto from 'crypto';

/**
 * Securely hashes a plain-text password using native PBKDF2 in the Node.js runtime.
 * Output format: pbkdf2$iterations$salt$hash
 */
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const iterations = 10000;
    const keylen = 64;
    const digest = 'sha512';
    const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
    return `pbkdf2$${iterations}$${salt}$${hash}`;
}

/**
 * Verifies a plain-text password against a legacy plain-text or a pbkdf2-hashed password.
 */
export function verifyPassword(password: string, hashedPassword?: string): boolean {
    if (!hashedPassword) return false;
    
    // Backward-compatibility: if the password in DB is not hashed yet
    if (!hashedPassword.startsWith('pbkdf2$')) {
        return password === hashedPassword;
    }
    
    try {
        const parts = hashedPassword.split('$');
        if (parts.length !== 4) return false;
        
        const [, iterationsStr, salt, hash] = parts;
        const iterations = parseInt(iterationsStr, 10);
        const keylen = 64;
        const digest = 'sha512';
        
        const calculatedHash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
        return hash === calculatedHash;
    } catch {
        return false;
    }
}
