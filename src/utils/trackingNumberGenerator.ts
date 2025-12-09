/** Generate a unique tracking number for shipments */

export const generateTrackingNumber = (): string => {
    const prefix = 'SHP';

    // Get current date in YYYYMMDD format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Generate a random alphanumeric string
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomStr = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomStr += characters.charAt(randomIndex);
    };

    return `${prefix}-${dateStr}-${randomStr}`;
};