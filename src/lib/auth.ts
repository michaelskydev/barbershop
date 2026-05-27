// Secret key for HMAC token signing
const SECRET_KEY = process.env.JWT_SECRET || 'fallback-secure-key-at-least-32-chars-long-for-hmac-sha256';

// Helper to encode string to Uint8Array for Web Crypto API
const encoder = new TextEncoder();

async function getCryptoKey() {
    return await crypto.subtle.importKey(
        'raw',
        encoder.encode(SECRET_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

/**
 * Sign a session token using HMAC-SHA256 with the Web Crypto API.
 * This is 100% compatible with both Node.js environment and Next.js Edge Middleware/Proxy runtime.
 */
export async function signToken(payload: { username: string }): Promise<string> {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    
    // Internal payload expiration of 2 hours
    const exp = Date.now() + 2 * 60 * 60 * 1000;
    const data = btoa(JSON.stringify({ ...payload, exp }));
    
    const key = await getCryptoKey();
    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(`${header}.${data}`)
    );
    
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
        
    return `${header}.${data}.${signature}`;
}

/**
 * Verify a session token using HMAC-SHA256 with the Web Crypto API.
 * Returns the decoded payload if valid and unexpired, otherwise null.
 */
export async function verifyToken(token: string): Promise<{ username: string } | null> {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const [header, data, signature] = parts;
        
        const key = await getCryptoKey();
        const dataBuffer = encoder.encode(`${header}.${data}`);
        
        // Reconstruct signature bytes from base64url
        const base64 = signature.replace(/-/g, '+').replace(/_/g, '/');
        const padLen = (4 - (base64.length % 4)) % 4;
        const padded = base64 + '='.repeat(padLen);
        const binaryStr = atob(padded);
        const signatureBytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            signatureBytes[i] = binaryStr.charCodeAt(i);
        }
        
        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            signatureBytes,
            dataBuffer
        );
        
        if (!isValid) return null;
        
        const decodedPayload = JSON.parse(atob(data));
        if (decodedPayload.exp && Date.now() > decodedPayload.exp) {
            return null; // Expired
        }
        
        return decodedPayload;
    } catch (e) {
        return null;
    }
}
