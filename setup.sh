#!/bin/bash

# 🚀 SCRIPT DE SETUP - HOTMART CLIENT SEARCH
# Este script configura todo o ambiente para o sistema de pesquisa

echo "🔍 Configurando Sistema de Pesquisa Hotmart..."
echo "================================================"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale o npm primeiro."
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Verificar se o arquivo CSV existe
if [ ! -f "relatorio-hotmart.csv" ]; then
    echo "❌ Arquivo relatorio-hotmart.csv não encontrado!"
    echo "   Coloque o arquivo CSV na raiz do projeto."
    exit 1
fi

echo "✅ Arquivo CSV encontrado"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas"

# Processar CSV
echo ""
echo "🔄 Processando CSV para SQLite..."
npm run db:process

if [ $? -ne 0 ]; then
    echo "❌ Erro ao processar CSV"
    exit 1
fi

echo "✅ CSV processado com sucesso"

# Verificar estatísticas
echo ""
echo "📊 Verificando estatísticas do banco..."
npm run db:stats

# Testar pesquisa
echo ""
echo "🔍 Testando pesquisa..."
npm run db:search "teste"

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Iniciar servidor: npm run server"
echo "2. Acessar interface: http://localhost:3001"
echo "3. Para desenvolvimento Vue.js: npm run dev"
echo ""
echo "📚 COMANDOS ÚTEIS:"
echo "- npm run server        # Iniciar servidor"
echo "- npm run server:dev    # Servidor com auto-reload"
echo "- npm run db:process    # Reprocessar CSV"
echo "- npm run db:search     # Pesquisar via CLI"
echo "- npm run db:stats      # Ver estatísticas"
echo ""
echo "🔗 URLs:"
echo "- Frontend SQLite: http://localhost:3001"
echo "- Frontend Vue.js: http://localhost:3000"
echo "- API REST: http://localhost:3001/api"
echo ""
echo "✨ Sistema pronto para uso!"
