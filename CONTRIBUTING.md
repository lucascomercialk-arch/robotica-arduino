# 🤝 Guia de Contribuição — Robótica com Arduino UNO

Obrigado pelo interesse em contribuir com a plataforma educacional **"Robótica com Arduino — Do Liga/Desliga ao Controle de Motor"**! Este é um projeto de código aberto voltado para alunos, professores e entusiastas da cultura Maker.

Para manter a versão publicada no **GitHub Pages** sempre estável para uso em sala de aula e laboratório, **todas as melhorias são feitas exclusivamente via Pull Request (PR)** e passam por revisão antes de entrarem na branch `main`.

---

## 🛠️ O que você pode melhorar ou adicionar?

- **Novos Desafios Extras** nas 4 Fichas Práticas ou novas variações de código C++ para Arduino UNO.
- **Melhorias no Guia de Troubleshooting** ("Se não funcionar...") com base em dúvidas reais de bancada.
- **Aprimoramentos Visuais e de Acessibilidade** (diagramas SVG inline, contrastes, responsividade mobile).
- **Correções Didáticas** nos textos, tabelas de ligação ou no simulador interativo de PWM.

---

## 🚀 Passo a Passo para Enviar sua Contribuição (Pull Request)

1. **Faça um Fork** deste repositório clicando no botão **Fork** no canto superior direito da página do GitHub.
2. **Clone o seu Fork** para a sua máquina:
   ```bash
   git clone https://github.com/SEU-USUARIO/robotica-arduino.git
   cd robotica-arduino
   ```
3. **Crie uma Branch** descritiva para a sua melhoria:
   ```bash
   git checkout -b feat/minha-melhoria
   ```
4. **Faça e Teste suas Alterações Localmente:**
   - Abra o arquivo `index.html` no navegador.
   - Verifique o Console do Desenvolvedor (`F12`) para garantir **zero erros de JavaScript**.
   - Teste tanto no **Dark Mode** quanto no **Light Mode** e em tela mobile.
   - **Importante:** Mantenha o projeto 100% em **HTML5, CSS3 e JavaScript puro (Vanilla)**, usando caminhos relativos e diagramas em SVG inline.
5. **Faça o Commit e o Push** para o seu Fork:
   ```bash
   git add .
   git commit -m "feat: descrição clara da melhoria adicionada"
   git push origin feat/minha-melhoria
   ```
6. **Abra o Pull Request (PR):**
   - Acesse o repositório original [lucascomercialk-arch/robotica-arduino](https://github.com/lucascomercialk-arch/robotica-arduino).
   - Clique em **Compare & pull request** e preencha o formulário do template explicando o que foi alterado.

---

## 📦 Como funciona o Deploy?

Assim que o seu Pull Request for revisado e aprovado pelo mantenedor, ele será mesclado (*merged*) na branch `main` e o **GitHub Pages** atualizará automaticamente o site oficial em produção!
