'use client'

import FaceBlurImage from '@/components/FaceBlurImage'
import { usePrivacySettings } from '@/hooks/useFaceBlur'

interface PhotoWithBlurProps {
  src: string
  alt: string
  /** If provided, overrides the user's full blur setting */
  fullBlur?: boolean
}

/**
 * Reads the user's face-blur preference from localStorage
 * and passes it to FaceBlurImage.
 */
export default function PhotoWithBlur({ src, alt, fullBlur: overrideFullBlur }: PhotoWithBlurProps) {
  const { faceBlur, fullBlur: settingFullBlur } = usePrivacySettings()
  const fullBlur = overrideFullBlur !== undefined ? overrideFullBlur : settingFullBlur
  return <FaceBlurImage src={src} alt={alt} blurFaces={faceBlur} fullBlur={fullBlur} />
}
