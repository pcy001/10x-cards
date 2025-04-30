// Script to inject polyfill into Cloudflare Worker
import fs from 'fs';
import path from 'path';

const workerDir = path.resolve(process.cwd(), 'dist/_worker.js');
const mainWorkerPath = path.resolve(workerDir, 'index.js');
const shims = path.resolve(workerDir, 'shims.js');

// Sprawdź czy katalog workera istnieje
if (fs.existsSync(workerDir) && fs.statSync(workerDir).isDirectory()) {
  console.log('Found worker directory at', workerDir);
  
  // Tworzymy plik shims.js z polyfillami
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

export {};
`;
  
  // Zapisz plik shims.js w katalogu workera
  fs.writeFileSync(shims, polyfill);
  console.log('Created shims.js with MessageChannel polyfill');
  
  // Znajdź główny plik workera i dodaj import do shims na początku
  if (fs.existsSync(mainWorkerPath)) {
    let mainContent = fs.readFileSync(mainWorkerPath, 'utf8');
    const importStatement = `import './shims.js';\n`;
    
    if (!mainContent.includes('./shims.js')) {
      mainContent = importStatement + mainContent;
      fs.writeFileSync(mainWorkerPath, mainContent);
      console.log('Added shims import to', mainWorkerPath);
    } else {
      console.log('Shims import already exists in', mainWorkerPath);
    }
  } else {
    // Przeszukaj katalog _worker.js, aby znaleźć główny plik
    const files = fs.readdirSync(workerDir);
    console.log('Worker directory contains:', files);
    
    // Szukaj plików, które mogą być głównym plikiem workera
    const mainFiles = ['index.js', 'main.js', 'worker.js', 'entry.js'];
    
    for (const file of mainFiles) {
      const filePath = path.resolve(workerDir, file);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        console.log('Found potential main worker file:', filePath);
        let content = fs.readFileSync(filePath, 'utf8');
        const importStatement = `import './shims.js';\n`;
        
        if (!content.includes('./shims.js')) {
          content = importStatement + content;
          fs.writeFileSync(filePath, content);
          console.log('Added shims import to', filePath);
          break;
        }
      }
    }
  }
} else if (fs.existsSync(workerDir) && fs.statSync(workerDir).isFile()) {
  // Stare podejście dla pliku _worker.js
  console.log('Found worker file at', workerDir);
  
  // Odczytaj zawartość pliku
  let workerContent = fs.readFileSync(workerDir, 'utf8');
  
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
  fs.writeFileSync(workerDir, workerContent);
  console.log('Polyfill injected into', workerDir);
} else {
  console.log('Worker entry point not found at', workerDir);
  
  // Sprawdź całą strukturę katalogu dist
  console.log('Listing dist directory structure:');
  const distFiles = fs.readdirSync(path.resolve(process.cwd(), 'dist'));
  console.log(distFiles);
} 