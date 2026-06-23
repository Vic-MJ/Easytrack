import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear el directorio uploads si no existe
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único con timestamp
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000000);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);

    cb(null, `${file.fieldname}-${timestamp}-${randomNum}${extension}`);
  }
});

// Filtro de archivos - solo permitir ciertos tipos
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/xml',
    'text/xml'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten archivos PDF, XML, JPG, PNG y JPEG.'), false);
  }
};

// Filtro especial para archivos de respaldo (JSON y PostgreSQL)
const backupFileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = [
    'application/json',
    'text/plain', // Para archivos .json que algunos navegadores detectan como text/plain
    'application/octet-stream',
    'application/x-tar',
    'application/sql',
    'application/x-sql'
  ];

  // También verificar la extensión del archivo
  const fileExtension = file.originalname.toLowerCase().split('.').pop();
  const allowedExtensions = ['json', 'backup', 'sql', 'tar', 'dump'];

  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no permitido. Extensiones válidas: .json, .backup, .sql, .tar, .dump'), false);
  }
};

// Configuración de multer para documentos normales
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
    files: 5 // máximo 5 archivos
  }
});

// Configuración de multer para archivos de respaldo
export const uploadBackup = multer({
  storage: storage, // Usar disco en lugar de memoria por los archivos de BD pesados
  fileFilter: backupFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB límite para archivos de respaldo
    files: 1 // solo 1 archivo
  }
});

// Middleware para manejar errores de multer
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'El archivo es demasiado grande. Excede el límite permitido.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Demasiados archivos. Máximo 5 archivos' });
    }
  }

  if (err && err.message.includes('Formato de archivo no permitido')) {
    return res.status(400).json({ message: err.message });
  }

  if (err && err.message.includes('Solo se permiten archivos .json')) {
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({ message: 'Error al subir archivo' });
  }

  next();
};