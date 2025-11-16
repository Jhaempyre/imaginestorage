// Mock server for testing widget without full backend
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Mock constraints endpoint
app.get('/api-keys/constraints/:publicKey', (req, res) => {
  console.log(`✅ Getting constraints for key: ${req.params.publicKey}`);
  res.json({
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'application/pdf',
      'text/plain',
      'application/json',
    ],
    allowedDomains: [],
    requireCaptcha: false,
  });
});

// Mock upload token endpoint
app.post('/upload/token', (req, res) => {
  console.log('🔐 Token request:', req.body);
  res.json({
    success: true,
    data: {
      token: 'mock_jwt_token_12345',
      expiresIn: 3600,
      maxFileSize: 100 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'video/mp4']
    }
  });
});

// Mock upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  console.log('📁 File upload:', {
    originalname: req.file?.originalname,
    size: req.file?.size,
    mimetype: req.file?.mimetype,
    token: req.body.token
  });

  res.json({
    success: true,
    data: {
      fileId: 'mock_file_id_123',
      fileName: req.file?.originalname || 'test.jpg',
      uniqueFileName: `${Date.now()}_${req.file?.originalname || 'test.jpg'}`,
      size: req.file?.size || 1024,
      mimeType: req.file?.mimetype || 'image/jpeg',
      fileUrl: `http://localhost:3001/files/mock_${Date.now()}_${req.file?.originalname || 'test.jpg'}`,
      uploadedAt: new Date(),
      folderPath: req.body.folderPath || ''
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log('📝 Available endpoints:');
  console.log('  GET  /api-keys/constraints/:publicKey');
  console.log('  POST /upload/token');
  console.log('  POST /upload');
  console.log('\n🌐 Open http://localhost:8080/test.html to test the widget\n');
});