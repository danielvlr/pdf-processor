# Como Adicionar a Capa Padrão

Para que a capa padrão seja carregada automaticamente:

1. Copie seu arquivo `Capa.pdf` para esta pasta (`frontend/public/`)

2. O arquivo deve ter exatamente este nome: `Capa.pdf`

3. Quando o frontend for carregado, ele tentará buscar `/Capa.pdf` automaticamente

## Estrutura:

```
frontend/
├── public/
│   ├── Capa.pdf          ← Coloque seu arquivo aqui
│   └── README_CAPA.md    ← Este arquivo
└── src/
```

## Desenvolvimento Local:

```bash
cd frontend
# Copie o arquivo
cp C:/Users/danie/Downloads/Capa.pdf public/Capa.pdf
npm run dev
```

## Produção (Docker):

O Dockerfile já copia tudo da pasta `public/` para a imagem final.
Basta adicionar `Capa.pdf` na pasta `public/` antes de fazer build.

## Nota:

Se o arquivo não for encontrado, o usuário precisará fazer upload manual da capa.
A aplicação funcionará normalmente, apenas sem a capa padrão pré-carregada.
