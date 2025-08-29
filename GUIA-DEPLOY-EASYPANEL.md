# 🚀 GUIA COMPLETO DE DEPLOY NO EASYPANEL

## ✅ **REPOSITÓRIO CRIADO COM SUCESSO**

### 📍 **URL do Repositório**
```
https://github.com/diogoqz/api-consulta-hotmart
```

## 🎯 **PASSOS PARA DEPLOY NO EASYPANEL**

### **1. Acessar EasyPanel**
1. Faça login no [EasyPanel](https://easypanel.io)
2. Acesse seu dashboard

### **2. Criar Novo Projeto**
1. Clique em **"New Project"**
2. Selecione **"Git Repository"**
3. Configure o repositório:
   ```
   Repository: diogoqz/api-consulta-hotmart
   Branch: main
   ```

### **3. Configurar Build**
1. **Build Command**:
   ```bash
   npm install
   ```

2. **Start Command**:
   ```bash
   npm start
   ```

3. **Port**:
   ```
   3000
   ```

### **4. Variáveis de Ambiente**
Adicione as seguintes variáveis:
```
NODE_ENV=production
PORT=3000
```

### **5. Volumes Persistentes**
Configure os seguintes volumes:
```
/app/uploads -> uploads
/app/data -> data
```

### **6. Health Check**
Configure o health check:
```
URL: /api/health
Interval: 30s
Timeout: 10s
```

## 🔧 **CONFIGURAÇÃO AVANÇADA**

### **Docker (Opcional)**
Se preferir usar Docker diretamente:

1. **Dockerfile** já configurado
2. **docker-compose.yml** disponível
3. **Build Command**:
   ```bash
   docker build -t hotmart-search .
   ```

### **Domínio Personalizado**
1. Configure seu domínio no EasyPanel
2. Adicione SSL/HTTPS
3. Configure proxy reverso se necessário

## 📊 **VERIFICAÇÃO PÓS-DEPLOY**

### **1. Health Check**
```bash
curl https://seu-dominio.com/api/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "records": 2435,
    "lastUpdate": "2025-01-XX..."
  }
}
```

### **2. Estatísticas**
```bash
curl https://seu-dominio.com/api/stats
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "total": {
      "total": 2435,
      "clientes_unicos": 2026,
      "ativos": 1275
    },
    "hotmart": 2305,
    "cakto": 130
  }
}
```

### **3. Interface Web**
- **Principal**: `https://seu-dominio.com/`
- **Admin**: `https://seu-dominio.com/admin`

## 🎯 **URLS IMPORTANTES**

### **Produção**
- **Interface Principal**: `https://seu-dominio.com/`
- **Painel Admin**: `https://seu-dominio.com/admin`
- **API Health**: `https://seu-dominio.com/api/health`
- **API Stats**: `https://seu-dominio.com/api/stats`

### **Desenvolvimento**
- **Interface Principal**: `http://localhost:3000/`
- **Painel Admin**: `http://localhost:3000/admin`
- **API Health**: `http://localhost:3000/api/health`

## 📁 **ESTRUTURA DE ARQUIVOS**

### **Arquivos Essenciais**
```
📄 package.json          # Dependências e scripts
📄 server.js             # Servidor Express
📄 Dockerfile            # Configuração Docker
📄 docker-compose.yml    # Orquestração Docker
📄 .gitignore            # Arquivos ignorados
📄 README.md             # Documentação
```

### **Processadores**
```
📄 csv-to-sqlite.js      # Processador Hotmart
📄 cakto-processor.js    # Processador Cakto
```

### **Interface**
```
📁 public/
├── 📄 index-api.html    # Interface principal
├── 📄 admin.html        # Painel administrativo
└── 📄 color-palette.html # Demonstração de cores
```

## 🔄 **ATUALIZAÇÕES**

### **Deploy Automático**
- O EasyPanel fará deploy automático quando houver push para `main`
- Build e restart automáticos

### **Deploy Manual**
```bash
# Fazer alterações
git add .
git commit -m "Atualização"
git push origin main
```

## 📈 **MONITORAMENTO**

### **Logs**
- Acesse os logs no EasyPanel
- Monitore erros e performance

### **Métricas**
- **Tempo de resposta**: < 100ms
- **Uso de memória**: < 100MB
- **Disco**: ~50MB

### **Health Checks**
- Verificação automática a cada 30s
- Notificações em caso de falha

## 🛠️ **TROUBLESHOOTING**

### **Problemas Comuns**

#### **1. Build Falha**
```bash
# Verificar logs
npm install --verbose

# Verificar Node.js version
node --version  # Deve ser 18+
```

#### **2. Porta em Uso**
```bash
# Verificar se porta 3000 está livre
netstat -tulpn | grep 3000
```

#### **3. Banco não Conecta**
```bash
# Verificar permissões
ls -la *.db

# Verificar se arquivos existem
ls -la data/
```

#### **4. Upload Falha**
- Verificar tamanho do arquivo (< 50MB)
- Verificar formato (.csv)
- Verificar permissões da pasta uploads

### **Comandos de Debug**
```bash
# Verificar status do container
docker ps

# Ver logs do container
docker logs <container-id>

# Acessar container
docker exec -it <container-id> /bin/sh
```

## 🎉 **CHECKLIST FINAL**

### **✅ Pré-Deploy**
- [ ] Repositório criado no GitHub
- [ ] Todos os arquivos commitados
- [ ] Dockerfile configurado
- [ ] package.json com scripts corretos
- [ ] .gitignore configurado

### **✅ EasyPanel**
- [ ] Projeto criado
- [ ] Repositório conectado
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Porta 3000 definida
- [ ] Variáveis de ambiente setadas
- [ ] Volumes persistentes configurados
- [ ] Health check ativo

### **✅ Pós-Deploy**
- [ ] Health check passando
- [ ] Interface acessível
- [ ] API respondendo
- [ ] Upload funcionando
- [ ] Pesquisa funcionando
- [ ] Estatísticas carregando

## 🚀 **SISTEMA PRONTO**

### **Status Final**
- ✅ **Repositório**: Criado e enviado
- ✅ **Código**: 100% funcional
- ✅ **Docker**: Configurado
- ✅ **Documentação**: Completa
- ✅ **Deploy**: Pronto para EasyPanel

### **Próximos Passos**
1. **Configurar EasyPanel** seguindo este guia
2. **Fazer deploy** do repositório
3. **Testar funcionalidades** em produção
4. **Configurar domínio** personalizado
5. **Monitorar performance** e logs

---

## 📞 **SUPORTE**

### **Recursos**
- **GitHub**: https://github.com/diogoqz/api-consulta-hotmart
- **Issues**: Para reportar problemas
- **Documentação**: README.md completo
- **EasyPanel**: Suporte oficial

### **Contato**
- **Desenvolvedor**: Diogo
- **Projeto**: Sistema de Pesquisa Hotmart & Cakto
- **Versão**: 1.0.0
- **Status**: Pronto para produção

**🎉 Sistema 100% configurado e pronto para deploy no EasyPanel!**
