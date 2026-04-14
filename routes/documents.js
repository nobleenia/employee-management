const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Document = require('../models/Document');
const authenticate = require('../middleware/auth');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock-secret'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'employee_documents',
    format: async (req, file) => path.extname(file.originalname).slice(1),
    public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0]
  },
});
const upload = multer({ storage: storage });

router.post('/upload', authenticate, upload.single('document'), async (req, res) => {
  try {
    const { employeeId, name } = req.body;
    const document = await Document.create({
      employeeId,
      name,
      fileUrl: req.file.path, // Cloudinary URL
      organizationId: req.user.organizationId
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

router.get('/:employeeId', authenticate, async (req, res) => {
  try {
    const documents = await Document.find({ 
      employeeId: req.params.employeeId,
      organizationId: req.user.organizationId 
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents' });
  }
});

module.exports = router;
