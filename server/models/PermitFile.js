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
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileType: {
      type: DataTypes.ENUM('document', 'image', 'plan', 'form', 'other'),
      defaultValue: 'document'
    },
    description: {
      type: DataTypes.TEXT
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isUploaded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    uploadDate: {
      type: DataTypes.DATE
    },
    s3Key: {
      type: DataTypes.STRING
    },
    s3Bucket: {
      type: DataTypes.STRING
    },
    checksum: {
      type: DataTypes.STRING
    },
    permitId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'permits',
        key: 'id'
      }
    }
  });

  return PermitFile;
};
