import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Props = {
  productId: string
  contentType: 'pdf' | 'video' | null
  watermark: string
}

export function ProtectedViewer({ productId, contentType, watermark }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function open() {
    setLoading(true)
    setError(null)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const { data, error } = await supabase.functions.invoke('get-product-file', {
      body: { productId },
      headers: { Authorization: `Bearer ${token}` },
    })
    setLoading(false)
    if (error || !data?.url) {
      setError("Impossible d'ouvrir le contenu pour le moment.")
      return
    }
    setUrl(data.url)
  }

  if (!url) {
    return (
      <div>
        <button
          onClick={open}
          disabled={loading}
          className="inline-block bg-signal text-ink font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-signal/90 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Ouverture…' : 'Accéder au contenu →'}
        </button>
        {error && <p className="text-alert text-xs mt-2">{error}</p>}
      </div>
    )
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-white/10 select-none"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: 'none' }}
    >
      {contentType === 'video' ? (
        <video src={url} controls controlsList="nodownload" className="w-full max-h-[70vh] bg-black" />
      ) : (
        <iframe src={url} className="w-full h-[70vh] bg-white" title="Contenu" />
      )}

      {/* Filigrane : discret mais suffisant pour tracer une fuite jusqu'au compte */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="text-white/10 font-semibold whitespace-nowrap"
          style={{ fontSize: '2.2rem', transform: 'rotate(-30deg)' }}
        >
          {watermark}
        </div>
      </div>
      <p className="text-[10px] text-muted/60 mt-1 px-1">
        Le lien expire après quelques minutes et ce contenu est personnel — merci de ne pas le partager.
      </p>
    </div>
  )
}
