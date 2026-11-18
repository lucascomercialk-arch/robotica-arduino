# 🤖 Robótica com Arduino — Do Liga/Desliga ao Controle de Motor

Plataforma web educacional completa, interativa e 100% responsiva desenvolvida em **HTML5, CSS3 e JavaScript Puro (Vanilla)** para oficinas práticas de extensão universitária com **Arduino UNO R3** (*Do Tinkercad ao Kit Físico*).

🔗 **Link Oficial de Publicação (GitHub Pages):**  
👉 **[https://lucascomercialk-arch.github.io/robotica-arduino/](https://lucascomercialk-arch.github.io/robotica-arduino/)**

---

## ✨ Funcionalidades e Estrutura Pedagógica

1. **Visão Geral & Metodologia ("Início"):**
   - Hero section com carga horária (`100 minutos / 2 Encontros`), público-alvo (`Iniciantes`) e atalhos rápidos.
   - Regra de Ouro da Oficina em 3 passos: `1. Simule no Tinkercad` → `2. Teste e Corrija (Validação)` → `3. Monte no Kit Físico`.
   - Diagramas SVG inline nativos explicando o ciclo da Robótica (*Perceber → Processar → Agir*) e *Circuito Elétrico em Loop Fechado*.

2. **Guia de Bancada & Componentes ("Antes de Começar"):**
   - **Mapa Interativo de Pinos do Arduino UNO (SVG):** Inspeção clicável dos pinos `Digitais (2 a 13)`, `PWM (~3, 5, 6, 9, 10, 11)`, `Analógicas (A0 a A5)`, `Power (5V/GND)` e alerta nos pinos `0 e 1 (RX/TX)`.
   - **Catálogo Visual de Componentes & Código de Cores de Resistores:** Protoboard, LED + Resistor 220 Ω (Lei de Ohm aplicada), Botão + Resistor 10 kΩ, Potenciômetro 10 kΩ e conjunto de potência Motor DC + Transistor NPN + Resistor 1 kΩ + Diodo Flyback.
   - **Painel de Alertas Críticos de Segurança:** Avisos destacados em Vermelho/Âmbar contra curto-circuito e queima de portas.

3. **Roteiro das Aulas (Aula 1 e Aula 2) + Mini-Simulador PWM:**
   - Abas alternáveis entre **Aula 1 (Digitais)** e **Aula 2 (Analógicos, PWM e Motores)** com estrutura `void setup()` / `void loop()` e passo a passo de upload na Arduino IDE.
   - **Simulador Interativo de PWM & `map()`:** Controle deslizante (`0 a 1023`) que calcula em tempo real `map(v, 0, 1023, 0, 255)`, tensão média (`0.00V a 5.00V`), porcentagem de *Duty Cycle*, gráfico de onda quadrada PWM, brilho de LED virtual e velocidade de rotação de uma hélice de Motor DC em SVG.

4. **As 4 Atividades Práticas (Fichas Interativas de Bancada):**
   - **Atividade 1 (Básico):** Acender o LED com a Entrada Analógica (`A0` como saída `OUTPUT`) + Variante Sinalizador de Trânsito (pinos 12 e 13).
   - **Atividade 2 (Básico):** Interruptor Digital (Botão + LED) com `INPUT_PULLUP` (lógica `== LOW`) e nota comparativa com *pull-down* externo de 10 kΩ.
   - **Atividade 3 (Médio):** Dimmer de LED com Potenciômetro (`A0`) e saída PWM (`~9`).
   - **Atividade 4 (Desafio):** Controle Conjunto de LED (`~9`) e Motor DC (`~10`) com Transistor NPN, Resistor de 1 kΩ na Base e Diodo em paralelo.
   - Todas as fichas contam com *Checklist de Materiais*, *Tabela Ponto-a-Ponto de Ligações*, *Passo a Passo*, *Código C++ com botão Copiar*, *Desafio Extra* e *Guia de Troubleshooting*.

5. **Área do Professor & Gerador de Evidências do Aluno:**
   - **Plano de Aula (Docente):** Cronograma oficial de 100 minutos, objetivos de aprendizagem e rubrica de avaliação em 4 critérios.
   - **Ficha Digital de Evidências:** Formulário dinâmico que adapta as perguntas de reflexão à ficha escolhida e gera um relatório formatado para impressão/PDF (`window.print()`) ou download em `.MD` e `.TXT`.

---

## 📁 Estrutura de Arquivos

```text
├── index.html   # Estrutura semântica completa + Diagramas SVG inline nítidos
├── style.css    # Design System Tech Educacional (Dark Mode padrão + Light Mode + Print CSS)
├── script.js    # Lógica Vanilla JS (Simulador PWM, Mapa UNO, Progresso localStorage e Relatórios)
└── README.md    # Documentação do projeto e instruções de deploy no GitHub Pages
```
