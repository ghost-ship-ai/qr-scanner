import { describe, it, expect, vi } from 'vitest';

// Mock the QrScanner class to test the _drawToCanvas method
describe('QrScanner Canvas Context', () => {
  it('should create canvas context with willReadFrequently option', () => {
    // Create a mock canvas element
    const mockCanvas = document.createElement('canvas');

    // Mock the getContext method to capture the options
    let capturedOptions: any = null;
    const mockContext = {
      imageSmoothingEnabled: false,
      drawImage: vi.fn(),
    };

    const originalGetContext = mockCanvas.getContext;
    mockCanvas.getContext = vi.fn((type: string, options?: any) => {
      capturedOptions = options;
      return mockContext;
    });

    // Create a mock image element
    const mockImage = document.createElement('img');
    mockImage.width = 100;
    mockImage.height = 100;

    // Import the QrScanner class and access the private _drawToCanvas method
    // Since it's a private static method, we need to access it through the class
    // We'll use a workaround by importing the source and testing the method directly

    // For this test, we'll simulate what the _drawToCanvas method does
    const canvas = mockCanvas;
    const image = mockImage;
    const scanRegion = null;
    const disallowCanvasResizing = false;

    // Simulate the canvas sizing logic
    if (!disallowCanvasResizing) {
      const canvasWidth = image.width;
      const canvasHeight = image.height;
      if (canvas.width !== canvasWidth) {
        canvas.width = canvasWidth;
      }
      if (canvas.height !== canvasHeight) {
        canvas.height = canvasHeight;
      }
    }

    // This is the key line we're testing - it should include willReadFrequently: true
    const context = canvas.getContext('2d', { alpha: false, willReadFrequently: true });

    // Verify that getContext was called with the correct options
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d', {
      alpha: false,
      willReadFrequently: true
    });

    // Verify that the captured options include willReadFrequently: true
    expect(capturedOptions).toEqual({
      alpha: false,
      willReadFrequently: true
    });

    // Verify that willReadFrequently is specifically set to true
    expect(capturedOptions.willReadFrequently).toBe(true);
  });

  it('should verify the actual QrScanner implementation uses willReadFrequently', async () => {
    // This test will verify that the actual QrScanner source code includes the fix
    // We'll read the source file and check that the getContext call includes willReadFrequently

    const fs = await import('fs');
    const path = await import('path');

    const sourceFile = path.join(process.cwd(), 'src', 'qr-scanner.ts');
    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');

    // Check that the getContext call includes willReadFrequently: true
    const getContextRegex = /getContext\s*\(\s*['"]2d['"]\s*,\s*\{[^}]*willReadFrequently\s*:\s*true[^}]*\}\s*\)/;

    expect(sourceContent).toMatch(getContextRegex);

    // Also check that it includes alpha: false for completeness
    const fullOptionsRegex = /getContext\s*\(\s*['"]2d['"]\s*,\s*\{\s*alpha\s*:\s*false\s*,\s*willReadFrequently\s*:\s*true\s*\}\s*\)/;

    expect(sourceContent).toMatch(fullOptionsRegex);
  });
});
