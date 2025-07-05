import { useAppStore } from "@/lib/store"
import { getCircadianInfo } from "@/lib/circadian"

export function useCircadianPhase() {
  const currentTime = useAppStore((s) => s.currentTime)
  return getCircadianInfo(currentTime)
} 