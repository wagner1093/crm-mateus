

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 1
CRM PRO
Documento de Estruturação e Especificação
Sistema de Gestão Empresarial — Versão para Desenvolvimento
DESTINATÁRIO Anti-Graphics (Desenvolvedor)
OBJETIVO Reestruturar módulos internos mantendo identidade visual atual
IMPORTANTE Sidebar, visual e identidade gráfica devem ser preservados 100%
DATA Abril / 2026

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 2
SUMÁRIO
01Visão Geral e Diretrizes
02Dashboard Principal
03Pipeline de Vendas
04Módulo de Clientes
05Módulo Financeiro Completo
06Cadastro de Serviços
07Módulo de Contratos
08Módulo de Propostas
09Pipeline de Suporte
10IA Integrada ao Sistema
11Configurações
12Fluxos e Integrações

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 3
MÓDULO 01
Visão Geral e Diretrizes
PREMISSA FUNDAMENTAL
Todos os módulos descritos neste documento devem ser implementados INTERNAMENTE
ao sistema existente. O visual, a sidebar, a paleta de cores e a identidade gráfica atual
devem ser preservados integralmente. O trabalho consiste em substituir/criar os
componentes de conteúdo de cada aba, não redesenhar a interface.
Estrutura de Abas (Sidebar)
ÍconeAbaDescrição
nDashboardVisão geral da empresa — dados,
KPIs, prospecção
nPipelineFunil de vendas com etapas e cards
de leads
nClientesBase de clientes vinculados a
serviços
nFinanceiroLançamentos, entradas, saídas,
metas, tickets
nnServiçosCadastro e gestão dos serviços
oferecidos
nContratosGeração e gestão de contratos por
cliente/serviço
nPropostasGeração de propostas comerciais
pré-definidas
nSuportePipeline de atendimento e
chamados
nIAAssistente e automações integradas
nnConfiguraçõesParâmetros do sistema, usuários,
integrações

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 4
MÓDULO 02
Dashboard Principal
A Dashboard é a tela inicial do CRM. Deve apresentar uma visão executiva e em tempo real de
toda a operação da empresa.
Cards de KPI (topo da página)
KPICálculo / OrigemCor Indicativa
Faturamento do MêsSoma das entradas confirmadas no
mês corrente
l
A ReceberTotal de cobranças em aberto (não
vencidas)
l
Em AtrasoTotal de cobranças vencidas e não
pagas
l
Ticket MédioFaturamento ÷ número de clientes
ativos
l
Leads AtivosQuantidade de leads na pipelinel
Clientes AtivosClientes com serviços vigentesl
Taxa de ConversãoLeads convertidos ÷ total de leads
(%)
l
Meta do MêsProgresso visual em % da meta de
faturamento
l
Seção: Prospecção e Pipeline (resumo)
n Mini-funil horizontal com contagem de leads por etapa
n Últimos 5 leads adicionados (nome, serviço, temperatura)
n Botão de ação rápida: '+ Novo Lead'
Seção: Últimas Transações Financeiras
n Lista dos últimos 10 lançamentos (entrada/saída, valor, data, status)
n Filtro rápido: Este mês / Últimos 30 dias / Personalizado
Seção: Gráficos
n Gráfico de barras — Faturamento mensal (12 meses)
n Gráfico de pizza — Distribuição por serviço (receita por categoria)
n Gráfico de linha — Leads x Conversões por mês

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 5
Seção: Alertas e Notificações
n Cobranças vencendo nos próximos 3 dias
n Contratos a vencer no mês
n Leads quentes sem atividade há mais de 3 dias

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 6
MÓDULO 03
Pipeline de Vendas
A Pipeline é o coração comercial do CRM. Deve ser visual, intuitiva e refletir exatamente o
processo de vendas da empresa.
Etapas do Funil (colunas Kanban)
EtapaNomeDescrição
1ProspecçãoLead identificado, ainda sem contato
formal
2Primeiro ContatoContato realizado, interesse inicial
3Proposta EnviadaProposta formal entregue ao lead
4NegociaçãoEm processo de ajuste de
valores/escopo
5Fechado — GanhoConvertido em cliente
6Fechado — PerdidoNegociação encerrada sem
conversão
Card do Lead — Campos Obrigatórios
CampoTipoObrigatórioNotas
Nome / EmpresaTextoSimNome da pessoa ou
empresa
Número de ContatoTelefone / WhatsAppSimFormato: (XX)
XXXXX-XXXX
Serviço de InteresseSelect múltiploSimTráfego, Social, Site,
Sistema, Hospedagem
Onde foi feita a PropostaSelectSimInstagram, WhatsApp,
Indicação, Site, Outro
Temperatura do LeadBadgeSimQuente / Morno / Frio
ResponsávelSelect (usuário)SimQuem está gerindo o lead
Data de EntradaData autoAutoData de criação do card
Valor EstimadoMoeda (R$)NãoValor potencial do
contrato

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 7
CampoTipoObrigatórioNotas
Próxima AçãoTexto livreNãoEx: Ligar na 4a feira
ObservaçõesTexto ricoNãoNotas livres
Origem (UTM)TextoNãoPara leads vindos de
tráfego pago
Temperatura do Lead — Definição Visual
QuenteMornoFrio
n Quente — Alto interesse, respondendo rápido, decisão iminente
n Morno — Interesse presente, mas ritmo lento ou indeciso
n Frio — Pouco engajamento, sem urgência
Funcionalidades da Pipeline
n Arrastar e soltar cards entre etapas (drag & drop)
n Filtros: por serviço, temperatura, responsável, período
n Busca por nome ou empresa
n Botão '+ Novo Lead' abrindo modal de criação
n Histórico de atividades dentro de cada card
n Botão de gerar proposta diretamente do card
n Botão de converter em cliente (ao ganhar)
n Integração com IA para sugerir próxima ação (ver Módulo 10)
Produtos que podem ser selecionados no Lead
Produto / ServiçoDescrição
Tráfego PagoGestão de anúncios Meta Ads / Google Ads
Social MídiaGestão de redes sociais
Criação de SiteDesenvolvimento de websites
Criação de SistemaDesenvolvimento de sistemas/aplicativos
Hospedagem de SitePlanos de hospedagem mensal/anual

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 8
MÓDULO 04
Módulo de Clientes
Gerencia todos os clientes ativos e inativos da empresa, vinculados aos seus respectivos serviços
contratados.
Campos do Cadastro de Cliente
CampoTipoObrigatório
Nome / Razão SocialTextoSim
CPF / CNPJTexto formatadoNão
E-mailE-mailSim
WhatsApp / TelefoneTelefoneSim
EndereçoTextoNão
Serviços ContratadosMultiselectSim
Valor Mensal / RecorrenteMoedaSim
Data de InícioDataSim
Data de Vencimento / RenovaçãoDataSim
StatusBadgeSim
Responsável InternoSelect usuárioSim
ObservaçõesTexto ricoNão
DocumentosUpload de arquivosNão
Status do Cliente
AtivoInativo
Visão do Perfil do Cliente
n Aba Resumo: dados cadastrais + serviços contratados + valor mensal
n Aba Financeiro: histórico de pagamentos, cobranças, status
n Aba Contratos: lista dos contratos vinculados ao cliente
n Aba Histórico: timeline de ações, mensagens, anotações
n Aba Suporte: chamados abertos e encerrados do cliente

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 9
MÓDULO 05
Módulo Financeiro Completo
O módulo financeiro é o centro de controle econômico da empresa. Deve cobrir todos os aspectos
de fluxo de caixa, faturamento, metas e análise de desempenho financeiro.
5.1 — Lançamentos (Entradas e Saídas)
CampoTipoObrigatórioNotas
TipoSelectSimEntrada / Saída
DescriçãoTextoSimEx: Mensalidade Social
Mídia — Cliente X
ValorMoeda (R$)SimValor do lançamento
Data de CompetênciaDataSimData real do fato
Data de VencimentoDataSimQuando deve ser
pago/recebido
Data de PagamentoDataNãoPreenchido ao confirmar
pagamento
StatusBadgeSimPago / Pendente /
Atrasado
CategoriaSelectSimVer categorias abaixo
Serviço RelacionadoSelectNãoVincula ao serviço
prestado
Cliente RelacionadoSelectNãoVincula ao cliente
Forma de PagamentoSelectNãoPIX / Boleto / Cartão /
TED / Dinheiro
Recorrente?ToggleNãoSe sim: diário/semanal/me
nsal/anual
ComprovanteUploadNãoAnexo de comprovante
ObservaçõesTextoNãoNotas livres
5.2 — Categorias de Lançamento
n Entradas: Mensalidade de Serviço · Pagamento Único · Hospedagem · Projeto Pontual ·
Outros
n Saídas: Ferramentas / Softwares · Freelancers · Anúncios / Tráfego · Infraestrutura · Impostos
· Salários · Outros

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 10
5.3 — Visões e Filtros do Financeiro
VisãoDescrição
Fluxo de CaixaCalendário mensal com entradas e saídas dia a dia
A ReceberTodos os lançamentos tipo Entrada com status Pendente
A PagarTodos os lançamentos tipo Saída com status Pendente
Em AtrasoLançamentos com data de vencimento passada e status
Pendente
ExtratoLista cronológica de todos os lançamentos com saldo
acumulado
Por ClienteFiltro por cliente mostrando todo o histórico financeiro
Por ServiçoReceita agrupada por tipo de serviço prestado
5.4 — Painel de Métricas Financeiras
MétricaFórmula / Origem
Faturamento Bruto do MêsSoma de todas as entradas do mês
Total de Saídas do MêsSoma de todas as saídas do mês
Lucro LíquidoFaturamento Bruto − Saídas
Margem de Lucro %(Lucro ÷ Faturamento) × 100
Ticket Médio GeralFaturamento ÷ quantidade de clientes ativos
Ticket Médio por ServiçoReceita do serviço ÷ clientes naquele serviço
Meta de FaturamentoValor configurável pelo usuário; exibe % atingida
Projeção do MêsEstimativa baseada em recorrências confirmadas
MRR (Receita Recorrente Mensal)Soma de todos os serviços mensais ativos
InadimplênciaTotal em atraso ÷ total a receber (%)
5.5 — Lógica de Status dos Lançamentos
n Pago: data de pagamento preenchida pelo usuário
n Pendente: data de vencimento no futuro, sem pagamento
n Atrasado: data de vencimento no passado, sem pagamento — alerta visual em vermelho
nn O sistema deve atualizar o status automaticamente toda vez que a página for carregada, comparando a
data de vencimento com a data atual.

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 11
5.6 — Recorrências
Lançamentos marcados como recorrentes devem gerar automaticamente o próximo lançamento ao
serem marcados como Pago, com a data de vencimento avançada conforme a periodicidade
configurada (ex: 30 dias para mensalidades).

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 12
MÓDULO 06
Cadastro de Serviços
O módulo de Serviços permite cadastrar e gerenciar todos os serviços que a empresa oferece.
Estes serviços são referenciados em Clientes, Lançamentos, Contratos e Propostas.
Serviços Pré-cadastrados (padrão do sistema)
ServiçoDescriçãoTipo de CobrançaPreço Padrão
Tráfego PagoGestão de anúncios
pagos
MensalR$ —
Social MídiaGestão de redes sociaisMensalR$ —
Criação de SiteDesenvolvimento de
website
ÚnicoR$ —
Criação de SistemaDesenvolvimento de
software/app
Único / ProjetoR$ —
Hospedagem de SitePlano de hospedagemMensal / AnualR$ —
Campos do Cadastro de Serviço
CampoTipo / OpçõesObrigatório
Nome do ServiçoTextoSim
DescriçãoTexto ricoNão
Tipo de CobrançaSelect: Mensal / Anual / Único / Por
Projeto
Sim
Preço Padrão (R$)MoedaNão
Permite personalizar valor por
cliente?
ToggleSim
CategoriaSelect: Marketing / Desenvolvimento
/ Infraestrutura
Sim
StatusAtivo / InativoSim
Integração com Financeiro
Ao vincular um serviço a um cliente, o sistema deve perguntar se deseja gerar automaticamente os
lançamentos recorrentes no módulo financeiro com base na data de início e tipo de cobrança do
serviço.

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 13
MÓDULO 07
Módulo de Contratos
Permite criar, gerenciar e armazenar contratos digitais vinculados a clientes e serviços específicos.
Fluxo de Criação de Contrato
PassoAçãoDetalhe
1Selecionar Tipo de ContratoTráfego Pago / Social Mídia / Site /
Sistema / Hospedagem
2Selecionar ClienteBusca na base de clientes
cadastrados
3Preencher Dados do ContratoValores, prazos, escopo, cláusulas
personalizáveis
4Pré-visualizarPreview do documento antes de
finalizar
5Finalizar / ExportarSalvar no sistema e/ou exportar em
PDF
Campos do Contrato
CampoTipo / OpçõesObrigatório
Tipo de ContratoSelect: serviços disponíveisSim
ClienteSelect: base de clientesSim
Número do ContratoAuto-gerado (ex: CTR-2026-001)Auto
Data de InícioDataSim
Duração / VigênciaMeses ou data fimSim
Valor do ContratoMoedaSim
Forma de PagamentoSelectSim
Escopo de ServiçoTexto rico (editável)Sim
Cláusulas AdicionaisTexto ricoNão
StatusRascunho / Ativo / Encerrado /
Cancelado
Auto
Assinatura Digital?Toggle (futuro)Não

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 14
Templates por Tipo de Serviço
O sistema deve conter templates base para cada tipo de contrato. O usuário edita apenas os
campos variáveis (cliente, valor, prazo, escopo). O template inclui: cabeçalho com dados da
empresa, cláusulas padrão do serviço, espaços para assinatura e data.

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 15
MÓDULO 08
Módulo de Propostas
Gera propostas comerciais profissionais de forma rápida, baseadas em templates pré-definidos por
tipo de serviço.
Fluxo de Geração de Proposta
PassoAçãoDetalhe
1Escolher Tipo de PropostaSocial Mídia / Tráfego Pago /
Criação de Site / Sistema
2Informar Lead ou ClienteBusca no cadastro ou inserção
manual
3Personalizar Valores e EscopoEditar template com dados
específicos
4Pré-visualizarVer proposta formatada antes de
enviar
5Enviar / ExportarPDF para download ou link
compartilhável
Campos da Proposta
CampoTipo / OpçõesObrigatório
Tipo de PropostaSelect: serviços disponíveisSim
Destinatário (Lead/Cliente)Texto ou SelectSim
Data da PropostaData auto (editável)Auto
Validade da PropostaData ou número de diasSim
Investimento / ValorMoedaSim
Escopo DetalhadoTexto rico com lista de entregasSim
Forma de Pagamento PropostaTexto livreNão
Observações / PersonalizaçãoTexto ricoNão
Integração com Pipeline
Ao gerar uma proposta a partir de um card da Pipeline, o sistema deve mover automaticamente o
lead para a etapa 'Proposta Enviada' e registrar a ação no histórico do card.

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 16
MÓDULO 09
Pipeline de Suporte
Módulo para gerenciar chamados, solicitações e atendimento aos clientes ativos da empresa.
Etapas da Pipeline de Suporte (Kanban)
EtapaDescrição
AbertoChamado recém-criado, aguardando triagem
Em AtendimentoResponsável designado e trabalhando na solução
Aguardando ClienteResposta ou ação pendente do cliente
ResolvidoSolução aplicada, aguardando confirmação
EncerradoChamado finalizado e arquivado
Campos do Chamado
CampoTipo / OpçõesObrigatório
TítuloTextoSim
ClienteSelect: clientes ativosSim
Serviço RelacionadoSelectSim
PrioridadeBaixa / Média / Alta / UrgenteSim
DescriçãoTexto ricoSim
ResponsávelSelect usuárioSim
Data de AberturaAutoAuto
Prazo de Resolução (SLA)DataNão
Histórico de MensagensChat interno do chamadoAuto
AnexosUploadNão

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 17
MÓDULO 10
IA Integrada ao Sistema
O sistema deve conter uma aba de IA (Assistente) e integrações de IA em pontos estratégicos do
CRM para aumentar a produtividade.
Aba de IA — Assistente Geral
n Interface de chat com assistente treinado no contexto da empresa
n Responde perguntas sobre clientes, financeiro e pipeline
n Gera rascunhos de propostas com base nos dados do CRM
n Sugere abordagens para leads com base na temperatura e histórico
n Gera relatórios em linguagem natural (ex: 'Como foi o mês?')
IA na Pipeline — Sugestão de Próxima Ação
n Botão 'Sugerir ação com IA' dentro do card do lead
n A IA analisa temperatura, tempo sem contato, serviço de interesse e histórico
n Retorna sugestão de abordagem + texto de mensagem para envio
IA no Financeiro — Análise e Projeção
n Resumo automático do mês financeiro em linguagem natural
n Alerta de padrões: 'Suas despesas com ferramentas subiram 30% esse mês'
n Sugestão de meta realista baseada nos últimos 3 meses
IA em Contratos e Propostas — Redação Assistida
n Botão 'Completar com IA' no escopo do contrato/proposta
n A IA preenche seções técnicas com base no tipo de serviço selecionado
Tecnologia Recomendada
Integração via API com modelo de linguagem (OpenAI GPT-4o ou Claude). As chamadas devem
incluir contexto do CRM (dados do cliente, serviço, histórico financeiro) injetados no prompt do
sistema. O desenvolvedor deve implementar um backend simples de proxy para proteger a chave
de API.

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 18
MÓDULO 11
Configurações
Dados da Empresa
n Nome da empresa, CNPJ, endereço, logo, e-mail, telefone
n Dados exibidos em contratos, propostas e cabeçalhos do sistema
Usuários e Permissões
n Cadastro de usuários (nome, e-mail, cargo, senha)
n Perfis: Administrador / Comercial / Financeiro / Suporte / Visualizador
n Controle de acesso por aba/módulo por perfil
Metas
n Meta mensal de faturamento (configurável por mês)
n Meta de novos clientes por mês
n Meta de conversão da pipeline (%)
Categorias Financeiras
n Editar, criar e desativar categorias de entrada e saída
Templates
n Editar templates padrão de contratos e propostas por tipo de serviço
n Editor rico de texto para personalização
Integrações
IntegraçãoFinalidade
WhatsApp (via API)Envio de mensagens e propostas direto do CRM
E-mail (SMTP)Envio de propostas, contratos e cobranças por e-mail
Asaas / Stripe / Mercado PagoGeração de cobranças e pagamentos online
IA (OpenAI / Anthropic)Chave de API e configuração do assistente
Google CalendarSincronização de datas de vencimento e follow-ups
Notificações
n Configurar alertas por e-mail ou in-app: cobranças vencendo, leads sem atividade, metas
atingidas

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 19
MÓDULO 12
Fluxos e Integrações Entre Módulos
Fluxo Principal: Lead → Cliente → Financeiro
Lead criado na Pipeline→Preenche campos obrigatórios
Proposta gerada→Card muda para 'Proposta Enviada'
Lead ganho (convertido)→Cliente criado automaticamente
Cliente criado→
Serviços selecionados geraram lançamentos
recorrentes
Lançamento gerado→Aparece em 'A Receber' no Financeiro
Pagamento confirmado→
Status → Pago + próximo lançamento
gerado
Contrato pode ser gerado→Vinculado ao cliente + serviço
Regras Gerais de Desenvolvimento
3 Manter 100% da identidade visual, sidebar e paleta de cores atual
3 Todos os modais devem seguir o padrão visual já existente no sistema
3 Dados devem persistir em banco de dados real (não localStorage)
3 O sistema deve ser responsivo (funcionar em desktop e tablet)
3 Todas as listagens devem ter paginação ou scroll infinito
3 Campos de data devem usar date picker visual consistente com o design
3 Exportação de PDF deve usar a identidade visual da empresa
3 Logs de atividade devem ser gerados para ações críticas (criar, editar, excluir)
3 Backups automáticos recomendados (configurável nas integrações)
3 A IA nunca deve exibir dados de outros clientes — contexto isolado por sessão

CRM PRO — Especificação TécnicaCONFIDENCIAL · Anti-Graphics
Página 20
PRÓXIMOS PASSOS
1. Anti-Graphics revisa este documento e confirma escopo viável
2. Definir prioridade de módulos para entrega em fases
3. Validar templates de contratos e propostas com o cliente
4. Configurar banco de dados e estrutura de tabelas conforme módulos acima
5. Implementar módulos na ordem: Dashboard → Pipeline → Clientes → Financeiro →
demais
Documento gerado por: CRM PRO — Especificação Técnica v1.0 · 2026