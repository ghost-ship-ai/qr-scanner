# QR Scanner Project Context

## What the project does
QR Scanner is a TypeScript-based JavaScript library for scanning QR codes. It provides:
- Web camera scanning with live video stream processing
- Single image QR code detection
- WebWorker-based processing to keep the UI thread responsive
- Native BarcodeDetector API support with fallback to jsQR
- Multiple build targets: ES6 modules, UMD, and legacy ES6 compatibility

## Architecture
- **Main entry**: `src/qr-scanner.ts` - Core QrScanner class with camera handling, scanning logic
- **Worker**: `src/worker.ts` - WebWorker for QR code detection using jsqr-es6 library
- **Build process**: Rollup with TypeScript compilation and Google Closure Compiler optimization
- **Output**: Multiple minified bundles for different use cases

## Key files
- `src/qr-scanner.ts` - Main QrScanner class (~51KB source)
- `src/worker.ts` - WebWorker implementation for QR decoding
- `rollup.config.js` - Complex build configuration with multiple targets
- `tsconfig.json` - TypeScript compiler configuration
- `package.json` - Yarn package with build scripts
- `demo/index.html` - Working demo page

## Dependencies
- **Runtime**: `@types/offscreencanvas` for TypeScript support
- **Build**: Rollup ecosystem with TypeScript, Closure Compiler, and jsqr-es6
- **Package manager**: Yarn (yarn.lock present)

## Build process
1. Rollup processes `src/worker.ts` → `qr-scanner-worker.min.js`
2. Rollup processes `src/qr-scanner.ts` → multiple targets:
   - `qr-scanner.min.js` (ES6 module)
   - `qr-scanner.umd.min.js` (UMD)  
   - `qr-scanner.legacy.min.js` (ES6 compatible UMD with inlined worker)
3. TypeScript compiler generates `types/qr-scanner.d.ts`
4. All outputs include sourcemaps

## Testing status
- **No existing tests** - This is a major gap
- The project relies on manual testing via the demo page
- Testing would need to cover camera access, QR detection accuracy, and WebWorker functionality

## Known issues
- Build output was previously committed to git (now fixed with .gitignore)
- No automated testing infrastructure
- Complex build setup may be fragile to dependency updates
- jsqr-es6 dependency imported via relative path in worker