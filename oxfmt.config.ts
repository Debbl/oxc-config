import { oxfmt } from './src/index.ts'

export default oxfmt({
  // Fixture and case files are deliberately broken.
  ignorePatterns: ['fixtures/**', 'test/cases/**', 'test/__snapshots__/**'],
})
