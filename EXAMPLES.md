# Exemplos de Uso - PDF Processor

## Índice
- [Cenários Comuns](#cenários-comuns)
- [Exemplos de API](#exemplos-de-api)
- [Casos de Teste](#casos-de-teste)
- [Troubleshooting](#troubleshooting)

---

## Cenários Comuns

### Cenário 1: Processar Contratos com Capa Corporativa

**Situação**: Você tem 50 contratos em PDF e precisa adicionar a capa da empresa em todos.

**Entrada**:
- `contratos.zip` (50 PDFs, cada um com 5-10 páginas)
- `capa-empresa.pdf` (capa corporativa)
- Rodapé: 15px (para remover número de página)

**Resultado**:
- 50 PDFs processados
- Cada um com capa corporativa na primeira página
- Páginas sem número no rodapé
- Última página removida

---

### Cenário 2: Relatórios com Logo PNG

**Situação**: Relatórios mensais que precisam de logo na capa.

**Entrada**:
- `relatorios-mensais.zip` (12 PDFs)
- `logo-empresa.png` (500x200px)
- Rodapé: 10px (padrão)

**Resultado**:
- Logo convertido para PDF e dimensionado
- Centralizado em página A4
- Aplicado como capa em todos os relatórios

---

### Cenário 3: Propostas Comerciais

**Situação**: Propostas geradas automaticamente precisam de capa personalizada.

**Entrada**:
- `propostas.zip` (20 PDFs)
- `capa-proposta.jpg` (imagem de alta qualidade)
- Rodapé: 20px (remover disclaimers)

**Resultado**:
- Capa JPG convertida e aplicada
- Disclaimers de rodapé removidos
- Última página (template vazio) excluída

---

## Exemplos de API

### Exemplo 1: cURL - Upload Básico

```bash
curl -X POST http://localhost:3001/api/process \
  -F "filesZip=@./documentos.zip" \
  -F "cover=@./capa.pdf" \
  -F "footerHeightPx=10" \
  --output processed-pdfs.zip
```

### Exemplo 2: cURL - Com Imagem de Capa

```bash
curl -X POST http://localhost:3001/api/process \
  -F "filesZip=@./contratos.zip" \
  -F "cover=@./logo.png" \
  -F "footerHeightPx=15" \
  -i \
  --output result.zip
```

### Exemplo 3: JavaScript/Node.js

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function processpdfs() {
  const form = new FormData();
  form.append('filesZip', fs.createReadStream('./pdfs.zip'));
  form.append('cover', fs.createReadStream('./cover.pdf'));
  form.append('footerHeightPx', '10');

  const response = await axios.post('http://localhost:3001/api/process', form, {
    headers: form.getHeaders(),
    responseType: 'arraybuffer'
  });

  // Salvar ZIP processado
  fs.writeFileSync('output.zip', response.data);

  // Ler relatório
  const report = JSON.parse(response.headers['x-process-report']);
  console.log('Relatório:', report);
}

processpdfs();
```

### Exemplo 4: Python

```python
import requests

url = 'http://localhost:3001/api/process'

files = {
    'filesZip': open('documents.zip', 'rb'),
    'cover': open('cover.pdf', 'rb')
}

data = {
    'footerHeightPx': '10'
}

response = requests.post(url, files=files, data=data)

# Salvar ZIP processado
with open('processed.zip', 'wb') as f:
    f.write(response.content)

# Ler relatório
report = response.headers.get('X-Process-Report')
print(f'Relatório: {report}')
```

### Exemplo 5: Postman

**Request**:
```
POST http://localhost:3001/api/process
Content-Type: multipart/form-data

Body:
  - filesZip: [Select File] documents.zip
  - cover: [Select File] cover.pdf
  - footerHeightPx: 10
```

**Response Headers**:
```
Content-Type: application/zip
Content-Disposition: attachment; filename="processed-pdfs.zip"
X-Process-Report: [{"name":"doc1.pdf","originalPages":5,"finalPages":4,"success":true}]
```

---

## Casos de Teste

### Teste 1: PDF de 1 Página

**Input**:
```
single-page.pdf:
  - Page 1: Content
```

**Process**:
- Substitui Page 1 por capa

**Output**:
```
single-page.pdf:
  - Page 1: Cover
```

**Relatório**:
```json
{
  "name": "single-page.pdf",
  "originalPages": 1,
  "finalPages": 1,
  "success": true
}
```

---

### Teste 2: PDF de 2 Páginas

**Input**:
```
two-pages.pdf:
  - Page 1: Introduction
  - Page 2: Conclusion
```

**Process**:
- Substitui Page 1 por capa
- Remove Page 2 (última)

**Output**:
```
two-pages.pdf:
  - Page 1: Cover
```

**Relatório**:
```json
{
  "name": "two-pages.pdf",
  "originalPages": 2,
  "finalPages": 1,
  "success": true
}
```

---

### Teste 3: PDF de 5 Páginas

**Input**:
```
document.pdf:
  - Page 1: Title
  - Page 2: Chapter 1 [footer: "Page 2"]
  - Page 3: Chapter 2 [footer: "Page 3"]
  - Page 4: Chapter 3 [footer: "Page 4"]
  - Page 5: Appendix
```

**Process** (footerHeightPx: 10):
- Substitui Page 1 por capa
- Pages 2-4: Remove rodapé (área branca 10px)
- Remove Page 5 (última)

**Output**:
```
document.pdf:
  - Page 1: Cover
  - Page 2: Chapter 1 [footer: WHITE SPACE]
  - Page 3: Chapter 2 [footer: WHITE SPACE]
  - Page 4: Chapter 3 [footer: WHITE SPACE]
```

**Relatório**:
```json
{
  "name": "document.pdf",
  "originalPages": 5,
  "finalPages": 4,
  "success": true
}
```

---

### Teste 4: ZIP com Múltiplos PDFs

**Input ZIP**:
```
documents.zip:
  ├── contract-1.pdf (3 pages)
  ├── contract-2.pdf (5 pages)
  ├── readme.txt (ignored)
  └── report.pdf (2 pages)
```

**Output ZIP**:
```
processed-pdfs.zip:
  ├── contract-1.pdf (2 pages)
  ├── contract-2.pdf (4 pages)
  └── report.pdf (1 page)
```

**Relatório**:
```json
[
  {
    "name": "contract-1.pdf",
    "originalPages": 3,
    "finalPages": 2,
    "success": true
  },
  {
    "name": "contract-2.pdf",
    "originalPages": 5,
    "finalPages": 4,
    "success": true
  },
  {
    "name": "report.pdf",
    "originalPages": 2,
    "finalPages": 1,
    "success": true
  }
]
```

---

### Teste 5: PDF Corrompido

**Input**:
```
corrupted.zip:
  └── broken.pdf (invalid format)
```

**Output ZIP**:
```
processed-pdfs.zip:
  (empty)
```

**Relatório**:
```json
[
  {
    "name": "broken.pdf",
    "originalPages": 0,
    "finalPages": 0,
    "success": false,
    "error": "Failed to load PDF"
  }
]
```

---

### Teste 6: Capa em SVG

**Input**:
```
Cover: logo.svg (vector graphics)
PDFs: 3 documents
```

**Process**:
- SVG convertido para PNG
- PNG convertido para PDF
- PDF aplicado como capa

**Output**:
- 3 PDFs com capa vetorial (renderizada)

---

## Troubleshooting

### Problema 1: ZIP não contém PDFs

**Erro**:
```json
{
  "error": "No PDF files found in ZIP"
}
```

**Solução**:
- Verifique se o ZIP contém arquivos `.pdf`
- Extensão deve ser lowercase
- PDFs não devem estar em subpastas (apenas raiz do ZIP)

---

### Problema 2: Capa inválida

**Erro**:
```json
{
  "error": "Cover file must be PDF or image (PNG/JPG/SVG)"
}
```

**Solução**:
- Use apenas: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.svg`
- Verifique o MIME type do arquivo
- Arquivo não pode estar corrompido

---

### Problema 3: Arquivo muito grande

**Erro**:
```
File too large
```

**Solução**:
- Limite atual: 100MB
- Divida o ZIP em partes menores
- Ou ajuste `MAX_FILE_SIZE` no `.env`

---

### Problema 4: Alguns PDFs falharam

**Cenário**:
```json
[
  { "name": "doc1.pdf", "success": true },
  { "name": "doc2.pdf", "success": false, "error": "Invalid PDF" }
]
```

**Solução**:
- Verifique doc2.pdf individualmente
- Pode estar corrompido ou criptografado
- Tente recriar o PDF
- PDFs protegidos por senha não funcionam

---

### Problema 5: Rodapé não foi totalmente removido

**Situação**:
Ainda aparecem rastros do rodapé

**Solução**:
- Aumente `footerHeightPx` (ex: de 10 para 20)
- Teste com diferentes valores
- Inspecione o PDF original para medir a altura exata

---

## Exemplos de Respostas da API

### Sucesso Total

**Request**:
```
POST /api/process
- filesZip: 3 PDFs válidos
- cover: capa.pdf
```

**Response**:
```
Status: 200 OK
Content-Type: application/zip
X-Process-Report: [
  {"name":"doc1.pdf","originalPages":5,"finalPages":4,"success":true},
  {"name":"doc2.pdf","originalPages":3,"finalPages":2,"success":true},
  {"name":"doc3.pdf","originalPages":2,"finalPages":1,"success":true}
]
Body: <binary ZIP data>
```

---

### Sucesso Parcial

**Request**:
```
POST /api/process
- filesZip: 2 PDFs válidos + 1 corrompido
- cover: logo.png
```

**Response**:
```
Status: 200 OK
X-Process-Report: [
  {"name":"good1.pdf","originalPages":4,"finalPages":3,"success":true},
  {"name":"good2.pdf","originalPages":2,"finalPages":1,"success":true},
  {"name":"bad.pdf","originalPages":0,"finalPages":0,"success":false,"error":"Failed to load PDF"}
]
Body: <ZIP with 2 processed PDFs>
```

---

### Erro de Validação

**Request**:
```
POST /api/process
- filesZip: (missing)
- cover: capa.pdf
```

**Response**:
```
Status: 400 Bad Request
Content-Type: application/json
{
  "error": "Missing required files: filesZip and cover"
}
```

---

## Scripts Úteis

### Script Bash: Processar em Lote

```bash
#!/bin/bash

# Processar múltiplos diretórios
for dir in ./projects/*/; do
    cd "$dir"

    # Criar ZIP
    zip -r pdfs.zip *.pdf

    # Processar
    curl -X POST http://localhost:3001/api/process \
      -F "filesZip=@pdfs.zip" \
      -F "cover=@../cover.pdf" \
      -F "footerHeightPx=15" \
      --output "processed-$(basename $dir).zip"

    cd ..
done
```

### Script PowerShell: Automatizar Processamento

```powershell
$dirs = Get-ChildItem -Directory

foreach ($dir in $dirs) {
    Set-Location $dir.FullName

    # Criar ZIP
    Compress-Archive -Path *.pdf -DestinationPath pdfs.zip -Force

    # Processar
    $form = @{
        filesZip = Get-Item "pdfs.zip"
        cover = Get-Item "..\cover.pdf"
        footerHeightPx = "10"
    }

    Invoke-WebRequest -Uri "http://localhost:3001/api/process" `
        -Method Post -Form $form -OutFile "processed.zip"

    Set-Location ..
}
```

---

## Testes com Jest

### Executar teste específico

```bash
# Apenas testes de PDF service
npm test -- pdf.service.test.ts

# Apenas testes de controller
npm test -- process.controller.test.ts

# Com coverage
npm test -- --coverage
```

### Ver resultado de teste

```bash
npm test -- --verbose
```

---

## Dicas de Performance

1. **Otimize tamanho do ZIP**:
   ```bash
   # Comprimir PDFs antes
   gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
      -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH \
      -sOutputFile=output.pdf input.pdf
   ```

2. **Processe em paralelo (múltiplas requisições)**:
   ```javascript
   // Dividir em chunks de 10 PDFs por ZIP
   const chunks = chunkArray(allPdfs, 10);
   const promises = chunks.map(chunk => processChunk(chunk));
   await Promise.all(promises);
   ```

3. **Use capa PDF em vez de imagem**:
   - Conversão de imagem → PDF adiciona overhead
   - PDF direto é mais rápido

---

Consulte [README.md](README.md) para documentação completa.
