import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { format } from 'date-fns'
import { helper } from '../helper'
import { local } from './local'
import './styles.css'
import type { ReactNode } from 'react'

import type { Helper } from '../helper'
import type { Route } from './routes'

export function build(node: ReactNode, route: Route, helper: Helper) {
	return [
		join('a', 'b'),
		format(new Date(), 'yyyy'),
		readFile,
		local,
		helper,
		node,
		route,
	]
}
