// Script to inject polyfill into Cloudflare Worker
import fs from 'fs';
import path from 'path';

const workerPath = path.resolve(process.cwd(), 'dist/_worker.js');

// Sprawdź czy plik workera istnieje
if (fs.existsSync(workerPath)) {
  console.log('Found worker file at', workerPath);
  
  // Odczytaj zawartość pliku
  let workerContent = fs.readFileSync(workerPath, 'utf8');
  
  // Wstrzyknij polyfill na początek pliku
  const polyfill = `
// MessageChannel polyfill for Cloudflare Workers
if (typeof globalThis.MessageChannel === 'undefined') {
  class MessagePortPolyfill {
    constructor() {
      this._listeners = {};
      this._otherPort = null;
    }
    
    postMessage(data) {
      if (!this._otherPort) return;
      
      setTimeout(() => {
        const event = { data, source: this };
        this._otherPort._dispatchMessage(event);
      }, 0);
    }
    
    addEventListener(type, listener) {
      if (type !== 'message') return;
      
      if (!this._listeners.message) {
        this._listeners.message = [];
      }
      
      this._listeners.message.push(listener);
    }
    
    removeEventListener(type, listener) {
      if (type !== 'message' || !this._listeners.message) return;
      
      const index = this._listeners.message.indexOf(listener);
      if (index !== -1) {
        this._listeners.message.splice(index, 1);
      }
    }
    
    _dispatchMessage(event) {
      if (!this._listeners.message) return;
      
      for (const listener of this._listeners.message) {
        listener(event);
      }
    }
    
    start() {}
    
    close() {
      this._listeners = {};
      this._otherPort = null;
    }
  }

  class MessageChannelPolyfill {
    constructor() {
      this.port1 = new MessagePortPolyfill();
      this.port2 = new MessagePortPolyfill();
      
      this.port1._otherPort = this.port2;
      this.port2._otherPort = this.port1;
    }
  }

  globalThis.MessageChannel = MessageChannelPolyfill;
  globalThis.MessagePort = MessagePortPolyfill;
  console.log('MessageChannel polyfill installed');
}
`;
  
  // Dodaj polyfill na początku pliku
  workerContent = polyfill + workerContent;
  
  // Zapisz zmodyfikowany plik
  fs.writeFileSync(workerPath, workerContent);
  console.log('Polyfill injected into', workerPath);
} else {
  console.log('Worker file not found at', workerPath);
} 