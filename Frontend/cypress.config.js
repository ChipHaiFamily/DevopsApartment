import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3000', // เปลี่ยนเป็น URL ของแอปคุณ
    env: {
      USERNAME: 'admin@apt.com',
      PASSWORD: 'ict555'
    },
  },
});
