# 🔍 Sistema de Pesquisa Hotmart - SQLite

Sistema de consulta de clientes Hotmart com banco de dados SQLite para performance otimizada.

## 🚀 **Características Principais**

### ✅ **Performance Otimizada**
- **Banco SQLite** para consultas ultra-rápidas
- **Índices otimizados** para pesquisa por nome, email e telefone
- **Atualizações incrementais** - só processa mudanças no CSV
- **Cache inteligente** com hash MD5 para detectar modificações

### ✅ **Pesquisa Robusta**
- Busca por **nome**, **email** e **telefone**
- **Sistema de relevância** com scoring
- **Agrupamento por cliente** com histórico completo
- **Sugestões fonéticas** (Soundex)

### ✅ **Interface Moderna**
- Design **dark theme** com highlights verdes
- **Responsivo** para mobile e desktop
- **Estatísticas em tempo real**
- **Botões de copiar** para contatos

## 📦 **Instalação e Configuração**

### 1. **Instalar Dependências**
```bash
npm install
```

### 2. **Processar CSV Inicial**
```bash
npm run db:process
```

### 3. **Iniciar Servidor**
```bash
npm run server
```

### 4. **Acessar Aplicação**
- **Frontend Vue.js**: `http://localhost:3000`
- **Frontend SQLite**: `http://localhost:3001`
- **API REST**: `http://localhost:3001/api`

## 🔧 **Scripts Disponíveis**

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento Vue.js |
| `npm run server` | Inicia servidor backend com SQLite |
| `npm run server:dev` | Inicia servidor com nodemon (auto-reload) |
| `npm run db:process` | Processa CSV e atualiza banco SQLite |
| `npm run db:search "joao"` | Pesquisa via linha de comando |
| `npm run db:stats` | Mostra estatísticas do banco |
| `npm run setup` | Processa CSV + inicia servidor |

## 📊 **API Endpoints**

### **Estatísticas**
```bash
GET /api/stats
```

### **Pesquisa Simples**
```bash
GET /api/search?q=joao&maxResults=50&minScore=5
```

### **Pesquisa Agrupada**
```bash
GET /api/search/grouped?q=joao&maxResults=50&minScore=5
```

### **Processar CSV**
```bash
POST /api/process
```

### **Status do Sistema**
```bash
GET /api/health
```

## 🔄 **Atualização de Dados**

### **Atualização Automática**
1. Substitua o arquivo `relatorio-hotmart.csv`
2. Execute: `npm run db:process`
3. O sistema detecta mudanças automaticamente

### **Verificar Mudanças**
```bash
# Ver estatísticas atuais
npm run db:stats

# Processar se houver mudanças
npm run db:process
```

## 📁 **Estrutura de Arquivos**

```
api-consulta-hotmart/
├── relatorio-hotmart.csv          # Dados de vendas
├── csv-to-sqlite.js              # Processador CSV → SQLite
├── server.js                     # Servidor Express + API
├── hotmart-data.db               # Banco SQLite (gerado)
├── csv-metadata.json             # Metadados de processamento
├── public/
│   ├── index-api.html            # Frontend SQLite
│   └── test-search.html          # Página de testes
├── src/                          # Frontend Vue.js
└── package.json
```

## 🎯 **Como Usar**

### **1. Primeira Execução**
```bash
# Instalar dependências
npm install

# Processar CSV inicial
npm run db:process

# Iniciar servidor
npm run server
```

### **2. Pesquisar Clientes**
- Acesse: `http://localhost:3001`
- Digite nome, email ou telefone
- Resultados aparecem em tempo real

### **3. Atualizar Dados**
```bash
# Substitua o CSV e execute
npm run db:process
```

## 🔍 **Exemplos de Pesquisa**

### **Por Nome**
```
joão silva
maria santos
```

### **Por Email**
```
joao@email.com
maria@gmail
```

### **Por Telefone**
```
11999999999
(11) 99999-9999
1199999999
```

## 📈 **Vantagens do SQLite**

### **Performance**
- ⚡ **Consultas 10x mais rápidas** que CSV
- 🔍 **Índices otimizados** para busca
- 💾 **Menos uso de memória**

### **Funcionalidades**
- 🔄 **Atualizações incrementais**
- 📊 **Estatísticas em tempo real**
- 🎯 **Sistema de relevância**
- 📱 **API REST completa**

### **Manutenção**
- 🛠️ **Fácil backup** (arquivo único)
- 🔧 **Sem configuração de servidor**
- 📝 **Logs detalhados**

## 🚨 **Troubleshooting**

### **Erro: "CSV não encontrado"**
```bash
# Verificar se o arquivo existe
ls -la relatorio-hotmart.csv

# Verificar permissões
chmod 644 relatorio-hotmart.csv
```

### **Erro: "Banco não acessível"**
```bash
# Remover banco corrompido
rm hotmart-data.db

# Reprocessar CSV
npm run db:process
```

### **Erro: "Porta em uso"**
```bash
# Verificar processos
lsof -i :3001

# Matar processo
kill -9 <PID>
```

## 📞 **Suporte**

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Teste com `npm run db:stats`
3. Verifique se o CSV está correto

---

**🎉 Sistema otimizado para máxima performance e facilidade de uso!**
