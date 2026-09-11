import type { Route } from './routes'
import './styles.css'
import { format } from 'date-fns'
import type { ReactNode } from 'react'
import { join } from 'node:path'
import { helper } from '../helper'
import { local } from './local'
import type { Helper } from '../helper'
import { readFile } from 'node:fs/promises'

export function build(node: ReactNode, route: Route, helper: Helper) {
  return [join('a', 'b'), format(new Date(), 'yyyy'), readFile, local, helper, node, route]
}
