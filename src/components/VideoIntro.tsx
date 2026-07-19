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

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
      <video
        src={src}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  )
}
