const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

// Create timestamp for backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Backup environment variables
function backupEnv() {
  try {
    if (fs.existsSync('.env')) {
      fs.copyFileSync('.env', path.join(BACKUP_DIR, `.env.${timestamp}`));
      console.log('✅ Environment variables backed up');
    }
  } catch (error) {
    console.error('❌ Failed to backup environment variables:', error);
  }
}

// Backup build directory
function backupBuild() {
  try {
    if (fs.existsSync('build')) {
      execSync(`tar -czf "${path.join(BACKUP_DIR, `build_${timestamp}.tar.gz`)}" build`);
      console.log('✅ Build directory backed up');
    }
  } catch (error) {
    console.error('❌ Failed to backup build directory:', error);
  }
}

// Clean old backups (keep last 5)
function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const sortedFiles = files.sort((a, b) => {
      const statA = fs.statSync(path.join(BACKUP_DIR, a));
      const statB = fs.statSync(path.join(BACKUP_DIR, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });

    if (sortedFiles.length > 5) {
      sortedFiles.slice(5).forEach(file => {
        fs.unlinkSync(path.join(BACKUP_DIR, file));
      });
      console.log('✅ Old backups cleaned');
    }
  } catch (error) {
    console.error('❌ Failed to clean old backups:', error);
  }
}

// Run backup
console.log('🔄 Starting backup process...');
backupEnv();
backupBuild();
cleanOldBackups();
console.log('✨ Backup completed!');