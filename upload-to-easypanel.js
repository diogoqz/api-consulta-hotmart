#!/usr/bin/env node

/**
 * Script para fazer upload dos CSVs para o EasyPanel
 * Executa automaticamente o processamento dos dados
 */

const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch').default;

const EASYPANEL_URL = 'https://api-htmcakto.rtp53d.easypanel.host';

async function uploadCSV(filePath, platform) {
    console.log(`📤 Fazendo upload de ${filePath} para ${platform}...`);
    
    try {
        const form = new FormData();
        form.append('csvFile', fs.createReadStream(filePath));
        
        const uploadResponse = await fetch(`${EASYPANEL_URL}/api/upload-csv`, {
            method: 'POST',
            body: form
        });
        
        if (!uploadResponse.ok) {
            throw new Error(`Upload falhou: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log(`✅ Upload ${platform} concluído:`, uploadResult);
        
        // Processar os dados
        console.log(`🔄 Processando dados ${platform}...`);
        const processEndpoint = platform === 'cakto' ? '/api/process-cakto' : '/api/process';
        
        const processResponse = await fetch(`${EASYPANEL_URL}${processEndpoint}`, {
            method: 'POST'
        });
        
        if (!processResponse.ok) {
            throw new Error(`Processamento falhou: ${processResponse.status} ${processResponse.statusText}`);
        }
        
        const processResult = await processResponse.json();
        console.log(`✅ Processamento ${platform} concluído:`, processResult);
        
        return processResult;
        
    } catch (error) {
        console.error(`❌ Erro no upload/processamento ${platform}:`, error.message);
        throw error;
    }
}

async function checkStats() {
    try {
        const response = await fetch(`${EASYPANEL_URL}/api/stats`);
        const stats = await response.json();
        
        console.log('\n📊 ESTATÍSTICAS ATUAIS:');
        console.log('Hotmart:', stats.data.hotmart);
        console.log('Cakto:', stats.data.cakto);
        console.log('Total:', stats.data.total);
        
        return stats;
    } catch (error) {
        console.error('❌ Erro ao verificar estatísticas:', error.message);
    }
}

async function main() {
    console.log('🚀 INICIANDO UPLOAD PARA EASYPANEL...');
    console.log('=====================================');
    
    // Verificar estatísticas antes
    console.log('\n📊 Verificando estatísticas atuais...');
    await checkStats();
    
    // Verificar se os arquivos existem
    const hotmartCSV = './relatorio-hotmart.csv';
    const caktoCSV = './vendas-cakto.csv';
    
    if (!fs.existsSync(hotmartCSV)) {
        console.error('❌ Arquivo relatorio-hotmart.csv não encontrado');
        return;
    }
    
    if (!fs.existsSync(caktoCSV)) {
        console.error('❌ Arquivo vendas-cakto.csv não encontrado');
        return;
    }
    
    try {
        // Upload e processamento Hotmart
        console.log('\n🔥 PROCESSANDO HOTMART...');
        await uploadCSV(hotmartCSV, 'hotmart');
        
        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Upload e processamento Cakto
        console.log('\n🌵 PROCESSANDO CAKTO...');
        await uploadCSV(caktoCSV, 'cakto');
        
        // Aguardar processamento
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar estatísticas finais
        console.log('\n📊 VERIFICANDO ESTATÍSTICAS FINAIS...');
        await checkStats();
        
        console.log('\n🎉 UPLOAD E PROCESSAMENTO CONCLUÍDOS!');
        console.log(`🌐 Acesse: ${EASYPANEL_URL}`);
        
    } catch (error) {
        console.error('\n❌ ERRO DURANTE O PROCESSO:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main()
        .then(() => {
            console.log('\n✅ Script executado com sucesso');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Erro fatal:', error.message);
            process.exit(1);
        });
}

module.exports = { uploadCSV, checkStats };
