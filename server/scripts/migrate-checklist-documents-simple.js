const { sequelize } = require('../models');

async function migrateChecklistDocumentsSimple() {
  try {
    console.log('Starting simple checklist documents migration...');

    // Add new columns to permit_checklists table
    await sequelize.query(`
      ALTER TABLE permit_checklists 
      ADD COLUMN IF NOT EXISTS documents_required BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS documents_complete BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS documents_due_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS document_instructions TEXT;
    `);

    console.log('✓ Added new columns to permit_checklists table');

    // Create checklist_files table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS checklist_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        permit_checklist_id UUID NOT NULL REFERENCES permit_checklists(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_type VARCHAR(50) DEFAULT 'document',
        description TEXT,
        is_required BOOLEAN DEFAULT FALSE,
        is_uploaded BOOLEAN DEFAULT FALSE,
        upload_date TIMESTAMP,
        s3_key VARCHAR(500),
        s3_bucket VARCHAR(100),
        checksum VARCHAR(255),
        uploaded_by UUID REFERENCES users(id),
        review_status VARCHAR(50) DEFAULT 'pending',
        review_notes TEXT,
        reviewed_by UUID REFERENCES users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✓ Created checklist_files table');

    // Create indexes for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_checklist_files_permit_checklist_id ON checklist_files(permit_checklist_id);
      CREATE INDEX IF NOT EXISTS idx_checklist_files_uploaded_by ON checklist_files(uploaded_by);
      CREATE INDEX IF NOT EXISTS idx_checklist_files_reviewed_by ON checklist_files(reviewed_by);
      CREATE INDEX IF NOT EXISTS idx_checklist_files_review_status ON checklist_files(review_status);
    `);

    console.log('✓ Created indexes for checklist_files table');

    console.log('\n🎉 Simple migration completed successfully!');
    console.log('\nNew features available:');
    console.log('- Document upload for individual checklist items');
    console.log('- Document completion tracking');
    console.log('- File review workflow');
    console.log('- Document due dates and instructions');
    console.log('\nNote: You can manually set documents_required = TRUE for specific checklist items as needed.');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateChecklistDocumentsSimple();
}

module.exports = migrateChecklistDocumentsSimple;
