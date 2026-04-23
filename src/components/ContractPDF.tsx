import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica', fontSize: 9.5, color: '#1e293b', lineHeight: 1.6 },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '3px solid #1e293b',
    paddingBottom: 16,
    marginBottom: 24,
  },
  companyBlock: { flex: 1 },
  companyName: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', letterSpacing: 1 },
  companyTagline: { fontSize: 9, color: '#64748b', marginTop: 2, letterSpacing: 0.5 },
  docType: { alignItems: 'flex-end' },
  docTypeTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  docTypeId: { fontSize: 9, color: '#64748b', marginTop: 3 },

  // Sections
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    backgroundColor: '#f1f5f9',
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderLeft: '3px solid #0f172a',
  },
  clause: {
    fontSize: 9,
    color: '#334155',
    marginBottom: 8,
    textAlign: 'justify',
    lineHeight: 1.7,
  },
  clauseNumber: {
    fontWeight: 'bold',
    color: '#0f172a',
  },

  // Data rows
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { fontWeight: 'bold', color: '#64748b', width: 130, fontSize: 9 },
  value: { color: '#0f172a', flex: 1, fontSize: 9 },
  
  // Financial table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  tableHeaderText: { color: '#ffffff', fontWeight: 'bold', fontSize: 8.5 },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e2e8f0',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRowAlt: { backgroundColor: '#f8fafc' },
  colDesc: { flex: 1, fontSize: 9 },
  colVal: { width: 100, textAlign: 'right', fontSize: 9 },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTop: '2px solid #22c55e',
    marginTop: 2,
  },
  totalLabel: { flex: 1, fontWeight: 'bold', fontSize: 10, color: '#15803d' },
  totalValue: { fontWeight: 'bold', fontSize: 12, color: '#15803d', textAlign: 'right', width: 100 },

  // Signatures
  signatureSection: { marginTop: 48, flexDirection: 'row', justifyContent: 'space-between' },
  signatureBox: { width: '45%', alignItems: 'center' },
  signatureLine: { width: '100%', borderTop: '1px solid #334155', paddingTop: 6, textAlign: 'center' },
  signatureName: { fontWeight: 'bold', fontSize: 9, color: '#0f172a' },
  signatureRole: { fontSize: 8, color: '#64748b', marginTop: 2 },
  signatureCpfDate: { fontSize: 8, color: '#94a3b8', marginTop: 2 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 7.5, color: '#94a3b8' },
  
  // Alert box
  alertBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 4,
    padding: 8,
    marginBottom: 14,
  },
  alertText: { fontSize: 8.5, color: '#92400e', textAlign: 'center', fontWeight: 'bold' },
})

