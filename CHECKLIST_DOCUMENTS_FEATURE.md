# Checklist Documents Feature

## Overview
This feature allows users to upload and manage documents for individual checklist items within permit packages. Each checklist item can now have multiple documents attached to it, with tracking for completion status and review workflow.

## New Features

### 1. Document Upload for Checklist Items
- **Individual File Upload**: Each checklist item can have multiple documents uploaded
- **File Type Support**: PDF, Word, Excel, images, text files, and more
- **Metadata Tracking**: Description, file type, required status, and upload information
- **File Size Limit**: 50MB per file

### 2. Document Completion Tracking
- **Required Documents**: Mark specific documents as required for checklist completion
- **Completion Status**: Track whether all required documents are uploaded
- **Progress Indicators**: Visual feedback on document completion status

### 3. File Review Workflow
- **Review Status**: Pending, Approved, Rejected, Needs Revision
- **Review Notes**: Add comments and feedback on uploaded documents
- **Reviewer Tracking**: Track who reviewed each document and when

### 4. Enhanced Checklist Management
- **Document Instructions**: Add specific instructions for each checklist item
- **Due Dates**: Set deadlines for document submission
- **Priority Levels**: High, Medium, Low priority for checklist items

## Database Changes

### New Tables
- **`checklist_files`**: Stores individual files for checklist items
- **`permit_checklists`**: Enhanced with document tracking fields

### New Fields Added
```sql
-- permit_checklists table
documents_required BOOLEAN DEFAULT FALSE
documents_complete BOOLEAN DEFAULT FALSE
documents_due_date TIMESTAMP
document_instructions TEXT

-- checklist_files table
permit_checklist_id UUID (foreign key)
filename VARCHAR(255)
original_name VARCHAR(255)
file_path TEXT
file_size BIGINT
mime_type VARCHAR(100)
file_type VARCHAR(50)
description TEXT
is_required BOOLEAN
is_uploaded BOOLEAN
upload_date TIMESTAMP
uploaded_by UUID (foreign key to users)
review_status VARCHAR(50)
review_notes TEXT
reviewed_by UUID (foreign key to users)
reviewed_at TIMESTAMP
```

## API Endpoints

### Checklist Files
- `GET /api/checklist-files/permit-checklist/:permitChecklistId` - Get files for a checklist item
- `POST /api/checklist-files/upload/:permitChecklistId` - Upload a new file
- `PUT /api/checklist-files/:fileId` - Update file metadata
- `PUT /api/checklist-files/:fileId/review` - Review a file (admin/reviewer)
- `GET /api/checklist-files/:fileId/download` - Download a file
- `DELETE /api/checklist-files/:fileId` - Delete a file

## Frontend Components

### ChecklistItemWithDocuments
A new React component that displays:
- Checklist item information
- Document upload form
- List of uploaded documents
- File management actions (edit, delete, download)
- Review status indicators

## Usage Examples

### 1. Upload a Document for a Checklist Item
```javascript
import { checklistFilesAPI } from '../services/api';

const file = event.target.files[0];
const metadata = {
  description: 'Structural engineering plans',
  fileType: 'plan',
  isRequired: true
};

await checklistFilesAPI.upload(permitChecklistId, file, metadata);
```

### 2. Mark Documents as Required
```javascript
// In the admin portal, when creating/editing checklist items
const checklistData = {
  name: 'Structural Review',
  documentsRequired: true,
  documentInstructions: 'Upload structural engineering plans and calculations'
};
```

### 3. Track Document Completion
```javascript
// The system automatically updates documentsComplete when required files are uploaded
if (checklistItem.documentsRequired && checklistItem.documentsComplete) {
  // All required documents are uploaded
  console.log('Checklist item is ready for review');
}
```

## Admin Portal Integration

### County Checklist Management
- **Enhanced Modal**: The existing county checklist modal now includes document tracking
- **Document Requirements**: Set which checklist items require documents
- **Instructions**: Add specific instructions for document uploads
- **Due Dates**: Set deadlines for document submission

### Document Review Workflow
- **Status Updates**: Admins can review and update document status
- **Feedback**: Add review notes and comments
- **Approval Process**: Streamlined document approval workflow

## File Storage

### Local Storage
- Files are stored in `server/uploads/checklist-files/`
- Organized by permit and checklist item
- Automatic cleanup when files are deleted

### S3 Integration Ready
- Database schema includes S3 fields
- Easy migration to cloud storage
- Checksum validation for file integrity

## Security Features

### Authentication
- All endpoints require valid authentication
- User-specific file access controls
- Admin-only review capabilities

### File Validation
- File type restrictions
- Size limits (50MB)
- Malware scanning ready

## Migration

### Database Migration
Run the migration script to add new fields and tables:
```bash
cd server
node scripts/migrate-checklist-documents-simple.js
```

### File Structure
Create the uploads directory:
```bash
mkdir -p server/uploads/checklist-files
```

## Benefits

1. **Better Organization**: Documents are tied to specific checklist items
2. **Progress Tracking**: Clear visibility into document completion status
3. **Review Workflow**: Structured process for document approval
4. **Compliance**: Track required documents for regulatory compliance
5. **User Experience**: Intuitive document management interface

## Future Enhancements

- **Bulk Upload**: Upload multiple files at once
- **Document Templates**: Pre-defined document types and requirements
- **Automated Review**: AI-powered document validation
- **Integration**: Connect with external document management systems
- **Notifications**: Email alerts for document due dates and reviews

## Support

For questions or issues with this feature, please refer to:
- API documentation in the server routes
- Component documentation in the client source code
- Database schema in the models directory
