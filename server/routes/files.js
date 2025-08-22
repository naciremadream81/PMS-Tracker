const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { Permit, PermitFile } = require('../models');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text files are allowed.'));
    }
  }
});

// Upload file for a permit
router.post('/upload/:permitId', auth, upload.single('file'), [
  body('description').optional().trim(),
  body('fileType').optional().isIn(['document', 'image', 'plan', 'form', 'other']),
  body('isRequired').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { permitId } = req.params;
    const { description, fileType, isRequired } = req.body;

    // Verify permit exists and belongs to user
    const permit = await Permit.findOne({
      where: { id: permitId, userId: req.user.id }
    });

    if (!permit) {
      return res.status(404).json({ error: 'Permit not found.' });
    }

    // Calculate file checksum
    const fileBuffer = await fs.readFile(req.file.path);
    const checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');

    // Create file record
    const permitFile = await PermitFile.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileType: fileType || 'document',
      description,
      isRequired: isRequired || false,
      isUploaded: true,
      uploadDate: new Date(),
      checksum,
      permitId
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: permitFile
    });
  } catch (error) {
    console.error('File upload error:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up file:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'File upload failed.' });
  }
});

// Get files for a permit
router.get('/permit/:permitId', auth, async (req, res) => {
  try {
    const { permitId } = req.params;

    // Verify permit belongs to user
    const permit = await Permit.findOne({
      where: { id: permitId, userId: req.user.id }
    });

    if (!permit) {
      return res.status(404).json({ error: 'Permit not found.' });
    }

    const files = await PermitFile.findAll({
      where: { permitId },
      order: [['upload_date', 'DESC']]
    });

    res.json({ files });
  } catch (error) {
    console.error('Files fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch files.' });
  }
});

// Download file
router.get('/download/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await PermitFile.findOne({
      where: { id: fileId },
      include: [{
        model: Permit,
        as: 'permit',
        where: { userId: req.user.id }
      }]
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Check if file exists on disk
    try {
      await fs.access(file.filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found on disk.' });
    }

    // Set headers for download
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Length', file.fileSize);

    // Stream file to response
    const fileStream = require('fs').createReadStream(file.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: 'File download failed.' });
  }
});

// Delete file
router.delete('/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await PermitFile.findOne({
      where: { id: fileId },
      include: [{
        model: Permit,
        as: 'permit',
        where: { userId: req.user.id }
      }]
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Delete file from disk
    try {
      await fs.unlink(file.filePath);
    } catch (error) {
      console.error('Failed to delete file from disk:', error);
    }

    // Delete file record
    await file.destroy();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'File deletion failed.' });
  }
});

// Update file metadata
router.put('/:fileId', auth, [
  body('description').optional().trim(),
  body('fileType').optional().isIn(['document', 'image', 'plan', 'form', 'other']),
  body('isRequired').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fileId } = req.params;
    const { description, fileType, isRequired } = req.body;

    const file = await PermitFile.findOne({
      where: { id: fileId },
      include: [{
        model: Permit,
        as: 'permit',
        where: { userId: req.user.id }
      }]
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (fileType !== undefined) updateData.fileType = fileType;
    if (isRequired !== undefined) updateData.isRequired = isRequired;

    await file.update(updateData);

    res.json({
      message: 'File updated successfully',
      file
    });
  } catch (error) {
    console.error('File update error:', error);
    res.status(500).json({ error: 'File update failed.' });
  }
});

module.exports = router;
