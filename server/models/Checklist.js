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
      defaultValue: ['residential', 'commercial', 'industrial', 'renovation', 'new_construction']
    },
    estimatedCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    processingTime: {
      type: DataTypes.INTEGER, // in days
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    countyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'counties',
        key: 'id'
      }
    }
  });

  return Checklist;
};
