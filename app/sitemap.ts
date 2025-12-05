import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sirius.network'

  const routes = [
    '',
    '/capsules',
    '/capsules/create',
    '/rwa',
    '/dashboard',
    '/marketplace',
    '/validators',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/capsules' || route === '/rwa' ? 0.9 : 0.8,
  })) as MetadataRoute.Sitemap
}
