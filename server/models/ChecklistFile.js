module.exports = (sequelize, DataTypes) => {
  const ChecklistFile = sequelize.define('ChecklistFile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    permitChecklistId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'permit_checklist_id',
      references: {
        model: 'permit_checklists',
        key: 'id'
      }
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'original_name'
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'file_path'
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'file_size',
      validate: {
        min: 0
      }
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'mime_type'
    },
    fileType: {
      type: DataTypes.ENUM('document', 'image', 'plan', 'form', 'certificate', 'inspection', 'other'),
      defaultValue: 'document',
      field: 'file_type'
    },
    description: {
      type: DataTypes.TEXT
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_required'
    },
    isUploaded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_uploaded'
    },
    uploadDate: {
      type: DataTypes.DATE,
      field: 'upload_date'
    },
    s3Key: {
      type: DataTypes.STRING,
      field: 's3_key'
    },
    s3Bucket: {
      type: DataTypes.STRING,
      field: 's3_bucket'
    },
    checksum: {
      type: DataTypes.STRING
    },
    uploadedBy: {
      type: DataTypes.UUID,
      field: 'uploaded_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reviewStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'needs_revision'),
      defaultValue: 'pending',
      field: 'review_status'
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      field: 'review_notes'
    },
    reviewedBy: {
      type: DataTypes.UUID,
      field: 'reviewed_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reviewedAt: {
      type: DataTypes.DATE,
      field: 'reviewed_at'
    }
  }, {
    tableName: 'checklist_files',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ChecklistFile;
};
