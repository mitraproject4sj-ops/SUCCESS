const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const archiver = require('archiver');

// Environment Variables
const BACKUP_DIR = path.join(__dirname, '../backups');
const S3_BUCKET = process.env.BACKUP_S3_BUCKET;
const S3_PREFIX = process.env.BACKUP_S3_PREFIX || 'lakshya-backups';

// Initialize S3 Client (if configured)
let s3Client;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1'
  });
}

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Get timestamp for backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFileName = `backup-${timestamp}.zip`;
const backupPath = path.join(BACKUP_DIR, backupFileName);

// Create zip archive
const archive = archiver('zip', { zlib: { level: 9 } });
const output = fs.createWriteStream(backupPath);

archive.pipe(output);

// Log archive progress
archive.on('progress', (progress) => {
  const percentage = (progress.entries.processed / progress.entries.total * 100).toFixed(2);
  console.log(`Processing: ${percentage}% (${progress.entries.processed}/${progress.entries.total})`);
});

// Backup process
async function createBackup() {
  console.log('🚀 Starting backup process...');

  try {
    // Add configuration files
    console.log('📁 Adding configuration files...');
    ['package.json', 'tsconfig.json', '.env.example', 'README.md'].forEach(file => {
      if (fs.existsSync(file)) {
        archive.file(file, { name: file });
      }
    });

    // Add source code
    console.log('📁 Adding source code...');
    archive.directory('src', 'src');

    // Add public assets
    if (fs.existsSync('public')) {
      console.log('📁 Adding public assets...');
      archive.directory('public', 'public');
    }

    // Add build output if exists
    if (fs.existsSync('build')) {
      console.log('📁 Adding build files...');
      archive.directory('build', 'build');
    }

    // Close the archive
    await archive.finalize();

    // Upload to S3 if configured
    if (s3Client && S3_BUCKET) {
      console.log('☁️ Uploading to S3...');
      const fileStream = fs.createReadStream(backupPath);
      
      await s3Client.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: `${S3_PREFIX}/${backupFileName}`,
        Body: fileStream
      }));
      
      console.log('✅ Backup uploaded to S3');
    }

    // Clean old backups
    await cleanOldBackups();

    console.log('✅ Backup completed successfully!');
    console.log(`📦 Backup saved to: ${backupPath}`);

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

// Clean old backups (keep last 7 days)
async function cleanOldBackups() {
  console.log('🧹 Cleaning old backups...');
  
  const files = fs.readdirSync(BACKUP_DIR);
  const now = new Date();
  
  files.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const daysOld = (now - stats.mtime) / (1000 * 60 * 60 * 24);
    
    if (daysOld > 7) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted old backup: ${file}`);
    }
  });
}

// Run backup
createBackup().catch(console.error);