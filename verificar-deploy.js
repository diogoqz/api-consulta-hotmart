#!/usr/bin/env node

/**
 * Script para verificar o status do deploy no EasyPanel
 */

const fetch = require('node-fetch').default;

const EASYPANEL_URL = 'https://api-htmcakto.rtp53d.easypanel.host';

async function checkHealth() {
    try {
        console.log('🏥 Verificando saúde do sistema...');
        const response = await fetch(`${EASYPANEL_URL}/api/health`);
        const health = await response.json();
        console.log('✅ Health Check:', health);
        return health;
    } catch (error) {
        console.error('❌ Health Check falhou:', error.message);
        return null;
    }
}

async function checkStats() {
    try {
        console.log('📊 Verificando estatísticas...');
        const response = await fetch(`${EASYPANEL_URL}/api/stats`);
        const stats = await response.json();
        console.log('✅ Estatísticas:', stats.data);
        return stats;
    } catch (error) {
        console.error('❌ Estatísticas falharam:', error.message);
        return null;
    }
}

async function checkSearch() {
    try {
        console.log('🔍 Testando pesquisa...');
        const response = await fetch(`${EASYPANEL_URL}/api/search/grouped?q=test&maxResults=5`);
        const search = await response.json();
        console.log('✅ Pesquisa:', { total: search.total, results: search.results.length });
        return search;
    } catch (error) {
        console.error('❌ Pesquisa falhou:', error.message);
        return null;
    }
}

async function checkFileExists() {
    try {
        console.log('📁 Verificando arquivos...');
        const response = await fetch(`${EASYPANEL_URL}/api/files`);
        const files = await response.json();
        console.log('✅ Arquivos:', files);
        return files;
    } catch (error) {
        console.log('⚠️ Endpoint de arquivos não disponível');
        return null;
    }
}

async function main() {
    console.log('🔍 VERIFICANDO DEPLOY NO EASYPANEL...');
    console.log('=====================================');
    
    const health = await checkHealth();
    const stats = await checkStats();
    const search = await checkSearch();
    const files = await checkFileExists();
    
    console.log('\n📋 RESUMO DO STATUS:');
    console.log('===================');
    
    if (health) {
        console.log('✅ Sistema: ONLINE');
        console.log(`📊 Registros: ${health.database?.records || 0}`);
    } else {
        console.log('❌ Sistema: OFFLINE');
    }
    
    if (stats && stats.data) {
        const total = stats.data.total.total;
        console.log(`📈 Total de registros: ${total}`);
        
        if (total === 0) {
            console.log('⚠️ Banco de dados vazio - aguardando deploy...');
        } else {
            console.log('🎉 Banco de dados carregado com sucesso!');
        }
    }
    
    if (search) {
        console.log(`🔍 Pesquisa funcionando: ${search.total} resultados`);
    }
    
    console.log('\n🌐 URLs de Acesso:');
    console.log(`Frontend: ${EASYPANEL_URL}`);
    console.log(`Admin: ${EASYPANEL_URL}/admin`);
    console.log(`API: ${EASYPANEL_URL}/api`);
    
    console.log('\n⏰ Próxima verificação em 30 segundos...');
}

// Executar se chamado diretamente
if (require.main === module) {
    main()
        .then(() => {
            console.log('\n✅ Verificação concluída');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Erro na verificação:', error.message);
            process.exit(1);
        });
}

module.exports = { checkHealth, checkStats, checkSearch };
