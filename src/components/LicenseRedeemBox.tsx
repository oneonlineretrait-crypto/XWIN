import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Props = {
  itemType: 'montante' | 'pronostic' | 'product'
  itemId: string
  onUnlocked: () => void
}

const itemLabels: Record<Props['itemType'], string> = {
  montante: 'cette montante',
  pronostic: 'ce pronostic',
  product: 'ce produit',
}

export function LicenseRedeemBox({ itemType, itemId, onUnlocked }: Props) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const { data, error } = await supabase.rpc('redeem_license', { p_code: code.trim() })
    setBusy(false)

    if (error) {
      setMessage({ text: error.message, ok: false })
      return
    }
    const result = data as string
    if (!result.startsWith('ok:')) {
      setMessage({ text: result, ok: false })
      return
    }

    const parts = result.split(':')
    if (parts[1] === 'vip') {
      setMessage({ text: `Compte passé VIP pour ${parts[2]} jours. Si ce contenu est inclus dans le VIP, il est débloqué.`, ok: true })
      onUnlocked()
    } else if (parts[1] === 'item' && parts[2] === itemType && parts[3] === itemId) {
      setMessage({ text: `Débloqué ! Le contenu s'affiche ci-dessous.`, ok: true })
      setCode('')
      onUnlocked()
    } else {
      setMessage({
        text: `Code activé, mais pour un autre contenu (pas ${itemLabels[itemType]}). Va sur la bonne page pour y accéder.`,
        ok: true,
      })
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-start">
      <div className="flex-1">
        <input
          required
          placeholder="Code de licence"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm tracking-wider font-mono focus:outline-none focus:border-gold"
        />
        {message && <p className={`text-xs mt-1 ${message.ok ? 'text-signal' : 'text-alert'}`}>{message.text}</p>}
      </div>
      <button
        disabled={busy}
        className="bg-gold text-ink font-semibold px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50"
      >
        {busy ? '…' : 'Activer'}
      </button>
    </form>
  )
}
