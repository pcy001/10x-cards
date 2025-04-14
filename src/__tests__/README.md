# Tests for X10 Cards

This directory contains unit tests for the X10 Cards application. Tests are written using [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## Test Structure

- `services/` - Tests for service modules
  - `flashcard.service.test.ts` - Tests for flashcard-related services
  - `learning.service.test.ts` - Tests for learning session services

## Running Tests

To run all tests:

```bash
npm test
# or
npx vitest run
```

To run tests in watch mode (for development):

```bash
npx vitest
# or 
npx vitest watch
```

To run tests with UI:

```bash
npx vitest --ui
```

To run specific tests:

```bash
# Run specific test file
npx vitest run src/__tests__/services/flashcard.service.test.ts

# Run tests that match a specific pattern
npx vitest -t "should save accepted flashcards"
```

## Coverage

To run tests with coverage:

```bash
npx vitest run --coverage
```

Coverage reports will be generated in the `coverage` directory.

## Writing Tests

When writing tests, follow these guidelines:

1. Use the Arrange-Act-Assert pattern
2. Mock external dependencies
3. Test both success and error cases
4. Keep tests focused and small
5. Use descriptive test names

Example:

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('MyFunction', () => {
  it('should return expected output for valid input', () => {
    // Arrange
    const input = { /* test data */ };
    const expectedOutput = { /* expected result */ };
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toEqual(expectedOutput);
  });
  
  it('should throw error for invalid input', () => {
    // Arrange
    const invalidInput = { /* invalid test data */ };
    
    // Act & Assert
    expect(() => myFunction(invalidInput)).toThrow('Expected error message');
  });
}); 