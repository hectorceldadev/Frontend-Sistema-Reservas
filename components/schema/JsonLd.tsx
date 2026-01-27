import { SITE_CONFIG } from '@/config';

const JsonLd = () => {

  const { hero, contacto, schemaInfo, metadataInfo } = SITE_CONFIG;

  const schema = {
    '@context': 'https://schema.org',
    '@type': schemaInfo.businessType,
    name: metadataInfo.title.default, 
    description: hero.desc,
    image: metadataInfo.openGraph.images.map(img => img.url), // Usamos las imágenes de OG
    telephone: contacto.info.contacto.telefono,
    url: metadataInfo.siteUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: schemaInfo.address.street,
      addressLocality: schemaInfo.address.city,
      postalCode: schemaInfo.address.postalCode,
      addressCountry: schemaInfo.address.country
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: schemaInfo.geo.latitude,
      longitude: schemaInfo.geo.longitude
    },
    areaServed: schemaInfo.areaServed.map(city => ({
        '@type': 'City',
        'name': city
    })),
    openingHoursSpecification: schemaInfo.openingHours.map(slot => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes
    })),
    priceRange: schemaInfo.priceRange,
    // Añadimos "SameAs" para conectar con redes sociales (SEO Local potente)
    sameAs: [
        contacto.info.contacto.links.instagram.href,
        // Si tuvieras Facebook o Twitter en el config, añádelos aquí
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default JsonLd;