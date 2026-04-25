import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { borderBottom: '2px solid #22C55E', paddingBottom: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: 4 },
  row: { flexDirection: 'row', paddingVertical: 4 },
  label: { fontWeight: 'bold', color: '#64748B', width: 100 },
  value: { color: '#111827', flex: 1 },
  tableHeader: { flexDirection: 'row', borderBottom: '1px solid #E5E7EB', paddingBottom: 4, marginBottom: 4, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', paddingVertical: 4, borderBottom: '1px solid #F3F4F6' },
  colDesc: { flex: 1 },
  colQtd: { width: 40, textAlign: 'center' },
  colPrice: { width: 80, textAlign: 'right' },
  colTotal: { width: 80, textAlign: 'right' },
  totalBox: { marginTop: 20, alignItems: 'flex-end' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#22C55E' },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 8, borderTop: '1px solid #E5E7EB', paddingTop: 10 },
  signatureArea: { marginTop: 60, flexDirection: 'row', justifyContent: 'space-between' },
  signatureLine: { width: '45%', borderTop: '1px solid #111827', paddingTop: 4, textAlign: 'center' },
})

export default function ProposalPDF({ proposal, organization }: { proposal: any, organization?: any }) {
  const companyName = organization?.nome || 'Empresa';
  const companyDescription = organization?.descricao || 'Soluções em Negócios';
  const logoUrl = organization?.logo_url;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {logoUrl && (
              <Image 
                src={logoUrl} 
                style={{ width: 45, height: 45, borderRadius: 4, objectFit: 'contain' }} 
              />
            )}
            <View>
              <Text style={styles.title}>Proposta Comercial</Text>
              <Text style={styles.subtitle}>{companyName}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>ID: {proposal.id.split('-')[0]}</Text>
            <Text style={{ fontSize: 10, color: '#64748B' }}>Data: {new Date(proposal.created_at).toLocaleDateString('pt-BR')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Cliente e Negócio</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{proposal.cliente_nome}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Serviço:</Text>
            <Text style={styles.value}>{proposal.servico?.nome || 'Serviço Personalizado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Válido até:</Text>
            <Text style={styles.value}>{new Date(proposal.data_validade).toLocaleDateString('pt-BR')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pagamento:</Text>
            <Text style={styles.value}>{proposal.modo_pagamento || 'A combinar'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investimento</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Descrição</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>{proposal.servico?.nome || 'Serviço Personalizado'}</Text>
            <Text style={styles.colTotal}>R$ {Number(proposal.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalText}>Valor Total: R$ {Number(proposal.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        {proposal.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Escopo / Observações</Text>
            <Text style={{ fontStyle: 'italic', color: '#64748B' }}>{proposal.observacoes}</Text>
          </View>
        )}

        <View style={styles.signatureArea}>
          <View style={styles.signatureLine}>
            <Text>{proposal.cliente_nome}</Text>
            <Text style={{ color: '#64748B', fontSize: 8 }}>Cliente</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text>{companyName}</Text>
            <Text style={{ color: '#64748B', fontSize: 8 }}>Departamento Comercial</Text>
          </View>
        </View>

        <Text style={styles.footer}>Este documento é uma proposta comercial e está sujeito a aprovação técnica.</Text>
      </Page>
    </Document>
  )
}
