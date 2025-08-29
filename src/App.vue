<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🔍 Pesquisa de Clientes Hotmart</h1>
      <p>Pesquise por nome, telefone ou email para encontrar o histórico completo do cliente</p>
    </div>

    <!-- Search Container -->
    <div class="search-container">
      <input
        v-model="searchTerm"
        @input="performSearch"
        type="text"
        class="search-input"
        placeholder="Digite nome, telefone ou email do cliente..."
        :disabled="loading"
      />
      
      <div class="search-stats" v-if="!loading">
        <div class="stats-item">
          <div class="stats-number">{{ totalClients }}</div>
          <div class="stats-label">Total de Clientes</div>
        </div>
        <div class="stats-item">
          <div class="stats-number">{{ filteredResults.length }}</div>
          <div class="stats-label">Resultados Encontrados</div>
        </div>
        <div class="stats-item">
          <div class="stats-number">{{ uniqueClients }}</div>
          <div class="stats-label">Clientes Únicos</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div>Carregando dados do CSV...</div>
    </div>

    <!-- Results Container -->
    <div v-else-if="filteredResults.length > 0" class="results-container">
      <div
        v-for="(client, index) in groupedResults"
        :key="client.email + client.phone"
        class="result-item"
      >
        <!-- Result Header -->
        <div class="result-header" @click="toggleResult(index)">
          <div class="client-name">
            {{ client.name }}
            <span v-if="client.primaryMatch" class="highlight">
              ({{ client.primaryMatch }} - Score: {{ client.relevanceScore }})
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span :class="getStatusClass(client.status)">
              {{ client.status }}
            </span>
            <span class="chevron" :class="{ rotated: expandedResults[index] }">▼</span>
          </div>
        </div>

        <!-- Result Content -->
        <div class="result-content" :class="{ active: expandedResults[index] }">
          <!-- Client Info -->
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">
                <span v-if="client.matchReasons && client.matchReasons.some(r => r.includes('Email'))" class="highlight">{{ client.email }}</span>
                <span v-else>{{ client.email }}</span>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Telefone</div>
              <div class="info-value">
                <span v-if="client.matchReasons && client.matchReasons.some(r => r.includes('Telefone'))" class="highlight">
                  {{ formatPhone(client.ddd, client.phone) }}
                </span>
                <span v-else>{{ formatPhone(client.ddd, client.phone) }}</span>
                <button 
                  v-if="client.phone" 
                  @click="copyToClipboard(formatPhone(client.ddd, client.phone))"
                  class="phone-copy"
                >
                  <span class="copy-icon">📋</span>
                  Copiar
                </button>
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">Cidade/Estado</div>
              <div class="info-value">{{ client.city }}, {{ client.state }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">Produto</div>
              <div class="info-value">{{ client.product }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">Valor</div>
              <div class="info-value">R$ {{ client.value }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">Forma de Pagamento</div>
              <div class="info-value">{{ client.paymentMethod }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">Total de Transações</div>
              <div class="info-value">{{ client.totalTransactions || 0 }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">Valor Total</div>
              <div class="info-value">R$ {{ (client.totalValue || 0).toFixed(2) }}</div>
            </div>
          </div>

          <!-- History Section -->
          <div class="history-section">
            <div class="history-title">📋 Histórico Completo ({{ client.history.length }} registros)</div>
            <div
              v-for="(record, recordIndex) in client.history"
              :key="recordIndex"
              class="history-item"
            >
              <div class="history-date">
                <strong>Adesão:</strong> {{ formatDate(record.adesao) }}
                <span v-if="record.cancelamento">
                  | <strong>Cancelamento:</strong> {{ formatDate(record.cancelamento) }}
                </span>
              </div>
              <div class="history-details">
                <div><strong>Código:</strong> {{ record.codigo }}</div>
                <div><strong>Status:</strong> 
                  <span :class="getStatusClass(record.status)">{{ record.status }}</span>
                </div>
                <div><strong>Plano:</strong> {{ record.plano }}</div>
                <div><strong>Valor:</strong> R$ {{ record.valor }}</div>
                <div v-if="record.periodoGratis === 'Sim'">
                  <strong>Período Grátis:</strong> {{ record.duracaoPeriodoGratis }} dias
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="searchTerm && !loading" class="no-results">
      <div>Nenhum cliente encontrado para "{{ searchTerm }}"</div>
      <div style="margin-top: 10px; color: #999;">Tente pesquisar por nome, telefone ou email</div>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse'

export default {
  name: 'App',
  data() {
    return {
      allData: [],
      searchTerm: '',
      filteredResults: [],
      expandedResults: {},
      loading: true,
      searchEngine: null
    }
  },
  computed: {
    totalClients() {
      return this.allData.length
    },
         uniqueClients() {
       const uniqueEmails = new Set(this.allData.map(item => item.Email).filter(email => email))
       const uniquePhones = new Set(this.allData.map(item => item.Telefone).filter(phone => phone))
       return Math.max(uniqueEmails.size, uniquePhones.size)
     },
        groupedResults() {
      // Usar o agrupamento inteligente do motor de pesquisa se disponível
      if (this.searchEngine && this.filteredResults.length > 0) {
        try {
          return this.searchEngine.getGroupedResults()
        } catch (error) {
          console.error('❌ Erro no agrupamento avançado, usando fallback:', error)
          return this.groupResultsFallback()
        }
      }
      
      // Fallback para agrupamento simples
      return this.groupResultsFallback()
    },

    groupResultsFallback() {
      const grouped = {}
      
      this.filteredResults.forEach(record => {
        const key = record.Email || `${record.DDD}${record.Telefone}` || record.Cliente
        
        if (!grouped[key]) {
          grouped[key] = {
            name: record.Cliente,
            email: record.Email,
            phone: record.Telefone,
            ddd: record.DDD,
            city: record.Cidade,
            state: record.Estado,
            product: record.Produto,
            value: record.Valor,
            paymentMethod: record['Forma de Pagamento'],
            status: record.Status,
            relevanceScore: 100, // Score padrão
            matchReasons: ['Pesquisa Simples'],
            primaryMatch: 'Pesquisa Simples',
            isActive: record.Status?.toLowerCase().includes('ativo'),
            history: [],
            totalTransactions: 0,
            totalValue: 0,
            activeSubscriptions: 0
          }
        }
        
        // Adicionar ao histórico
        const transactionId = record.Código || `${record.Cliente}-${record.Produto}-${record.Adesão}`
        const existingTransaction = grouped[key].history.find(h => h.codigo === record.Código)
        
        if (!existingTransaction) {
          grouped[key].history.push({
            id: transactionId,
            codigo: record.Código,
            produto: record.Produto,
            status: record.Status,
            plano: record.Plano,
            valor: parseFloat(record.Valor?.replace(',', '.')) || 0,
            adesao: record.Adesão,
            cancelamento: record.Cancelamento,
            periodoGratis: record['Período Grátis'],
            duracaoPeriodoGratis: record['Duração do Período Grátis'],
            formaPagamento: record['Forma de Pagamento']
          })

          grouped[key].totalTransactions++
          grouped[key].totalValue += parseFloat(record.Valor?.replace(',', '.')) || 0
          
          if (record.Status?.toLowerCase().includes('ativo')) {
            grouped[key].activeSubscriptions++
          }
        }
      })
      
      return Object.values(grouped)
    }
  },
  async mounted() {
    // Inicializar o motor de pesquisa
    this.searchEngine = new HotmartClientSearch()
    await this.loadCSVData()
  },
  methods: {
    async loadCSVData() {
      try {
        console.log('🔄 Carregando dados do CSV...')
        const response = await fetch('/relatorio-hotmart.csv')
        const csvText = await response.text()
        
        console.log('📄 CSV carregado, tamanho:', csvText.length)
        
        // Verificar se o searchEngine está disponível
        if (!this.searchEngine) {
          console.error('❌ SearchEngine não está disponível, usando fallback')
          this.loadCSVDataFallback(csvText)
          return
        }

        try {
          // Usar o motor de pesquisa aprimorado
          this.allData = await this.searchEngine.loadCSVData(csvText)
          console.log('✅ Dados carregados com searchEngine:', this.allData.length)
        } catch (error) {
          console.error('❌ Erro no searchEngine, usando fallback:', error)
          this.loadCSVDataFallback(csvText)
        }
        
        this.loading = false
      } catch (error) {
        console.error('❌ Erro ao carregar arquivo:', error)
        this.loading = false
      }
    },

    loadCSVDataFallback(csvText) {
      console.log('🔄 Usando carregamento fallback do CSV')
      
      Papa.parse(csvText, {
        header: true,
        delimiter: ';',
        complete: (results) => {
          this.allData = results.data.filter(row => row.Cliente && row.Cliente.trim() !== '')
          console.log('✅ Dados carregados com fallback:', this.allData.length)
          console.log('📊 Primeiro registro:', this.allData[0])
        },
        error: (error) => {
          console.error('❌ Erro no parse do CSV:', error)
        }
      })
    },
    
    performSearch() {
      if (!this.searchTerm.trim()) {
        this.filteredResults = []
        return
      }

      console.log('🔍 Iniciando pesquisa por:', this.searchTerm)
      console.log('📊 Total de dados carregados:', this.allData.length)

      // Verificar se o searchEngine está disponível
      if (!this.searchEngine) {
        console.error('❌ SearchEngine não está disponível')
        return
      }

      try {
        // Usar a nova lógica de pesquisa aprimorada
        const results = this.searchEngine.performSearch(this.searchTerm, {
          maxResults: 50,
          minScore: 5, // Score mais baixo para testar
          groupByClient: true,
          sortBy: 'relevance'
        })

        // Atualizar resultados filtrados para compatibilidade
        this.filteredResults = this.searchEngine.filteredResults
        
        console.log('✅ Resultados encontrados:', this.filteredResults.length)
        if (this.filteredResults.length > 0) {
          console.log('🏆 Melhor resultado (score):', this.filteredResults[0]?._relevanceScore)
          console.log('📋 Primeiro resultado:', this.filteredResults[0])
        }
      } catch (error) {
        console.error('❌ Erro na pesquisa:', error)
        // Fallback para pesquisa simples
        this.performSimpleSearch()
      }
    },

    performSimpleSearch() {
      console.log('🔄 Usando pesquisa simples como fallback')
      const searchLower = this.searchTerm.toLowerCase().trim()
      
      this.filteredResults = this.allData.filter(record => {
        const cliente = (record.Cliente || '').toLowerCase()
        const email = (record.Email || '').toLowerCase()
        const telefone = (record.Telefone || '').toLowerCase()
        const ddd = (record.DDD || '').toLowerCase()
        
        const phoneNormalized = `${ddd}${telefone}`.replace(/\D/g, '')
        const searchNormalized = searchLower.replace(/\D/g, '')
        
        return cliente.includes(searchLower) || 
               email.includes(searchLower) || 
               phoneNormalized.includes(searchNormalized)
      })
      
      console.log('📊 Resultados da pesquisa simples:', this.filteredResults.length)
    },
    
    toggleResult(index) {
      this.expandedResults[index] = !this.expandedResults[index]
    },
    
    getStatusClass(status) {
      const statusLower = status.toLowerCase()
      if (statusLower.includes('ativo')) return 'status-ativo'
      if (statusLower.includes('inativo')) return 'status-inativo'
      if (statusLower.includes('atraso')) return 'status-atraso'
      if (statusLower.includes('cancelada')) return 'status-cancelada'
      return 'status-inativo'
    },
    
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
    },
    
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
    },
    
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text)
        // Feedback visual simples
        const button = event.target.closest('.phone-copy')
        const originalText = button.innerHTML
        button.innerHTML = '<span class="copy-icon">✅</span> Copiado!'
        setTimeout(() => {
          button.innerHTML = originalText
        }, 2000)
      } catch (err) {
        console.error('Erro ao copiar:', err)
      }
    }
  }
}
</script>
