# Cronologia & Lexicon — PWAs offline

Este repositório contém três aplicações instaláveis (PWA): **Cronologia** (iPad),
**Cronologia** (iPhone) e **Lexicon** (dicionário multilingue). As três funcionam
offline depois de uma primeira visita online, e sincronizam com o GitHub quando
há ligação.

## Ficheiros

| Ficheiro | Partilhado por | Função |
|---|---|---|
| `Cronologia.html` | — | App de cronologia, versão iPad |
| `Cronologia_iphone.html` | — | App de cronologia, versão iPhone |
| `Lexicon.html` | — | App de dicionário multilingue |
| `sw.js` | Cronologia + Cronologia iPhone + Lexicon | Service worker — cache da app shell e das Google Fonts |
| `cronologia-manifest.webmanifest` | Cronologia + Cronologia iPhone | Manifest PWA (nome, ícone, modo standalone) |
| `lexicon-manifest.webmanifest` | só Lexicon | Manifest PWA do Lexicon |

Todos os ficheiros têm de estar **na mesma pasta** no repositório GitHub (o
mesmo sítio publicado via GitHub Pages).

## Instalação (primeira vez, ou depois de atualizar sw.js/manifest)

1. Publica todos os ficheiros da tabela acima nessa pasta.
2. Abre cada app **uma vez enquanto estiveres online** — isto instala o
   service worker e faz cache da app pela primeira vez. (Nota: são precisas
   duas visitas para a cache ficar completa — a primeira instala o service
   worker, a segunda já é servida por ele. Abrir a página duas vezes seguidas
   online, antes de desligar a internet, garante que a cache fica pronta.)
3. **Remove o atalho atual do ecrã principal** de cada app (o ícone antigo).
4. **Volta a adicionar o atalho** (Partilhar → Adicionar ao Ecrã Principal).
   Isto é uma particularidade do iOS — um atalho já existente não passa a
   funcionar offline sozinho só por os ficheiros terem mudado no servidor; é
   preciso recriá-lo.

Depois disto, cada app abre e funciona **completamente offline** — navegar,
adicionar, editar — mesmo sem qualquer ligação.

## O que continua a precisar de internet

Independentemente da app estar instalada e a cache funcionar, há duas coisas
que exigem sempre ligação real, porque são pedidos a serviços externos:

- **Sincronização com o GitHub** (botão "Sincronizar" e o ponto de estado,
  em todas as três apps).
  - 🟢 verde = sincronizado
  - 🟡/cinza (pending) = sem ligação, vai sincronizar automaticamente assim
    que a internet voltar
  - 🔴 vermelho = erro real (ex: token inválido) — precisa de ação tua

- **Tradução automática** (só no Lexicon, botão "🌐 Traduzir" e "Traduzir
  pendentes"). Podes guardar uma palavra francesa/inglesa/latina/grega sem
  tradução enquanto estiveres offline — fica marcada "⏳ por traduzir" — e a
  app traduz-a automaticamente assim que a ligação voltar.

O `sw.js` está propositadamente configurado para **nunca** intercetar estes
dois pedidos (`api.github.com` e `api.mymemory.translated.net`) — vão sempre
direto à rede real, para que a lógica própria de cada app (estados
pending/ok/err, fila de traduções pendentes) veja sempre o resultado real e
nunca uma resposta antiga guardada em cache.

## Quando repetir os passos de instalação (remover/readicionar atalho)

Só é preciso remover e readicionar o atalho se `sw.js` ou os ficheiros
`.webmanifest` forem substituídos por versões com alterações estruturais
grandes (por exemplo, mudar de estratégia de cache). Alterações normais aos
ficheiros `.html` (novas funcionalidades, correções) **não** exigem repetir
isto — o service worker vai sempre buscar a versão mais recente da página
quando há internet, e só usa a cache quando estás offline.

## Funcionalidades por app

### Cronologia (iPad / iPhone)
- Linha do tempo com agrupamento por era e por data.
- Reordenar entradas com a mesma data por arrastar (ícone ⋮⋮).
- Largura da coluna de datas ajusta-se automaticamente ao conteúdo visível.
- Sincronização com GitHub com fila offline e retoma automática.

### Lexicon
- Seis línguas: Francês, Inglês, Latim, Português, Grego, Árabe.
- Código do livro convertido automaticamente para maiúsculas.
- Tradução automática (MyMemory) com fila offline e retoma automática.
- Sincronização com GitHub com fila offline e retoma automática.
