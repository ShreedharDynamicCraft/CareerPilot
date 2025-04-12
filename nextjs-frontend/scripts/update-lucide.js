const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Updating lucide-react package...');

try {
  // Update lucide-react to latest version
  execSync('npm install lucide-react@latest', { stdio: 'inherit' });
  console.log('✅ lucide-react updated successfully');
  
  // Find the Header.jsx file
  const componentsDir = path.join(__dirname, '..', 'components');
  const headerPath = path.join(componentsDir, 'Header.jsx');
  
  if (fs.existsSync(headerPath)) {
    console.log('📄 Found Header.jsx - checking for problematic icon import');
    
    let content = fs.readFileSync(headerPath, 'utf8');
    
    // Check if the problematic icon is being imported
    if (content.includes('ChartNoAxesColumnIncreasing')) {
      console.log('🔄 Replacing ChartNoAxesColumnIncreasing with BarChart3');
      
      // Replace the import
      content = content.replace(/ChartNoAxesColumnIncreasing/g, 'BarChart3');
      
      // Write the updated file
      fs.writeFileSync(headerPath, content, 'utf8');
      console.log('✅ Header.jsx updated successfully');
    } else {
      console.log('✓ No problematic icon found in imports');
    }
  } else {
    console.log('❓ Header.jsx not found in components directory');
  }
  
  console.log('🎉 Update complete!');
  console.log('🔄 Please restart your development server');
} catch (error) {
  console.error('❌ Error updating lucide-react:', error.message);
}
