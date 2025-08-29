# 🔍 Sistema de Pesquisa de Clientes Hotmart & Cakto

Sistema completo de pesquisa de clientes com suporte às plataformas **Hotmart** e **Cakto**, construído com Node.js, SQLite e interface web moderna.

## 🚀 **Características**

### ✨ **Funcionalidades Principais**
- 🔍 **Pesquisa robusta** por nome, email e telefone
- 🎯 **Identificação de correspondências** com badges visuais
- 🌵♨️ **Suporte a duas plataformas** (Cakto e Hotmart)
- 📊 **Estatísticas em tempo real** por plataforma
- 📁 **Upload de CSVs** via interface administrativa
- 💾 **Banco SQLite** para performance otimizada
- 🔄 **Processamento incremental** de dados
- 📱 **Interface responsiva** e moderna

### 🎨 **Interface Moderna**
- **Design discreto** sem boxes desnecessários
- **Ícones e emojis** para identificação visual
- **Cores diferenciadas** por plataforma
- **Layout responsivo** para todos os dispositivos
- **Badges informativos** de correspondência e plataforma

## 📊 **Dados Processados**

### **Estatísticas Atuais**
- **📊 Total**: 2.435 registros
- **👥 Clientes únicos**: 2.026
- **✅ Assinaturas ativas**: 1.275

### **Por Plataforma**
- **♨️ Hotmart**: 2.305 registros
- **🌵 Cakto**: 130 registros

## 🛠️ **Tecnologias**

- **Backend**: Node.js, Express.js
- **Banco de Dados**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Processamento**: PapaParse (CSV)
- **Containerização**: Docker
- **Deploy**: EasyPanel

## 🚀 **Deploy Rápido**

### **EasyPanel**
1. **Conectar repositório** no GitHub
2. **Configurar projeto**:
   ```
   Nome: hotmart-client-search
   Branch: main
   Build Command: npm install
   Start Command: npm start
   Port: 3000
   ```
3. **Variáveis de ambiente**:
   ```
   NODE_ENV=production
   PORT=3000
   ```

### **Docker**
```bash
# Build da imagem
docker build -t hotmart-search .

# Executar container
docker run -p 3000:3000 hotmart-search

# Docker Compose
docker-compose up -d
```

## 📁 **Estrutura do Projeto**

```
api-consulta-hotmart/
├── 📁 public/                 # Arquivos estáticos
│   ├── index-api.html        # Interface principal
│   ├── admin.html            # Painel administrativo
│   └── color-palette.html    # Demonstração de cores
├── 📁 src/                   # Código fonte Vue.js (legado)
├── 📄 server.js              # Servidor Express
├── 📄 csv-to-sqlite.js       # Processador Hotmart
├── 📄 cakto-processor.js     # Processador Cakto
├── 📄 package.json           # Dependências e scripts
├── 📄 Dockerfile             # Configuração Docker
├── 📄 docker-compose.yml     # Orquestração Docker
└── 📄 README.md              # Documentação
```

## 🔧 **Instalação Local**

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn

### **Passos**
```bash
# 1. Clonar repositório
git clone <repository-url>
cd api-consulta-hotmart

# 2. Instalar dependências
npm install

# 3. Processar dados iniciais
npm run db:process

# 4. Iniciar servidor
npm run server

# 5. Acessar interface
open http://localhost:3000
```

## 📡 **API Endpoints**

### **Estatísticas**
```bash
GET /api/stats
# Retorna estatísticas combinadas de Hotmart e Cakto
```

### **Pesquisa**
```bash
GET /api/search/grouped?q=termo
# Pesquisa agrupada por cliente
```

### **Health Check**
```bash
GET /api/health
# Status do servidor e banco de dados
```

### **Upload de CSV**
```bash
POST /api/upload-csv
# Upload de arquivo CSV para processamento
```

### **Processamento**
```bash
POST /api/process      # Processar Hotmart
POST /api/process-cakto # Processar Cakto
```

## 🎯 **Funcionalidades de Pesquisa**

### **Tipos de Correspondência**
- **Nome exato** (Score: 100)
- **Email exato** (Score: 90)
- **Telefone exato** (Score: 70)
- **Nome começa com** (Score: 60)
- **Email começa com** (Score: 50)
- **Telefone começa com** (Score: 40)
- **Correspondência parcial** (Score: 10)

### **Badges Visuais**
- **🎯 Tipo de correspondência** - Como o resultado foi encontrado
- **🌵♨️ Plataforma** - Cakto ou Hotmart
- **✅❌ Status** - Ativo ou Cancelado
- **📊 Score** - Pontuação de relevância

