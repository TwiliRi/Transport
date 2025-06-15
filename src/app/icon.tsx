import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default async function Icon() {
  // Читаем иконку грузовика из папки public
  const iconPath = join(process.cwd(), 'public', 'free-icon-delivery-truck-310215.png')
  const iconBuffer = await readFile(iconPath)
  const iconBase64 = `data:image/png;base64,${iconBuffer.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '30%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
        }}
      >
        <img
          src={iconBase64}
          alt="Грузовик"
          width="32"
          height="32"
          style={{
            objectFit: 'contain',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}