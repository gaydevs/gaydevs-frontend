# gaydevs

Landing estática do MVP 1 em React, TypeScript e Vite, publicada sob `/gaydevs/`.

## Desenvolvimento

Use Node.js 24 e npm, versões de ambiente validadas neste projeto.

```sh
npm ci
npm run dev
```

Abra o endereço `/gaydevs/` informado pelo Vite.

## Verificação e produção

```sh
npm run lint
npm run typecheck
npm run build
npm run preview
```

Para publicar no DreamHost, envie o **conteúdo** de `dist/` para a pasta pública `gaydevs/` de `vettoretti.dev`. O arquivo final deve ficar em `gaydevs/index.html`, com os arquivos de `dist/assets/` em `gaydevs/assets/`. Não é necessário backend nem fallback de rotas: a navegação interna usa âncoras.

## Conteúdo e apresentação

`src/data/` centraliza os textos, links, eventos, timeline, legendas, espaços da comunidade e lore. `src/types/content.ts` define os contratos. `App.tsx` injeta os dados nas seções; componentes de apresentação não importam a origem local. Uma integração futura pode fornecer os mesmos contratos sem substituir a interface.

Os nove assets originais utilizados estão em `src/assets/`. Suas variantes WebP são versionáveis e já acompanham o projeto. `npm run images` recria as variantes e `src/data/images.ts` usando **apenas os originais locais**. `sharp` é exclusivamente uma dependência de desenvolvimento.

Space Grotesk e JetBrains Mono são carregadas pelo Google Fonts com CSS não bloqueante e `display=swap`. Fallbacks de sistema mantêm a página utilizável caso as fontes externas não estejam disponíveis. Nenhum arquivo de fonte é armazenado no projeto.

## Auditoria editorial opcional

O build e o runtime são independentes do briefing. Quando o documento aprovado estiver disponível, é possível executar uma comparação adicional explicitamente:

```sh
npm run check:content -- "caminho/para/CONTENT.md"
```

Esse comando lê o documento sem alterá-lo e compara trechos literais com o HTML renderizado, além da timeline, dos JSONs, das legendas e dos comandos. O documento não é copiado nem incluído no build.

## Decisões de interface

- Hero vertical abaixo de 1024 px e horizontal a partir de 1024 px; todo texto permanece em HTML.
- Timeline em HTML/CSS, em uma coluna, com os 19 marcos aprovados.
- Seis fotos na ordem aprovada, com proporções naturais e legendas abaixo. Bário e Cool Doce também ilustram os meetups.
- Fluxo visual de talks conforme o wireframe; talks e summit permanecem formatos paralelos.
- Animações limitadas a hover e scroll suave, desativados por `prefers-reduced-motion`.
- Acessibilidade inclui HTML semântico, um `h1`, link para pular ao conteúdo, foco visível, textos alternativos e comandos completos com quebra de linha.
- Nenhum arquivo do briefing, caminho absoluto externo, backend, CMS ou chamada de API faz parte da aplicação.
