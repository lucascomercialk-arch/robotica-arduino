/* ==========================================================================
   SCRIPT.JS — ROBÓTICA COM ARDUINO UNO (100% VANILLA JS)
   Funcionalidades:
   1. Persistência de Tema (Dark Mode padrão + Toggle Light Mode) em localStorage
   2. Persistência de Progresso das 6 Etapas/Atividades em localStorage
   3. Mapa Interativo de Pinos do Arduino UNO
   4. Abas de Roteiro (Aula 1 / Aula 2), 4 Fichas Práticas e Área do Professor
   5. Mini-Simulador em tempo real de PWM, map(0-1023 -> 0-255), LED e Motor SVG
   6. Copiar Código C++ com feedback Toast
   7. Gerador de Evidências com perguntas dinâmicas, impressão PDF e download .MD/.TXT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_THEME_KEY = 'robotica_uno_theme';
  const STORAGE_PROGRESS_KEY = 'robotica_uno_progress_v1';

  /* --------------------------------------------------------------------------
     1. TEMA DARK / LIGHT MODE
  -------------------------------------------------------------------------- */
  const htmlEl = document.documentElement;
  const themeBtnDesktop = document.getElementById('theme-toggle');
  const themeBtnMobile = document.getElementById('theme-toggle-mobile');

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_THEME_KEY, theme);
    const icons = document.querySelectorAll('.theme-icon');
    icons.forEach(ic => {
      ic.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
  }

  const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) || 'dark';
  applyTheme(savedTheme);

  function toggleTheme() {
    const current = htmlEl.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  if (themeBtnDesktop) themeBtnDesktop.addEventListener('click', toggleTheme);
  if (themeBtnMobile) themeBtnMobile.addEventListener('click', toggleTheme);

  /* --------------------------------------------------------------------------
     2. MENU MOBILE & SCROLLSPY DA SIDEBAR
  -------------------------------------------------------------------------- */
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 820 && sidebar) {
        sidebar.classList.remove('open');
      }
    });
  });

  const sections = document.querySelectorAll('.section-block');
  window.addEventListener('scroll', () => {
    let currentSectionId = 'inicio';
    const scrollPos = window.scrollY + 180;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop) {
        currentSectionId = sec.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-section') === currentSectionId);
    });
  });

  /* --------------------------------------------------------------------------
     3. PROGRESSO SALVO EM LOCALSTORAGE
  -------------------------------------------------------------------------- */
  const progressCheckboxes = document.querySelectorAll('.progress-checkbox');
  const completeActBtns = document.querySelectorAll('.btn-complete-act');
  const progressPercentEl = document.getElementById('progress-percent');
  const progressBarFillEl = document.getElementById('progress-bar-fill');
  const progressCountTextEl = document.getElementById('progress-count-text');
  const resetProgressBtn = document.getElementById('reset-progress');

  let progressState = {};
  try {
    progressState = JSON.parse(localStorage.getItem(STORAGE_PROGRESS_KEY)) || {};
  } catch (e) {
    progressState = {};
  }

  function updateProgressUI() {
    const total = progressCheckboxes.length;
    let completed = 0;

    progressCheckboxes.forEach(cb => {
      const stepKey = cb.getAttribute('data-step');
      const isDone = Boolean(progressState[stepKey]);
      cb.checked = isDone;
      if (isDone) completed++;
    });

    completeActBtns.forEach(btn => {
      const stepKey = btn.getAttribute('data-check-step');
      const isDone = Boolean(progressState[stepKey]);
      btn.classList.toggle('completed', isDone);
      const actNum = stepKey.replace('at', '');
      btn.textContent = isDone
        ? `✅ Ficha ${actNum} Concluída!`
        : `✔️ Marcar Ficha ${actNum} como Concluída`;
    });

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (progressPercentEl) progressPercentEl.textContent = `${pct}%`;
    if (progressBarFillEl) progressBarFillEl.style.width = `${pct}%`;
    if (progressCountTextEl) progressCountTextEl.textContent = `${completed} de ${total} etapas concluídas`;

    localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progressState));
  }

  progressCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const stepKey = cb.getAttribute('data-step');
      progressState[stepKey] = cb.checked;
      updateProgressUI();
    });
  });

  completeActBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const stepKey = btn.getAttribute('data-check-step');
      progressState[stepKey] = !progressState[stepKey];
      updateProgressUI();
      showToast(progressState[stepKey] ? 'Progresso da ficha salvo!' : 'Marcação removida.');
    });
  });

  if (resetProgressBtn) {
    resetProgressBtn.addEventListener('click', () => {
      progressState = {};
      updateProgressUI();
      showToast('Progresso reiniciado com sucesso.');
    });
  }

  updateProgressUI();

  /* --------------------------------------------------------------------------
     4. MAPA INTERATIVO DE PINOS DO ARDUINO UNO
  -------------------------------------------------------------------------- */
  const pinData = {
    digitais: {
      badge: 'ENTRADA / SAÍDA DIGITAL',
      badgeClass: 'badge-blue',
      title: 'Pinos Digitais 2 a 13',
      desc: 'Operam com apenas dois estados lógicos binários: <strong><code>HIGH</code> (Ligado / 5V)</strong> ou <strong><code>LOW</code> (Desligado / 0V)</strong>.',
      specs: [
        '<strong>Configuração:</strong> <code>pinMode(pino, OUTPUT)</code> ou <code>pinMode(pino, INPUT_PULLUP)</code>',
        '<strong>Comandos:</strong> <code>digitalWrite(pino, HIGH/LOW)</code> e <code>digitalRead(pino)</code>',
        '<strong>Limite seguro de corrente:</strong> ~20 mA por pino (máx. absoluto 40 mA). Use resistor de 220 Ω para LEDs!'
      ]
    },
    pwm: {
      badge: 'SAÍDA ANALÓGICA SIMULADA (PWM)',
      badgeClass: 'badge-teal',
      title: 'Pinos PWM (~3, ~5, ~6, ~9, ~10, ~11)',
      desc: 'Identificados pelo símbolo til (<code>~</code>) na placa. Simulam uma saída analógica variável através de <strong>Duty Cycle</strong> (Modulação por Largura de Pulso).',
      specs: [
        '<strong>Comando:</strong> <code>analogWrite(pinoPWM, valor)</code> onde o valor vai de <strong><code>0</code> a <code>255</code></strong> (8 bits).',
        '<strong>Exemplos de Duty Cycle:</strong> <code>0</code> = 0% (0V), <code>127</code> = 50% (~2.5V), <code>255</code> = 100% (5V).',
        '<strong>Aplicações na Oficina:</strong> Dimmer de LED no pino <code>~9</code> (Ficha 3) e Motor DC via Transistor no pino <code>~10</code> (Ficha 4).'
      ]
    },
    analogicas: {
      badge: 'CONVERSOR ADC 10 BITS + GPIO',
      badgeClass: 'badge-primary',
      title: 'Entradas Analógicas A0 a A5',
      desc: 'Leem tensões contínuas variáveis entre <strong>0V e 5V</strong> (como o pino central do potenciômetro) e convertem internamente para um número inteiro de <strong><code>0</code> a <code>1023</code></strong>.',
      specs: [
        '<strong>Comando de Leitura:</strong> <code>int v = analogRead(A0);</code> (1024 níveis de resolução).',
        '<strong>Conversão para PWM:</strong> <code>int pwm = map(v, 0, 1023, 0, 255);</code>',
        '<strong>Nota importante (Ficha 1):</strong> Os pinos <code>A0 a A5</code> também podem operar como <strong>saídas digitais comuns</strong> usando <code>pinMode(A0, OUTPUT)</code> e <code>digitalWrite(A0, HIGH)</code>!'
      ]
    },
    rxtx: {
      badge: '⚠️ COMUNICAÇÃO SERIAL USB',
      badgeClass: 'badge-red',
      title: 'Pinos 0 (RX) e 1 (TX) — Evitar Uso!',
      desc: 'Estes dois pinos são conectados diretamente ao conversor USB-Serial da placa Arduino UNO para gravação de código e uso do Monitor Serial.',
      specs: [
        '<strong>Regra de Bancada:</strong> <strong>Evite ligar LEDs, botões ou motores nos pinos 0 e 1!</strong>',
        '<strong>Consequência:</strong> Componentes ligados aqui causam falha de <em>Upload</em> (erro <code>stk500_getsync()</code>) e travam o Monitor Serial (<code>Serial.begin(9600)</code>).'
      ]
    },
    power: {
      badge: 'BARRAMENTO DE ENERGIA',
      badgeClass: 'badge-amber',
      title: 'Pinos de Alimentação (5V, 3.3V e GND)',
      desc: 'Fornecem a energia regulada da porta USB (ou fonte externa) para alimentar a protoboard.',
      specs: [
        '<strong><code>5V</code> (Vermelho):</strong> Tensão positiva padrão da lógica do Arduino UNO.',
        '<strong><code>GND</code> (Azul/Preto):</strong> Terra / Referência de 0V. Todo circuito precisa retornar ao <strong>GND comum</strong> para fechar o loop elétrico.',
        '<strong>Atenção:</strong> Nunca conecte o pino <code>5V</code> diretamente ao <code>GND</code> sem carga!'
      ]
    }
  };

  const pinInfoBox = document.getElementById('pin-info-box');
  const pinTabs = document.querySelectorAll('.pin-tab');
  const svgPinGroups = document.querySelectorAll('.pin-group');

  function selectPinGroup(key) {
    const data = pinData[key];
    if (!data || !pinInfoBox) return;

    pinTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-target') === key));
    svgPinGroups.forEach(g => g.classList.toggle('active-pin', g.getAttribute('data-pin-group') === key));

    pinInfoBox.innerHTML = `
      <span class="pin-badge ${data.badgeClass}">${data.badge}</span>
      <h4>${data.title}</h4>
      <p>${data.desc}</p>
      <ul class="pin-specs">
        ${data.specs.map(s => `<li>${s}</li>`).join('')}
      </ul>
    `;
  }

  pinTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      selectPinGroup(tab.getAttribute('data-target'));
    });
  });

  svgPinGroups.forEach(group => {
    group.addEventListener('click', () => {
      selectPinGroup(group.getAttribute('data-pin-group'));
    });
  });

  /* --------------------------------------------------------------------------
     5. SISTEMA DE ABAS (AULAS 1/2, FICHAS 1-4, PROFESSOR/EVIDÊNCIAS)
  -------------------------------------------------------------------------- */
  // Abas Aula 1 e Aula 2
  const classTabBtns = document.querySelectorAll('[data-class-tab]');
  const classTabContents = document.querySelectorAll('.class-tab-content');

  classTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-class-tab');
      classTabBtns.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      classTabContents.forEach(c => {
        c.classList.toggle('active', c.id === target);
      });
    });
  });

  // Abas 4 Fichas Práticas
  const actTabBtns = document.querySelectorAll('[data-act]');
  const actPanels = document.querySelectorAll('.activity-panel');

  actTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-act');
      actTabBtns.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      actPanels.forEach(p => {
        p.classList.toggle('active', p.id === target);
      });
    });
  });

  // Abas Docente & Evidências
  const profTabBtns = document.querySelectorAll('[data-prof-tab]');
  const profPanels = document.querySelectorAll('.prof-tab-panel');

  profTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-prof-tab');
      profTabBtns.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      profPanels.forEach(p => {
        p.classList.toggle('active', p.id === target);
      });
    });
  });

  /* --------------------------------------------------------------------------
     6. MINI-SIMULADOR INTERATIVO DE PWM & MAP() + ANIMAÇÃO DA HÉLICE SVG
  -------------------------------------------------------------------------- */
  const potSlider = document.getElementById('pot-slider');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const simAdcBadge = document.getElementById('sim-adc-badge');
  const simAdcVal = document.getElementById('sim-adc-val');
  const simPwmVal = document.getElementById('sim-pwm-val');
  const simVoltVal = document.getElementById('sim-volt-val');
  const simDutyVal = document.getElementById('sim-duty-val');

  const codeV = document.getElementById('code-v');
  const codeV2 = document.getElementById('code-v2');
  const codePwm = document.getElementById('code-pwm');
  const codePwm2 = document.getElementById('code-pwm2');

  const pwmWavePath = document.getElementById('pwm-wave-path');
  const waveCaption = document.getElementById('wave-caption');
  const ledGlowAura = document.getElementById('led-glow-aura');
  const virtualLedBulb = document.getElementById('virtual-led-bulb');
  const ledStatusText = document.getElementById('led-status-text');
  const propellerRotor = document.getElementById('propeller-rotor');
  const motorStatusText = document.getElementById('motor-status-text');

  let currentDutyRatio = 0.5;
  let rotorAngle = 0;

  function arduinoMap(x, inMin, inMax, outMin, outMax) {
    return Math.trunc(((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin);
  }

  function updateWaveSVG(dutyRatio) {
    if (!pwmWavePath) return;
    // Desenha 2 períodos de onda entre x=25 e x=245 (110px cada período)
    const period = 110;
    const yHigh = 20;
    const yLow = 75;

    if (dutyRatio <= 0.005) {
      pwmWavePath.setAttribute('d', `M 25 ${yLow} L 245 ${yLow}`);
      return;
    }
    if (dutyRatio >= 0.995) {
      pwmWavePath.setAttribute('d', `M 25 ${yHigh} L 245 ${yHigh}`);
      return;
    }

    const highWidth = Math.round(period * dutyRatio);
    const x1End = 25 + highWidth;
    const x2Start = 25 + period;
    const x2End = x2Start + highWidth;
    const xEnd = 25 + period * 2;

    const d = `M 25 ${yLow} L 25 ${yHigh} L ${x1End} ${yHigh} L ${x1End} ${yLow} L ${x2Start} ${yLow} L ${x2Start} ${yHigh} L ${x2End} ${yHigh} L ${x2End} ${yLow} L ${xEnd} ${yLow}`;
    pwmWavePath.setAttribute('d', d);
  }

  function updateSimulator(adcRaw) {
    const adc = Math.max(0, Math.min(1023, parseInt(adcRaw, 10) || 0));
    const pwm = arduinoMap(adc, 0, 1023, 0, 255);
    const dutyRatio = pwm / 255;
    const dutyPercent = Math.round(dutyRatio * 100);
    const voltage = (dutyRatio * 5.0).toFixed(2);

    currentDutyRatio = dutyRatio;

    if (simAdcBadge) simAdcBadge.textContent = `${adc} / 1023`;
    if (simAdcVal) simAdcVal.textContent = adc;
    if (simPwmVal) simPwmVal.textContent = pwm;
    if (simVoltVal) simVoltVal.textContent = `${voltage} V`;
    if (simDutyVal) simDutyVal.textContent = `${dutyPercent}%`;

    if (codeV) codeV.textContent = adc;
    if (codeV2) codeV2.textContent = adc;
    if (codePwm) codePwm.textContent = pwm;
    if (codePwm2) codePwm2.textContent = pwm;

    // Atualiza onda PWM
    updateWaveSVG(dutyRatio);
    if (waveCaption) {
      waveCaption.textContent = `${dutyPercent}% em 5V (HIGH) / ${100 - dutyPercent}% em 0V (LOW)`;
    }

    // Atualiza LED Virtual
    if (ledGlowAura && virtualLedBulb) {
      ledGlowAura.style.opacity = dutyRatio.toFixed(2);
      ledGlowAura.style.transform = `scale(${0.65 + dutyRatio * 0.75})`;
      const brightness = 38 + Math.round(dutyRatio * 62);
      virtualLedBulb.style.filter = `brightness(${brightness}%)`;
    }
    if (ledStatusText) {
      if (pwm === 0) ledStatusText.textContent = 'LED Apagado (PWM 0)';
      else if (pwm < 85) ledStatusText.textContent = `Brilho Baixo (PWM ${pwm})`;
      else if (pwm < 180) ledStatusText.textContent = `Brilho Médio (PWM ${pwm})`;
      else if (pwm < 255) ledStatusText.textContent = `Brilho Alto (PWM ${pwm})`;
      else ledStatusText.textContent = 'Brilho Máximo 100% (PWM 255)';
    }

    // Atualiza texto do Motor DC
    if (motorStatusText) {
      if (pwm === 0) motorStatusText.textContent = 'Motor Parado (0 RPM)';
      else if (pwm < 55) motorStatusText.textContent = `Zona de Inércia / Baixo Torque (${dutyPercent}%)`;
      else motorStatusText.textContent = `Velocidade: ${dutyPercent}% (~${Math.round(dutyRatio * 4500)} RPM)`;
    }
  }

  // Loop de animação contínua para a hélice do Motor DC
  function animateMotorPropeller() {
    if (propellerRotor && currentDutyRatio > 0.01) {
      // Velocidade angular proporcional ao Duty Cycle
      rotorAngle = (rotorAngle + currentDutyRatio * 14) % 360;
      propellerRotor.style.transform = `rotate(${rotorAngle}deg)`;
    }
    requestAnimationFrame(animateMotorPropeller);
  }

  if (potSlider) {
    potSlider.addEventListener('input', (e) => {
      updateSimulator(e.target.value);
      // Marca automaticamente a etapa do simulador como testada no progresso
      if (!progressState.simulador) {
        progressState.simulador = true;
        updateProgressUI();
      }
    });
    updateSimulator(potSlider.value);
    requestAnimationFrame(animateMotorPropeller);
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-adc');
      if (potSlider) {
        potSlider.value = val;
        updateSimulator(val);
      }
    });
  });

  /* --------------------------------------------------------------------------
     7. BOTÕES "COPIAR CÓDIGO" C++ COM TOAST
  -------------------------------------------------------------------------- */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2600);
  }

  function copyTextToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(successMsg);
  }

  const copyBtns = document.querySelectorAll('.btn-copy');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const codeEl = document.getElementById(targetId);
      if (!codeEl) return;
      copyTextToClipboard(codeEl.innerText, '✅ Código C++ copiado para a Arduino IDE / Tinkercad!');
    });
  });

  /* --------------------------------------------------------------------------
     8. GERADOR DE EVIDÊNCIAS DO ALUNO (PERGUNTAS DINÂMICAS + EXPORTAÇÃO)
  -------------------------------------------------------------------------- */
  const questionsByActivity = {
    '1': {
      title: 'Atividade 1 (Básico): Acender LED com a Entrada Analógica (A0 como Saída) / Sinalizador',
      q1: '1. O que acontece com o LED quando o pino A0 está em HIGH (5V) e quando muda para LOW (0V)? Qual a função do resistor de 220 Ω no circuito?',
      q2: '2. Qual foi a diferença entre testar o LED ligado direto no pino 5V e controlá-lo pelo pino A0 configurado com pinMode(A0, OUTPUT)?',
      demoA1: 'Quando A0 está em HIGH (5V), a corrente passa pelo resistor e o LED acende. Em LOW (0V), não há diferença de potencial e ele apaga. O resistor de 220 Ω limita a corrente em ~14 mA para não queimar o LED nem a porta do Arduino.',
      demoA2: 'No pino 5V o LED fica aceso permanentemente sem controle. No pino A0 configurado como OUTPUT, o código controla quando ele liga e desliga (piscando a cada 500ms no desafio extra).'
    },
    '2': {
      title: 'Atividade 2 (Básico): Interruptor Digital (Botão + LED)',
      q1: '1. Por que usamos INPUT_PULLUP no pino 2 (lógica invertida == LOW quando pressionado) ou um resistor pull-down externo de 10 kΩ em vez de deixar o pino solto?',
      q2: '2. Como vocês implementaram o Desafio Extra para manter o LED aceso por 3 segundos após apertar o botão?',
      demoA1: 'Sem resistor pull-up ou pull-down, a entrada digital fica flutuando e capta ruído eletromagnético da mão, fazendo o LED piscar sozinho. Com INPUT_PULLUP, o pino fica firme em 5V (HIGH) quando solto e vai a 0V (LOW) quando apertamos.',
      demoA2: 'Adicionamos o comando delay(3000); logo após digitalWrite(pinoLED, HIGH); dentro do bloco if (estado == LOW), mantendo o LED aceso por 3000 ms antes de voltar a ler o loop.'
    },
    '3': {
      title: 'Atividade 3 (Médio): Dimmer de LED com Potenciômetro e PWM',
      q1: '1. Por que precisamos usar a função map(v, 0, 1023, 0, 255) entre o analogRead(A0) e o analogWrite(9, brilho)?',
      q2: '2. O que o sinal PWM faz na prática no pino ~9 para variar o brilho do LED se o Arduino só trabalha com 0V e 5V?',
      demoA1: 'Porque o conversor analógico-digital (analogRead) tem 10 bits e retorna valores de 0 a 1023, enquanto o gerador PWM (analogWrite) tem 8 bits e só aceita valores de 0 a 255.',
      demoA2: 'O PWM liga e desliga o pino ~9 muito rápido (~490 vezes por segundo). Variando o Duty Cycle (porcentagem de tempo em 5V), a tensão média muda de 0V a 5V e nosso olho enxerga como mudança suave de brilho.'
    },
    '4': {
      title: 'Atividade 4 (Desafio): Controle Conjunto de LED e Motor DC',
      q1: '1. Por que o Motor DC não pode ser conectado diretamente ao pino ~10 do Arduino e qual é o papel do Transistor NPN (com resistor de 1 kΩ na Base)?',
      q2: '2. Qual a função do Diodo ligado em paralelo com o motor (com a faixa prateada no 5V) e por que o motor só parte acima de um certo valor de PWM?',
      demoA1: 'O pino do Arduino fornece no máximo ~20 mA com segurança, mas o motor exige mais de 150 mA. O Transistor NPN funciona como uma chave eletrônica de potência que usa o pequeno sinal da Base (protegida pelo resistor de 1 kΩ) para chavear a corrente maior vinda do 5V.',
      demoA2: 'O diodo protege o transistor contra o pico de tensão reversa (força contra-eletromotriz) gerado pela bobina do motor ao desligar. No desafio extra acionamos só quando v > 512 porque em PWM muito baixo o motor não tem torque para vencer o atrito inicial.'
    }
  };

  const evForm = document.getElementById('evidence-form');
  const evActivitySelect = document.getElementById('ev-activity');
  const labelQ1 = document.getElementById('label-q1');
  const labelQ2 = document.getElementById('label-q2');
  const inputNames = document.getElementById('ev-names');
  const inputExtra = document.getElementById('ev-extra');
  const inputUrl = document.getElementById('ev-url');
  const inputQ1 = document.getElementById('ev-q1');
  const inputQ2 = document.getElementById('ev-q2');
  const inputNotes = document.getElementById('ev-notes');
  const btnFillDemo = document.getElementById('btn-fill-demo');

  // Elementos do cartão gerado
  const evStatusBadge = document.getElementById('ev-status-badge');
  const recDate = document.getElementById('rec-date');
  const recNames = document.getElementById('rec-names');
  const recActivity = document.getElementById('rec-activity');
  const recExtra = document.getElementById('rec-extra');
  const recUrl = document.getElementById('rec-url');
  const recQ1Title = document.getElementById('rec-q1-title');
  const recA1 = document.getElementById('rec-a1');
  const recQ2Title = document.getElementById('rec-q2-title');
  const recA2 = document.getElementById('rec-a2');
  const recNotes = document.getElementById('rec-notes');

  const btnCopyReport = document.getElementById('btn-copy-report');
  const btnDownloadMd = document.getElementById('btn-download-md');
  const btnDownloadTxt = document.getElementById('btn-download-txt');
  const btnPrintReport = document.getElementById('btn-print-report');

  let currentReportData = null;

  function updateEvidenceQuestions() {
    if (!evActivitySelect) return;
    const actId = evActivitySelect.value;
    const qObj = questionsByActivity[actId];
    if (!qObj) return;
    if (labelQ1) labelQ1.textContent = qObj.q1;
    if (labelQ2) labelQ2.textContent = qObj.q2;
  }

  if (evActivitySelect) {
    evActivitySelect.addEventListener('change', updateEvidenceQuestions);
    updateEvidenceQuestions();
  }

  if (btnFillDemo) {
    btnFillDemo.addEventListener('click', () => {
      const actId = evActivitySelect ? evActivitySelect.value : '1';
      const qObj = questionsByActivity[actId];
      if (inputNames && !inputNames.value) inputNames.value = 'Lucas Kammer & Dupla de Bancada 01';
      if (inputUrl && !inputUrl.value) inputUrl.value = 'https://www.tinkercad.com/things/arduino-uno-oficina-pratica';
      if (inputQ1) inputQ1.value = qObj.demoA1;
      if (inputQ2) inputQ2.value = qObj.demoA2;
      if (inputNotes) inputNotes.value = 'Simulamos primeiro no Tinkercad, conferimos as cores dos resistores e garantimos o GND comum antes de conectar o cabo USB.';
      showToast('Campos preenchidos com exemplo técnico! Clique em Gerar Resumo.');
    });
  }

  if (evForm) {
    evForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const actId = evActivitySelect.value;
      const qObj = questionsByActivity[actId];
      const nowStr = new Date().toLocaleString('pt-BR');

      currentReportData = {
        date: nowStr,
        names: inputNames.value.trim(),
        activityTitle: qObj.title,
        extra: inputExtra.value,
        url: inputUrl.value.trim(),
        q1: qObj.q1,
        a1: inputQ1.value.trim(),
        q2: qObj.q2,
        a2: inputQ2.value.trim(),
        notes: inputNotes.value.trim() || 'Montagem validada no Tinkercad e executada sem intercorrências.'
      };

      if (recDate) recDate.textContent = `Emitido em: ${currentReportData.date}`;
      if (recNames) recNames.textContent = currentReportData.names;
      if (recActivity) recActivity.textContent = currentReportData.activityTitle;
      if (recExtra) recExtra.textContent = currentReportData.extra;
      if (recUrl) {
        recUrl.textContent = currentReportData.url;
        recUrl.href = currentReportData.url;
      }
      if (recQ1Title) recQ1Title.textContent = currentReportData.q1;
      if (recA1) recA1.textContent = currentReportData.a1;
      if (recQ2Title) recQ2Title.textContent = currentReportData.q2;
      if (recA2) recA2.textContent = currentReportData.a2;
      if (recNotes) recNotes.textContent = currentReportData.notes;

      if (evStatusBadge) {
        evStatusBadge.textContent = 'Pronto para Entrega';
        evStatusBadge.className = 'badge badge-primary';
      }

      [btnCopyReport, btnDownloadMd, btnDownloadTxt, btnPrintReport].forEach(b => {
        if (b) b.disabled = false;
      });

      showToast('🎉 Resumo de evidências gerado com sucesso!');
    });
  }

  function formatReportAsMarkdown(d) {
    return `# Relatório de Evidências — Robótica com Arduino UNO
**Data de Emissão:** ${d.date}
**Dupla / Equipe:** ${d.names}
**Atividade Prática:** ${d.activityTitle}
**Desafio Extra:** ${d.extra}
**Link Público do Tinkercad:** ${d.url}

---

### Reflexão Técnica
**${d.q1}**
> ${d.a1}

**${d.q2}**
> ${d.a2}

### Registro de Teste e Correção na Bancada
> ${d.notes}
`;
  }

  function formatReportAsTxt(d) {
    return `====================================================================
RELATÓRIO DE EVIDÊNCIAS — ROBÓTICA COM ARDUINO UNO
====================================================================
Data de Emissão : ${d.date}
Dupla / Equipe  : ${d.names}
Atividade       : ${d.activityTitle}
Desafio Extra   : ${d.extra}
Link Tinkercad  : ${d.url}
--------------------------------------------------------------------
REFLEXÃO TÉCNICA:

${d.q1}
R: ${d.a1}

${d.q2}
R: ${d.a2}

TESTE E CORREÇÃO NA BANCADA:
R: ${d.notes}
====================================================================`;
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (btnCopyReport) {
    btnCopyReport.addEventListener('click', () => {
      if (!currentReportData) return;
      copyTextToClipboard(formatReportAsTxt(currentReportData), '📋 Relatório copiado! Pronto para colar e enviar ao professor.');
    });
  }

  if (btnDownloadMd) {
    btnDownloadMd.addEventListener('click', () => {
      if (!currentReportData) return;
      downloadFile('evidencia-robotica-arduino.md', formatReportAsMarkdown(currentReportData), 'text/markdown');
      showToast('⬇️ Arquivo .MD baixado!');
    });
  }

  if (btnDownloadTxt) {
    btnDownloadTxt.addEventListener('click', () => {
      if (!currentReportData) return;
      downloadFile('evidencia-robotica-arduino.txt', formatReportAsTxt(currentReportData), 'text/plain');
      showToast('⬇️ Arquivo .TXT baixado!');
    });
  }

  if (btnPrintReport) {
    btnPrintReport.addEventListener('click', () => {
      window.print();
    });
  }
});
