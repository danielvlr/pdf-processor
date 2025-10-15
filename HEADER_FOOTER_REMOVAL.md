# Remoção de Cabeçalho e Rodapé - PDF Processor

## 📋 Visão Geral

O PDF Processor agora suporta a remoção simultânea de **cabeçalhos** e **rodapés** das páginas intermediárias dos PDFs processados.

---

## 🎯 Funcionalidade

### O que é removido?

- **Cabeçalho**: Área branca no **topo** de cada página intermediária
- **Rodapé**: Área branca na **parte inferior** de cada página intermediária

### Quais páginas são afetadas?

Apenas as **páginas intermediárias**:
- **Primeira página**: Substituída pela capa (não afetada por cabeçalho/rodapé)
- **Páginas do meio**: Cabeçalho e rodapé removidos
- **Última página**: Removida completamente

### Exemplo Visual

```
PDF Original (5 páginas):
┌──────────────┐
│  Cabeçalho   │  ← Removido
│              │
│   Conteúdo   │  ← Mantido
│              │
│   Rodapé     │  ← Removido
└──────────────┘

PDF Processado:
┌──────────────┐
│   [BRANCO]   │  ← Cabeçalho coberto
│              │
│   Conteúdo   │  ← Mantido
│              │
│   [BRANCO]   │  ← Rodapé coberto
└──────────────┘
```

---

## 🔧 Como Usar

### 1. Interface Web

Acesse a aplicação e preencha os campos:

1. **ZIP com PDFs**: Arquivo .zip contendo os PDFs
2. **Arquivo de Capa**: PDF ou imagem para usar como capa
3. **Altura do Rodapé (px)**: Defina a altura em pixels
   - Padrão: `10px`
   - Mínimo: `0px` (sem remoção)
   - Máximo: `200px`
4. **Altura do Cabeçalho (px)**: Defina a altura em pixels
   - Padrão: `0px` (sem remoção)
   - Mínimo: `0px`
   - Máximo: `200px`

### 2. Como Medir o Cabeçalho/Rodapé

#### Método 1: Visual (Rápido)

1. Abra um PDF original
2. Observe o cabeçalho/rodapé
3. Estime a altura:
   - Pequeno (só número): 10-15px
   - Médio (texto + número): 20-30px
   - Grande (logo + texto): 40-60px

#### Método 2: Preciso (Adobe Acrobat/PDF Viewer)

1. Abra o PDF no Adobe Acrobat
2. Use a ferramenta de medição
3. Meça a altura exata do cabeçalho/rodapé
4. Use esse valor em pixels

#### Método 3: Tentativa e Erro

1. Comece com valor pequeno (10px)
2. Processe um PDF de teste
3. Verifique se removeu o suficiente
4. Ajuste e teste novamente

---

## 📊 Casos de Uso

### Caso 1: Apenas Rodapé

```
Rodapé: 20px
Cabeçalho: 0px
```

Remove apenas o rodapé (número de página, por exemplo).

### Caso 2: Apenas Cabeçalho

```
Rodapé: 0px
Cabeçalho: 30px
```

Remove apenas o cabeçalho (logo da empresa, por exemplo).

### Caso 3: Ambos

```
Rodapé: 15px
Cabeçalho: 25px
```

Remove tanto cabeçalho quanto rodapé.

### Caso 4: Nenhum

```
Rodapé: 0px
Cabeçalho: 0px
```

Não remove nada, apenas substitui capa e remove última página.

---

## 🎨 Exemplos Práticos

### Exemplo 1: Documento Corporativo

**Cenário:**
- PDFs têm logo da empresa no topo (40px)
- Número de página no rodapé (15px)

**Configuração:**
```
Cabeçalho: 40px
Rodapé: 15px
```

**Resultado:**
- Logo removida
- Número de página removido
- Conteúdo principal preservado

---

### Exemplo 2: Relatório Acadêmico

**Cenário:**
- Título do capítulo no cabeçalho (25px)
- Nenhum rodapé

**Configuração:**
```
Cabeçalho: 25px
Rodapé: 0px
```

**Resultado:**
- Título do capítulo removido
- Rodapé não afetado (0px)

---

### Exemplo 3: Formulário Simples

**Cenário:**
- Sem cabeçalho
- Pequeno rodapé com data (10px)

**Configuração:**
```
Cabeçalho: 0px
Rodapé: 10px
```

**Resultado:**
- Cabeçalho não afetado (0px)
- Data removida

