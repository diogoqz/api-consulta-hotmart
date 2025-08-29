#!/usr/bin/env node

/**
 * 🚀 SERVIDOR BACKEND - HOTMART CLIENT SEARCH
 * 
 * Servidor Express que serve dados do SQLite via API REST
 * 
 * @author Diogo
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const HotmartCSVProcessor = require('./csv-to-sqlite');
const CaktoProcessor = require('./cakto-processor');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Criar diretório uploads se não existir
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads');
    }
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    // Salvar como relatorio-hotmart.csv
    cb(null, 'relatorio-hotmart.csv');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV são permitidos'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Função para inicializar banco de dados
async function initializeDatabase() {
    try {
        console.log('🔍 Verificando banco de dados...');
        
        // Tentar obter estatísticas para verificar se as tabelas existem
        const testProcessor = new HotmartCSVProcessor();
        await testProcessor.getStatistics();
        console.log('✅ Banco de dados já inicializado');
        
    } catch (error) {
        if (error.code === 'SQLITE_ERROR' && error.message.includes('no such table')) {
            console.log('⚠️  Tabelas não encontradas, inicializando banco...');
            
            try {
                // Inicializar Hotmart
                const hotmartProcessor = new HotmartCSVProcessor();
                await hotmartProcessor.initDatabase();
                await hotmartProcessor.createTables();
                console.log('✅ Tabelas Hotmart criadas');
                
                // Inicializar Cakto
                const caktoProcessor = new CaktoProcessor();
                await caktoProcessor.initDatabase();
                await caktoProcessor.createTable();
                await caktoProcessor.createIndexes();
                console.log('✅ Tabelas Cakto criadas');
                
                console.log('🎉 Banco de dados inicializado com sucesso');
                
            } catch (initError) {
                console.error('❌ Erro ao inicializar banco:', initError.message);
            }
        } else {
            console.error('❌ Erro ao verificar banco:', error.message);
        }
    }
}

// Instância do processador
const processor = new HotmartCSVProcessor();

/**
 * Rota principal - informações do sistema
 */
app.get('/api', (req, res) => {
  res.json({
    name: 'Hotmart Client Search API',
    version: '1.0.0',
    endpoints: {
      '/api/stats': 'Estatísticas do banco',
      '/api/search': 'Pesquisar clientes',
      '/api/process': 'Processar CSV',
      '/api/health': 'Status do sistema'
    }
  });
});

/**
 * Rota de saúde do sistema
 */
