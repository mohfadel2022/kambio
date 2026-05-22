const fs = require('fs');
const path = require('path');

const regPath = path.join(process.cwd(), 'public/fonts/Amiri-Regular.ttf');
const boldPath = path.join(process.cwd(), 'public/fonts/Amiri-Bold.ttf');
const targetFile = path.join(process.cwd(), 'src/lib/InvoicePDF.tsx');

try {
    const regB64 = fs.readFileSync(regPath).toString('base64');
    const boldB64 = fs.readFileSync(boldPath).toString('base64');
    
    let content = fs.readFileSync(targetFile, 'utf8');
    
    const startMarker = '// Fonts embedded as Base64 for maximum reliability';
    const endMarker = 'const colors = {';
    
    const newFontsCode = `// Fonts embedded as Base64 for maximum reliability
const AMIRI_REGULAR = "data:font/truetype;charset=utf-8;base64,${regB64}";
const AMIRI_BOLD = "data:font/truetype;charset=utf-8;base64,${boldB64}";

Font.register({
  family: "KambioArabic",
  src: AMIRI_REGULAR,
});

Font.register({
  family: "KambioArabicBold",
  src: AMIRI_BOLD,
});

`;

    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
        const newContent = content.substring(0, startIndex) + newFontsCode + content.substring(endIndex);
        fs.writeFileSync(targetFile, newContent);
        console.log('✅ Fonts embedded successfully as Base64!');
    } else {
        console.error('❌ Could not find markers in InvoicePDF.tsx');
    }
} catch (err) {
    console.error('❌ Error during embedding:', err);
}
