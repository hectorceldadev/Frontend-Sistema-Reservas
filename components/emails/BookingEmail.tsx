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
  logoUrl?: string;
  businessMap?: string;
}

export const BookingEmail = ({
  customerName = 'Cliente',
  date = 'Fecha no definida',
  time = '00:00',
  services = [],
  totalPrice = 0,
  staffName = 'El Equipo',
  businessName = 'Nuestro Local',
  businessAddress = 'Dirección no disponible',
  cancelLink = '#',
  businessMap = '#',
  logoUrl,
}: BookingEmailProps) => {
  
  const previewText = `¡Reserva confirmada en ${businessName}!`;

  return (
    <Html>
      {/* 1. EL TAILWIND DEBE ENVOLVER AL HEAD PARA QUE FUNCIONE EL HOVER */}
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                bgBase: '#09090b',    // zinc-950
                bgCard: '#18181b',    // zinc-900
                borderSubtle: '#27272a', // zinc-800
                textMain: '#fafafa',  // zinc-50
                textMuted: '#a1a1aa', // zinc-400
                brand: '#eab308',     // yellow-500
                brandBg: '#422006',   // yellow-950/50 aprox
                success: '#10b981'
              },
            },
          },
        }}
      >
        <Head />
        <Preview>{previewText}</Preview>
        
        <Body className="bg-bgBase my-auto mx-auto font-sans px-4 py-10">
          
          <Container className="bg-bgCard border border-solid border-borderSubtle rounded-2xl mx-auto max-w-[500px] overflow-hidden shadow-2xl">
            
            {/* CABECERA DEL NEGOCIO */}
            <Section className="bg-bgBase border-b border-solid border-borderSubtle py-6 px-8 text-center">
              {logoUrl ? (
                  <Img src={logoUrl} width="100" height="100" alt="Logo" className="mx-auto rounded-xl border border-white/10" />
              ) : (
                  <Heading className="text-textMain text-2xl font-bold uppercase tracking-wider m-0">
                      {businessName}
                  </Heading>
              )}
            </Section>

            {/* CONTENIDO PRINCIPAL */}
            <Section className="px-8 py-8">
              
              {/* ETIQUETA DE ESTADO */}
              <Section className="text-center mb-6">
                <span className="bg-success/10 border border-solid border-success text-success text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Reserva Confirmada
                </span>
              </Section>

              {/* SALUDO */}
              <Heading className="text-textMain text-xl font-bold text-center m-0 mb-4">
                ¡Hola {customerName}!
              </Heading>
              
              <Text className="text-textMuted text-[15px] leading-[24px] text-center m-0 mb-8">
                Tu cita en <strong className="text-textMain">{businessName}</strong> ha sido agendada correctamente. Aquí tienes los detalles:
              </Text>

              {/* GRID DE FECHA Y HORA */}
              <Section className="mb-6">
                  <Row>
                      <Column className="w-1/2 pr-2">
                          <Section className="bg-bgBase rounded-xl p-4 border border-solid border-borderSubtle text-center">
                              <Text className="text-textMuted text-[10px] uppercase font-bold tracking-wider m-0 mb-1">
                                  Fecha
                              </Text>
                              <Text className="text-textMain text-[15px] font-bold capitalize m-0">
                                  {date}
                              </Text>
                          </Section>
                      </Column>
                      <Column className="w-1/2 pl-2">
                           <Section className="bg-bgBase rounded-xl p-4 border border-solid border-borderSubtle text-center">
                              <Text className="text-textMuted text-[10px] uppercase font-bold tracking-wider m-0 mb-1">
                                  Hora
                              </Text>
                              <Text className="text-brand text-[15px] font-bold m-0">
                                  {time}
                              </Text>
                          </Section>
                      </Column>
                  </Row>
              </Section>

              {/* LISTA DE SERVICIOS */}
              <Section className="bg-bgBase rounded-xl p-5 border border-solid border-borderSubtle mb-6">
                  <Text className="text-brand text-[10px] uppercase font-bold tracking-wider m-0 mb-4">
                      Servicios
                  </Text>
                  
                  {services.map((service, index) => (
                      <Row key={index} className="mb-2">
                          <Column>
                              <Text className="m-0 text-textMain text-[14px] font-medium">
                                  • {service}
                              </Text>
                          </Column>
                      </Row>
                  ))}

                  <Hr className="border border-solid border-borderSubtle border-dashed my-4 mx-0 w-full" />

                  <Row>
                      <Column>
                          <Text className="m-0 text-textMuted text-[11px] uppercase tracking-wider mb-1">Profesional</Text>
                          <Text className="m-0 text-textMain text-[14px] font-bold">{staffName}</Text>
                      </Column>
                      <Column>
                          <Text className="m-0 text-textMuted text-[11px] uppercase tracking-wider mb-1 text-right">Total Estimado</Text>
                          <Text className="m-0 text-brand text-[16px] font-bold text-right">{totalPrice}€</Text>
                      </Column>
                  </Row>
              </Section>

              {/* UBICACIÓN */}
              <Section className="text-center bg-bgBase rounded-xl p-4 border border-solid border-borderSubtle mb-6">
                   <Text className="text-textMuted text-[10px] uppercase font-bold tracking-wider m-0 mb-1">Ubicación</Text>
                   <Text className="text-textMain text-[14px] font-medium m-0 mb-3">{businessAddress}</Text>
                   
                   <Link 
                      href={businessMap}
                      className="text-brand text-[12px] font-bold underline"
                   >
                      Ver en Google Maps →
                   </Link>
              </Section>

              <Hr className="border border-solid border-borderSubtle my-6 mx-0 w-full" />

              {/* ACCIONES (Cancelar) */}
              <Text className="text-textMuted text-[13px] leading-[24px] text-center m-0 mb-2">
                ¿Te ha surgido un imprevisto?
              </Text>
              <Section className="text-center">
                <Link href={cancelLink} className="text-danger text-[12px] font-medium hover:text-red-400 underline transition-colors">
                    Cancelar mi cita
                </Link>
              </Section>

            </Section>

            {/* FOOTER */}
            <Section className="bg-bgBase py-5 px-8 text-center border-t border-solid border-borderSubtle">
              <Text className="text-[#71717a] text-[11px] leading-[20px] m-0 mb-1">
                Este es un correo automático, por favor no respondas a esta dirección.
              </Text>
              <Text className="text-[#71717a] text-[11px] font-bold m-0">
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