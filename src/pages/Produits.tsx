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
    <div className="min-h-screen">
      <NavBar />
      <main className="px-4 sm:px-6 py-8 sm:py-10 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl mb-6">Stratégies & formations</h1>

        {loading && <p className="text-paper/50">Chargement…</p>}
        {!loading && products.length === 0 && (
          <p className="text-paper/50">Aucun contenu pour le moment.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {products.map((p) => {
            const unlocked = p.content_url !== null
            return (
              <Link
                key={p.id}
                to={`/produits/${p.id}`}
                className="border border-white/10 rounded-lg p-4 hover:border-white/25 hover:bg-white/[0.03] transition-colors flex flex-col items-start"
              >
                <div className="w-10 h-10 rounded-md bg-signal/15 text-signal flex items-center justify-center mb-3">
                  <ProductIcon type={p.type} className="w-5 h-5" />
                </div>
                <p className="text-xs text-paper/40 uppercase mb-1">{typeLabels[p.type]}</p>
                <p className="font-medium text-sm leading-snug line-clamp-2 flex-1">{p.title}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  {unlocked ? (
                    <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded">Débloqué</span>
                  ) : (
                    <span className="text-xs bg-white/10 text-paper/70 px-2 py-0.5 rounded">{p.price} FCFA</span>
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
