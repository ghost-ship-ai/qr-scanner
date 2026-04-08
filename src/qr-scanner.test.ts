import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the worker import
vi.mock('./qr-scanner-worker.min.js', () => ({
  createWorker: vi.fn(() => ({
    postMessage: vi.fn(),
    terminate: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
}));

// Mock BarcodeDetector
global.BarcodeDetector = vi.fn().mockImplementation(() => ({
  detect: vi.fn().mockResolvedValue([]),
  getSupportedFormats: vi.fn().mockResolvedValue(['qr_code']),
}));

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getVideoTracks: () => [{
        getSettings: () => ({}),
        applyConstraints: vi.fn().mockResolvedValue(undefined),
      }],
    }),
    enumerateDevices: vi.fn().mockResolvedValue([]),
  },
});

// Import QrScanner after mocks are set up
const QrScanner = await import('./qr-scanner').then(m => m.default);

describe('QrScanner Shadow DOM Support', () => {
  let shadowHost: HTMLElement;
  let shadowRoot: ShadowRoot;
  let videoElement: HTMLVideoElement;

  beforeEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';

    // Create a shadow DOM setup
    shadowHost = document.createElement('div');
    shadowRoot = shadowHost.attachShadow({ mode: 'open' });

    // Create video element inside shadow DOM
    videoElement = document.createElement('video');
    videoElement.id = 'test-video';
    shadowRoot.appendChild(videoElement);

    // Add shadow host to document
    document.body.appendChild(shadowHost);
  });

  it('should keep video element in shadow DOM when creating QrScanner', () => {
    // Verify initial setup
    expect(shadowRoot.contains(videoElement)).toBe(true);
    expect(document.body.contains(videoElement)).toBe(false);
    expect(videoElement.isConnected).toBe(true);

    // Create QrScanner instance
    const mockOnDecode = vi.fn();
    new QrScanner(videoElement, mockOnDecode, {
      returnDetailedScanResult: true,
    });

    // Video should still be in shadow DOM, not moved to document.body
    expect(shadowRoot.contains(videoElement)).toBe(true);
    expect(document.body.contains(videoElement)).toBe(false);
    expect(videoElement.parentNode).toBe(shadowRoot);
  });

  it('should move disconnected video element to document.body', () => {
    // Remove video from shadow DOM to make it disconnected
    shadowRoot.removeChild(videoElement);

    // Verify video is disconnected
    expect(videoElement.isConnected).toBe(false);
    expect(videoElement.parentElement).toBe(null);

    // Create QrScanner instance
    const mockOnDecode = vi.fn();
    new QrScanner(videoElement, mockOnDecode, {
      returnDetailedScanResult: true,
    });

    // Video should now be moved to document.body since it was disconnected
    expect(document.body.contains(videoElement)).toBe(true);
    expect(videoElement.parentElement).toBe(document.body);
  });

  it('should keep video element in regular DOM when already connected', () => {
    // Create video element in regular DOM
    const regularVideo = document.createElement('video');
    regularVideo.id = 'regular-video';
    const container = document.createElement('div');
    container.appendChild(regularVideo);
    document.body.appendChild(container);

    // Verify initial setup
    expect(container.contains(regularVideo)).toBe(true);
    expect(regularVideo.isConnected).toBe(true);

    // Create QrScanner instance
    const mockOnDecode = vi.fn();
    new QrScanner(regularVideo, mockOnDecode, {
      returnDetailedScanResult: true,
    });

    // Video should stay in its original container
    expect(container.contains(regularVideo)).toBe(true);
    expect(regularVideo.parentElement).toBe(container);
  });

  it('should work with nested shadow DOM', () => {
    // Create nested shadow DOM
    const innerHost = document.createElement('div');
    const innerShadowRoot = innerHost.attachShadow({ mode: 'open' });

    const nestedVideo = document.createElement('video');
    nestedVideo.id = 'nested-video';
    innerShadowRoot.appendChild(nestedVideo);

    shadowRoot.appendChild(innerHost);

    // Verify nested setup
    expect(innerShadowRoot.contains(nestedVideo)).toBe(true);
    expect(nestedVideo.isConnected).toBe(true);

    // Create QrScanner instance
    const mockOnDecode = vi.fn();
    new QrScanner(nestedVideo, mockOnDecode, {
      returnDetailedScanResult: true,
    });

    // Video should stay in nested shadow DOM
    expect(innerShadowRoot.contains(nestedVideo)).toBe(true);
    expect(nestedVideo.parentNode).toBe(innerShadowRoot);
    expect(document.body.contains(nestedVideo)).toBe(false);
  });
});

describe('QrScanner Web Component Integration', () => {
  it('should work correctly when used inside a custom element', () => {
    // Define a custom element similar to the reproduction case
    class ScanningWindow extends HTMLElement {
      declare shadowRoot: ShadowRoot;
      video!: HTMLVideoElement;
      qrScanner!: QrScanner;

      constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
          <style>
            :host { display: block; height: 100%; width: 100%; }
            #camera { width: 100%; height: 100%; border: 1px solid black; }
          </style>
          <video id="camera"></video>
        `;
      }

      connectedCallback() {
        this.video = this.shadowRoot.querySelector('#camera')!;
        const mockOnDecode = vi.fn();
        this.qrScanner = new QrScanner(this.video, mockOnDecode, {
          returnDetailedScanResult: true,
        });
      }
    }

    // Register the custom element
    if (!customElements.get('scanning-window')) {
      customElements.define('scanning-window', ScanningWindow);
    }

    // Create and add the custom element to DOM
    const scanningWindow = document.createElement('scanning-window') as ScanningWindow;
    document.body.appendChild(scanningWindow);

    // Wait for the element to be connected and then call connectedCallback manually
    // (since JSDOM doesn't automatically call lifecycle methods)
    scanningWindow.connectedCallback();

    // Video should remain in the shadow DOM
    expect(scanningWindow.shadowRoot.contains(scanningWindow.video)).toBe(true);
    expect(document.body.contains(scanningWindow.video)).toBe(false);
    expect(scanningWindow.video.parentNode).toBe(scanningWindow.shadowRoot);
  });
});
