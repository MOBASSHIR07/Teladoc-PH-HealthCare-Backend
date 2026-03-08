import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../app/ErrorHelpers/AppError";
import status from "http-status";

/*
  Configure Cloudinary using environment variables
*/
cloudinary.config({
  cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY_API_SECRET,
});

/*
  Delete file from Cloudinary using file URL
*/
export const deleteFileFromCloudinary = async (url: string): Promise<void> => {

  /*
    Extract public_id from Cloudinary URL
    Example URL:
    https://res.cloudinary.com/.../v123/folder/file.pdf

    We need:
    folder/file
  */
  const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)$/;
  const match = url.match(regex);

  if (!match) {
    console.log(`Could not extract public_id from url: ${url}`);
    return;
  }

  try {
    const publicId = match[1];

    /*
      resource_type auto works for
      image, pdf, video etc.
    */
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });

    console.log(`File ${publicId} deleted successfully`);
  } catch (error) {
    console.log(error);

    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Error deleting file from Cloudinary"
    );
  }
};

/*
  Upload file manually to Cloudinary using buffer
  Useful when files come from memory storage.
*/
export const uploadFileToCloudinary = async (
  buffer: Buffer,
  fileName: string
): Promise<UploadApiResponse> => {

  if (!buffer || !fileName) {
    throw new AppError(status.BAD_REQUEST, "File or fileName is required");
  }

  // Extract extension
  const extension = fileName.split(".").pop()?.toLowerCase();

  // Clean filename
  const fileNameWithoutExtension = fileName
    .split(".")
    .slice(0, -1)
    .join(".")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_]/g, "");

  // Generate unique name
  const uniqueName =
    Math.random().toString(36).substring(2) +
    "-" +
    Date.now() +
    "-" +
    fileNameWithoutExtension;

  const isPdf = extension === "pdf";
  const folder = isPdf ? "pdfs" : "images";

  return new Promise((resolve, reject) => {

    /*
      upload_stream allows uploading files directly
      from memory buffer without saving to disk
    */
    cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // important fix
        public_id: uniqueName,
        folder: `TelaDoc_ph_healthcare/${folder}`,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve(result as UploadApiResponse);
      }
    ).end(buffer);
  });
};

export default cloudinary;









// import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
// import { envVars } from "./env";
// import AppError from "../app/ErrorHelpers/AppError";
// import status from "http-status";

// cloudinary.config({
//     cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
//     api_key: envVars.CLOUDINARY_API_KEY,
//     api_secret: envVars.CLOUDINARY_API_SECRET,
// });

// export const deleteFileFromCloudinary = async (url: string): Promise<void> => {
//     const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)$/;
//     const match = url.match(regex);

//     if (!match) {
//         console.log(`Could not extract public_id from url: ${url}`);
//         return;
//     }

//     try {
//         const publicId = match[1];
//         const extension = url.split(".").pop()?.toLowerCase();
//         const resourceType = extension === "pdf" ? "raw" : "image";

//         await cloudinary.uploader.destroy(publicId, {
//             resource_type: resourceType
//         });

//         console.log(`File ${publicId} deleted successfully`);
//     } catch (error) {
//         console.log(error);
//         throw new AppError(
//             status.INTERNAL_SERVER_ERROR,
//             "Error deleting file from Cloudinary"
//         );
//     }
// };

// export const uploadFileToCloudinary = async (
//     buffer: Buffer,
//     fileName: string
// ): Promise<UploadApiResponse> => {
//     if (!buffer || !fileName) {
//         throw new AppError(status.BAD_REQUEST, "File or fileName is required");
//     }

//     const extension = fileName.split(".").pop()?.toLowerCase();
//     const fileNameWithoutExtension = fileName
//         .split(".")
//         .slice(0, -1)
//         .join(".")
//         .toLowerCase()
//         .replace(/\s+/g, "-")
//         .replace(/[^a-z0-9\-_]/g, "");

//     const uniqueName =
//         Math.random().toString(36).substring(2) +
//         "-" +
//         Date.now() +
//         "-" +
//         fileNameWithoutExtension +
//         (extension ? `.${extension}` : "");

//     const isPdf = extension === "pdf";
//     const folder = isPdf ? "pdfs" : "images";

//     return new Promise((resolve, reject) => {
//         cloudinary.uploader.upload_stream(
//             {
//                 resource_type: isPdf ? "raw" : "image",
//                 public_id: uniqueName,
//                 folder: `TelaDoc_ph_healthcare/${folder}`,
//             },
//             (error, result) => {
//                 if (error) return reject(error);
//                 resolve(result as UploadApiResponse);
//             }
//         ).end(buffer);
//     });
// };

// export default cloudinary;