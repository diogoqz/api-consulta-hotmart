#!/usr/bin/env node

/**
 * 🔄 CONVERSOR CSV PARA SQLITE - HOTMART
 * 
 * Este script converte o arquivo CSV de vendas Hotmart para um banco SQLite
 * e permite atualizações incrementais quando o CSV for modificado.
 * 
 * @author Diogo
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const Papa = require('papaparse');
const crypto = require('crypto');

class HotmartCSVProcessor {
  constructor() {
    this.csvPath = './relatorio-hotmart.csv';
    this.dbPath = './hotmart-data.db';
    this.metadataPath = './csv-metadata.json';
    this.db = null;
  }

  /**
   * Inicializa o banco de dados SQLite
   */
  async initDatabase() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Erro ao conectar ao banco:', err.message);
          reject(err);
        } else {
          console.log('✅ Conectado ao banco SQLite');
          resolve();
        }
      });
    });
  }

  /**
   * Cria as tabelas necessárias
   */
  async createTables() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE,
        cliente TEXT,
        email TEXT,
        ddd TEXT,
        telefone TEXT,
        cep TEXT,
        cidade TEXT,
        estado TEXT,
        bairro TEXT,
        pais TEXT,
        logradouro TEXT,
        numero TEXT,
        complemento TEXT,
        produto TEXT,
        plano TEXT,
        valor REAL,
        adesao TEXT,
        cancelamento TEXT,
        periodo_gratis TEXT,
        expiracao_periodo_gratis TEXT,
        duracao_periodo_gratis TEXT,
        forma_pagamento TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_cliente ON vendas(cliente);
      CREATE INDEX IF NOT EXISTS idx_email ON vendas(email);
      CREATE INDEX IF NOT EXISTS idx_telefone ON vendas(ddd, telefone);
      CREATE INDEX IF NOT EXISTS idx_status ON vendas(status);
      CREATE INDEX IF NOT EXISTS idx_codigo ON vendas(codigo);
    `;

    return new Promise((resolve, reject) => {
      this.db.exec(createTableSQL, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabelas:', err.message);
          reject(err);
        } else {
          console.log('✅ Tabelas criadas/verificadas');
          resolve();
        }
      });
    });
  }

  /**
   * Calcula o hash do arquivo CSV para detectar mudanças
   */
  calculateCSVHash() {
    if (!fs.existsSync(this.csvPath)) {
      return null;
    }
    
    const content = fs.readFileSync(this.csvPath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Carrega metadados do último processamento
   */
  loadMetadata() {
    if (fs.existsSync(this.metadataPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.metadataPath, 'utf8'));
      } catch (error) {
        console.warn('⚠️ Erro ao carregar metadados, criando novo');
      }
    }
    return { lastHash: null, lastProcessed: null, totalRecords: 0 };
  }

  /**
   * Salva metadados do processamento
   */
  saveMetadata(metadata) {
    fs.writeFileSync(this.metadataPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Normaliza dados para inserção no banco
   */
  normalizeRecord(record) {
    return {
      codigo: record.Código || '',
      cliente: record.Cliente || '',
      email: record.Email || '',
      ddd: record.DDD || '',
      telefone: record.Telefone || '',
      cep: record.CEP || '',
      cidade: record.Cidade || '',
      estado: record.Estado || '',
      bairro: record.Bairro || '',
      pais: record.Pais || '',
      logradouro: record.Logradouro || '',
      numero: record.Número || '',
      complemento: record.Complemento || '',
      produto: record.Produto || '',
      plano: record.Plano || '',
      valor: this.parseValue(record.Valor),
      adesao: record.Adesão || '',
      cancelamento: record.Cancelamento || '',
      periodo_gratis: record['Período Grátis'] || '',
      expiracao_periodo_gratis: record['Expiração do Período Grátis'] || '',
      duracao_periodo_gratis: record['Duração do Período Grátis'] || '',
      forma_pagamento: record['Forma de Pagamento'] || '',
      status: record.Status || ''
    };
  }

  /**
   * Converte valor monetário para número
   */
  parseValue(value) {
    if (!value) return 0;
    
    // Remove R$, espaços e converte vírgula para ponto
    const cleanValue = value.toString()
      .replace(/R\$/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    
    return parseFloat(cleanValue) || 0;
  }

  /**
   * Processa o arquivo CSV
   */
  async processCSV() {
    if (!fs.existsSync(this.csvPath)) {
      throw new Error(`Arquivo CSV não encontrado: ${this.csvPath}`);
    }

    console.log('📄 Lendo arquivo CSV...');
    const csvContent = fs.readFileSync(this.csvPath, 'utf8');
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('⚠️ Erros no parse do CSV:', results.errors);
          }
          
          const validRecords = results.data.filter(row => 
            row.Cliente && row.Cliente.trim() !== '' && row.Código
          );
          
          console.log(`✅ Parseado ${validRecords.length} registros válidos de ${results.data.length} total`);
          resolve(validRecords);
        },
        error: (error) => {
          reject(new Error(`Erro no parse do CSV: ${error.message}`));
        }
      });
    });
  }

  /**
   * Insere ou atualiza registros no banco
   */
  async upsertRecords(records) {
    const insertSQL = `
      INSERT OR REPLACE INTO vendas (
        codigo, cliente, email, ddd, telefone, cep, cidade, estado, bairro, pais,
        logradouro, numero, complemento, produto, plano, valor, adesao, cancelamento,
        periodo_gratis, expiracao_periodo_gratis, duracao_periodo_gratis, forma_pagamento, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        const stmt = this.db.prepare(insertSQL);
        let inserted = 0;
        let updated = 0;

        records.forEach((record, index) => {
          const normalized = this.normalizeRecord(record);
          
          stmt.run([
            normalized.codigo, normalized.cliente, normalized.email, normalized.ddd, normalized.telefone,
            normalized.cep, normalized.cidade, normalized.estado, normalized.bairro, normalized.pais,
            normalized.logradouro, normalized.numero, normalized.complemento, normalized.produto, normalized.plano,
            normalized.valor, normalized.adesao, normalized.cancelamento, normalized.periodo_gratis,
            normalized.expiracao_periodo_gratis, normalized.duracao_periodo_gratis, normalized.forma_pagamento, normalized.status
          ], function(err) {
            if (err) {
              console.error(`❌ Erro ao inserir registro ${index}:`, err.message);
            } else {
              if (this.changes > 0) {
                inserted++;
              } else {
                updated++;
              }
            }
          });
        });

        stmt.finalize((err) => {
          if (err) {
            this.db.run('ROLLBACK');
            reject(err);
          } else {
            this.db.run('COMMIT', (err) => {
              if (err) {
                reject(err);
              } else {
                console.log(`✅ Inseridos: ${inserted}, Atualizados: ${updated}`);
                resolve({ inserted, updated });
              }
            });
          }
        });
      });
    });
  }

  /**
   * Verifica estatísticas do banco
   */
  async getStatistics() {
    if (!this.db) {
      await this.initDatabase();
    }

    const statsSQL = `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT cliente) as clientes_unicos,
        COUNT(DISTINCT email) as emails_unicos,
        SUM(valor) as valor_total,
        COUNT(CASE WHEN status LIKE '%ativo%' THEN 1 END) as ativos,
        COUNT(CASE WHEN status LIKE '%cancelado%' THEN 1 END) as cancelados
      FROM vendas
    `;

    return new Promise((resolve, reject) => {
      this.db.get(statsSQL, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Obtém a data da transação mais recente
   */
  async getLatestTransaction() {
    if (!this.db) {
      await this.initDatabase();
    }

    const query = `
      SELECT 
        MAX(adesao) as latest_date,
        COUNT(*) as total_transactions
      FROM vendas
      WHERE adesao IS NOT NULL AND adesao != ''
    `;

    return new Promise((resolve, reject) => {
      this.db.get(query, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Processa o CSV e atualiza o banco
   */
  async process() {
    try {
      console.log('🚀 Iniciando processamento do CSV...');
      
      // Verificar se o CSV mudou
      const currentHash = this.calculateCSVHash();
      const metadata = this.loadMetadata();
      
      if (currentHash === metadata.lastHash) {
        console.log('✅ CSV não foi modificado desde o último processamento');
        return await this.getStatistics();
      }

      console.log('🔄 CSV foi modificado, processando...');
      
      // Inicializar banco
      await this.initDatabase();
      await this.createTables();
      
      // Processar CSV
      const records = await this.processCSV();
      const result = await this.upsertRecords(records);
      
      // Atualizar metadados
      const newMetadata = {
        lastHash: currentHash,
        lastProcessed: new Date().toISOString(),
        totalRecords: records.length,
        inserted: result.inserted,
        updated: result.updated
      };
      this.saveMetadata(newMetadata);
      
      // Obter estatísticas
      const stats = await this.getStatistics();
      
      console.log('📊 Estatísticas do banco:');
      console.log(`   Total de registros: ${stats.total}`);
      console.log(`   Clientes únicos: ${stats.clientes_unicos}`);
      console.log(`   Emails únicos: ${stats.emails_unicos}`);
      console.log(`   Valor total: R$ ${stats.valor_total?.toFixed(2) || '0.00'}`);
      console.log(`   Ativos: ${stats.ativos}`);
      console.log(`   Cancelados: ${stats.cancelados}`);
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erro no processamento:', error.message);
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }

  /**
   * Executa pesquisa no banco SQLite
   */
  async search(query, options = {}) {
    const {
      maxResults = 50,
      minScore = 5,
      groupByClient = true
    } = options;

    await this.initDatabase();
    
    const searchSQL = `
      SELECT 
        *,
        CASE 
          WHEN cliente LIKE ? THEN 100
          WHEN email LIKE ? THEN 90
          WHEN (ddd || telefone) LIKE ? THEN 70
          WHEN cliente LIKE ? THEN 60
          WHEN email LIKE ? THEN 50
          WHEN (ddd || telefone) LIKE ? THEN 40
          ELSE 10
        END as relevance_score,
        CASE 
          WHEN cliente LIKE ? THEN 'Nome exato'
          WHEN email LIKE ? THEN 'Email exato'
          WHEN (ddd || telefone) LIKE ? THEN 'Telefone exato'
          WHEN cliente LIKE ? THEN 'Nome começa com'
          WHEN email LIKE ? THEN 'Email começa com'
          WHEN (ddd || telefone) LIKE ? THEN 'Telefone começa com'
          ELSE 'Correspondência parcial'
        END as match_type
      FROM vendas 
      WHERE 
        cliente LIKE ? OR 
        email LIKE ? OR 
        (ddd || telefone) LIKE ? OR
        cliente LIKE ? OR 
        email LIKE ? OR 
        (ddd || telefone) LIKE ?
      ORDER BY relevance_score DESC, cliente ASC
      LIMIT ?
    `;

    const searchTerm = query.trim();
    const exactMatch = searchTerm;
    const partialMatch = `%${searchTerm}%`;
    const startsWith = `${searchTerm}%`;

    return new Promise((resolve, reject) => {
      this.db.all(searchSQL, [
        exactMatch, exactMatch, exactMatch, startsWith, startsWith, startsWith,
        exactMatch, exactMatch, exactMatch, startsWith, startsWith, startsWith,
        partialMatch, partialMatch, partialMatch, startsWith, startsWith, startsWith,
        maxResults
      ], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const filtered = rows.filter(row => row.relevance_score >= minScore);
          resolve(filtered);
        }
      });
    });
  }
}

// Execução do script
async function main() {
  const processor = new HotmartCSVProcessor();
  
  try {
    const stats = await processor.process();
    console.log('🎉 Processamento concluído com sucesso!');
  } catch (error) {
    console.error('💥 Erro fatal:', error.message);
    process.exit(1);
  }
}

// Se executado diretamente
if (require.main === module) {
  main();
}

module.exports = HotmartCSVProcessor;
