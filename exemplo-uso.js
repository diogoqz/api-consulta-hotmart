/**
 * 📝 EXEMPLO PRÁTICO DE USO - SISTEMA HOTMART
 * 
 * Este arquivo demonstra como usar a classe HotmartClientSearch
 * em diferentes cenários práticos.
 */

// Importar a classe (se estiver usando módulos)
// import HotmartClientSearch from './search-logic.js'

// Ou usar globalmente (se carregado via script tag)
// const searchEngine = new window.HotmartClientSearch()

// ========================================
// 🚀 EXEMPLO 1: USO BÁSICO
// ========================================

async function exemploBasico() {
  console.log('🔍 Exemplo 1: Uso Básico')
  
  const searchEngine = new HotmartClientSearch()
  
  // 1. Carregar dados do CSV
  try {
    const response = await fetch('/relatorio-hotmart.csv')
    const csvText = await response.text()
    await searchEngine.loadCSVData(csvText)
    console.log('✅ Dados carregados com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error)
    return
  }
  
  // 2. Pesquisar por nome
  const resultadosNome = searchEngine.performSearch('Anna Karolina')
  console.log(`📋 Encontrados ${resultadosNome.length} resultados por nome`)
  
  // 3. Pesquisar por email
  const resultadosEmail = searchEngine.performSearch('dmartins@gmail.com')
  console.log(`📧 Encontrados ${resultadosEmail.length} resultados por email`)
  
  // 4. Pesquisar por telefone
  const resultadosTelefone = searchEngine.performSearch('992127370')
  console.log(`📞 Encontrados ${resultadosTelefone.length} resultados por telefone`)
  
  // 5. Obter estatísticas
  const stats = searchEngine.getStatistics()
  console.log('📊 Estatísticas:', stats)
}

// ========================================
// 🎯 EXEMPLO 2: PESQUISA AVANÇADA
// ========================================

function exemploPesquisaAvancada() {
  console.log('🎯 Exemplo 2: Pesquisa Avançada')
  
  const searchEngine = new HotmartClientSearch()
  
  // Simular dados carregados
  searchEngine.allData = [
    {
      Cliente: 'João Silva',
      Email: 'joao@email.com',
      Telefone: '999999999',
      DDD: '11',
      Status: 'Ativo',
      Cidade: 'São Paulo',
      Estado: 'SP',
      Valor: '427,00'
    },
    {
      Cliente: 'Maria Santos',
      Email: 'maria@email.com',
      Telefone: '888888888',
      DDD: '21',
      Status: 'Inativo',
      Cidade: 'Rio de Janeiro',
      Estado: 'RJ',
      Valor: '0,00'
    }
  ]
  
  // Pesquisa com múltiplos critérios
  const clientesAtivos = searchEngine.advancedSearch({
    status: 'Ativo'
  })
  
  const clientesSP = searchEngine.advancedSearch({
    state: 'SP'
  })
  
  console.log(`✅ Clientes ativos: ${clientesAtivos.length}`)
  console.log(`✅ Clientes de SP: ${clientesSP.length}`)
}

// ========================================
// 📊 EXEMPLO 3: ANÁLISE DE DADOS
// ========================================

function exemploAnaliseDados() {
  console.log('📊 Exemplo 3: Análise de Dados')
  
  const searchEngine = new HotmartClientSearch()
  
  // Simular dados para análise
  searchEngine.allData = [
    { Cliente: 'Cliente 1', Status: 'Ativo', Valor: '427,00', Cidade: 'São Paulo' },
    { Cliente: 'Cliente 2', Status: 'Ativo', Valor: '427,00', Cidade: 'São Paulo' },
    { Cliente: 'Cliente 3', Status: 'Inativo', Valor: '0,00', Cidade: 'Rio de Janeiro' },
    { Cliente: 'Cliente 4', Status: 'Atraso', Valor: '427,00', Cidade: 'Belo Horizonte' }
  ]
  
  // Análise por status
  const ativos = searchEngine.advancedSearch({ status: 'Ativo' })
  const inativos = searchEngine.advancedSearch({ status: 'Inativo' })
  const atraso = searchEngine.advancedSearch({ status: 'Atraso' })
  
  // Análise por cidade
  const sp = searchEngine.advancedSearch({ city: 'São Paulo' })
  const rj = searchEngine.advancedSearch({ city: 'Rio de Janeiro' })
  
  // Calcular receita total
  const receitaTotal = searchEngine.allData.reduce((total, cliente) => {
    return total + parseFloat(cliente.Valor.replace(',', '.'))
  }, 0)
  
  console.log('📈 Análise de Dados:')
  console.log(`- Clientes Ativos: ${ativos.length}`)
  console.log(`- Clientes Inativos: ${inativos.length}`)
  console.log(`- Clientes em Atraso: ${atraso.length}`)
  console.log(`- Clientes em SP: ${sp.length}`)
  console.log(`- Clientes no RJ: ${rj.length}`)
  console.log(`- Receita Total: R$ ${receitaTotal.toFixed(2)}`)
}

// ========================================
// 📱 EXEMPLO 4: INTEGRAÇÃO WHATSAPP
// ========================================

function exemploIntegracaoWhatsApp() {
  console.log('📱 Exemplo 4: Integração WhatsApp')
  
  const searchEngine = new HotmartClientSearch()
  
  // Simular cliente encontrado
  const cliente = {
    name: 'João Silva',
    phone: '999999999',
    ddd: '11',
    email: 'joao@email.com',
    status: 'Ativo'
  }
  
  // Formatar telefone para WhatsApp
  const telefoneFormatado = searchEngine.formatPhone(cliente.ddd, cliente.phone)
  const telefoneE164 = searchEngine.normalizePhone(cliente.ddd, cliente.phone)
  
  // Criar link do WhatsApp
  const mensagem = encodeURIComponent(`Olá ${cliente.name}! Vi que você é nosso cliente. Como posso ajudar?`)
  const linkWhatsApp = `https://api.whatsapp.com/send?phone=55${telefoneE164}&text=${mensagem}`
  
  console.log('📞 Informações do Cliente:')
  console.log(`- Nome: ${cliente.name}`)
  console.log(`- Telefone: ${telefoneFormatado}`)
  console.log(`- E.164: ${telefoneE164}`)
  console.log(`- Link WhatsApp: ${linkWhatsApp}`)
  
  // Função para abrir WhatsApp
  function abrirWhatsApp(phone, message) {
    const link = `https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(message)}`
    window.open(link, '_blank')
  }
  
  // Exemplo de uso
  // abrirWhatsApp(telefoneE164, 'Olá! Como posso ajudar?')
}

// ========================================
- 📈 EXEMPLO 5: RELATÓRIOS
// ========================================

function exemploRelatorios() {
  console.log('📈 Exemplo 5: Relatórios')
  
  const searchEngine = new HotmartClientSearch()
  
  // Simular dados para relatório
  searchEngine.allData = [
    { Cliente: 'Cliente 1', Status: 'Ativo', Valor: '427,00', Adesão: '2024-01-15' },
    { Cliente: 'Cliente 2', Status: 'Ativo', Valor: '427,00', Adesão: '2024-02-20' },
    { Cliente: 'Cliente 3', Status: 'Cancelada', Valor: '0,00', Adesão: '2024-01-10', Cancelamento: '2024-03-01' }
  ]
  
  // Gerar relatório de clientes ativos
  const ativos = searchEngine.advancedSearch({ status: 'Ativo' })
  const cancelados = searchEngine.advancedSearch({ status: 'Cancelada' })
  
  const relatorio = {
    periodo: 'Janeiro a Março 2024',
    totalClientes: searchEngine.allData.length,
    clientesAtivos: ativos.length,
    clientesCancelados: cancelados.length,
    receitaAtivos: ativos.reduce((total, c) => total + parseFloat(c.Valor.replace(',', '.')), 0),
    taxaRetencao: ((ativos.length / searchEngine.allData.length) * 100).toFixed(2) + '%'
  }
  
  console.log('📊 Relatório de Performance:')
  console.log(relatorio)
  
  // Exportar para CSV (exemplo)
  const dadosParaExportar = ativos.map(cliente => ({
    Nome: cliente.Cliente,
    Email: cliente.Email,
    Telefone: searchEngine.formatPhone(cliente.DDD, cliente.Telefone),
    Status: cliente.Status,
    Valor: cliente.Valor,
    DataAdesao: cliente.Adesão
  }))
  
  console.log('📋 Dados para exportação:', dadosParaExportar)
  
  // searchEngine.exportToCSV(dadosParaExportar, 'clientes-ativos.csv')
}

// ========================================
// 🔔 EXEMPLO 6: SISTEMA DE ALERTAS
// ========================================

function exemploSistemaAlertas() {
  console.log('🔔 Exemplo 6: Sistema de Alertas')
  
  const searchEngine = new HotmartClientSearch()
  
  // Simular dados com diferentes status
  searchEngine.allData = [
    { Cliente: 'Cliente 1', Status: 'Atraso', Valor: '427,00', Adesão: '2024-01-15' },
    { Cliente: 'Cliente 2', Status: 'Ativo', Valor: '427,00', Adesão: '2024-02-20', 'Período Grátis': 'Sim' },
    { Cliente: 'Cliente 3', Status: 'Inativo', Valor: '0,00', Adesão: '2024-01-10' }
  ]
  
  // Verificar pagamentos em atraso
  const pagamentosAtraso = searchEngine.advancedSearch({ status: 'Atraso' })
  
  // Verificar trials próximos do vencimento
  const trialsAtivos = searchEngine.advancedSearch({ 
    status: 'Ativo',
    periodoGratis: 'Sim'
  })
  
  // Verificar clientes inativos há muito tempo
  const clientesInativos = searchEngine.advancedSearch({ status: 'Inativo' })
  
  const alertas = {
    pagamentosAtraso: {
      count: pagamentosAtraso.length,
      message: `⚠️ ${pagamentosAtraso.length} pagamentos em atraso`,
      priority: 'high'
    },
    trialsExpirando: {
      count: trialsAtivos.length,
      message: `⏰ ${trialsAtivos.length} trials ativos`,
      priority: 'medium'
    },
    clientesInativos: {
      count: clientesInativos.length,
      message: `📉 ${clientesInativos.length} clientes inativos`,
      priority: 'low'
    }
  }
  
  console.log('🚨 Alertas do Sistema:')
  Object.values(alertas).forEach(alerta => {
    console.log(`${alerta.message} (Prioridade: ${alerta.priority})`)
  })
  
  // Função para enviar notificação
  function enviarNotificacao(alerta) {
    if (alerta.priority === 'high') {
      console.log(`🔴 ALERTA CRÍTICO: ${alerta.message}`)
      // Implementar notificação push, email, etc.
    } else if (alerta.priority === 'medium') {
      console.log(`🟡 ALERTA MÉDIO: ${alerta.message}`)
    } else {
      console.log(`🟢 ALERTA BAIXO: ${alerta.message}`)
    }
  }
  
  // Enviar alertas
  Object.values(alertas).forEach(enviarNotificacao)
}

// ========================================
// 🚀 EXECUTAR TODOS OS EXEMPLOS
// ========================================

async function executarTodosExemplos() {
  console.log('🚀 Iniciando todos os exemplos...\n')
  
  try {
    await exemploBasico()
    console.log('\n' + '='.repeat(50) + '\n')
    
    exemploPesquisaAvancada()
    console.log('\n' + '='.repeat(50) + '\n')
    
    exemploAnaliseDados()
    console.log('\n' + '='.repeat(50) + '\n')
    
    exemploIntegracaoWhatsApp()
    console.log('\n' + '='.repeat(50) + '\n')
    
    exemploRelatorios()
    console.log('\n' + '='.repeat(50) + '\n')
    
    exemploSistemaAlertas()
    console.log('\n' + '='.repeat(50) + '\n')
    
    console.log('✅ Todos os exemplos executados com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao executar exemplos:', error)
  }
}

// Executar quando o arquivo for carregado
if (typeof window !== 'undefined') {
  // Executar automaticamente no navegador
  // executarTodosExemplos()
  
  // Ou disponibilizar globalmente
  window.exemplosHotmart = {
    executarTodosExemplos,
    exemploBasico,
    exemploPesquisaAvancada,
    exemploAnaliseDados,
    exemploIntegracaoWhatsApp,
    exemploRelatorios,
    exemploSistemaAlertas
  }
}

// Para Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    executarTodosExemplos,
    exemploBasico,
    exemploPesquisaAvancada,
    exemploAnaliseDados,
    exemploIntegracaoWhatsApp,
    exemploRelatorios,
    exemploSistemaAlertas
  }
}
