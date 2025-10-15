# 🚀 Primeiro Uso - PDF Processor

Guia passo-a-passo para seu primeiro processamento de PDFs.

---

## ⚡ Início Ultra-Rápido (3 Comandos)

```bash
# 1. Entre no diretório
cd pdf-processor

# 2. Inicie com Docker
docker-compose up --build

# 3. Abra o navegador
# http://localhost
```

✅ **Pronto!** A aplicação está rodando.

---

## 📝 Seu Primeiro Processamento

### Passo 1: Prepare os Arquivos de Teste

Vamos criar arquivos simples para testar:

#### Opção A: Usar arquivos existentes
Se você já tem PDFs, pule para o Passo 2.

#### Opção B: Criar PDFs de teste

1. **Crie 2-3 PDFs simples:**
   - Abra Word/Google Docs/LibreOffice
   - Digite qualquer texto (ex: "Teste 1", "Teste 2")
   - Salve como PDF
   - Nomeie: `teste1.pdf`, `teste2.pdf`, `teste3.pdf`

2. **Crie um arquivo de capa:**
   - Crie mais um documento
   - Digite "CAPA DO DOCUMENTO"
   - Salve como `capa.pdf`

3. **Crie o ZIP:**

   **Windows:**
   ```
   - Selecione teste1.pdf, teste2.pdf, teste3.pdf
   - Clique direito > Enviar para > Pasta compactada (zip)
   - Nomeie: documentos.zip
   ```

   **Linux/Mac:**
   ```bash
   zip documentos.zip teste1.pdf teste2.pdf teste3.pdf
   ```

---

### Passo 2: Acesse a Aplicação

1. Abra o navegador
2. Acesse: **http://localhost** (Docker) ou **http://localhost:3000** (dev local)
3. Você verá a interface de upload

---

### Passo 3: Faça o Upload

1. **Campo "ZIP com PDFs":**
   - Clique em "Escolher arquivo"
   - Selecione `documentos.zip`
   - Veja o nome do arquivo aparecer ao lado

2. **Campo "Arquivo de Capa":**
   - Clique em "Escolher arquivo"
   - Selecione `capa.pdf`
   - Veja o nome do arquivo aparecer ao lado

3. **Campo "Altura do Rodapé (px)":**
   - Deixe em 10 (padrão)
   - Ou ajuste se necessário

4. **Campo "Altura do Cabeçalho (px)":**
   - Deixe em 0 (padrão, sem remoção)
   - Ou defina um valor se seus PDFs têm cabeçalho para remover

---

### Passo 4: Processar

1. Clique no botão **"Processar PDFs"**
2. Aguarde o processamento (5-30 segundos)
3. Observe:
   - Botão fica desabilitado
   - Texto muda para "Processando..."

---

### Passo 5: Verificar Resultados

#### Download Automático
- O arquivo `processed-pdfs.zip` será baixado automaticamente
- Verifique sua pasta de Downloads

#### Relatório na Tela
Você verá uma tabela com:

```
╔════════════╦════════════╦════════════╦═══════════╗
║ Arquivo    ║ Pág. Orig. ║ Pág. Final ║ Status    ║
╠════════════╬════════════╬════════════╬═══════════╣
║ teste1.pdf ║ 1          ║ 1          ║ ✓ Sucesso ║
║ teste2.pdf ║ 1          ║ 1          ║ ✓ Sucesso ║
║ teste3.pdf ║ 1          ║ 1          ║ ✓ Sucesso ║
╚════════════╩════════════╩════════════╩═══════════╝
```

**Resumo:**
- Total: 3 arquivo(s)
- Sucesso: 3
- Falhas: 0

---

### Passo 6: Verificar PDFs Processados

1. Extraia `processed-pdfs.zip`
2. Abra `teste1.pdf`
3. Verifique:
   - ✅ Primeira página foi substituída pela capa
   - ✅ Se tinha mais páginas, a última foi removida
   - ✅ Rodapé foi removido das páginas intermediárias

---

## 🎯 Teste Avançado

### Criar PDFs com Múltiplas Páginas

1. **Documento com 5 páginas:**
   ```
   Página 1: Título
   Página 2: Capítulo 1
   Página 3: Capítulo 2
   Página 4: Capítulo 3
   Página 5: Fim
   ```

2. **Processar novamente**

3. **Resultado esperado:**
   ```
   Página 1: CAPA (substituída)
   Página 2: Capítulo 1 (rodapé removido)
   Página 3: Capítulo 2 (rodapé removido)
   Página 4: Capítulo 3 (rodapé removido)
   (Página 5 "Fim" foi REMOVIDA)
   ```

---

## 🖼️ Teste com Imagem de Capa

### Usar PNG/JPG como Capa

1. **Prepare uma imagem:**
   - Qualquer PNG ou JPG
   - Recomendado: 800x1000px ou A4 (595x842)
   - Pode ser logo da empresa, foto, etc.

2. **Upload:**
   - ZIP: mesmo `documentos.zip`
   - Capa: selecione `logo.png` (em vez de PDF)

3. **Processar**

