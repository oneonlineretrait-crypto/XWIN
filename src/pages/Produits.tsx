import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { ProductIcon } from '../components/ProductIcon'
import { supabase } from '../lib/supabase'

type Product = {
  id: string
  type: 'strategie' | 'formation'
  title: string
  price: number
  description: string | null
  content_url: string | null
}

const typeLabels: Record<Product['type'], string> = {
  strategie: 'Stratégie',
  formation: 'Formation',
}

export function Produits() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products_public')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="xwin-page-bg min-h-screen">
      <NavBar />
      <main className="px-4 sm:px-6 py-8 sm:py-10 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl mb-6">Stratégies & formations</h1>

        {loading && <p className="text-muted">Chargement…</p>}
        {!loading && products.length === 0 && (
          <p className="text-muted">Aucun contenu pour le moment.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {products.map((p) => {
            const unlocked = p.content_url !== null
            return (
              <Link
                key={p.id}
                to={`/produits/${p.id}`}
                className="border border-white/[0.07] bg-surface/70 shadow-card rounded-2xl p-4 hover:border-signal/40 hover:bg-white/[0.03] hover:-translate-y-0.5 hover:shadow-glow transition-all flex flex-col items-start"
              >
                <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center mb-3">
                  <ProductIcon type={p.type} className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted/80 uppercase mb-1 tracking-wide">{typeLabels[p.type]}</p>
                <p className="font-medium text-sm leading-snug line-clamp-2 flex-1">{p.title}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  {unlocked ? (
                    <span className="text-xs bg-signal text-ink font-semibold px-2.5 py-1 rounded-full">Débloqué</span>
                  ) : (
                    <span className="text-xs bg-gold text-ink font-semibold px-2.5 py-1 rounded-full">{p.price} FCFA</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
