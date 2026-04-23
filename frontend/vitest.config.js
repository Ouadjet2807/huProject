import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Jest-like globals
    globals: true,
    // Environment
    environment: 'jsdom',
    // Include below if you want code coverage
    setupFiles: ["./src/setupTests.js"],
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'],
    },
  },
})