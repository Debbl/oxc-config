import { readFileSync } from 'fs'

var contents = readFileSync('notes.txt', 'utf8')

export function report(name: string) {
  if (name == 'release') {
    console.log('reporting on ' + name)
  }

  throw 'name did not match'
}

export { contents }
