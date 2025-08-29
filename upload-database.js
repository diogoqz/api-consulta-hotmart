#!/usr/bin/env node

/**
 * Script para fazer upload do banco de dados SQLite para o EasyPanel
 * Envia o banco já processado com todos os dados
 */

const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch').default;

const EASYPANEL_URL = 'https://api-htmcakto.rtp53d.easypanel.host';

async function uploadDatabase() {
    console.log('🗄️ FAZENDO UPLOAD DO BANCO DE DADOS...');
    console.log('========================================');
    
    const dbFile = './hotmart-data.db';
    
    if (!fs.existsSync(dbFile)) {
        console.error('❌ Arquivo hotmart-data.db não encontrado');
        return;
    }
    
    const stats = fs.statSync(dbFile);
    console.log(`📊 Tamanho do banco: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    try {
        // Criar form data
        const form = new FormData();
        form.append('database', fs.createReadStream(dbFile), {
            filename: 'hotmart-data.db',
            contentType: 'application/octet-stream'
        });
        
        console.log('📤 Enviando banco para o EasyPanel...');
        
        const response = await fetch(`${EASYPANEL_URL}/api/upload-database`, {
            method: 'POST',
            body: form
        });
        
        if (!response.ok) {
            throw new Error(`Upload falhou: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Upload do banco concluído:', result);
        
        // Verificar estatísticas após upload
        console.log('\n📊 Verificando estatísticas após upload...');
        await checkStats();
        
        return result;
        
    } catch (error) {
        console.error('❌ Erro no upload do banco:', error.message);
        
        // Se o endpoint não existir, tentar alternativa
        console.log('\n🔄 Tentando método alternativo...');
        await uploadDatabaseAlternative();
    }
}

async function uploadDatabaseAlternative() {
    console.log('🔄 MÉTODO ALTERNATIVO: Upload via admin panel...');
    
    try {
        // Primeiro, verificar se o endpoint de upload de arquivo existe
        const form = new FormData();
        form.append('csvFile', fs.createReadStream('./hotmart-data.db'), {
            filename: 'database.db',
            contentType: 'application/octet-stream'
        });
        
        const response = await fetch(`${EASYPANEL_URL}/api/upload-csv`, {
            method: 'POST',
            body: form
        });
        
        if (response.ok) {
            console.log('✅ Arquivo enviado via endpoint CSV');
            const result = await response.json();
            console.log('Resultado:', result);
        } else {
            console.log('⚠️ Endpoint CSV não aceita arquivo .db');
        }
        
    } catch (error) {
        console.error('❌ Método alternativo falhou:', error.message);
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
    console.log('🚀 INICIANDO UPLOAD DO BANCO DE DADOS...');
    
    // Verificar estatísticas antes
    console.log('\n📊 Verificando estatísticas atuais...');
    await checkStats();
    
    // Fazer upload do banco
    await uploadDatabase();
    
    console.log('\n🎉 PROCESSO CONCLUÍDO!');
    console.log(`🌐 Acesse: ${EASYPANEL_URL}`);
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

module.exports = { uploadDatabase, checkStats };
