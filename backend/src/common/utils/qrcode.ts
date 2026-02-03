import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
    try {
        // Returns a Data URL (Base64 string representing an image)
        return await QRCode.toDataURL(data);
    } catch (err) {
        console.error('Error generating QR Code', err);
        throw new Error('QR Generation Failed');
    }
};