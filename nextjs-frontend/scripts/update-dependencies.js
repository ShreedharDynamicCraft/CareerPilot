const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Updating dependencies...');

// Update lucide-react to latest version
try {
  console.log('Updating lucide-react...');
  execSync('npm install lucide-react@latest', { stdio: 'inherit' });
  console.log('✅ lucide-react updated successfully');
} catch (error) {
  console.error('❌ Failed to update lucide-react:', error.message);
}

// Check for Header.jsx to see which icon is causing the problem
const headerPath = path.join(__dirname, '..', 'components', 'Header.jsx');

if (fs.existsSync(headerPath)) {
  console.log('Checking Header.jsx for problematic icon imports...');
  
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  const iconImportRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]lucide-react['"]/;
  const match = headerContent.match(iconImportRegex);
  
  if (match) {
    const iconsImported = match[1].split(',').map(i => i.trim());
    console.log('Icons imported in Header.jsx:', iconsImported.join(', '));
    
    // Check if ChartNoAxesColumnIncreasing is imported
    if (iconsImported.includes('ChartNoAxesColumnIncreasing')) {
      console.log('Found problematic import: ChartNoAxesColumnIncreasing');
      console.log('Replacing with BarChart3 icon...');
      
      const updatedContent = headerContent.replace(
        'ChartNoAxesColumnIncreasing', 
        'BarChart3'
      );
      
      fs.writeFileSync(headerPath, updatedContent, 'utf8');
      console.log('✅ Header.jsx updated successfully');
    }
  } else {
    console.log('No lucide-react imports found in Header.jsx');
  }
} else {
  console.log('Header.jsx not found in the expected location');
}

console.log('📦 Dependency update complete!');
