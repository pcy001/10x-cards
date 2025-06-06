// Polyfill dla MessageChannel w środowisku Cloudflare Workers
export class MessageChannelPolyfill {
  constructor() {
    this.port1 = new MessagePortPolyfill();
    this.port2 = new MessagePortPolyfill();
    
    this.port1._otherPort = this.port2;
    this.port2._otherPort = this.port1;
  }
}

export class MessagePortPolyfill {
  constructor() {
    this._listeners = {};
    this._otherPort = null;
  }
  
  postMessage(data) {
    if (!this._otherPort) return;
    
    // Symulacja asynchronicznego dostarczania wiadomości
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
  
  start() {
    // No-op, included for API compatibility
  }
  
  close() {
    this._listeners = {};
    this._otherPort = null;
  }
}

// Globalny polyfill
if (typeof globalThis.MessageChannel === 'undefined') {
  globalThis.MessageChannel = MessageChannelPolyfill;
}

if (typeof globalThis.MessagePort === 'undefined') {
  globalThis.MessagePort = MessagePortPolyfill;
} 