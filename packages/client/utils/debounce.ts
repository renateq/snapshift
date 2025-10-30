export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
) {
  let timeoutId: ReturnType<typeof setTimeout>

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }

  // optional: allow manual canceling
  debounced.cancel = () => clearTimeout(timeoutId)

  return debounced
}
