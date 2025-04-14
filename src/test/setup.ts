import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock fetch globally
global.fetch = vi.fn();

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
}); 