export default function ContractPDF({ project, proposal }: { project?: any; proposal?: any }) {
  const data = project || proposal || {}
  const contractId = data.id ? data.id.split('-')[0].toUpperCase() : 'N/A'
  const today = new Date().toLocaleDateString('pt-BR')
  const deadlineDays = data.validity_days || 60
  const deadlineDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + deadlineDays)
    return d.toLocaleDateString('pt-BR')
  })()
  const contractValue = Number(data.contract_value || data.total_value || 0)
  const paymentIn50 = (contractValue * 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const paymentIn50Delivery = (contractValue * 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <Document title={`Contrato de Prestação de Serviços - ${data.customer_name || 'Cliente'}`} author="Sistema CRM">
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>CONTRATO DE SERVIÇOS</Text>
            <Text style={styles.companyTagline}>SOLUÇÕES EM NEGÓCIOS E GESTÃO</Text>
            <Text style={[styles.companyTagline, { marginTop: 2 }]}>CNPJ: __.___.___/____-__ · Fone: (__)  ____-____</Text>
          </View>
          <View style={styles.docType}>
            <Text style={styles.docTypeTitle}>CONTRATO DE PRESTAÇÃO</Text>
            <Text style={[styles.docTypeTitle, { marginTop: -4 }]}>DE SERVIÇOS CORPORATIVOS</Text>
            <Text style={styles.docTypeId}>Contrato N°: {contractId}</Text>
            <Text style={styles.docTypeId}>Data de Emissão: {today}</Text>
          </View>
        </View>

        {/* NOTICE */}
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>
            DOCUMENTO DE VALIDADE JURÍDICA — Leia atentamente antes de assinar. Guarde uma via deste contrato.
          </Text>
        </View>

        {/* CLÁUSULA 1 — PARTES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLÁUSULA 1ª — QUALIFICAÇÃO DAS PARTES</Text>
          
          <Text style={styles.clause}>
            <Text style={styles.clauseNumber}>1.1 CONTRATANTE: </Text>
            {data.customer_name || '___________________________'}{data.customer_cpf ? `, inscrito no CPF/CNPJ sob o nº ${data.customer_cpf}` : ', inscrito no CPF/CNPJ sob o nº ___.___.___-__'}, doravante denominado simplesmente <Text style={styles.clauseNumber}>CONTRATANTE</Text>.
          </Text>
          
          <Text style={styles.clause}>
            <Text style={styles.clauseNumber}>1.2 CONTRATADA: </Text>
            Pessoa Jurídica de direito privado, inscrita no CNPJ sob o nº __.___.___/____-__, com sede na cidade de _______________, Estado de _______________, doravante denominada simplesmente <Text style={styles.clauseNumber}>CONTRATADA</Text>.
          </Text>

          <View style={{ marginTop: 8 }}>
            <View style={styles.row}>
              <Text style={styles.label}>Referência:</Text>
              <Text style={styles.value}>{data.vehicle_model || data.reference || 'Não informado'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Identificador:</Text>
              <Text style={styles.value}>{data.plate || 'A Definir'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Categoria/Nível:</Text>
              <Text style={styles.value}>{data.armor_type || data.armor_level || 'A Definir conforme análise técnica'}</Text>
            </View>
          </View>
        </View>

        {/* CLÁUSULA 2 — OBJETO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLÁUSULA 2ª — OBJETO DO CONTRATO</Text>
          <Text style={styles.clause}>
            <Text style={styles.clauseNumber}>2.1 </Text>
            O presente contrato tem como objeto a prestação de serviços especializados descritos na proposta comercial anexa, compreendendo o fornecimento de materiais, execução técnica, gestão de projeto e entrega dos resultados conforme cronograma estabelecido.
          </Text>
          <Text style={styles.clause}>
            <Text style={styles.clauseNumber}>2.2 </Text>
            Os serviços incluem: (i) análise inicial de requisitos; (ii) execução técnica conforme padrões de qualidade; (iii) fornecimento de suporte especializado; (iv) documentação final e laudo de entrega dos serviços.
          </Text>
        </View>

        {/* CLÁUSULA 3 — PREÇO E PAGAMENTO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLÁUSULA 3ª — PREÇO E FORMA DE PAGAMENTO</Text>
          
          {contractValue > 0 ? (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colDesc]}>Item / Serviço</Text>
                <Text style={[styles.tableHeaderText, styles.colVal]}>Valor</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.colDesc}>Serviços Especializados — Ref: {data.vehicle_model || data.reference || 'Projeto'}</Text>
                <Text style={[styles.colVal, { fontWeight: 'bold' }]}>R$ {contractValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
              </View>
              <View style={[styles.tableRow, styles.tableRowAlt]}>
                <Text style={styles.colDesc}>Taxas de Documentação e Registro (incluso)</Text>
                <Text style={[styles.colVal, { color: '#64748b' }]}>Incluso</Text>
              </View>
              <View style={[styles.tableRow]}>
                <Text style={styles.colDesc}>Laudo Técnico de Entrega (incluso)</Text>
                <Text style={[styles.colVal, { color: '#64748b' }]}>Incluso</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>VALOR TOTAL DO CONTRATO</Text>
                <Text style={styles.totalValue}>R$ {contractValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.clause}>Valor a ser definido conforme avaliação técnica inicial.</Text>
          )}

          <Text style={[styles.clause, { marginTop: 12 }]}>
            <Text style={styles.clauseNumber}>3.1 FORMA DE PAGAMENTO: </Text>
            O valor total será quitado conforme acordado entre as partes, sendo o padrão: (i) <Text style={styles.clauseNumber}>50% no ato da assinatura</Text> (R$ {paymentIn50}), como sinal e início dos serviços; e (ii) <Text style={styles.clauseNumber}>50% na conclusão</Text> (R$ {paymentIn50Delivery}), condicionada à aprovação final.
          </Text>
          <Text style={styles.clause}>
            <Text style={styles.clauseNumber}>3.2 </Text>
            O atraso no pagamento de qualquer parcela sujeitará o CONTRATANTE ao pagamento de multa de 2% (dois por cento) sobre o valor em atraso, acrescido de juros moratórios de 1% (um por cento) ao mês.
          </Text>
        </View>

        {/* CLÁUSULA 4 — PRAZO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLÁUSULA 4ª — PRAZO DE EXECUÇÃO E ENTREGA</Text>
          <Text style={styles.clause}>
            <Text style={styles.clauseNumber}>4.1 </Text>
            O prazo estimado para execução dos serviços é de <Text style={styles.clauseNumber}>{deadlineDays} dias úteis</Text>, contados da data da assinatura e do recebimento do sinal, com previsão de conclusão até <Text style={styles.clauseNumber}>{data.expected_delivery_date ? new Date(data.expected_delivery_date).toLocaleDateString('pt-BR') : deadlineDate}</Text>.
          </Text>
          <Text style={styles.clause}>
            <Text style={styles.clauseNumber}>4.2 </Text>
            O prazo poderá ser prorrogado mediante comunicação prévia ao CONTRATANTE nos casos de: (i) atraso na entrega de insumos por fornecedores; (ii) necessidade de ajustes técnicos no projeto; (iii) motivos de força maior ou caso fortuito.
          </Text>
        </View>

        {/* CLÁUSULA 5 — GARANTIA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLÁUSULA 5ª — GARANTIA E ASSISTÊNCIA TÉCNICA</Text>
          <Text style={styles.clause}>
            <Text style={styles.clauseNumber}>5.1 </Text>
            A CONTRATADA garante os serviços executados pelo prazo legal de 90 dias, podendo ser estendido conforme proposta comercial, contra falhas técnicas comprovadamente atribuíveis à execução do serviço.
          </Text>
          <Text style={styles.clause}>
            <Text style={styles.clauseNumber}>5.2 </Text>
            A garantia não cobre danos causados por uso indevido, intervenção de terceiros não autorizados ou desgaste natural decorrente do tempo.
          </Text>
        </View>

        {/* CLÁUSULA 6 — RESCISÃO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLÁUSULA 6ª — RESCISÃO DO CONTRATO</Text>
          <Text style={styles.clause}>
            <Text style={styles.clauseNumber}>6.1 </Text>
            Este contrato poderá ser rescindido por qualquer das partes mediante notificação por escrito. Rescisões após o início da execução técnica implicarão no pagamento proporcional dos serviços já realizados e materiais adquiridos.
          </Text>
        </View>

        {/* CLÁUSULA 7 — DISPOSIÇÕES GERAIS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLÁUSULA 7ª — DISPOSIÇÕES GERAIS</Text>
          <Text style={styles.clause}>
            <Text style={styles.clauseNumber}>7.1 </Text>
            Este contrato é regido pelas normas do Código Civil Brasileiro e, quando aplicável, pelo Código de Defesa do Consumidor.
          </Text>
          <Text style={styles.clause}>
            <Text style={styles.clauseNumber}>7.2 </Text>
            Fica eleito o Foro da Comarca de sede da CONTRATADA para dirimir quaisquer controvérsias oriundas deste instrumento.
          </Text>
          <Text style={styles.clause}>
            Local e data: _______________, {today}.
          </Text>
        </View>

        {/* ASSINATURAS */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>{data.customer_name || 'CONTRATANTE'}</Text>
              <Text style={styles.signatureRole}>Contratante</Text>
              <Text style={styles.signatureCpfDate}>CPF/CNPJ: {data.customer_cpf || '___.___.___-__'}</Text>
            </View>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>CONTRATADA</Text>
              <Text style={styles.signatureRole}>Representante Legal</Text>
              <Text style={styles.signatureCpfDate}>CNPJ: __.___.___/____-__</Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Sistema CRM | Contrato N° {contractId} | Gerado em {today}</Text>
          <Text style={styles.footerText}>© Empresa de Soluções Corporativas Ltda.</Text>
        </View>

      </Page>
    </Document>
  )
}
