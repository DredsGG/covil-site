# Política de segurança

Esta é a versão curta da página [covil.app/seguranca](https://covil.app/seguranca). Vale para o site covil.app (este repositório) e para o aplicativo Covil.

## Como relatar uma falha

Escreva para **contato@covil.app** com o assunto "Segurança". Se a falha ainda não foi corrigida, use o e-mail e não abra um problema (issue) público no GitHub.

Inclua:

- o que você achou e onde (endereço da página ou versão do app);
- como repetir o problema, passo a passo;
- o impacto que você enxerga;
- como falar com você.

Não envie dados de outras pessoas, nem anexe dados reais que você tenha conseguido acessar.

## Boa-fé

Se você agir de boa-fé, ou seja, testar só o necessário para mostrar o problema, não acessar nem apagar dados de outras pessoas, não derrubar o serviço e não divulgar a falha antes de conversarmos, não pretendemos tomar medida contra você por isso. Isto não é autorização para atacar, não vale para quem causar dano e não substitui a lei.

Não há programa de recompensa e não pagamos por relatos.

## Prazo de resposta

Responderemos assim que possível, em geral em poucos dias.

## Escopo

Dentro: o site covil.app e o aplicativo Covil.

Fora: serviços de terceiros que o site usa (GitHub, Cloudflare, bancos e o Pix), que têm os próprios canais; ataques de negação de serviço e testes de carga; engenharia social e golpes contra pessoas; computadores e redes de outros anfitriões ou usuários.

## security.txt

[covil.app/.well-known/security.txt](https://covil.app/.well-known/security.txt), no formato da RFC 9116. Ainda não publicamos uma chave OpenPGP; por enquanto, o canal é o e-mail acima.

## O que o site faz pela segurança

HTTPS com HSTS (aplicado na Cloudflare, não neste repositório), Política de Segurança de Conteúdo (CSP) imposta, cabeçalhos de proteção (`public/_headers`), sem cookie e sem rastreio. Isso reduz risco, mas não garante que não haja falhas: por isso este canal existe.