4. **Resultado:**
   - Imagem foi convertida para PDF
   - Aplicada como primeira página
   - Centralizada e redimensionada

---

## 📊 Entendendo os Resultados

### Caso 1: PDF de 1 Página

```
Entrada:  [P1]
Saída:    [Capa]
```
- P1 substituída por capa
- Nenhuma página removida (só tem 1)

---

### Caso 2: PDF de 2 Páginas

```
Entrada:  [P1, P2]
Saída:    [Capa]
```
- P1 substituída por capa
- P2 removida (última página)

---

### Caso 3: PDF de 5 Páginas

```
Entrada:  [P1, P2, P3, P4, P5]
Saída:    [Capa, P2*, P3*, P4*]
```
- P1 substituída por capa
- P2, P3, P4: rodapé removido (*)
- P5 removida (última página)

---

## ⚙️ Ajustando Parâmetros

### Altura do Rodapé

O rodapé é removido criando uma área branca no final da página.

**Valores comuns:**
- `0px` - sem rodapé para remover
- `10px` - rodapé pequeno (número de página)
- `20px` - rodapé médio (texto + número)
- `30px` - rodapé grande (logo + texto)
- `50px` - rodapé muito grande

**Como escolher:**
1. Abra um PDF original
2. Meça visualmente a altura do rodapé
3. Teste valores até encontrar o ideal

---

### Altura do Cabeçalho

O cabeçalho é removido criando uma área branca no topo da página.

**Valores comuns:**
- `0px` - sem cabeçalho para remover (padrão)
- `15px` - cabeçalho pequeno (número de página)
- `25px` - cabeçalho médio (texto + logo pequeno)
- `40px` - cabeçalho grande (logo + texto)
- `60px` - cabeçalho muito grande

**Como escolher:**
1. Abra um PDF original
2. Meça visualmente a altura do cabeçalho
3. Teste valores até encontrar o ideal

**Nota:** Você pode remover tanto cabeçalho quanto rodapé ao mesmo tempo!

---

## 🔍 Verificação de Saúde

### Testar se está funcionando

```bash
# Health check do backend
curl http://localhost:3001/health

# Deve retornar:
# {"status":"ok","timestamp":"2025-01-15T..."}
```

### Ver logs

```bash
# Docker
docker-compose logs -f

# Procurar por:
# ✓ "Server running on port 3001"
# ✓ "ready in XXX ms"
```

---

## 🐛 Problemas Comuns

### "Nenhum PDF encontrado no ZIP"

**Causa:**
- ZIP não contém arquivos .pdf
- Arquivos estão em subpastas

**Solução:**
- Coloque PDFs direto na raiz do ZIP
- Extensão deve ser `.pdf` (lowercase)

---

### "Arquivo de capa inválido"

**Causa:**
- Arquivo não é PDF nem imagem
- Formato não suportado

**Solução:**
- Use apenas: .pdf, .png, .jpg, .jpeg, .svg
- Verifique se arquivo não está corrompido

---

### "Download não inicia"

**Causa:**
- Popup blocker
- Erro de processamento

**Solução:**
- Permita popups no navegador
- Verifique console do navegador (F12)
- Veja relatório de erros

---

## 📱 Testar no Mobile

1. **Descubra seu IP local:**
   ```bash
   # Linux/Mac
   ifconfig | grep inet

   # Windows
   ipconfig
   ```

2. **Acesse do celular:**
   ```
   http://SEU_IP:80
   exemplo: http://192.168.1.100
   ```

3. **Upload e processar normalmente**

---

## 🎓 Próximos Passos

Agora que você testou:

1. **Explore a documentação:**
   - [README.md](README.md) - Documentação completa
   - [EXAMPLES.md](EXAMPLES.md) - Mais exemplos
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Como funciona

2. **Teste cenários reais:**
   - Seus PDFs de trabalho
   - Diferentes tamanhos
   - Muitos arquivos (50+)

3. **Customize:**
   - Ajuste estilos em `frontend/src/App.css`
   - Modifique lógica em `backend/src/services/`
   - Adicione features

4. **Deploy em produção:**
   - Suba para servidor
   - Configure domínio
   - Adicione HTTPS

---

## 📞 Precisa de Ajuda?

- **Documentação**: [README.md](README.md)
- **Instalação**: [INSTALL_GUIDE.md](INSTALL_GUIDE.md)
- **Exemplos**: [EXAMPLES.md](EXAMPLES.md)
- **Issues**: GitHub Issues

---

## ✅ Checklist do Primeiro Uso

- [ ] Docker/Node instalado
- [ ] Aplicação iniciada com sucesso
- [ ] Interface acessível no navegador
- [ ] PDFs de teste criados
- [ ] ZIP criado
- [ ] Capa preparada
- [ ] Upload realizado
- [ ] Processamento concluído
- [ ] Download do resultado
- [ ] PDFs verificados
- [ ] Relatório analisado

---

**Parabéns! 🎉**

Você completou seu primeiro processamento de PDFs!

Agora você pode:
- Processar seus próprios documentos
- Experimentar diferentes configurações
- Integrar com seus sistemas
- Contribuir com melhorias

**Bem-vindo ao PDF Processor!** 🚀
