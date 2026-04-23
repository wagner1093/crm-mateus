import ClientesClient from './ClientesClient';

export const metadata = {
  title: 'Clientes | CRM Mateus',
  description: 'Gestão de clientes ativos',
};

export default function ClientesPage() {
  return <ClientesClient />;
}
