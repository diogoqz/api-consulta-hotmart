#!/usr/bin/env node

/**
 * Script de inicialização do banco de dados
 * Para ser executado no EasyPanel após o deploy
 */

const HotmartCSVProcessor = require('./csv-to-sqlite.js');
const CaktoProcessor = require('./cakto-processor.js');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    console.log('🚀 Iniciando inicialização do banco de dados...');
    
    try {
        // Verificar se os arquivos CSV existem
        const hotmartCSV = './relatorio-hotmart.csv';
        const caktoCSV = './vendas-cakto.csv';
        
        console.log('📁 Verificando arquivos CSV...');
        
        if (!fs.existsSync(hotmartCSV)) {
            console.log('⚠️  Arquivo relatorio-hotmart.csv não encontrado');
            console.log('📝 Criando tabela vazia para Hotmart...');
            
            const hotmartProcessor = new HotmartCSVProcessor();
            await hotmartProcessor.initDatabase();
            await hotmartProcessor.createTables();
            
            console.log('✅ Tabela Hotmart criada com sucesso');
        } else {
            console.log('✅ Arquivo relatorio-hotmart.csv encontrado');
            console.log('🔄 Processando dados do Hotmart...');
            
            const hotmartProcessor = new HotmartCSVProcessor();
            const hotmartStats = await hotmartProcessor.process();
            
            console.log('📊 Estatísticas Hotmart:', hotmartStats);
        }
        
        if (!fs.existsSync(caktoCSV)) {
            console.log('⚠️  Arquivo vendas-cakto.csv não encontrado');
            console.log('📝 Criando tabela vazia para Cakto...');
            
            const caktoProcessor = new CaktoProcessor();
            await caktoProcessor.initDatabase();
            await caktoProcessor.createTable();
            await caktoProcessor.createIndexes();
            
            console.log('✅ Tabela Cakto criada com sucesso');
        } else {
            console.log('✅ Arquivo vendas-cakto.csv encontrado');
            console.log('🔄 Processando dados da Cakto...');
            
            const caktoProcessor = new CaktoProcessor();
            const caktoStats = await caktoProcessor.process();
            
            console.log('📊 Estatísticas Cakto:', caktoStats);
        }
        
        // Verificar se as tabelas foram criadas
        console.log('🔍 Verificando criação das tabelas...');
        
        const hotmartProcessor = new HotmartCSVProcessor();
        await hotmartProcessor.initDatabase();
        
        const caktoProcessor = new CaktoProcessor();
        await caktoProcessor.initDatabase();
        
        // Testar consultas básicas
        try {
            const hotmartStats = await hotmartProcessor.getStatistics();
            console.log('✅ Tabela Hotmart funcionando:', hotmartStats);
        } catch (error) {
            console.log('❌ Erro na tabela Hotmart:', error.message);
        }
        
        try {
            const caktoStats = await caktoProcessor.getStatistics();
            console.log('✅ Tabela Cakto funcionando:', caktoStats);
        } catch (error) {
            console.log('❌ Erro na tabela Cakto:', error.message);
        }
        
        console.log('🎉 Inicialização do banco de dados concluída!');
        console.log('📊 Sistema pronto para uso');
        
    } catch (error) {
        console.error('❌ Erro durante inicialização:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('✅ Script de inicialização executado com sucesso');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erro fatal:', error.message);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };
