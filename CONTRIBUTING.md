# Guia de Contribuição

Obrigado por considerar contribuir com o PDF Processor!

## Como Contribuir

### Reportar Bugs

1. Verifique se o bug já foi reportado nas [Issues](../../issues)
2. Se não, crie uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (OS, Node version, Docker version)

### Sugerir Melhorias

1. Abra uma issue descrevendo:
   - Caso de uso
   - Solução proposta
   - Benefícios esperados

### Pull Requests

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
4. **Faça** suas alterações
5. **Teste** suas alterações (`npm test`)
6. **Commit** (`git commit -m 'Add: Minha feature'`)
7. **Push** (`git push origin feature/MinhaFeature`)
8. **Abra** um Pull Request

## Padrões de Código

### TypeScript

- Use TypeScript strict mode
- Sempre defina tipos explícitos
- Evite `any`
- Use async/await em vez de Promises

### Commits

Use Conventional Commits:

```
feat: adiciona suporte para WebP
fix: corrige erro ao processar PDFs grandes
docs: atualiza README com exemplos
test: adiciona testes para image.service
refactor: simplifica lógica de processamento
```

### Nomenclatura

- **Arquivos**: kebab-case (`pdf.service.ts`)
- **Classes**: PascalCase (`PdfProcessor`)
- **Funções**: camelCase (`processPDF`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### Testes

- Escreva testes para novas features
- Mantenha cobertura acima de 80%
- Use describe/it para estruturar
- Nomes descritivos de testes

```typescript
describe('processPDF', () => {
  it('should replace first page with cover', async () => {
    // test implementation
  });
});
```

## Estrutura de Branches

- `main` - produção
- `develop` - desenvolvimento
- `feature/*` - novas features
- `fix/*` - correções de bugs
- `docs/*` - documentação

## Processo de Review

1. PRs serão revisados por mantenedores
2. Alterações podem ser solicitadas
3. Após aprovação, será feito merge
4. PRs incompletos ou que quebram testes serão fechados

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a licença MIT.

## Dúvidas?

Abra uma [Discussion](../../discussions) ou [Issue](../../issues).

Obrigado! 🎉
