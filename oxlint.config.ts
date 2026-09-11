import { defineConfig } from 'oxlint'
import { oxlint } from './src/index.ts'

export default defineConfig({
  extends: [oxlint()],
  // Fixture and case files are deliberately broken.
  ignorePatterns: ['fixtures/**', 'test/cases/**'],
})
