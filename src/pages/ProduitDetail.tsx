import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { ProductIcon } from '../components/ProductIcon'
import { supabase } from '../lib/supabase'
import { startCheckout } from '../lib/checkout'

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

export function ProduitDetail() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (!productId) return
    supabase
      .from('products_public')
      .select('*')
      .eq('id', productId)
      .single()
      .then(({ data }) => {
        setProduct((data as Product) ?? null)
        setLoading(false)
      })
  }, [productId])

  async function handleUnlock() {
    if (!product) return
    setPaying(true)
    try {
      await startCheckout({ item_type: 'product', item_id: product.id })
    } catch {
      navigate('/paiement-indisponible')
    }
  }

  const unlocked = product?.content_url !== null && product?.content_url !== undefined

  return (
    <div className="xwin-page-bg min-h-screen">
      <NavBar />
      <main className="px-4 sm:px-6 py-8 sm:py-10 max-w-2xl mx-auto">
        <Link to="/produits" className="text-sm text-muted hover:text-paper/80 mb-6 inline-block">
          ← Stratégies & formations
        </Link>

        {loading && <p className="text-muted">Chargement…</p>}
        {!loading && !product && <p className="text-muted">Contenu introuvable.</p>}

        {product && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <ProductIcon type={product.type} className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted/80 uppercase tracking-wide">{typeLabels[product.type]}</p>
                <h1 className="font-display text-2xl">{product.title}</h1>
              </div>
            </div>

            {unlocked ? (
              <div className="border border-white/[0.07] bg-surface/70 shadow-card rounded-2xl p-6">
                {product.description && (
                  <p className="text-paper/70 text-sm mb-5 leading-relaxed">{product.description}</p>
                )}
                <a
                  href={product.content_url!}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-signal text-ink font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-signal/90 active:scale-95 transition-all"
                >
                  Accéder au contenu →
                </a>
              </div>
            ) : (
              <div className="border border-white/[0.07] bg-surface/70 shadow-card rounded-2xl p-8 text-center">
                <p className="text-muted text-sm mb-4">
                  Le contenu de cette {typeLabels[product.type].toLowerCase()} est réservé aux acheteurs.
                </p>
                <button
                  onClick={handleUnlock}
                  disabled={paying}
                  className="bg-gold text-ink font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-gold/90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {paying ? 'Redirection…' : `Acheter — ${product.price} FCFA`}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
