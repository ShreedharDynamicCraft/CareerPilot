const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '..', 'package.json');

try {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add these dependencies if they don't exist
  const dependencies = {
    "cheerio": "^1.0.0-rc.12",
    "lucide-react": "^0.350.0",  // Use specific version that works
    "axios": "^1.6.0",
    "user-agents": "^1.0.1444",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  };
  
  // Update dependencies
  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...dependencies
  };
  
  // Remove upstash dependencies if they exist
  delete packageJson.dependencies['@upstash/ratelimit'];
  delete packageJson.dependencies['@upstash/redis'];
  
  // Add a script to run the update dependencies script
  packageJson.scripts = {
    ...packageJson.scripts,
    "fix-deps": "node scripts/update-dependencies.js"
  };
  
  // Write updated package.json
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json updated successfully');
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
}
