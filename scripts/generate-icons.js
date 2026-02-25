const sharp = require('sharp');
const png2icons = require('png2icons');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../assets/icon.svg');
const icoPath = path.join(__dirname, '../assets/icon.ico');
const pngPath = path.join(__dirname, '../assets/icon.png');

async function generateIcons() {
    console.log('Generating icons with png2icons...');

    try {
        // Create a 256x256 PNG for tray icon usage
        await sharp(svgPath)
            .resize(256, 256)
            .png()
            .toFile(pngPath);
        console.log('Generated assets/icon.png (256x256)');

        // Read the PNG buffer for ICO conversion
        const pngBuffer = fs.readFileSync(pngPath);

        // Convert PNG buffer to ICO
        const icoBuffer = png2icons.createICO(pngBuffer, png2icons.HERMITE, 0, false);

        if (!icoBuffer) {
            throw new Error('Failed to create ICO buffer');
        }

        fs.writeFileSync(icoPath, icoBuffer);

        // Copy to build folder
        const buildDir = path.join(__dirname, '../build');
        if (!fs.existsSync(buildDir)) {
            fs.mkdirSync(buildDir);
        }
        fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);

        console.log('Successfully generated icon.ico in assets/ and build/');
        console.log('Tray icon PNG kept at assets/icon.png');
    } catch (error) {
        console.error('Error generating icons:', error);
        process.exit(1);
    }
}

generateIcons();
