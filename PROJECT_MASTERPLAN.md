
# 🏡 PROJECT MASTERPLAN: Emily & Gustavo - Chá de Casa Nova

Este documento é a **ÚNICA** fonte de verdade para regras de design, comportamento e progresso do projeto.

---

## 🧠 Filosofia do Sistema (Diretrizes Supremas)

1.  **Humanização Radical:** O sistema nunca deve falar como uma máquina. Ele deve falar como o casal ("Ops, algo deu errado", "Que alegria!").
2.  **Zero Alertas Nativos:** PROIBIDO usar `alert()`. Use Modais/Toasts customizados.
3.  **Dualidade (Mobile vs Desktop):**
    *   **Mobile:** App Nativo (Bottom Sheets, Toque fácil).
    *   **Desktop:** Editorial/Software (Hover, Tooltips, Grid expandido).
4.  **Sensibilidade Temporal:** O site deve "sentir" o tempo. Antes é ansiedade, durante é celebração, depois é gratidão.

---

## 📅 Roteiro de Evolução

### 🏁 Fase 1: Fundação & Core (CONCLUÍDA)
*O alicerce da casa está pronto. As paredes estão pintadas e os móveis no lugar.*

- [x] **Setup:** React, TypeScript, Tailwind, Google Fonts.
- [x] **UX:** Onboarding, Contagem Regressiva, Carrinho Adaptativo (Sheet/Widget).
- [x] **Core:** Lista de Presentes, Filtros por Categoria, Integração Google Sheets.
- [x] **Feedback:** Sistema de Confetes e Mensagens Humanizadas.

### ✨ Fase 2: Encantamento & Facilidade (CONCLUÍDA)
*Agora vamos decorar, colocar flores nos vasos e facilitar a vida das visitas.*

- [x] **Facilitador de Encontros (Busca):** Barra de busca instantânea humanizada.
- [x] **Clareza na Ação de Presentear:** Fluxos distintos: "Comprar na Shopee", "Presentear por Fora" e "Apenas ver".
- [x] **Limpeza do Backend:** Script atualizado com a lista REAL de presentes.
- [x] **Admin de Luxo (Painel da Noiva):** Redesign completo e geração de imagem para Stories.
- [x] **Cartão de Visita Digital:** SEO & Open Graph configurados.
- [x] **Refinamento Textual:** Alertas reescritos para tom acolhedor.

### 💖 Fase 3: Pós-Evento & Memórias (EM ANDAMENTO)
*A festa acabou, mas o carinho fica. O site se transforma em um álbum de memórias.*

- [x] **Lógica Temporal Robusta:**
    *   Detecção automática de "Ontem", "Hoje" e "Futuro" baseada em dia de calendário (não apenas horas).
- [x] **Modo "Cartão de Agradecimento":**
    *   Redesign completo do componente `Countdown`. Sai o relógio, entra um "Card Polaroid" estático e elegante.
    *   Remoção de elementos de urgência (GPS, Guia de Entrega).
- [x] **Adaptação Textual Global:**
    *   Mudança de todos os textos para o passado ("Onde celebramos", "Quem participou", "Foi lindo").
- [x] **Lista de Presentes Tardia:**
    *   Adaptação dos botões para "Enviar presente tardio" (para os atrasadinhos).
- [ ] **Galeria de Fotos:** (Futuro) Implementar carrossel com fotos oficiais do evento.

---

## 🚫 Restrições Técnicas & Estilo

*   **Cores:** Sempre usar as variáveis CSS (`--sage`, `--terracotta`, etc). Nada de hexcodes soltos se possível.
*   **Imagens:** Sempre usar `GiftImage` com lazy loading e skeleton.
*   **Texto:** Títulos em *Dancing Script* ou *Cormorant*. Corpo em *Montserrat*.
*   **Mapa:** Opacidade em 80% para manter a leveza visual.

---

## 🎨 Guia de Estilo Rápido

*   **Cor Principal:** `#354F52` (Dark Sage)
*   **Cor de Destaque:** `#B07D62` (Terracotta)
*   **Fundo:** `#F8F7F2` (Sand)

---
**Status Atual:** Fase 3 ativa. O sistema opera agora em modo "Pós-Evento" com visual de agradecimento.
