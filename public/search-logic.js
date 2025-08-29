/**
 * 🔍 LÓGICA DE PESQUISA DE CLIENTES HOTMART APRIMORADA
 * 
 * Este arquivo contém toda a lógica de pesquisa e processamento de dados
 * para o sistema de consulta de clientes Hotmart com sistema de relevância.
 * 
 * @author Diogo
 * @version 2.0.0
 */

class HotmartClientSearch {
  constructor() {
    this.allData = []
    this.filteredResults = []
    this.searchTerm = ''
    this.loading = false
    
    // Configurações de relevância
    this.relevanceWeights = {
      exactMatch: 100,        // Correspondência exata
      startsWith: 80,         // Começa com o termo
      containsWord: 60,       // Contém palavra completa
      partialMatch: 40,       // Correspondência parcial
      phoneMatch: 70,         // Match de telefone
      emailMatch: 90,         // Match de email
      recentActivity: 20,     // Atividade recente
      activeStatus: 15,       // Status ativo
      multipleMatches: 25     // Múltiplas correspondências
    }
  }

  /**
   * Carrega e processa dados do CSV
   * @param {string} csvText - Conteúdo do arquivo CSV
   * @returns {Promise<Array>} Array com dados processados
   */
  async loadCSVData(csvText) {
    try {
      this.loading = true
      
      // Parse CSV usando PapaParse
      const results = Papa.parse(csvText, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
        dynamicTyping: true,
        skipEmptyLines: true
      })

      // Filtra registros válidos e normaliza dados
      this.allData = results.data
        .filter(row => row.Cliente && row.Cliente.trim() !== '')
        .map(row => this.normalizeRecord(row))

      console.log(`✅ Dados carregados: ${this.allData.length} registros`)
      console.log('📊 Primeiro registro:', this.allData[0])
      
      this.loading = false
      return this.allData
      
    } catch (error) {
      console.error('❌ Erro ao carregar CSV:', error)
      this.loading = false
      throw error
    }
  }

  /**
   * Normaliza um registro de dados
   * @param {Object} record - Registro bruto
   * @returns {Object} Registro normalizado
   */
  normalizeRecord(record) {
    return {
      ...record,
      // Campos normalizados para pesquisa
      _searchName: this.normalizeText(record.Cliente || ''),
      _searchEmail: this.normalizeText(record.Email || ''),
      _searchPhone: this.normalizePhone(record.DDD, record.Telefone),
      _fullPhone: `${record.DDD || ''}${record.Telefone || ''}`.replace(/\D/g, ''),
      _searchCity: this.normalizeText(record.Cidade || ''),
      _searchState: this.normalizeText(record.Estado || ''),
      
      // Metadados para relevância
      _hasEmail: !!(record.Email && record.Email.trim()),
      _hasPhone: !!(record.Telefone && record.Telefone.trim()),
      _isActive: this.isActiveStatus(record.Status),
      _lastActivity: this.parseDate(record.Adesão || record.Cancelamento)
    }
  }

  /**
   * Normaliza texto removendo acentos e caracteres especiais
   * @param {string} text - Texto a ser normalizado
   * @returns {string} Texto normalizado
   */
  normalizeText(text) {
    if (!text) return ''
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Verifica se o status é ativo
   * @param {string} status - Status do cliente
   * @returns {boolean} Se está ativo
   */
  isActiveStatus(status) {
    if (!status) return false
    const statusLower = status.toLowerCase()
    return statusLower.includes('ativo') || 
           statusLower.includes('trial') ||
           statusLower.includes('renovada')
  }

  /**
   * Parse de data para cálculo de relevância
   * @param {string} dateString - Data em string
   * @returns {Date|null} Data parseada
   */
  parseDate(dateString) {
    if (!dateString) return null
    try {
      return new Date(dateString)
    } catch {
      return null
    }
  }

  /**
   * Executa pesquisa inteligente nos dados
   * @param {string} searchTerm - Termo de pesquisa
   * @param {Object} options - Opções de pesquisa
   * @returns {Array} Resultados ordenados por relevância
   */
  performSearch(searchTerm, options = {}) {
    this.searchTerm = searchTerm
    
    const {
      maxResults = 50,
      minScore = 10,
      groupByClient = true,
      sortBy = 'relevance'
    } = options
    
    if (!searchTerm || !searchTerm.trim()) {
      this.filteredResults = []
      return []
    }

    const searchNormalized = this.normalizeText(searchTerm)
    const searchTerms = searchNormalized.split(' ').filter(term => term.length > 1)
    const isPhoneSearch = /^\d+$/.test(searchTerm.replace(/\D/g, ''))
    const isEmailSearch = searchTerm.includes('@')

    console.log(`🔍 Pesquisando por: "${searchTerm}"`)
    console.log(`📝 Termos normalizados: [${searchTerms.join(', ')}]`)
    console.log(`📱 Pesquisa por telefone: ${isPhoneSearch}`)
    console.log(`📧 Pesquisa por email: ${isEmailSearch}`)

    // Calcula relevância para cada registro
    const scoredResults = this.allData
      .map(record => ({
        ...record,
        _relevanceScore: this.calculateRelevance(record, searchTerm, searchTerms, isPhoneSearch, isEmailSearch)
      }))
      .filter(record => record._relevanceScore >= minScore)

    // Ordena por relevância
    this.filteredResults = this.sortResults(scoredResults, sortBy)
      .slice(0, maxResults)

    console.log(`✅ Resultados encontrados: ${this.filteredResults.length}`)
    console.log(`🏆 Melhor resultado (score ${this.filteredResults[0]?._relevanceScore}):`, 
                this.filteredResults[0]?.Cliente)

    return groupByClient ? this.getGroupedResults() : this.filteredResults
  }

  /**
   * Calcula a relevância de um registro
   * @param {Object} record - Registro a ser avaliado
   * @param {string} originalTerm - Termo original de pesquisa
   * @param {Array} searchTerms - Termos normalizados
   * @param {boolean} isPhoneSearch - Se é pesquisa por telefone
   * @param {boolean} isEmailSearch - Se é pesquisa por email
   * @returns {number} Pontuação de relevância
   */
  calculateRelevance(record, originalTerm, searchTerms, isPhoneSearch, isEmailSearch) {
    let score = 0
    let matchReasons = []

    // === PESQUISA POR TELEFONE ===
    if (isPhoneSearch) {
      const phoneDigits = originalTerm.replace(/\D/g, '')
      const recordPhone = record._fullPhone
      
      if (recordPhone === phoneDigits) {
        score += this.relevanceWeights.exactMatch
        matchReasons.push('Telefone Exato')
      } else if (recordPhone.includes(phoneDigits)) {
        score += this.relevanceWeights.phoneMatch
        matchReasons.push('Telefone Parcial')
      }
    }

    // === PESQUISA POR EMAIL ===
    if (isEmailSearch) {
      const emailLower = originalTerm.toLowerCase()
      const recordEmail = (record.Email || '').toLowerCase()
      
      if (recordEmail === emailLower) {
        score += this.relevanceWeights.exactMatch
        matchReasons.push('Email Exato')
      } else if (recordEmail.includes(emailLower)) {
        score += this.relevanceWeights.emailMatch
        matchReasons.push('Email Parcial')
      }
    }

    // === PESQUISA POR NOME ===
    if (!isPhoneSearch && !isEmailSearch) {
      const nameScore = this.calculateTextRelevance(record._searchName, searchTerms, 'Nome')
      score += nameScore.score
      matchReasons.push(...nameScore.reasons)

      // Verifica email também em pesquisas de texto
      if (record._searchEmail) {
        const emailScore = this.calculateTextRelevance(record._searchEmail, searchTerms, 'Email')
        if (emailScore.score > 0) {
          score += emailScore.score * 0.8 // Email tem peso menor em pesquisa de texto
          matchReasons.push(...emailScore.reasons)
        }
      }

      // Verifica localização
      const locationScore = this.calculateLocationRelevance(record, searchTerms)
      score += locationScore.score
      matchReasons.push(...locationScore.reasons)
    }

    // === BÔNUS DE QUALIDADE ===
    // Cliente ativo
    if (record._isActive) {
      score += this.relevanceWeights.activeStatus
    }

    // Tem email
    if (record._hasEmail) {
      score += 5
    }

    // Tem telefone
    if (record._hasPhone) {
      score += 5
    }

    // Atividade recente (últimos 6 meses)
    if (record._lastActivity) {
      const monthsAgo = (Date.now() - record._lastActivity.getTime()) / (1000 * 60 * 60 * 24 * 30)
      if (monthsAgo <= 6) {
        score += this.relevanceWeights.recentActivity * (1 - monthsAgo / 6)
      }
    }

    // Múltiplas correspondências
    if (matchReasons.length > 1) {
      score += this.relevanceWeights.multipleMatches
    }

    // Armazena informações de match no registro
    record._matchReasons = matchReasons
    record._primaryMatch = matchReasons[0] || 'Sem correspondência'

    return Math.round(score)
  }

  /**
   * Calcula relevância de texto
   * @param {string} text - Texto a ser avaliado
   * @param {Array} searchTerms - Termos de pesquisa
   * @param {string} fieldType - Tipo do campo
   * @returns {Object} Score e razões
   */
  calculateTextRelevance(text, searchTerms, fieldType) {
    let score = 0
    let reasons = []

    if (!text) return { score: 0, reasons: [] }

    const words = text.split(' ').filter(w => w.length > 1)

    for (const term of searchTerms) {
      // Correspondência exata de palavra
      if (words.includes(term)) {
        score += this.relevanceWeights.exactMatch
        reasons.push(`${fieldType} - Palavra Exata`)
        continue
      }

      // Começa com o termo
      const startsWithMatch = words.find(word => word.startsWith(term))
      if (startsWithMatch) {
        score += this.relevanceWeights.startsWith
        reasons.push(`${fieldType} - Inicia Com`)
        continue
      }

      // Contém o termo
      if (text.includes(term)) {
        score += this.relevanceWeights.partialMatch
        reasons.push(`${fieldType} - Contém`)
      }
    }

    // Bônus para correspondência no início do texto
    if (text.startsWith(searchTerms[0])) {
      score += 20
    }

    return { score, reasons }
  }

  /**
   * Calcula relevância por localização
   * @param {Object} record - Registro
   * @param {Array} searchTerms - Termos de pesquisa
   * @returns {Object} Score e razões
   */
  calculateLocationRelevance(record, searchTerms) {
    let score = 0
    let reasons = []

    for (const term of searchTerms) {
      if (record._searchCity && record._searchCity.includes(term)) {
        score += 15
        reasons.push('Cidade')
      }
      
      if (record._searchState && record._searchState.includes(term)) {
        score += 10
        reasons.push('Estado')
      }
    }

    return { score, reasons }
  }

  /**
   * Ordena os resultados
   * @param {Array} results - Resultados a serem ordenados
   * @param {string} sortBy - Critério de ordenação
   * @returns {Array} Resultados ordenados
   */
  sortResults(results, sortBy) {
    switch (sortBy) {
      case 'relevance':
        return results.sort((a, b) => {
          // Primeiro por score de relevância
          if (b._relevanceScore !== a._relevanceScore) {
            return b._relevanceScore - a._relevanceScore
          }
          
          // Depois por status ativo
          if (a._isActive !== b._isActive) {
            return b._isActive ? 1 : -1
          }
          
          // Por último por nome alfabético
          return a.Cliente.localeCompare(b.Cliente)
        })

      case 'name':
        return results.sort((a, b) => a.Cliente.localeCompare(b.Cliente))

      case 'recent':
        return results.sort((a, b) => {
          const dateA = a._lastActivity || new Date(0)
          const dateB = b._lastActivity || new Date(0)
          return dateB - dateA
        })

      default:
        return results.sort((a, b) => b._relevanceScore - a._relevanceScore)
    }
  }

  /**
   * Agrupa resultados por cliente único com melhor lógica de identificação
   * @returns {Array} Clientes agrupados com histórico completo
   */
  getGroupedResults() {
    const grouped = new Map()

    this.filteredResults.forEach(record => {
      // Lógica aprimorada de identificação de cliente único
      const clientKey = this.generateClientKey(record)

      if (!grouped.has(clientKey)) {
        grouped.set(clientKey, {
          // Informações básicas do cliente
          name: record.Cliente,
          email: record.Email,
          phone: record.Telefone,
          ddd: record.DDD,
          city: record.Cidade,
          state: record.Estado,
          
          // Informações da transação principal (maior relevância)
          product: record.Produto,
          value: record.Valor,
          paymentMethod: record['Forma de Pagamento'],
          status: record.Status,
          
          // Metadados de pesquisa
          relevanceScore: record._relevanceScore,
          matchReasons: record._matchReasons,
          primaryMatch: record._primaryMatch,
          isActive: record._isActive,
          
          // Histórico de transações
          history: [],
          
          // Estatísticas
          totalTransactions: 0,
          totalValue: 0,
          activeSubscriptions: 0
        })
      }

      const client = grouped.get(clientKey)
      
      // Adiciona ao histórico se não for duplicado
      const transactionId = record.Código || `${record.Cliente}-${record.Produto}-${record.Adesão}`
      const existingTransaction = client.history.find(h => h.id === transactionId)
      
      if (!existingTransaction) {
        client.history.push({
          id: transactionId,
          codigo: record.Código,
          produto: record.Produto,
          status: record.Status,
          plano: record.Plano,
          valor: this.parseFloat(record.Valor),
          adesao: record.Adesão,
          cancelamento: record.Cancelamento,
          periodoGratis: record['Período Grátis'],
          duracaoPeriodoGratis: record['Duração do Período Grátis'],
          formaPagamento: record['Forma de Pagamento']
        })

        // Atualiza estatísticas
        client.totalTransactions++
        client.totalValue += this.parseFloat(record.Valor) || 0
        
        if (record._isActive) {
          client.activeSubscriptions++
        }
      }

      // Mantém o registro com maior relevância como principal
      if (record._relevanceScore > client.relevanceScore) {
        client.relevanceScore = record._relevanceScore
        client.matchReasons = record._matchReasons
        client.primaryMatch = record._primaryMatch
        client.product = record.Produto
        client.value = record.Valor
        client.status = record.Status
      }
    })

    // Converte Map para Array e ordena por relevância
    return Array.from(grouped.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  /**
   * Gera chave única para identificação do cliente
   * @param {Object} record - Registro do cliente
   * @returns {string} Chave única
   */
  generateClientKey(record) {
    // Prioridade: Email > Telefone completo > Nome normalizado
    if (record.Email && record.Email.includes('@')) {
      return `email:${record.Email.toLowerCase().trim()}`
    }
    
    if (record._fullPhone && record._fullPhone.length >= 10) {
      return `phone:${record._fullPhone}`
    }
    
    return `name:${record._searchName}`
  }

  /**
   * Parse seguro de valor monetário
   * @param {string|number} value - Valor a ser parseado
   * @returns {number} Valor numérico
   */
  parseFloat(value) {
    if (typeof value === 'number') return value
    if (!value) return 0
    
    return parseFloat(
      value.toString()
        .replace(/[^\d,-]/g, '')
        .replace(',', '.')
    ) || 0
  }

  /**
   * Pesquisa com sugestões de correção
   * @param {string} searchTerm - Termo de pesquisa
   * @returns {Object} Resultados e sugestões
   */
  searchWithSuggestions(searchTerm) {
    const results = this.performSearch(searchTerm)
    const suggestions = []

    // Se poucos resultados, gera sugestões
    if (results.length < 5) {
      // Sugestões baseadas em similaridade de som (Soundex)
      const soundexTerm = this.soundex(searchTerm)
      const similarNames = this.allData
        .filter(record => this.soundex(record.Cliente) === soundexTerm)
        .map(record => record.Cliente)
        .filter((name, index, arr) => arr.indexOf(name) === index)
        .slice(0, 5)

      suggestions.push(...similarNames)

      // Sugestões baseadas em substring comum
      if (suggestions.length < 3) {
        const partialMatches = this.allData
          .filter(record => {
            const name = record._searchName || this.normalizeText(record.Cliente)
            return name.includes(this.normalizeText(searchTerm).substring(0, 3))
          })
          .map(record => record.Cliente)
          .filter((name, index, arr) => arr.indexOf(name) === index)
          .slice(0, 3)

        suggestions.push(...partialMatches)
      }
    }

    return {
      results,
      suggestions: suggestions.filter((s, i, arr) => arr.indexOf(s) === i),
      searchTerm,
      resultCount: results.length,
      hasMore: results.length >= 50
    }
  }

  /**
   * Implementação simples do algoritmo Soundex
   * @param {string} word - Palavra para gerar soundex
   * @returns {string} Código Soundex
   */
  soundex(word) {
    if (!word) return ''
    
    const normalized = this.normalizeText(word).toUpperCase()
    if (!normalized) return ''

    let soundex = normalized.charAt(0)
    const mapping = {
      'BFPV': '1', 'CGJKQSXZ': '2', 'DT': '3',
      'L': '4', 'MN': '5', 'R': '6'
    }

    for (let i = 1; i < normalized.length && soundex.length < 4; i++) {
      const char = normalized.charAt(i)
      for (const [chars, code] of Object.entries(mapping)) {
        if (chars.includes(char) && soundex.slice(-1) !== code) {
          soundex += code
          break
        }
      }
    }

    return soundex.padEnd(4, '0').substring(0, 4)
  }

  /**
   * Calcula estatísticas avançadas
   * @returns {Object} Estatísticas detalhadas
   */
  getStatistics() {
    const totalClients = this.allData.length
    
    // Clientes únicos por diferentes critérios
    const uniqueEmails = new Set(
      this.allData
        .filter(item => item.Email && item.Email.includes('@'))
        .map(item => item.Email.toLowerCase())
    )
    
    const uniquePhones = new Set(
      this.allData
        .filter(item => item._fullPhone && item._fullPhone.length >= 10)
        .map(item => item._fullPhone)
    )

    const activeClients = this.allData.filter(item => item._isActive).length
    const clientsWithEmail = this.allData.filter(item => item._hasEmail).length
    const clientsWithPhone = this.allData.filter(item => item._hasPhone).length

    // Estatísticas de pesquisa atual
    const searchStats = this.filteredResults.length > 0 ? {
      totalFound: this.filteredResults.length,
      avgRelevanceScore: Math.round(
        this.filteredResults.reduce((sum, r) => sum + r._relevanceScore, 0) / this.filteredResults.length
      ),
      topMatchReason: this.getTopMatchReason(),
      hasHighConfidence: this.filteredResults.filter(r => r._relevanceScore >= 80).length
    } : null

    return {
      totalClients,
      uniqueClients: Math.max(uniqueEmails.size, uniquePhones.size),
      activeClients,
      clientsWithEmail,
      clientsWithPhone,
      uniqueEmails: uniqueEmails.size,
      uniquePhones: uniquePhones.size,
      dataCompleteness: Math.round((clientsWithEmail + clientsWithPhone) / totalClients * 100),
      search: searchStats
    }
  }

  /**
   * Identifica a razão de match mais comum nos resultados
   * @returns {string} Razão principal
   */
  getTopMatchReason() {
    const reasons = {}
    this.filteredResults.forEach(result => {
      if (result._primaryMatch) {
        reasons[result._primaryMatch] = (reasons[result._primaryMatch] || 0) + 1
      }
    })

    return Object.keys(reasons).reduce((a, b) => reasons[a] > reasons[b] ? a : b, '')
  }

  /**
   * Limpa dados e reset do estado
   */
  clear() {
    this.allData = []
    this.filteredResults = []
    this.searchTerm = ''
    this.loading = false
  }

  // Métodos de formatação mantidos da versão anterior
  formatPhone(ddd, phone) {
    if (!phone) return ''
    
    const fullPhone = `${ddd || ''}${phone}`.replace(/\D/g, '')
    
    if (fullPhone.length === 11) {
      return `(${fullPhone.slice(0,2)}) ${fullPhone.slice(2,7)}-${fullPhone.slice(7)}`
    }
    
    if (fullPhone.length === 10) {
      return `(${fullPhone.slice(0,2)}) ${fullPhone.slice(2,6)}-${fullPhone.slice(6)}`
    }
    
    return phone
  }

  formatDate(dateString) {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  getStatusClass(status) {
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes('ativo')) return 'status-ativo'
    if (statusLower.includes('inativo')) return 'status-inativo'
    if (statusLower.includes('atraso')) return 'status-atraso'
    if (statusLower.includes('cancelada')) return 'status-cancelada'
    
    return 'status-inativo'
  }

  normalizePhone(ddd, phone) {
    if (!phone) return ''
    
    const fullPhone = `${ddd || ''}${phone}`.replace(/\D/g, '')
    
    if (fullPhone.length === 11 && fullPhone.startsWith('0')) {
      return `55${fullPhone.slice(1)}`
    }
    
    if (fullPhone.length === 10) {
      return `55${fullPhone}`
    }
    
    return fullPhone
  }

  advancedSearch(criteria) {
    const { name, email, phone, status, city, state, minRelevance = 20 } = criteria
    
    return this.allData.filter(record => {
      let matches = true
      let score = 0

      if (name) {
        const nameMatch = record._searchName.includes(this.normalizeText(name))
        matches = matches && nameMatch
        if (nameMatch) score += 30
      }

      if (email) {
        const emailMatch = record._searchEmail.includes(this.normalizeText(email))
        matches = matches && emailMatch
        if (emailMatch) score += 40
      }

      if (phone) {
        const phoneMatch = record._fullPhone.includes(phone.replace(/\D/g, ''))
        matches = matches && phoneMatch
        if (phoneMatch) score += 35
      }

      if (status) {
        const statusMatch = record.Status && record.Status.toLowerCase().includes(status.toLowerCase())
        matches = matches && statusMatch
        if (statusMatch) score += 20
      }

      if (city) {
        const cityMatch = record._searchCity.includes(this.normalizeText(city))
        matches = matches && cityMatch
        if (cityMatch) score += 15
      }

      if (state) {
        const stateMatch = record._searchState.includes(this.normalizeText(state))
        matches = matches && stateMatch
        if (stateMatch) score += 10
      }

      return matches && score >= minRelevance
    })
  }

  exportToCSV(data, filename = 'resultados-pesquisa.csv') {
    const csvContent = Papa.unparse(data)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}

// Exemplo de uso aprimorado:
/*
const searchEngine = new HotmartClientSearch()

// Carregar dados
await searchEngine.loadCSVData(csvText)

// Pesquisa simples com relevância
const results = searchEngine.performSearch('Anna Karolina', {
  maxResults: 20,
  minScore: 15,
  groupByClient: true,
  sortBy: 'relevance'
})

// Pesquisa com sugestões
const searchWithSuggestions = searchEngine.searchWithSuggestions('Ana Carla')
console.log('Sugestões:', searchWithSuggestions.suggestions)

// Estatísticas avançadas
const stats = searchEngine.getStatistics()
console.log('Estatísticas:', stats)
*/

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HotmartClientSearch
} else if (typeof window !== 'undefined') {
  window.HotmartClientSearch = HotmartClientSearch
}

