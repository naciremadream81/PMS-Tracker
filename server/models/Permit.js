module.exports = (sequelize, DataTypes) => {
  const Permit = sequelize.define('Permit', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    permitNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'permit_number' // Map to database column
    },
    projectName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'project_name', // Map to database column
      validate: {
        len: [1, 200]
      }
    },
    projectAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'project_address' // Map to database column
    },
    projectType: {
      type: DataTypes.ENUM('residential', 'commercial', 'industrial', 'renovation', 'new_construction'),
      allowNull: false,
      field: 'project_type' // Map to database column
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'),
      defaultValue: 'draft'
    },
    submissionDate: {
      type: DataTypes.DATE,
      field: 'submission_date' // Map to database column
    },
    approvalDate: {
      type: DataTypes.DATE,
      field: 'approval_date' // Map to database column
    },
    expirationDate: {
      type: DataTypes.DATE,
      field: 'expiration_date' // Map to database column
    },
    estimatedCost: {
      type: DataTypes.DECIMAL(12, 2),
      field: 'estimated_cost', // Map to database column
      validate: {
        min: 0
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    notes: {
      type: DataTypes.TEXT
    },
    isOffline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_offline' // Map to database column
    },
    lastSynced: {
      type: DataTypes.DATE,
      field: 'last_synced' // Map to database column
    },
    countyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'county_id', // Map to database column
      references: {
        model: 'counties',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id', // Map to database column
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    // Table name mapping
    tableName: 'permits',
    // Map timestamp fields to database columns
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Permit;
};
