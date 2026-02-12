import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Row,
  Column,
  Link,
  Img,
} from '@react-email/components';

interface BookingEmailProps {
  customerName: string;
  date: string;
  time: string;
  services: string[];
  totalPrice: number;
  staffName: string;
  businessName?: string;
  businessAddress?: string;
  cancelLink?: string;
  logoUrl?: string,
  businessMap?: string 
}

export const BookingEmail = ({
  customerName = 'Cliente',
  date,
  time,
  services = [],
  totalPrice,
  staffName,
  businessName,
  businessAddress,
  cancelLink = '#',
  businessMap,
  logoUrl,
}: BookingEmailProps) => {
  
  const previewText = `Reserva confirmada en ${businessName}`;

  return (
    <Html>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: '#111827', // Gris muy oscuro
                accent: '#d97706', // Dorado Barbería
                offwhite: '#f3f4f6',
                surface: '#ffffff',
                text: '#374151',
                textLight: '#6b7280',
              },
            },
          },
        }}
      >
        <Head />
        <Preview>{previewText}</Preview>
        
        <Body className="bg-offwhite my-auto mx-auto font-sans">
          <Container className="my-10 mx-auto w-116.25">
            
            {/* 1. BARRA DE MARCA SUPERIOR */}
            <Section className="bg-brand h-2 w-full rounded-t-lg"></Section>

            {/* 2. CONTENEDOR PRINCIPAL */}
            <Section className="bg-surface border border-gray-200 rounded-b-lg shadow-md p-8">
                
                {/* CABECERA */}
                <Section className="text-center mb-6">
                    <Img src={logoUrl} width="100" height="100" alt="Logo" className="mx-auto mb-4 rounded-md border border-white/20" />
                    <Heading className="text-brand text-[20px] font-bold text-center uppercase tracking-wider m-0">
                        {businessName}
                    </Heading>
                    <Text className="text-accent text-[12px] font-bold uppercase tracking-widest mt-1 m-0">
                        Reserva Confirmada
                    </Text>
                </Section>

                <Hr className="border-gray-100 my-6" />

                {/* SALUDO */}
                <Text className="text-text text-[16px] leading-6 text-center mt-0 mb-6">
                    Hola <strong>{customerName}</strong>,<br/>
                    Tu cita ha sido confirmada correctamente.
                </Text>

                {/* GRID DE FECHA Y HORA (Estilo Ticket) */}
                <Section className="mb-6">
                    <Row>
                        <Column className="w-1/2 pr-2">
                            <Section className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                                <Text className="text-textLight text-[10px] uppercase font-bold tracking-wider m-0 mb-1">
                                    Fecha
                                </Text>
                                <Text className="text-brand text-lg font-bold m-0">
                                    {date}
                                </Text>
                            </Section>
                        </Column>
                        <Column className="w-1/2 pl-2">
                             <Section className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                                <Text className="text-textLight text-[10px] uppercase font-bold tracking-wider m-0 mb-1">
                                    Hora
                                </Text>
                                <Text className="text-accent text-lg font-bold m-0">
                                    {time}
                                </Text>
                            </Section>
                        </Column>
                    </Row>
                </Section>

                {/* LISTA DE SERVICIOS (Estilo Factura) */}
                <Section className="bg-gray-50 rounded-lg p-6 border border-gray-100 mb-6">
                    <Text className="text-textLight text-[10px] uppercase font-bold tracking-wider mb-4 border-b border-gray-200 pb-2">
                        Resumen del servicio
                    </Text>
                    
                    {services.map((service, index) => (
                        <Row key={index} className="mb-2">
                            <Column>
                                <Text className="m-0 text-brand text-sm font-medium">
                                    {service}
                                </Text>
                            </Column>
                        </Row>
                    ))}

                    <Hr className="border-gray-200 border-dashed my-4" />

                    <Row>
                        <Column>
                            <Text className="m-0 text-textLight text-xs">Profesional</Text>
                            <Text className="m-0 text-brand text-sm font-semibold">{staffName}</Text>
                        </Column>
                        <Column>
                            <Text className="m-0 text-textLight text-xs text-right">Total estimado</Text>
                            <Text className="m-0 text-brand text-sm font-bold text-right">{totalPrice}€</Text>
                        </Column>
                    </Row>
                </Section>

                {/* UBICACIÓN */}
                <Section className="text-center mb-2">
                     <Text className="text-textLight text-xs m-0 mb-1">Ubicación</Text>
                     <Text className="text-brand text-sm font-medium m-0 mb-3">{businessAddress}</Text>
                     
                     <Link 
                        href={businessMap} //* COLOCAR GOOGLE MAPS
                        className="text-accent text-xs font-bold underline"
                     >
                        Ver en Google Maps →
                     </Link>
                </Section>

            </Section>

            {/* FOOTER */}
            <Section className="text-center mt-6">
               <Text className="text-textLight text-[12px] leading-relaxed mb-4">
                 ¿Cambio de planes?
               </Text>
               <Link href={cancelLink} className="text-red-500 text-xs font-medium hover:text-red-700 underline transition-colors">
                  Cancelar mi cita
               </Link>
               
               <Text className="text-gray-300 text-[10px] mt-8">
                 © {new Date().getFullYear()} {businessName}.
               </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BookingEmail;