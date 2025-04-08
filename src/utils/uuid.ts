export function generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    // Fallback (non cryptographique)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c: string): string {
        const r = Math.floor(Math.random() * 16); // évite l'opérateur bitwise
        const v = c === 'x' ? r : (r % 4) + 8; // remplace (r & 0x3 | 0x8)
        return v.toString(16);
    });
}
