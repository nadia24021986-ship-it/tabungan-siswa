import { useEffect, useState } from 'react'

interface Props {
  src: string
  durationMs?: number
  onFinish: () => void
}

export default function VideoIntro({ src, durationMs = 2000, onFinish }: Props) {
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!finished) {
        setFinished(true)
        onFinish()
      }
    }, durationMs)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs])

  function handleSkip() {
    if (finished) return
    setFinished(true)
    onFinish()
  }

  return (
    <div
      className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
      onClick={handleSkip}
    >
      <video
        src={src}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <span className="absolute bottom-6 right-6 text-white/60 text-xs">
        Tap untuk lewati
      </span>
    </div>
  )
}
