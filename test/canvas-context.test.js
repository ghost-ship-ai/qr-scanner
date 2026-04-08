/**
 * Simple test to verify that the QrScanner uses willReadFrequently option
 * when creating canvas context.
 *
 * This test can be run with: node test/canvas-context.test.js
 */

const fs = require('fs');
const path = require('path');

function testCanvasContextOptions() {
    console.log('Testing QrScanner canvas context options...');

    // Read the source file
    const sourceFile = path.join(__dirname, '..', 'src', 'qr-scanner.ts');

    if (!fs.existsSync(sourceFile)) {
        console.error('❌ Source file not found:', sourceFile);
        process.exit(1);
    }

    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');

    // Test 1: Check that getContext includes willReadFrequently: true
    const willReadFrequentlyRegex = /getContext\s*\(\s*['"]2d['"]\s*,\s*\{[^}]*willReadFrequently\s*:\s*true[^}]*\}\s*\)/;

    if (!willReadFrequentlyRegex.test(sourceContent)) {
        console.error('❌ willReadFrequently: true option not found in getContext call');
        process.exit(1);
    }

    console.log('✅ willReadFrequently: true option found');

    // Test 2: Check that it also includes alpha: false (existing option)
    const alphaFalseRegex = /getContext\s*\(\s*['"]2d['"]\s*,\s*\{[^}]*alpha\s*:\s*false[^}]*\}\s*\)/;

    if (!alphaFalseRegex.test(sourceContent)) {
        console.error('❌ alpha: false option not found in getContext call');
        process.exit(1);
    }

    console.log('✅ alpha: false option found');

    // Test 3: Check that both options are in the same getContext call
    const bothOptionsRegex = /getContext\s*\(\s*['"]2d['"]\s*,\s*\{\s*alpha\s*:\s*false\s*,\s*willReadFrequently\s*:\s*true\s*\}\s*\)/;

    if (!bothOptionsRegex.test(sourceContent)) {
        console.error('❌ Both options not found in the same getContext call');
        process.exit(1);
    }

    console.log('✅ Both alpha: false and willReadFrequently: true found in same getContext call');

    console.log('🎉 All tests passed! Canvas context options are correctly configured.');
}

// Run the test
testCanvasContextOptions();
