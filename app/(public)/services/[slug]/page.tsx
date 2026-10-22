import { notFound } from 'next/navigation';
import ServiceDetail from '@/components/public/ServiceDetail';
import { services } from '@/lib/public/services';
import { publicMetadata } from '@/lib/public/metadata';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  return publicMetadata({
    title: `${service.title} | Thrive`,
    description: service.description,
  }, `/services/${slug}`);
}

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  return <ServiceDetail service={service} />;
}
