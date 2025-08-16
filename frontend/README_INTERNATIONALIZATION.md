# Sistema de Internacionalização (i18n) - MoneyHub

## Visão Geral

O MoneyHub agora suporta 4 idiomas:

- 🇧🇷 **Português** (pt) - Idioma padrão
- 🇺🇸 **Inglês** (en)
- 🇪🇸 **Espanhol** (es)
- 🇮🇹 **Italiano** (it)

## Estrutura de Arquivos

```
frontend/
├── contexts/
│   └── LanguageContext.tsx          # Contexto principal de idioma
├── hooks/
│   └── useTranslation.ts            # Hook personalizado para traduções
├── components/
│   └── LanguageSelector.tsx         # Componente seletor de idioma
├── public/messages/
│   ├── pt.json                      # Traduções em português
│   ├── en.json                      # Traduções em inglês
│   ├── es.json                      # Traduções em espanhol
│   └── it.json                      # Traduções em italiano
└── app/layout.tsx                   # Layout com providers
```

## Como Usar

### 1. Em Componentes React

```tsx
import { useTranslation } from "@/hooks/useTranslation";

export default function MeuComponente() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div>
      <h1>{t("common.dashboard")}</h1>
      <p>{t("dashboard.welcome")}</p>
      <button onClick={() => setLanguage("en")}>{t("common.save")}</button>
    </div>
  );
}
```

### 2. Traduções Aninhadas

```tsx
// Para acessar traduções aninhadas
t("accounts.accountTypes.checking"); // "Conta Corrente"
t("transactions.transactionTypes.income"); // "Receita"
```

### 3. Seletor de Idioma

O componente `LanguageSelector` já está integrado na navbar e permite aos usuários trocar de idioma facilmente.

## Estrutura das Traduções

Cada arquivo de tradução segue esta estrutura:

```json
{
  "common": {
    "dashboard": "Dashboard",
    "accounts": "Contas",
    "save": "Salvar",
    "cancel": "Cancelar"
  },
  "auth": {
    "login": "Entrar",
    "register": "Cadastrar"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Bem-vindo ao MoneyHub"
  }
}
```

## Adicionando Novas Traduções

### 1. Adicionar a chave em todos os arquivos de idioma

**pt.json:**

```json
{
  "novoModulo": {
    "titulo": "Título em Português"
  }
}
```

**en.json:**

```json
{
  "novoModulo": {
    "titulo": "Title in English"
  }
}
```

**es.json:**

```json
{
  "novoModulo": {
    "titulo": "Título en Español"
  }
}
```

**it.json:**

```json
{
  "novoModulo": {
    "titulo": "Titolo in Italiano"
  }
}
```

### 2. Usar no componente

```tsx
const { t } = useTranslation();
return <h1>{t("novoModulo.titulo")}</h1>;
```

## Funcionalidades

### Detecção Automática de Idioma

- O sistema detecta automaticamente o idioma do navegador
- Salva a preferência do usuário em cookies
- Persiste a escolha entre sessões

### Carregamento Dinâmico

- As traduções são carregadas sob demanda
- Cache automático para melhor performance
- Fallback para chaves não encontradas

### Interface Consistente

- Seletor visual com bandeiras
- Indicador de idioma ativo
- Transições suaves entre idiomas

## Melhores Práticas

1. **Use chaves descritivas**: `t('accounts.addAccount')` em vez de `t('add')`
2. **Organize por módulos**: Agrupe traduções relacionadas
3. **Mantenha consistência**: Use a mesma estrutura em todos os idiomas
4. **Teste todos os idiomas**: Verifique se as traduções fazem sentido
5. **Evite strings hardcoded**: Sempre use o sistema de tradução

## Troubleshooting

### Tradução não aparece

- Verifique se a chave existe em todos os arquivos de idioma
- Confirme se o arquivo está em `public/messages/`
- Verifique o console para erros de carregamento

### Idioma não muda

- Verifique se o `LanguageProvider` está envolvendo a aplicação
- Confirme se o cookie está sendo salvo
- Verifique se não há erros no console

### Performance

- As traduções são carregadas uma vez por idioma
- Use o cache do navegador para melhor performance
- Considere lazy loading para idiomas menos usados
