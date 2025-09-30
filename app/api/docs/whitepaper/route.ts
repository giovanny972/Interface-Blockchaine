import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Chemin vers le fichier markdown dans le dossier docs
    const whitepaperPath = path.join(process.cwd(), 'docs', 'whitepaper.md')
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(whitepaperPath)) {
      return NextResponse.json(
        { error: 'Fichier whitepaper.md non trouvé' },
        { status: 404 }
      )
    }
    
    // Lire le contenu du fichier
    const content = fs.readFileSync(whitepaperPath, 'utf-8')
    
    // Retourner le contenu avec les headers appropriés
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600' // Cache pendant 1 heure
      }
    })
  } catch (error) {
    console.error('Erreur lors de la lecture du whitepaper:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la lecture du fichier' },
      { status: 500 }
    )
  }
}