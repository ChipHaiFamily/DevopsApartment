import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3000', 
    env: {
      USERNAME: 'admin@apt.com',
      PASSWORD: 'ict555'
    },

    testIsolation: false, 
  },
});
