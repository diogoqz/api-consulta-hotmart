# 🚀 Deploy no EasyPanel

Guia completo para fazer deploy do sistema de pesquisa Hotmart no EasyPanel.

## 📋 **Pré-requisitos**

- Conta no EasyPanel
- Repositório GitHub configurado
- Acesso SSH ao servidor (se necessário)

## 🔧 **Configuração do Repositório**

### 1. **Estrutura do Repositório**
```
api-consulta-hotmart/
├── Dockerfile                 # Configuração Docker
├── docker-compose.yml         # Orquestração Docker
├── package.json              # Dependências Node.js
├── server.js                 # Servidor Express
├── csv-to-sqlite.js          # Processador CSV
├── public/                   # Arquivos estáticos
│   ├── index-api.html        # Interface principal
│   ├── admin.html            # Painel administrativo
│   └── color-palette.html    # Paleta de cores
├── uploads/                  # Diretório de uploads
│   └── .gitkeep
├── .dockerignore             # Arquivos ignorados no Docker
├── .gitignore               # Arquivos ignorados no Git
└── README.md                # Documentação
```

### 2. **Arquivos Essenciais**
- ✅ `Dockerfile` - Configuração do container
- ✅ `package.json` - Dependências e scripts
- ✅ `server.js` - Servidor principal
- ✅ `public/` - Interface web

## 🐳 **Configuração Docker**

### **Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p uploads
EXPOSE 3001
CMD ["npm", "start"]
```

### **docker-compose.yml**
```yaml
version: '3.8'
services:
  hotmart-search:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - ./uploads:/app/uploads
      - ./data:/app/data
    restart: unless-stopped
```

## 📦 **Deploy no EasyPanel**

### 1. **Criar Novo Projeto**
1. Acesse o EasyPanel
2. Clique em "Novo Projeto"
3. Selecione "GitHub"
4. Conecte seu repositório

### 2. **Configuração do Projeto**
```
Nome: hotmart-client-search
Branch: main
Build Command: npm install
Start Command: npm start
Port: 3000
```

### 3. **Variáveis de Ambiente**
```
NODE_ENV=production
PORT=3000
```

### 4. **Volumes Persistentes**
```
/app/uploads -> uploads
/app/data -> data
```

## 🔄 **Processo de Deploy**

### **Build Automático**
1. Push para `main` branch
2. EasyPanel detecta mudanças
3. Executa `npm install`
4. Inicia com `npm start`

### **Verificação**
- ✅ Build bem-sucedido
- ✅ Servidor rodando na porta 3000
- ✅ Health check passando
- ✅ Interface acessível

## 📊 **Monitoramento**

### **Logs**
```bash
# Ver logs do container
docker logs hotmart-search

# Logs em tempo real
docker logs -f hotmart-search
```

### **Health Check**
```bash
curl http://localhost:3000/api/health
```

## 🔧 **Administração**

### **Acessar Painel Admin**
```
https://seu-dominio.com/admin
```

### **Funcionalidades**
- 📊 Ver estatísticas do banco
- 📁 Upload de novo CSV
- 🔄 Processar dados
- 📈 Monitorar atualizações

### **Atualizar CSV**
1. Acesse `/admin`
2. Arraste ou selecione arquivo CSV
3. Clique em "Atualizar Banco de Dados"
4. Aguarde processamento
5. Verifique estatísticas atualizadas

## 🛠️ **Troubleshooting**

### **Problemas Comuns**

#### **1. Build Falha**
```bash
# Verificar logs
docker logs hotmart-search

# Verificar dependências
npm install --production
```

#### **2. Servidor Não Inicia**
```bash
# Verificar porta
netstat -tulpn | grep 3000

# Verificar variáveis de ambiente
echo $NODE_ENV
echo $PORT
```

#### **3. Upload Não Funciona**
```bash
# Verificar permissões
ls -la uploads/

# Verificar espaço em disco
df -h
```

### **Comandos Úteis**
```bash
# Reiniciar container
docker restart hotmart-search

# Ver logs em tempo real
docker logs -f hotmart-search

# Acessar container
docker exec -it hotmart-search sh

# Verificar status
docker ps
```

## 🔒 **Segurança**

### **Recomendações**
- ✅ Usar HTTPS
- ✅ Configurar firewall
- ✅ Limitar uploads (50MB)
- ✅ Validar arquivos CSV
- ✅ Logs de auditoria

### **Backup**
```bash
# Backup do banco
cp hotmart-data.db backup/

# Backup de configurações
tar -czf config-backup.tar.gz uploads/ data/
```

## 📈 **Performance**

### **Otimizações**
- ✅ SQLite com índices
- ✅ Cache de consultas
- ✅ Compressão gzip
- ✅ CDN para assets

### **Monitoramento**
- 📊 CPU e memória
- 📊 Tempo de resposta
- 📊 Taxa de erro
- 📊 Uso de disco

## 🎯 **URLs Importantes**

### **Produção**
- **Interface Principal**: `https://seu-dominio.com/`
- **Painel Admin**: `https://seu-dominio.com/admin`
- **API Health**: `https://seu-dominio.com/api/health`
- **API Stats**: `https://seu-dominio.com/api/stats`

### **Desenvolvimento**
- **Interface Principal**: `http://localhost:3000/`
- **Painel Admin**: `http://localhost:3000/admin`
- **API Health**: `http://localhost:3000/api/health`

## 🚀 **Deploy Rápido**

### **1. Preparar Repositório**
```bash
git add .
git commit -m "Preparar para deploy"
git push origin main
```

### **2. Configurar EasyPanel**
- Conectar repositório
- Configurar build
- Definir variáveis de ambiente
- Configurar volumes

### **3. Deploy**
- Clicar em "Deploy"
- Aguardar build
- Verificar logs
- Testar interface

### **4. Configurar Domínio**
- Adicionar domínio personalizado
- Configurar SSL
- Testar acesso

## ✅ **Checklist de Deploy**

- [ ] Repositório configurado
- [ ] Dockerfile criado
- [ ] package.json com scripts
- [ ] Variáveis de ambiente definidas
- [ ] Volumes persistentes configurados
- [ ] Health check funcionando
- [ ] Interface acessível
- [ ] Upload funcionando
- [ ] SSL configurado
- [ ] Backup configurado

---

**🎉 Sistema pronto para produção no EasyPanel!**
