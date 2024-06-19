import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define la carpeta donde se guardarán las imágenes
        cb(null, path.resolve(process.cwd(), 'src', 'utils', 'uploads'));
    },
    filename: (req, file, cb) => {
        // Define el nombre del archivo
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // Filtra los archivos para que solo se admitan imágenes
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

export const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 20 }, // Limita el tamaño de los archivos a 20 MB
    fileFilter: fileFilter
});

