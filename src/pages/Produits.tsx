import { useEffect, useState } from 'react'
import { NavBar } from '../components/NavBar'
import { supabase } from '../lib/supabase'
import { startCheckout } from '../lib/checkout'

type Product = {
  id: string
  type: 'strategie' | 'formation'
  title: string
  description: string | null
  price: number
  content_url: string | null
}

export function Produits() {
  const [products, setProducts] = useState<Product[]>([])
  const [payingId, setPayingId] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('products_public').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setProducts((data as Product[]) ?? [])
    })
  }, [])

  async function handleUnlock(id: string) {
    setPayingId(id)
    try {
      await startCheckout({ item_type: 'product', item_id: id })
    } catch (e) {
      alert((e as Error).message)
      setPayingId(null)
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="px-6 py-10 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl mb-8">Stratégies & formations</h1>

        <div className="grid gap-4">
          {products.map((p) => (
            <div key={p.id} className="border border-white/10 rounded-lg p-5">
              <span className="text-xs text-paper/50 uppercase">{p.type}</span>
              <h2 className="font-medium text-lg mb-1">{p.title}</h2>
              {p.description && <p className="text-paper/60 text-sm mb-4">{p.description}</p>}

              {p.content_url ? (
                <a href={p.content_url} target="_blank" rel="noreferrer" className="text-signal text-sm">
                  Accéder au contenu →
                </a>
              ) : (
                <button
                  onClick={() => handleUnlock(p.id)}
                  disabled={payingId === p.id}
                  className="bg-signal text-white px-4 py-2 rounded-md text-sm hover:bg-signal/90 disabled:opacity-50"
                >
                  {payingId === p.id ? 'Redirection…' : `Acheter — ${p.price} FCFA`}
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
