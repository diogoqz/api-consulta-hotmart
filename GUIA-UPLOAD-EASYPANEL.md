# 📤 Guia: Upload de Dados para EasyPanel

## 🎯 **Situação Atual**

✅ **API funcionando** na nuvem  
✅ **Frontend corrigido** (URLs relativas)  
❌ **Banco de dados vazio** (0 registros)  
❌ **Upload automático** com erro 500  

## 🚀 **Solução: Upload Manual**

### **Passo 1: Acessar Admin Panel**
```
🌐 URL: https://api-htmcakto.rtp53d.easypanel.host/admin
```

### **Passo 2: Upload Hotmart**
1. **Aba "Hotmart"** (já selecionada)
2. **Arrastar arquivo** `relatorio-hotmart.csv` para a área de upload
3. **Clicar "Atualizar Hotmart"**
4. **Aguardar** processamento

### **Passo 3: Upload Cakto**
1. **Clicar aba "Cakto"**
2. **Arrastar arquivo** `vendas-cakto.csv` para a área de upload
3. **Clicar "Atualizar Cakto"**
4. **Aguardar** processamento

### **Passo 4: Verificar**
1. **Voltar para aba "Hotmart"**
2. **Verificar estatísticas** atualizadas
3. **Testar pesquisa** na página principal

## 📁 **Arquivos Necessários**

### **Local (seu computador):**
- ✅ `relatorio-hotmart.csv` (543 KB)
- ✅ `vendas-cakto.csv` (43 KB)

### **EasyPanel:**
- ❌ Arquivos não enviados ainda
- ❌ Banco vazio

## 🔧 **URLs Importantes**

### **Frontend Principal:**
```
https://api-htmcakto.rtp53d.easypanel.host
```

### **Admin Panel:**
```
https://api-htmcakto.rtp53d.easypanel.host/admin
```

### **API Stats:**
```
https://api-htmcakto.rtp53d.easypanel.host/api/stats
```

## 📊 **Estatísticas Esperadas**

### **Após Upload Hotmart:**
- Total: ~2.305 registros
- Clientes únicos: ~1.200+
- Emails únicos: ~1.200+

### **Após Upload Cakto:**
- Total: ~100+ registros
- Clientes únicos: ~100+
- Emails únicos: ~100+

## ⚠️ **Possíveis Problemas**

### **Erro 500 no Upload:**
- **Causa:** Problema no servidor EasyPanel
- **Solução:** Tentar novamente ou verificar logs

### **Arquivo não carrega:**
- **Causa:** Tamanho ou formato incorreto
- **Solução:** Verificar se é CSV válido

### **Processamento lento:**
- **Causa:** Servidor processando dados
- **Solução:** Aguardar (pode demorar 1-2 minutos)

## 🎯 **Próximos Passos**

1. **Acessar** admin panel
2. **Fazer upload** dos 2 arquivos CSV
3. **Verificar** estatísticas
4. **Testar** pesquisa na página principal
5. **Confirmar** funcionamento completo

## 📞 **Suporte**

Se houver problemas:
1. **Verificar logs** do EasyPanel
2. **Tentar upload** novamente
3. **Verificar** formato dos arquivos CSV
4. **Contatar** suporte se necessário

---

**🎉 Após o upload, o sistema estará 100% funcional na nuvem!**
