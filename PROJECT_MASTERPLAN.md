# 🏡 PROJECT MASTERPLAN: Emily & Gustavo - Chá de Casa Nova

Este documento é a **ÚNICA** fonte de verdade para regras de design, comportamento e progresso do projeto.

---

## 🧠 Filosofia do Sistema (Diretrizes Supremas)

1.  **Humanização Radical:** O sistema nunca deve falar como uma máquina. Ele deve falar como o casal ("Ops, algo deu errado", "Que alegria!").
2.  **Zero Alertas Nativos:** PROIBIDO usar `alert()`. Use Modais/Toasts customizados.
3.  **Dualidade (Mobile vs Desktop):**
    *   **Mobile:** App Nativo (Bottom Sheets, Toque fácil).
    *   **Desktop:** Editorial/Software (Hover, Tooltips, Grid expandido).

---

## 📅 Roteiro de Evolução

### 🏁 Fase 1: Fundação & Core (CONCLUÍDA)
*O alicerce da casa está pronto. As paredes estão pintadas e os móveis no lugar.*

- [x] **Setup:** React, TypeScript, Tailwind, Google Fonts.
- [x] **UX:** Onboarding, Contagem Regressiva, Carrinho Adaptativo (Sheet/Widget).
- [x] **Core:** Lista de Presentes, Filtros por Categoria, Integração Google Sheets.
- [x] **Feedback:** Sistema de Confetes e Mensagens Humanizadas.

### ✨ Fase 2: Encantamento & Facilidade (ATUAL)
*Agora vamos decorar, colocar flores nos vasos e facilitar a vida das visitas.*

- [x] **Facilitador de Encontros (Busca):** (FEITO AGORA)
    *   Implementar barra de busca para filtrar presentes por nome.
    *   Deve ser instantânea e limpar filtros conflitantes suavemente.
- [ ] **Cartão de Visita Digital (SEO & Open Graph):**
    *   Configurar meta tags para que, ao compartilhar o link no WhatsApp, apareça uma foto linda do casal e um título convidativo.
- [ ] **Mural de Recados (Opcional/Futuro):**
    *   Uma área simples onde, ao confirmar o presente, o convidado pode deixar uma mensagem curta de carinho que será salva na planilha.

---

## 🚫 Restrições Técnicas & Estilo

*   **Cores:** Sempre usar as variáveis CSS (`--sage`, `--terracotta`, etc). Nada de hexcodes soltos se possível.
*   **Imagens:** Sempre usar `GiftImage` com lazy loading e skeleton.
*   **Texto:** Títulos em *Dancing Script* ou *Cormorant*. Corpo em *Montserrat*.

---

## 🎨 Guia de Estilo Rápido

*   **Cor Principal:** `#354F52` (Dark Sage)
*   **Cor de Destaque:** `#B07D62` (Terracotta)
*   **Fundo:** `#F8F7F2` (Sand)

---
**Status Atual:** Iniciando Fase 2 - Implementação da Busca Inteligente.
