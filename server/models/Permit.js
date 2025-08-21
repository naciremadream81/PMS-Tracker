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
      unique: true
    },
    projectName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    projectAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    projectType: {
      type: DataTypes.ENUM('residential', 'commercial', 'industrial', 'renovation', 'new_construction'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'),
      defaultValue: 'draft'
    },
    submissionDate: {
      type: DataTypes.DATE
    },
    approvalDate: {
      type: DataTypes.DATE
    },
    expirationDate: {
      type: DataTypes.DATE
    },
    estimatedCost: {
      type: DataTypes.DECIMAL(12, 2),
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
      defaultValue: false
    },
    lastSynced: {
      type: DataTypes.DATE
    },
    countyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'counties',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  });

  return Permit;
};