app.get('/api/health', async (req, res) => {
  try {
    const stats = await processor.getStatistics();
    res.json({
      status: 'healthy',
      database: {
        connected: true,
        records: stats.total,
        lastUpdate: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * Rota para estatísticas do banco
 */
app.get('/api/stats', async (req, res) => {
  try {
    const hotmartStats = await processor.getStatistics();
    const caktoProcessor = new CaktoProcessor();
    const caktoStats = await caktoProcessor.getStatistics();
    
    // Combinar estatísticas
    const combinedStats = {
      hotmart: hotmartStats,
      cakto: caktoStats,
      total: {
        total: hotmartStats.total + caktoStats.total,
        clientes_unicos: hotmartStats.clientes_unicos + caktoStats.clientes_unicos,
        emails_unicos: hotmartStats.emails_unicos + caktoStats.emails_unicos,
        ativos: hotmartStats.ativos + caktoStats.ativos,
        cancelados: hotmartStats.cancelados + caktoStats.cancelados
      }
    };
    
    res.json({
      success: true,
      data: combinedStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Rota para upload de CSV
 */
app.post('/api/upload-csv', upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo foi enviado'
      });
    }

    console.log('📁 Arquivo CSV enviado:', req.file.originalname);
    
    // Mover arquivo para a raiz do projeto
    const sourcePath = req.file.path;
    const targetPath = './relatorio-hotmart.csv';
    
    fs.copyFileSync(sourcePath, targetPath);
    fs.unlinkSync(sourcePath); // Remover arquivo temporário
    
    res.json({
      success: true,
      message: 'Arquivo CSV enviado com sucesso',
      filename: req.file.originalname,
      size: req.file.size,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Rota para processar CSV Hotmart
 */
app.post('/api/process', async (req, res) => {
  try {
    console.log('🔄 Processando CSV Hotmart via API...');
    const stats = await processor.process();
    
    res.json({
      success: true,
      message: 'CSV Hotmart processado com sucesso',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro no processamento Hotmart:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Rota para processar CSV Cakto
 */
app.post('/api/process-cakto', async (req, res) => {
  try {
    console.log('🔄 Processando CSV Cakto via API...');
    const caktoProcessor = new CaktoProcessor();
    const stats = await caktoProcessor.process();
    
    res.json({
      success: true,
      message: 'CSV Cakto processado com sucesso',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro no processamento Cakto:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Rota para reiniciar servidor (apenas em desenvolvimento)
 */
app.post('/api/restart', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Reinicialização não permitida em produção'
      });
    }

    console.log('🔄 Reiniciando servidor...');
    
    res.json({
      success: true,
      message: 'Servidor será reiniciado em 3 segundos'
    });

    // Reiniciar após 3 segundos
    setTimeout(() => {
      process.exit(0);
    }, 3000);
    
  } catch (error) {
    console.error('❌ Erro ao reiniciar:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Rota para pesquisa
 */
app.get('/api/search', async (req, res) => {
  try {
    const { q, maxResults = 50, minScore = 5, groupByClient = true } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro de pesquisa "q" é obrigatório'
      });
    }

    console.log(`🔍 Pesquisando por: "${q}"`);
    
    const results = await processor.search(q, {
      maxResults: parseInt(maxResults),
      minScore: parseInt(minScore),
      groupByClient: groupByClient === 'true'
    });

    res.json({
      success: true,
      query: q,
      results: results,
      total: results.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro na pesquisa:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Rota para pesquisa com agrupamento por cliente
 */
app.get('/api/search/grouped', async (req, res) => {
  try {
    const { q, maxResults = 50, minScore = 5 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro de pesquisa "q" é obrigatório'
      });
    }

    console.log(`🔍 Pesquisando agrupado por: "${q}"`);
    
    // Buscar resultados do Hotmart
    const hotmartResults = await processor.search(q, {
      maxResults: parseInt(maxResults),
      minScore: parseInt(minScore),
      groupByClient: false
    });

    // Buscar resultados da Cakto
    const caktoProcessor = new CaktoProcessor();
    const caktoResults = await caktoProcessor.search(q, parseInt(maxResults));
    
    // Combinar resultados
    const results = [...hotmartResults, ...caktoResults];

    // Agrupar por cliente
    const grouped = {};
    
    results.forEach(record => {
      // Determinar chave baseada na plataforma
      let key, name, email, phone, status, plataforma;
      
      if (record.plataforma === 'cakto') {
        // Dados da Cakto
        key = record.email_cliente || record.telefone_cliente || record.nome_cliente;
        name = record.nome_cliente;
        email = record.email_cliente;
        phone = record.telefone_cliente;
        status = record.status_venda;
        plataforma = 'cakto';
      } else {
        // Dados do Hotmart
        key = record.email || `${record.ddd}${record.telefone}` || record.cliente;
        name = record.cliente;
        email = record.email;
        phone = record.telefone;
        status = record.status;
        plataforma = 'hotmart';
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          name: name,
          email: email,
          phone: phone,
          ddd: record.ddd || '',
          city: record.cidade || '',
          state: record.estado || '',
          relevanceScore: record.relevance_score || 0,
          matchType: record.match_type || 'Correspondência parcial',
          isActive: status?.toLowerCase().includes('paid') || status?.toLowerCase().includes('ativo'),
          history: [],
          totalTransactions: 0,
          totalValue: 0,
          activeSubscriptions: 0,
          plataforma: plataforma
        };
      }
      
      // Adicionar ao histórico
      let existingTransaction;
      
      if (record.plataforma === 'cakto') {
        existingTransaction = grouped[key].history.find(h => h.id_venda === record.id_venda);
      } else {
        existingTransaction = grouped[key].history.find(h => h.codigo === record.codigo);
      }
      
      if (!existingTransaction) {
        if (record.plataforma === 'cakto') {
          // Histórico da Cakto
          grouped[key].history.push({
            id: record.id_venda,
            produto: record.produto,
            status: record.status_venda,
            valor: record.valor_pago,
            data_venda: record.data_venda,
            metodo_pagamento: record.metodo_pagamento,
            plataforma: 'cakto'
          });
        } else {
          // Histórico do Hotmart
          grouped[key].history.push({
            id: record.id,
            codigo: record.codigo,
            produto: record.produto,
            status: record.status,
            plano: record.plano,
            valor: record.valor,
            adesao: record.adesao,
            cancelamento: record.cancelamento,
            periodoGratis: record.periodo_gratis,
            duracaoPeriodoGratis: record.duracao_periodo_gratis,
            formaPagamento: record.forma_pagamento,
            plataforma: 'hotmart'
          });
        }

        grouped[key].totalTransactions++;
        grouped[key].totalValue += record.valor_pago || record.valor || 0;
        
        if (status?.toLowerCase().includes('paid') || status?.toLowerCase().includes('ativo')) {
          grouped[key].activeSubscriptions++;
        }
      }
    });

    const groupedResults = Object.values(grouped);
    
    res.json({
      success: true,
      query: q,
      results: groupedResults,
      total: groupedResults.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro na pesquisa agrupada:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Rota para servir arquivos estáticos do Vue
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index-api.html'));
});

/**
 * Rota para página de administração
 */
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

/**
 * Middleware de tratamento de erros
 */
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

/**
 * Rota 404
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
  console.log(`🔍 Exemplo de pesquisa: http://localhost:${PORT}/api/search?q=joao`);
  
  // Inicializar banco de dados
  await initializeDatabase();
});

module.exports = app;
