import { createFileRoute } from '@tanstack/react-router'

export const metadata = { title: 'Home' }

export const Route = createFileRoute('/')({
  component: () => <div>home</div>,
})
