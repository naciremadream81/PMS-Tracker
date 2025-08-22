module.exports = (sequelize, DataTypes) => {
  const PermitFile = sequelize.define('PermitFile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'original_name' // Map to database column
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'file_path' // Map to database column
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'file_size', // Map to database column
      validate: {
        min: 0
      }
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'mime_type' // Map to database column
    },
    fileType: {
      type: DataTypes.ENUM('document', 'image', 'plan', 'form', 'other'),
      defaultValue: 'document',
      field: 'file_type' // Map to database column
    },
    description: {
      type: DataTypes.TEXT
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_required' // Map to database column
    },
    isUploaded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_uploaded' // Map to database column
    },
    uploadDate: {
      type: DataTypes.DATE,
      field: 'upload_date' // Map to database column
    },
    s3Key: {
      type: DataTypes.STRING,
      field: 's3_key' // Map to database column
    },
    s3Bucket: {
      type: DataTypes.STRING,
      field: 's3_bucket' // Map to database column
    },
    checksum: {
      type: DataTypes.STRING
    },
    permitId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'permit_id', // Map to database column
      references: {
        model: 'permits',
        key: 'id'
      }
    }
  }, {
    // Table name mapping
    tableName: 'permit_files',
    // Map timestamp fields to database columns
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return PermitFile;
};
