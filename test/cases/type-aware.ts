export function label(value: string | undefined) {
  if (value) return value

  return 'none'
}

export function callUnknown(value: unknown) {
  return (value as any).run()
}
