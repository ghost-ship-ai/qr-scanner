// Simple debug test to check our fix
const { JSDOM } = require('jsdom');

// Set up JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLVideoElement = dom.window.HTMLVideoElement;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

// Create shadow DOM setup
const shadowHost = document.createElement('div');
const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

// Create video element inside shadow DOM
const videoElement = document.createElement('video');
videoElement.id = 'test-video';
shadowRoot.appendChild(videoElement);

// Add shadow host to document
document.body.appendChild(shadowHost);

console.log('Before QrScanner:');
console.log('video.isConnected:', videoElement.isConnected);
console.log('video.parentElement:', videoElement.parentElement);
console.log('shadowRoot.contains(video):', shadowRoot.contains(videoElement));
console.log('document.body.contains(video):', document.body.contains(videoElement));

// Test our logic
if (!videoElement.isConnected) {
    console.log('Would move video to document.body');
    document.body.appendChild(videoElement);
} else {
    console.log('Video is connected, not moving');
}

console.log('After our logic:');
console.log('video.isConnected:', videoElement.isConnected);
console.log('video.parentElement:', videoElement.parentElement);
console.log('shadowRoot.contains(video):', shadowRoot.contains(videoElement));
console.log('document.body.contains(video):', document.body.contains(videoElement));