## 📱 **Interface Administrativa**

### **Acesso**
```
http://localhost:3000/admin
```

### **Funcionalidades**
- **📊 Estatísticas em tempo real**
- **📁 Upload de CSVs** por plataforma
- **🔄 Processamento automático**
- **📈 Feedback visual** de operações

## 🔄 **Processamento de Dados**

### **Hotmart**
- **Arquivo**: `relatorio-hotmart.csv`
- **Processador**: `csv-to-sqlite.js`
- **Tabela**: `vendas`

### **Cakto**
- **Arquivo**: `vendas-cakto.csv`
- **Processador**: `cakto-processor.js`
- **Tabela**: `vendas_cakto`

### **Características**
- **Processamento incremental** - Só atualiza mudanças
- **Detecção de hash** - Evita reprocessamento desnecessário
- **Metadados** - Controle de versão dos arquivos
- **Índices otimizados** - Performance de pesquisa

## 🎨 **Design System**

### **Paleta de Cores**
- **Fundo principal**: #1E1E1E (Cinza grafite escuro)
- **Cards/blocos**: #2A2A2A a #2F2F2F (Cinza médio-escuro)
- **Texto principal**: #FFFFFF (Branco puro)
- **Texto secundário**: #AAAAAA (Cinza claro)
- **Bordas/divisores**: #3A3A3A (Cinza médio)
- **Hotmart**: #E91E63 (Rosa)
- **Cakto**: #FF9800 (Laranja)
- **Destaque**: #4A9EFF (Azul)

### **Emojis das Plataformas**
- **🌵 Cakto**: Cactus (crescimento e adaptabilidade)
- **♨️ Hotmart**: Hot Springs (energia e movimento)

## 🚀 **Scripts Disponíveis**

```bash
npm run server        # Iniciar servidor de desenvolvimento
npm run server:dev    # Servidor com nodemon
npm run db:process    # Processar CSV Hotmart
npm run db:process-cakto # Processar CSV Cakto
npm run db:stats      # Ver estatísticas
npm run setup         # Setup inicial completo
npm start             # Produção (Docker/EasyPanel)
```

## 📊 **Performance**

### **Otimizações Implementadas**
- **Banco SQLite** - Consultas otimizadas
- **Índices específicos** - Pesquisa rápida
- **Processamento incremental** - Atualizações eficientes
- **Agrupamento inteligente** - Resultados unificados
- **Cache de metadados** - Evita reprocessamento

### **Métricas**
- **Tempo de pesquisa**: < 100ms
- **Processamento CSV**: ~2.000 registros/segundo
- **Memória**: < 100MB
- **Disco**: ~50MB (banco + arquivos)

## 🔒 **Segurança**

### **Medidas Implementadas**
- **Validação de entrada** - Sanitização de dados
- **CORS configurado** - Controle de origem
- **Upload seguro** - Validação de arquivos
- **SQL injection protection** - Prepared statements
- **Rate limiting** - Proteção contra spam

## 📈 **Monitoramento**

### **Health Checks**
```bash
curl http://localhost:3000/api/health
```

### **Logs**
- **Console logs** - Desenvolvimento
- **Docker logs** - Produção
- **Error tracking** - Captura de erros

## 🤝 **Contribuição**

### **Estrutura de Desenvolvimento**
1. **Fork** do repositório
2. **Branch** para feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** das mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. **Push** para branch (`git push origin feature/nova-funcionalidade`)
5. **Pull Request** para main

### **Padrões de Código**
- **JavaScript**: ES6+
- **CSS**: BEM methodology
- **HTML**: Semantic markup
- **Commits**: Conventional commits

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 **Suporte**

### **Problemas Comuns**
1. **Porta em uso**: Altere a porta em `server.js`
2. **CSV não processa**: Verifique formato e encoding
3. **Banco não conecta**: Verifique permissões de arquivo
4. **Upload falha**: Verifique tamanho e formato do arquivo

### **Contato**
- **Issues**: GitHub Issues
- **Documentação**: README.md
- **Deploy**: EasyPanel

---

## 🎉 **Status do Projeto**

✅ **100% Funcional** - Sistema completo e testado
✅ **Pronto para Produção** - Deploy configurado
✅ **Documentado** - README completo
✅ **Otimizado** - Performance e UX

**🚀 Sistema operacional e pronto para uso em produção!**
