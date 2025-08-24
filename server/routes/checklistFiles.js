const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const { ChecklistFile, PermitChecklist, User } = require('../models');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/checklist-files');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
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

// All routes require authentication
router.use(auth);

// Get all files for a specific permit checklist item
router.get('/permit-checklist/:permitChecklistId', async (req, res) => {
  try {
    const { permitChecklistId } = req.params;
    
    const files = await ChecklistFile.findAll({
      where: { permitChecklistId },
      include: [
        {
          model: User,
          as: 'uploadedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'reviewedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ files });
  } catch (error) {
    console.error('Checklist files fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch checklist files.' });
  }
});

// Upload a new file for a checklist item
router.post('/upload/:permitChecklistId', upload.single('file'), async (req, res) => {
  try {
    const { permitChecklistId } = req.params;
    const { description, fileType, isRequired } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided.' });
    }

    // Verify the permit checklist item exists
    const permitChecklist = await PermitChecklist.findByPk(permitChecklistId);
    if (!permitChecklist) {
      return res.status(404).json({ error: 'Permit checklist item not found.' });
    }

    // Create the checklist file record
    const checklistFile = await ChecklistFile.create({
      permitChecklistId,
      filename: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileType: fileType || 'document',
      description: description || '',
      isRequired: isRequired === 'true',
      isUploaded: true,
      uploadDate: new Date(),
      uploadedBy: req.user.id,
      reviewStatus: 'pending'
    });

    // Update the permit checklist to mark documents as complete if required
    if (permitChecklist.documentsRequired) {
      await permitChecklist.update({
        documentsComplete: true
      });
    }

    res.status(201).json({ 
      file: checklistFile,
      message: 'File uploaded successfully.' 
    });
  } catch (error) {
    console.error('Checklist file upload error:', error);
    res.status(500).json({ error: 'Failed to upload file.' });
  }
});

// Update file metadata
router.put('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { description, fileType, isRequired } = req.body;

    const file = await ChecklistFile.findByPk(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Check if user has permission to update this file
    if (file.uploadedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to update this file.' });
    }

    await file.update({
      description: description || file.description,
      fileType: fileType || file.fileType,
      isRequired: isRequired !== undefined ? isRequired : file.isRequired
    });

    res.json({ file, message: 'File updated successfully.' });
  } catch (error) {
    console.error('Checklist file update error:', error);
    res.status(500).json({ error: 'Failed to update file.' });
  }
});

// Review a file (admin/reviewer only)
router.put('/:fileId/review', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { reviewStatus, reviewNotes } = req.body;

    if (!['pending', 'approved', 'rejected', 'needs_revision'].includes(reviewStatus)) {
      return res.status(400).json({ error: 'Invalid review status.' });
    }

    const file = await ChecklistFile.findByPk(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    await file.update({
      reviewStatus,
      reviewNotes: reviewNotes || file.reviewNotes,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    });

    res.json({ file, message: 'File review updated successfully.' });
  } catch (error) {
    console.error('Checklist file review error:', error);
    res.status(500).json({ error: 'Failed to update file review.' });
  }
});

// Download a file
router.get('/:fileId/download', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const file = await ChecklistFile.findByPk(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.filePath)) {
      return res.status(404).json({ error: 'File not found on disk.' });
    }

    res.download(file.filePath, file.originalName);
  } catch (error) {
    console.error('Checklist file download error:', error);
    res.status(500).json({ error: 'Failed to download file.' });
  }
});

// Delete a file
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const file = await ChecklistFile.findByPk(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Check if user has permission to delete this file
    if (file.uploadedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this file.' });
    }

    // Delete file from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    // Delete database record
    await file.destroy();

    res.json({ message: 'File deleted successfully.' });
  } catch (error) {
    console.error('Checklist file deletion error:', error);
    res.status(500).json({ error: 'Failed to delete file.' });
  }
});

module.exports = router;
