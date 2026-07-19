import { useNavigate } from 'react-router-dom'
import VideoIntro from '@/components/VideoIntro'

/**
 * Ditampilkan sebentar (2 detik) setelah login berhasil, sebelum
 * masuk ke Dashboard. Setelah selesai, arahkan ke "/" -- HomeRedirect
 * di App.tsx yang akan menentukan tujuan akhir (Dashboard Guru atau
 * Dashboard Siswa) sesuai role, jadi tidak perlu duplikasi logic di sini.
 */
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

