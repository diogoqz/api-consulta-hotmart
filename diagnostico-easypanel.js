#!/usr/bin/env node

/**
 * Script de diagnóstico para EasyPanel
 * Verifica todos os componentes do sistema
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO EASYPANEL - INICIANDO...');
console.log('==========================================');

// 1. Verificar arquivos essenciais
console.log('\n📁 1. VERIFICANDO ARQUIVOS ESSENCIAIS:');
const arquivosEssenciais = [
    'server.js',
    'package.json',
    'csv-to-sqlite.js',
    'cakto-processor.js',
    'init-db.js',
    'Dockerfile',
    'docker-compose.yml'
];

arquivosEssenciais.forEach(arquivo => {
    if (fs.existsSync(arquivo)) {
        console.log(`✅ ${arquivo} - OK`);
    } else {
        console.log(`❌ ${arquivo} - FALTANDO`);
    }
});

// 2. Verificar diretórios
console.log('\n📂 2. VERIFICANDO DIRETÓRIOS:');
const diretorios = ['public', 'uploads'];
diretorios.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✅ ${dir}/ - OK`);
    } else {
        console.log(`❌ ${dir}/ - FALTANDO`);
    }
});

// 3. Verificar arquivos CSV
console.log('\n📊 3. VERIFICANDO ARQUIVOS CSV:');
const csvFiles = ['relatorio-hotmart.csv', 'vendas-cakto.csv'];
csvFiles.forEach(csv => {
    if (fs.existsSync(csv)) {
        const stats = fs.statSync(csv);
        console.log(`✅ ${csv} - ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
        console.log(`⚠️  ${csv} - NÃO ENCONTRADO (normal se não foi enviado)`);
    }
});

// 4. Verificar banco de dados
console.log('\n🗄️ 4. VERIFICANDO BANCO DE DADOS:');
const dbFiles = ['hotmart.db', 'cakto.db'];
dbFiles.forEach(db => {
    if (fs.existsSync(db)) {
        const stats = fs.statSync(db);
        console.log(`✅ ${db} - ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
        console.log(`⚠️  ${db} - NÃO ENCONTRADO (será criado automaticamente)`);
    }
});

// 5. Verificar variáveis de ambiente
console.log('\n🌍 5. VERIFICANDO VARIÁVEIS DE AMBIENTE:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'não definido'}`);
console.log(`PORT: ${process.env.PORT || '3000 (padrão)'}`);
console.log(`PWD: ${process.env.PWD || 'não definido'}`);

// 6. Verificar permissões
console.log('\n🔐 6. VERIFICANDO PERMISSÕES:');
try {
    fs.accessSync('.', fs.constants.R_OK | fs.constants.W_OK);
    console.log('✅ Permissões de leitura/escrita - OK');
} catch (error) {
    console.log('❌ Problema com permissões:', error.message);
}

// 7. Testar módulos Node.js
console.log('\n📦 7. TESTANDO MÓDULOS NODE.JS:');
const modulos = ['express', 'sqlite3', 'cors', 'multer'];
modulos.forEach(modulo => {
    try {
        require(modulo);
        console.log(`✅ ${modulo} - OK`);
    } catch (error) {
        console.log(`❌ ${modulo} - ERRO: ${error.message}`);
    }
});

// 8. Verificar package.json
console.log('\n📋 8. VERIFICANDO PACKAGE.JSON:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`✅ Nome: ${packageJson.name}`);
    console.log(`✅ Versão: ${packageJson.version}`);
    console.log(`✅ Script start: ${packageJson.scripts.start || 'não definido'}`);
    console.log(`✅ Dependências: ${Object.keys(packageJson.dependencies || {}).length}`);
} catch (error) {
    console.log(`❌ Erro ao ler package.json: ${error.message}`);
}

console.log('\n==========================================');
console.log('🔍 DIAGNÓSTICO CONCLUÍDO');
console.log('==========================================');

// 9. Recomendações
console.log('\n💡 RECOMENDAÇÕES:');
console.log('1. Se algum arquivo estiver faltando, verifique o deploy');
console.log('2. Se módulos falharem, execute: npm install');
console.log('3. Se banco não existir, execute: npm run init-db');
console.log('4. Para iniciar servidor: npm start');
console.log('5. Verifique logs do EasyPanel para erros específicos');

console.log('\n🚀 PRÓXIMOS PASSOS:');
console.log('1. Execute: npm install');
console.log('2. Execute: npm run init-db');
console.log('3. Execute: npm start');
console.log('4. Verifique se a porta está correta no EasyPanel');
console.log('5. Teste: curl http://localhost:3000/api/health');
