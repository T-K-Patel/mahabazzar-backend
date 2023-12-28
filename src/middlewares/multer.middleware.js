import multer from "multer";

// For large file storage in server.

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./public/temp");
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         cb(
//             null,
//             file.fieldname +
//                 "-" +
//                 uniqueSuffix +
//                 "." +
//                 file.mimetype.split("/")[1]
//         );
//     },
// });

const storage = multer.memoryStorage();

export const upload = multer({ storage: storage });
