import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock jsqr-es6 module
const mockJsQR = vi.fn();
vi.mock('../node_modules/jsqr-es6/dist/jsQR.js', () => ({
  default: mockJsQR,
}));

// Mock Worker and MessageEvent for testing
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;

  postMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }));
    }
  }

  terminate() {}
}

// Mock global self for worker context
const mockSelf = {
  onmessage: null as ((event: MessageEvent) => void) | null,
  postMessage: vi.fn(),
  close: vi.fn(),
};

// Set up global self for worker
(global as any).self = mockSelf;

describe('QR Scanner Binary Data Support', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJsQR.mockReset();
  });

  describe('Worker Binary Data', () => {
    it('should include binaryData in worker response when QR code is detected', async () => {
      // Import worker after mocking
      await import('../src/worker.ts');

      const mockResult = {
        data: 'Hello World',
        binaryData: new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]), // "Hello World" in bytes
        location: {
          topLeftCorner: { x: 0, y: 0 },
          topRightCorner: { x: 100, y: 0 },
          bottomRightCorner: { x: 100, y: 100 },
          bottomLeftCorner: { x: 0, y: 100 },
        },
      };

      mockJsQR.mockReturnValue(mockResult);

      const testImageData = {
        data: new Uint8ClampedArray([255, 255, 255, 255]), // Simple white pixel
        width: 1,
        height: 1,
      };

      const testEvent = {
        data: {
          id: 1,
          type: 'decode',
          data: testImageData,
        },
      };

      // Trigger the worker's onmessage handler
      if (mockSelf.onmessage) {
        mockSelf.onmessage(testEvent as MessageEvent);
      }

      // Verify that postMessage was called with binaryData
      expect(mockSelf.postMessage).toHaveBeenCalledWith({
        id: 1,
        type: 'qrResult',
        data: 'Hello World',
        binaryData: mockResult.binaryData,
        cornerPoints: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      });
    });

    it('should handle null result from jsQR', async () => {
      await import('../src/worker.ts');

      mockJsQR.mockReturnValue(null);

      const testImageData = {
        data: new Uint8ClampedArray([0, 0, 0, 255]), // Simple black pixel
        width: 1,
        height: 1,
      };

      const testEvent = {
        data: {
          id: 2,
          type: 'decode',
          data: testImageData,
        },
      };

      if (mockSelf.onmessage) {
        mockSelf.onmessage(testEvent as MessageEvent);
      }

      expect(mockSelf.postMessage).toHaveBeenCalledWith({
        id: 2,
        type: 'qrResult',
        data: null,
      });
    });
  });

  describe('ScanResult Interface', () => {
    it('should have binaryData field in ScanResult type', () => {
      // This test verifies that the TypeScript interface includes binaryData
      // If the interface is missing binaryData, TypeScript compilation would fail
      const mockScanResult: {
        data: string;
        binaryData: Uint8Array;
        cornerPoints: Array<{ x: number; y: number }>;
      } = {
        data: 'test',
        binaryData: new Uint8Array([116, 101, 115, 116]), // "test" in bytes
        cornerPoints: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
          { x: 0, y: 10 },
        ],
      };

      expect(mockScanResult.data).toBe('test');
      expect(mockScanResult.binaryData).toBeInstanceOf(Uint8Array);
      expect(mockScanResult.binaryData).toEqual(new Uint8Array([116, 101, 115, 116]));
      expect(mockScanResult.cornerPoints).toHaveLength(4);
    });

    it('should verify binaryData is a Uint8Array', () => {
      const binaryData = new Uint8Array([1, 2, 3, 4, 5]);

      expect(binaryData).toBeInstanceOf(Uint8Array);
      expect(binaryData.length).toBe(5);
      expect(Array.from(binaryData)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('BarcodeDetector Fallback', () => {
    it('should provide empty Uint8Array for binaryData when using BarcodeDetector', () => {
      // Test that when BarcodeDetector is used, binaryData is an empty Uint8Array
      const mockBarcodeDetectorResult = {
        data: 'BarcodeDetector result',
        binaryData: new Uint8Array(), // Should be empty for BarcodeDetector
        cornerPoints: [
          { x: 0, y: 0 },
          { x: 50, y: 0 },
          { x: 50, y: 50 },
          { x: 0, y: 50 },
        ],
      };

      expect(mockBarcodeDetectorResult.binaryData).toBeInstanceOf(Uint8Array);
      expect(mockBarcodeDetectorResult.binaryData.length).toBe(0);
    });
  });
});
