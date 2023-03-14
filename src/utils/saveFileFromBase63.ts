import base64 from 'base64-js';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

function saveFileFromBase64(base64Data: string, fileName: string) {
    const fileData = base64.toByteArray(base64Data);
    const filePath = process.env.photosPath + fileName;
    fs.writeFileSync(filePath, fileData);
}

export { saveFileFromBase64 }