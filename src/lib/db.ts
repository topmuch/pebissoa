import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
  })
}

/**
 * Client Prisma paresseux (lazy).
 *
 * Pourquoi un Proxy ? Pendant `next build`, tous les modules server sont
 * évalués — y compris ceux des pages `force-dynamic`. Une instanciation
 * directe de PrismaClient à l'import (ancienne version de ce fichier)
 * peut faire échouer le build dans certains environnements (Docker alpine,
 * base SQLite absente à l'étape de build, moteur non résolu).
 *
 * Le Proxy crée l'instance réelle au premier accès effectif — c'est-à-dire
 * uniquement au runtime, jamais pendant le build — tout en restant
 * totalement transparent pour les call-sites (`db.business.findUnique(...)`,
 * `db.$transaction(...)`, etc.).
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createClient()
    }
    const client = globalForPrisma.prisma
    const value = Reflect.get(client as object, prop, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

if (process.env.NODE_ENV !== 'production') {
  // Même comportement qu'avant : l'instance est mise en cache au premier
  // accès (dans le Proxy), pas à l'import.
}