---

## 🔍 Verificação dos Resultados

Após processar os PDFs:

1. **Baixe o ZIP processado**
2. **Extraia os arquivos**
3. **Abra um PDF**
4. **Verifique:**
   - ✅ Primeira página = Capa nova
   - ✅ Páginas intermediárias têm áreas brancas no topo/rodapé
   - ✅ Conteúdo principal está preservado
   - ✅ Última página foi removida

### Se não ficou correto:

- **Cabeçalho/rodapé ainda visível**: Aumente o valor (px)
- **Muito conteúdo removido**: Diminua o valor (px)
- **Área branca muito grande**: Diminua o valor (px)

---

## 🚀 Processamento em Lote

Você pode processar **múltiplos PDFs** de uma vez:

```bash
documentos.zip contém:
├── doc1.pdf (3 páginas)
├── doc2.pdf (5 páginas)
├── doc3.pdf (10 páginas)
└── doc4.pdf (2 páginas)
```

**Todos receberão:**
- ✅ Mesma capa
- ✅ Mesma remoção de cabeçalho
- ✅ Mesma remoção de rodapé
- ✅ Última página removida

**Performance:**
- Processamento paralelo
- 85-90% mais rápido que versão anterior
- Ver [PERFORMANCE_OPTIMIZATIONS.md](PERFORMANCE_OPTIMIZATIONS.md)

---

## 🛠️ Implementação Técnica

### Backend

**Arquivo:** `backend/src/services/pdf.service.ts`

```typescript
// Rodapé (parte inferior)
if (footerHeightPx > 0) {
  copiedPage.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: footerHeightPx,
    color: rgb(1, 1, 1), // White
  });
}

// Cabeçalho (parte superior)
if (headerHeightPx > 0) {
  copiedPage.drawRectangle({
    x: 0,
    y: height - headerHeightPx,
    width: width,
    height: headerHeightPx,
    color: rgb(1, 1, 1), // White
  });
}
```

### Frontend

**Arquivo:** `frontend/src/App.tsx`

```typescript
const [headerHeightPx, setHeaderHeightPx] = useState<number>(0);
const [footerHeightPx, setFooterHeightPx] = useState<number>(10);

// Enviado no FormData
formData.append('headerHeightPx', headerHeightPx.toString());
formData.append('footerHeightPx', footerHeightPx.toString());
```

---

## 📝 API

### Endpoint: `POST /api/process`

**Content-Type:** `multipart/form-data`

**Parâmetros:**

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| `filesZip` | File | ✅ Sim | - | ZIP com PDFs |
| `cover` | File | ✅ Sim | - | PDF/Imagem de capa |
| `footerHeightPx` | Number | ❌ Não | `10` | Altura do rodapé |
| `headerHeightPx` | Number | ❌ Não | `0` | Altura do cabeçalho |

**Resposta:**

```
Content-Type: application/zip
Content-Disposition: attachment; filename="processed-pdfs.zip"
X-Process-Report: [{"name":"doc1.pdf","success":true,...}]
```

---

## ⚠️ Limitações

1. **Valores máximos**: 200px (proteção contra valores muito grandes)
2. **Valores mínimos**: 0px (sem remoção)
3. **Precisão**: A remoção é feita com retângulo branco, não remove o conteúdo do PDF
4. **Páginas afetadas**: Apenas páginas intermediárias (não a capa nem última)

---

## 💡 Dicas

1. **Comece pequeno**: Teste com valores baixos primeiro
2. **Use incrementos de 5px**: Facilita ajustes finos
3. **Mantenha PDFs de teste**: Para testar configurações rapidamente
4. **Documente valores ideais**: Para cada tipo de documento que você processa
5. **Use 0px se não precisar**: Não desperdiçar processamento

---

## 🔄 Changelog

**v2.1 - Suporte a Remoção de Cabeçalho**
- ✅ Adicionado parâmetro `headerHeightPx`
- ✅ Interface atualizada com campo de cabeçalho
- ✅ Documentação atualizada
- ✅ Exemplos e guias adicionados

---

## 📞 Suporte

Se tiver dúvidas sobre como configurar os valores:

1. Consulte os exemplos acima
2. Teste com valores pequenos primeiro
3. Use o método de tentativa e erro
4. Consulte [FIRST_RUN.md](FIRST_RUN.md) para guia passo-a-passo

---

**Última atualização:** 2025-10-15
**Versão:** 2.1
