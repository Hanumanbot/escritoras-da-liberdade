# Escritoras da Liberdade — Projeto Baobá

**Plataforma Popular de Ensino para Pessoas Pretas**  
Uma iniciativa vinculada ao **Projeto Baobá** (Fundo Baobá para Equidade Racial), com foco em educação popular emancipatória, letramento racial, escrevivência, literatura negra, redação crítica e preparação de jovens e mulheres negras.

---

## 🌟 Identidade & Propósito

O programa **Escritoras da Liberdade** organiza suas turmas por polos regionais com nomes em homenagem a grandes referências históricas e intelectuais negras:
* **Polo Dandara dos Palmares** (Salvador - BA)
* **Núcleo Carolina Maria de Jesus** (São Paulo - SP)
* **Polo Lélia Gonzalez** (Rio de Janeiro - RJ)

---

## 🚀 Funcionalidades da Plataforma

### 1. 🏢 Multi-tenant por Polos Regionais Baobá
* Isolamento de oficinas, educandas, educadoras populares e prestações de contas por polo regional.
* Seletor dinâmico no cabeçalho com atualização instantânea de ementas e indicadores.

### 2. 🎥 Sala de Aulas Virtual (Até 100 Participantes Simultâneas)
* **Alta Capacidade:** Grid dinâmico e paginado com suporte a até 100 educandas conectadas simultaneamente (84 online em tempo real).
* **Quadro de Escrita Coletiva (HTML5 Canvas):** Espaço para anotações conjuntas, citações de Conceição Evaristo e Carolina Maria de Jesus, seleção de cores e espessura de traço.
* **Sala WebRTC SFU:** Integração com Jitsi Meet embutido para vídeo e áudio em alta definição com criptografia.
* **Roda de Diálogo & Fila de Mãos:** Sistema onde as educandas acionam o botão **✋ Pedir a Palavra**, organizando a fila para a educadora conceder a palavra com acolhimento.

### 3. 🎓 Perfil da Educanda (Aluna)
* **Desempenho Crítico & Memoriais:** Acompanhamento do aproveitamento acadêmico (9.8/10.0), frequência ativa (98%) e gráfico com os eixos formativos (*Escrevivência, Literatura Negra, Redação Crítica, Pensamento Decolonial*).
* **Pareceres Afetuosos:** Leitura de orientações individuais deixadas pelas educadoras nas produções textuais.
* **Envio de Textos e Ensaios:** Central de produção textual com questionários reflexivos e envio de memoriais em tempo real.

### 4. 👩🏾‍🏫 Perfil da Educadora (Professora)
* **Moderação Host da Oficina:** Controles para silenciar microfones, compartilhar material de leitura e abrir rodas de votação rápida.
* **Avaliação Pedagógica de Ensaios:** Revisão das respostas e memoriais das educandas, atribuição de notas de 0 a 10.0 e redação de pareceres pedagógicos individualizados.
* **Relatórios Mensais de Atividades Docentes:** Lançamento de carga horária ministrada (ex: 44h no mês), quantidade de oficinas dadas, educandas atendidas e ementa desenvolvida para cálculo automático da bolsa de fomento (R$ 90,00/h).

### 5. 👑 Perfil Master Baobá (Coordenação Geral & Gestão Financeira)
* **Aba de Acompanhamento de Relatórios & Liberação de Pagamentos:**
  * Painel financeiro consolidado: Total de bolsas liquidadas via PIX no mês e total pendente de liberação.
  * Tabela completa de auditoria de todos os polos regionais.
  * **Fluxo de Liberação:**
    1. *Auditoria:* Validação da ementa e horas declaradas.
    2. *Aprovação:* Registro do parecer da coordenação.
    3. *Liberação Instantânea:* Transferência via PIX com geração automática de comprovante auditável (*ex: PIX-BAOBA-883920194*).

---

## 🛠️ Como Executar

O servidor local já se encontra em execução na porta `8000`:

```bash
cd /home/rodrigo/.gemini/antigravity/scratch/edutech-lms-platform
python3 server.py 8000
```

Acesse no navegador:
**[http://localhost:8000](http://localhost:8000)**
