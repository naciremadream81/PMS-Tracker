const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createAdminDirect() {
  try {
    const password = 'Admin@2024!';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('Creating admin user with:');
    console.log('Email: admin@pms-tracker.com');
    console.log('Password:', password);
    console.log('Hash:', hashedPassword);
    
    // Test the hash
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('Hash validation test:', isValid);
    
    console.log('\nNow run this SQL command in your database:');
    console.log(`
INSERT INTO users (id, email, password, first_name, last_name, company, phone, role, is_active, created_at, updated_at) 
VALUES (
  '${uuidv4()}', 
  'admin@pms-tracker.com', 
  '${hashedPassword}', 
  'System', 
  'Administrator', 
  'PMS Tracker System Admin', 
  '(555) 999-0000', 
  'admin', 
  true, 
  NOW(), 
  NOW()
);
    `);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminDirect();
