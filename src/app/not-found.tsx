import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#F6F6F6]">
      <div className="text-center px-4 max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-bold text-[#0066CC]">404</span>
        </div>
        <h1 className="text-2xl font-bold text-[#242424] mb-3">
          Page non trouvée
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button className="bg-[#0066CC] hover:bg-[#0055AA] text-white">
              <Home className="h-4 w-4 mr-2" />
              Retour à l&apos;accueil
            </Button>
          </Link>
          <Link href="/annuaire">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voir l&apos;annuaire
            </Button>
          </Link>
        </div>
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground/40">
          <Building2 className="h-5 w-5" />
          <span className="text-sm">Pebiss - Annuaire Professionnel de Guinée-Bissau</span>
        </div>
      </div>
    </div>
  )
}
