const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function resetAdminPassword() {
  try {
    // Generate a new password hash
    const password = 'Admin@2024!';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update the admin user's password
    const result = await User.update(
      { password: hashedPassword },
      { 
        where: { 
          email: 'admin@pms-tracker.com',
          role: 'admin'
        }
      }
    );
    
    if (result[0] > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('📧 Email: admin@pms-tracker.com');
      console.log('🔑 Password: Admin@2024!');
    } else {
      console.log('❌ Admin user not found or password not updated');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
