import type { Metadata } from 'next';
import { shareMeta } from '@/lib/seo';
import { SITE_BASE_URL } from '@/lib/site';

export function publicMetadata(page: { title: string; description: string }, path: string): Metadata {
  return {
    ...page,
    ...shareMeta({ ...page, path }),
    alternates: { canonical: `${SITE_BASE_URL}${path}` },
  };
}
