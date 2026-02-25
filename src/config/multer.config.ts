import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.config";
import multer from "multer";

const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params: async(req,file)=>{
        const originalname = file.originalname;
        const extension = originalname.split('.').pop()?.toLocaleLowerCase();
        const fileNameWihtoutExtention = originalname.split('.').slice(0, -1).join('.').toLocaleLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-_]/g, '');
        const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWihtoutExtention;
        const folder = extension === "pdf" ? "pdfs" : "images";
        return {
            folder: `TelaDoc_ph_healthcare/${folder}`,
            public_id: uniqueName,
            resource_type : "auto",
        }
    }
})

export const  multerUpload = multer({storage})