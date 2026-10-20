# 🌳 Escritoras da Liberdade — Projeto Baobá
## Material Oficial para Divulgação & Git Release v1.0.0

Este documento reúne os textos prontos para publicação no **GitHub**, **LinkedIn**, **Twitter/X** e **Comunidades de Tecnologia e Impacto Social**.

---

## 📌 1. Post para LinkedIn & Comunidades Tech / Redes Sociais

```markdown
✊🏾 Orgulho em compartilhar o lançamento da plataforma "Escritoras da Liberdade", uma iniciativa de educação popular para pessoas pretas desenvolvida em parceria com o Projeto Baobá! 🌳✨

A plataforma foi concebida para fortalecer o letramento racial, a escrevivência, a produção crítica e a emancipação de educandas e educadoras em todo o Brasil.

🚀 Destaques da arquitetura e das funcionalidades:

🏢 Multi-tenant por Polos Regionais:
Estrutura adaptada aos núcleos do projeto (Polo Dandara dos Palmares em Salvador, Núcleo Carolina Maria de Jesus em SP e Polo Lélia Gonzalez no RJ), com autonomia pedagógica e isolamento de dados.

🎥 Sala de Aula Virtual de Alta Escala (Até 100 participantes):
Sessões ao vivo síncronas que acolhem até 100 educandas simultâneas com WebRTC SFU, paginação inteligente, fila humanizada de "Pedir a Palavra" e Quadro de Escrita Coletiva interativo em HTML5 Canvas.

✍🏾 Escrevivência & Avaliação Emancipatória:
As educandas acompanham seu rendimento crítico, participam de oficinas e submetem memoriais e ensaios, recebendo notas e pareceres pedagógicos e afetuosos das educadoras.

👑 Módulo Master & Fomento Docente:
Painel financeiro para a Coordenação Geral do Fundo Baobá auditar relatórios mensais de oficinas, validar horas ministradas e liberar pagamentos de bolsas via PIX com geração automática de comprovantes.

💻 Stack tecnológica:
Construído com Python 3 (REST API e SQLite), Vanilla JS moderno, Tailwind CSS, Chart.js e suporte nativo a WebRTC/Jitsi.

"A nossa escrevivência não é para adormecer os da casa-grande, mas para acordá-los de seus sonos injustos." — Conceição Evaristo

#EducacaoPopular #ProjetoBaoba #EscritorasDaLiberdade #EquidadeRacial #EdTech #OpenSource #Python #WebRTC #Escrevivencia #DiversidadeNaTecnologia
```

---

## 📌 2. GitHub Release v1.0.0 (Release Notes)

```markdown
# 🚀 Escritoras da Liberdade v1.0.0 — Lançamento Oficial

Primeira versão da plataforma popular de ensino para pessoas pretas, vinculada ao Projeto Baobá.

### ✨ Novidades desta versão:
* **Arquitetura Multi-tenant:** Suporte aos Polos Regionais (Salvador, SP e RJ).
* **Sala de Aula Online (100 Vagas):** Mosaico responsivo, WebRTC SFU, detecção de fala ativa e quadro branco interativo.
* **Fila de Dúvidas Humanizada:** Botão "Pedir a Palavra" com acolhimento pela educadora titular.
* **Módulo de Escrevivência:** Submissão de ensaios, questionários conceituais e recebimento de notas e pareceres docentes.
* **Auditoria e Liberação de Bolsas Master:** Aba financeira com aprovação de relatórios de oficinas e repasses instantâneos via PIX.
* **Zero External Dependencies:** Backend em Python puro com persistência SQLite e frontend reativo.
```

---

## 📌 3. Comandos para Git Commit & Push (Terminal do Host)

Caso você queira subir o código para o seu repositório no GitHub:

```bash
# 1. Acesse o diretório do projeto
cd /home/rodrigo/.gemini/antigravity/scratch/edutech-lms-platform

# 2. Inicialize o repositório git
git init

# 3. Adicione todos os arquivos
git add .

# 4. Crie o primeiro commit estruturado
git commit -m "feat: lancamento inicial da plataforma Escritoras da Liberdade (Projeto Baoba)"

# 5. Conecte ao seu repositório remoto no GitHub (substitua pela sua URL)
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/escritoras-da-liberdade.git

# 6. Envie para o GitHub
git push -u origin main
```
