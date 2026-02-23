import {v2 as cloudinary, UploadApiResponse} from 'cloudinary';
import { envVars } from './env';
import AppError from '../app/ErrorHelpers/AppError';
import status from 'http-status';

cloudinary.config({
    cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY_API_SECRET,
});

export const deleteFileFromCloudinary = async (url: string) => {
     const regex = /\/v\d+\/(.+?)(?:\.[a-zA-z0-9]+)$/;
     const match = url.match(regex);

     try {
        if (match) {
        const publicId = match[1];
        await cloudinary.uploader.destroy(
            publicId, {
                resource_type: 'image',
            }
        )
        console.log(`file ${publicId} deleted `);
     }
     } catch (error) {
         console.log(error);
         throw new AppError(status.INTERNAL_SERVER_ERROR, 'Error deleting file from cloudinary');
     }
    }


    export const uploadFileToCloudinary = async (buffer: Buffer, fileName: string): Promise<UploadApiResponse> => {
        
        if(!buffer || !fileName){
            throw new AppError(status.BAD_REQUEST, 'File or fileName is required');
        }
         const extension = fileName.split('.').pop()?.toLocaleLowerCase();
        const fileNameWihtoutExtention = fileName.split('.').slice(0, -1).join('.').toLocaleLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-_]/g, '');
        const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWihtoutExtention;
        const folder = extension === "pdf" ? "pdfs" : "images";
        return  new Promise((resolve, reject) => {

            cloudinary.uploader.upload_stream({
                resource_type: 'auto',
                public_id: `TelaDoc_ph_healthcare/${folder}/${uniqueName}`,
                folder: `TelaDoc_ph_healthcare/${folder}`,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve(result as UploadApiResponse);
            }
        ).end(buffer);
        })
    }

export default cloudinary;