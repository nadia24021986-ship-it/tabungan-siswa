import { useNavigate } from 'react-router-dom'
import VideoIntro from '@/components/VideoIntro'

export default function WelcomeScreen() {
  const navigate = useNavigate()

  return (
    <VideoIntro
      src="/videos/welcome.mp4"
      durationMs={2000}
      onFinish={() => navigate('/', { replace: true })}
    />
  )
}
