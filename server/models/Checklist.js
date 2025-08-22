module.exports = (sequelize, DataTypes) => {
  const Checklist = sequelize.define('Checklist', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.ENUM('required', 'optional', 'conditional'),
      defaultValue: 'required'
    },
    projectTypes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['residential', 'commercial', 'industrial', 'renovation', 'new_construction'],
      field: 'project_types' // Map to database column
    },
    estimatedCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'estimated_cost', // Map to database column
      validate: {
        min: 0
      }
    },
    processingTime: {
      type: DataTypes.INTEGER, // in days
      defaultValue: 0,
      field: 'processing_time' // Map to database column
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active' // Map to database column
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    countyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'county_id', // Map to database column
      references: {
        model: 'counties',
        key: 'id'
      }
    }
  }, {
    // Table name mapping
    tableName: 'checklists',
    // Map timestamp fields to database columns
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Checklist;
};
