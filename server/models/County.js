module.exports = (sequelize, DataTypes) => {
  const County = sequelize.define('County', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100]
      }
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: false,
      validate: {
        len: [2, 2]
      }
    },
    stateFull: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'state_full' // Map to database column
    },
    website: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    phone: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.TEXT
    },
    contactEmail: {
      type: DataTypes.STRING,
      field: 'contact_email', // Map to database column
      validate: {
        isEmail: true
      }
    },
    processingTime: {
      type: DataTypes.INTEGER, // in days
      defaultValue: 30,
      field: 'processing_time' // Map to database column
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active' // Map to database column
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'America/New_York'
    }
  }, {
    // Table name mapping
    tableName: 'counties',
    // Map timestamp fields to database columns
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return County;
};
