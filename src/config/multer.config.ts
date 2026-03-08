import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.config";
import multer from "multer";

/*
  This storage engine directly uploads files to Cloudinary
  using multer middleware.
*/
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,

  /*
    params() runs for every uploaded file.
    Here we dynamically configure:
    - folder
    - public_id
    - resource_type
  */
  params: async (req, file) => {

    // Original filename sent from client
    const originalname = file.originalname;

    // Extract extension (jpg, png, pdf etc.)
    const extension = originalname.split(".").pop()?.toLowerCase();

    // Remove extension and sanitize filename
    const fileNameWithoutExtension = originalname
      .split(".")
      .slice(0, -1)
      .join(".")
      .toLowerCase()
      .replace(/\s+/g, "-")        // replace spaces with "-"
      .replace(/[^a-z0-9\-_]/g, ""); // remove special characters

    // Create unique filename to avoid collision
    const uniqueName =
      Math.random().toString(36).substring(2) +
      "-" +
      Date.now() +
      "-" +
      fileNameWithoutExtension;

    // Detect if file is PDF
    const isPdf = extension === "pdf";

    // Separate folder for images and pdf
    const folder = isPdf ? "pdfs" : "images";

    return {
      folder: `TelaDoc_ph_healthcare/${folder}`,

      // unique id used in cloudinary
      public_id: uniqueName,

      /*
        resource_type auto lets Cloudinary detect the file type
        automatically (image / video / raw).
        This also fixes PDF preview issue in browser.
      */
      resource_type: "auto",
    };
  },
});

/*
  Multer middleware using cloudinary storage.
  Any file uploaded through this will go directly to Cloudinary.
*/
export const multerUpload = multer({ storage });


// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "./cloudinary.config";
// import multer from "multer";

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: async (req, file) => {
//         const originalname = file.originalname;
//         const extension = originalname.split(".").pop()?.toLowerCase();
//         const fileNameWithoutExtension = originalname
//             .split(".")
//             .slice(0, -1)
//             .join(".")
//             .toLowerCase()
//             .replace(/\s+/g, "-")
//             .replace(/[^a-z0-9\-_]/g, "");

//         const uniqueName =
//             Math.random().toString(36).substring(2) +
//             "-" +
//             Date.now() +
//             "-" +
//             fileNameWithoutExtension +
//             (extension ? `.${extension}` : "");

//         const isPdf = extension === "pdf";
//         const folder = isPdf ? "pdfs" : "images";

//         return {
//             folder: `TelaDoc_ph_healthcare/${folder}`,
//             public_id: uniqueName,
//             resource_type: isPdf ? "raw" : "image",
//         };
//     },
// });

// export const multerUpload = multer({ storage });

