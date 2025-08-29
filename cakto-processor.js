const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

class CaktoProcessor {
  constructor() {
    this.dbPath = './hotmart-data.db';
    this.csvPath = './vendas-cakto.csv';
    this.metadataPath = './cakto-metadata.json';
    this.db = null;
  }

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

  async createTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS vendas_cakto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_venda TEXT UNIQUE,
        produto TEXT,
        checkout TEXT,
        id_oferta TEXT,
        oferta TEXT,
        status_venda TEXT,
        comissao REAL,
        afiliado TEXT,
        nome_cliente TEXT,
        email_cliente TEXT,
        telefone_cliente TEXT,
        data_nascimento TEXT,
        tipo_documento TEXT,
        numero_documento TEXT,
        metodo_pagamento TEXT,
        valor_base REAL,
        desconto REAL,
        valor_pago REAL,
        taxas REAL,
        cupom_desconto TEXT,
        porcentagem_desconto REAL,
        parcelas INTEGER,
        motivo_recusa TEXT,
        tipo_produto TEXT,
        venda_pai TEXT,
        tipo_venda TEXT,
        data_venda TEXT,
        data_pagamento TEXT,
        data_reembolso TEXT,
        data_chargeback TEXT,
        data_agendamento TEXT,
        data_cancelamento TEXT,
        data_liberacao TEXT,
        fbc_pixel TEXT,
        fbp_pixel TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_term TEXT,
        utm_content TEXT,
        sck TEXT,
        plataforma TEXT DEFAULT 'cakto',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return new Promise((resolve, reject) => {
      this.db.run(createTableSQL, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela:', err.message);
          reject(err);
        } else {
          console.log('✅ Tabela vendas_cakto criada/verificada');
          resolve();
        }
      });
    });
  }

  async createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_cakto_nome ON vendas_cakto(nome_cliente)',
      'CREATE INDEX IF NOT EXISTS idx_cakto_email ON vendas_cakto(email_cliente)',
      'CREATE INDEX IF NOT EXISTS idx_cakto_telefone ON vendas_cakto(telefone_cliente)',
      'CREATE INDEX IF NOT EXISTS idx_cakto_status ON vendas_cakto(status_venda)',
      'CREATE INDEX IF NOT EXISTS idx_cakto_data ON vendas_cakto(data_venda)',
      'CREATE INDEX IF NOT EXISTS idx_cakto_plataforma ON vendas_cakto(plataforma)'
    ];

    for (const indexSQL of indexes) {
      await new Promise((resolve, reject) => {
        this.db.run(indexSQL, (err) => {
          if (err) {
            console.error('❌ Erro ao criar índice:', err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    console.log('✅ Índices criados/verificados');
  }

  getFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  loadMetadata() {
    try {
      if (fs.existsSync(this.metadataPath)) {
        return JSON.parse(fs.readFileSync(this.metadataPath, 'utf8'));
      }
    } catch (error) {
      console.log('⚠️ Erro ao carregar metadata, criando novo');
    }
    return { lastHash: null, lastProcessed: null };
  }

  saveMetadata(metadata) {
    fs.writeFileSync(this.metadataPath, JSON.stringify(metadata, null, 2));
  }

  normalizeText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  normalizePhone(phone) {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  }

  parseCSV() {
    if (!fs.existsSync(this.csvPath)) {
      throw new Error(`Arquivo CSV não encontrado: ${this.csvPath}`);
    }

    const content = fs.readFileSync(this.csvPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV vazio ou sem dados');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  async upsertRecord(record) {
    const sql = `
      INSERT OR REPLACE INTO vendas_cakto (
        id_venda, produto, checkout, id_oferta, oferta, status_venda, comissao, afiliado,
        nome_cliente, email_cliente, telefone_cliente, data_nascimento, tipo_documento,
        numero_documento, metodo_pagamento, valor_base, desconto, valor_pago, taxas,
        cupom_desconto, porcentagem_desconto, parcelas, motivo_recusa, tipo_produto,
        venda_pai, tipo_venda, data_venda, data_pagamento, data_reembolso, data_chargeback,
        data_agendamento, data_cancelamento, data_liberacao, fbc_pixel, fbp_pixel,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content, sck, plataforma
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cakto')
    `;

    const values = [
      record['ID da Venda'],
      record['Produto'],
      record['Checkout'],
      record['Id da Oferta'],
      record['Oferta'],
      record['Status da Venda'],
      parseFloat(record['Comissão']) || 0,
      record['Afiliado'],
      record['Nome do Cliente'],
      record['Email do Cliente'],
      record['Telefone do Cliente'],
      record['Data de Nascimento do Cliente'],
      record['Tipo de Documento do Cliente'],
      record['Número do Documento do Cliente'],
      record['Método de Pagamento'],
      parseFloat(record['Valor Base do Produto']) || 0,
      parseFloat(record['Desconto']) || 0,
      parseFloat(record['Valor Pago pelo Cliente']) || 0,
      parseFloat(record['Taxas']) || 0,
      record['Cupom de Desconto'],
      parseFloat(record['Porcentagem de Desconto']) || 0,
      parseInt(record['Parcelas']) || 1,
      record['Motivo de Recusa'],
      record['Tipo do Produto'],
      record['Venda Pai'],
      record['Tipo da Venda'],
      record['Data da Venda'],
      record['Data de Pagamento'],
      record['Data do Reembolso'],
      record['Data do Chargeback'],
      record['Data de Agendamento do Pagamento'],
      record['Data de Cancelamento do Pagamento'],
      record['Data estimada de Liberação'],
      record['fbc - Pixel Facebook'],
      record['fbp - Pixel Facebook'],
      record['utm_source'],
      record['utm_medium'],
      record['utm_campaign'],
      record['utm_term'],
      record['utm_content'],
      record['sck']
    ];

    return new Promise((resolve, reject) => {
      this.db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  async process() {
    try {
      console.log('🔄 Iniciando processamento do CSV da Cakto...');
      
      await this.initDatabase();
      await this.createTable();
      await this.createIndexes();

      const currentHash = this.getFileHash(this.csvPath);
      const metadata = this.loadMetadata();

      if (currentHash === metadata.lastHash) {
        console.log('✅ CSV da Cakto não foi modificado, pulando processamento');
        return await this.getStatistics();
      }

      console.log('📊 Processando dados da Cakto...');
      const data = this.parseCSV();
      
      let inserted = 0;
      let updated = 0;

      for (const record of data) {
        try {
          const changes = await this.upsertRecord(record);
          if (changes > 0) {
            if (changes === 1) inserted++;
            else updated++;
          }
        } catch (error) {
          console.error('❌ Erro ao processar registro:', error.message);
        }
      }

      // Atualizar metadata
      metadata.lastHash = currentHash;
      metadata.lastProcessed = new Date().toISOString();
      this.saveMetadata(metadata);

      const stats = await this.getStatistics();
      
      console.log(`✅ Processamento da Cakto concluído:`);
      console.log(`   📊 Total de registros: ${stats.total}`);
      console.log(`   👥 Clientes únicos: ${stats.clientes_unicos}`);
      console.log(`   📧 Emails únicos: ${stats.emails_unicos}`);
      console.log(`   ✅ Assinaturas ativas: ${stats.ativos}`);
      console.log(`   ❌ Cancelados: ${stats.cancelados}`);
      console.log(`   🔄 Inseridos: ${inserted}, Atualizados: ${updated}`);

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

  async getStatistics() {
    if (!this.db) {
      await this.initDatabase();
    }

    const statsSQL = `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT nome_cliente) as clientes_unicos,
        COUNT(DISTINCT email_cliente) as emails_unicos,
        SUM(valor_pago) as valor_total,
        COUNT(CASE WHEN status_venda LIKE '%paid%' THEN 1 END) as ativos,
        COUNT(CASE WHEN status_venda LIKE '%cancel%' OR status_venda LIKE '%refund%' THEN 1 END) as cancelados
      FROM vendas_cakto
      WHERE plataforma = 'cakto'
    `;

    return new Promise((resolve, reject) => {
      this.db.get(statsSQL, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            total: row.total || 0,
            clientes_unicos: row.clientes_unicos || 0,
            emails_unicos: row.emails_unicos || 0,
            valor_total: row.valor_total || 0,
            ativos: row.ativos || 0,
            cancelados: row.cancelados || 0
          });
        }
      });
    });
  }

  async search(query, limit = 50) {
    if (!this.db) {
      await this.initDatabase();
    }

    const normalizedQuery = this.normalizeText(query);
    
    const searchSQL = `
      SELECT 
        id_venda,
        nome_cliente,
        email_cliente,
        telefone_cliente,
        produto,
        status_venda,
        valor_pago,
        data_venda,
        plataforma,
        CASE 
          WHEN LOWER(nome_cliente) LIKE ? THEN 100
          WHEN LOWER(email_cliente) LIKE ? THEN 90
          WHEN REPLACE(telefone_cliente, ' ', '') LIKE ? THEN 70
          WHEN LOWER(nome_cliente) LIKE ? THEN 60
          WHEN LOWER(email_cliente) LIKE ? THEN 50
          WHEN REPLACE(telefone_cliente, ' ', '') LIKE ? THEN 40
          ELSE 10
        END as relevance_score,
        CASE 
          WHEN LOWER(nome_cliente) LIKE ? THEN 'Nome exato'
          WHEN LOWER(email_cliente) LIKE ? THEN 'Email exato'
          WHEN REPLACE(telefone_cliente, ' ', '') LIKE ? THEN 'Telefone exato'
          WHEN LOWER(nome_cliente) LIKE ? THEN 'Nome começa com'
          WHEN LOWER(email_cliente) LIKE ? THEN 'Email começa com'
          WHEN REPLACE(telefone_cliente, ' ', '') LIKE ? THEN 'Telefone começa com'
          ELSE 'Correspondência parcial'
        END as match_type
      FROM vendas_cakto
      WHERE plataforma = 'cakto'
        AND (
          LOWER(nome_cliente) LIKE ? OR
          LOWER(email_cliente) LIKE ? OR
          REPLACE(telefone_cliente, ' ', '') LIKE ? OR
          LOWER(nome_cliente) LIKE ? OR
          LOWER(email_cliente) LIKE ? OR
          REPLACE(telefone_cliente, ' ', '') LIKE ?
        )
      ORDER BY relevance_score DESC, data_venda DESC
      LIMIT ?
    `;

    const searchTerm = `%${normalizedQuery}%`;
    const phoneTerm = `%${query.replace(/\D/g, '')}%`;
    const exactMatch = normalizedQuery;
    const startsWith = `${normalizedQuery}%`;

    return new Promise((resolve, reject) => {
      this.db.all(searchSQL, [
        exactMatch, exactMatch, exactMatch, startsWith, startsWith, startsWith,
        exactMatch, exactMatch, exactMatch, startsWith, startsWith, startsWith,
        searchTerm, searchTerm, phoneTerm, startsWith, startsWith, startsWith,
        limit
      ], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }
}

module.exports = CaktoProcessor;

// Execução direta se chamado via linha de comando
if (require.main === module) {
  const processor = new CaktoProcessor();
  
  processor.process()
    .then(stats => {
      console.log('🎉 Processamento da Cakto finalizado com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro:', error.message);
      process.exit(1);
    });
}
