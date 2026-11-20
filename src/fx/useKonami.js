import { useEffect } from 'react'

const SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

/** Calls `onUnlock` when the Konami code is typed. */
export default function useKonami(onUnlock) {
  useEffect(() => {
    let pos = 0
    const onKey = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      pos = key === SEQ[pos] ? pos + 1 : key === SEQ[0] ? 1 : 0
      if (pos === SEQ.length) {
        pos = 0
        onUnlock()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onUnlock])
}
