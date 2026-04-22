# Contexto do Projeto — Vida Mais APP

## Cliente

**Associação Centro do Idoso Vida Mais Itapira**
Site: https://www.vidamaisitapira.org.br

Espaço de convivência gratuito para homens e mulheres com 60+ anos, em Itapira-SP. Iniciativa privada sem fins lucrativos — todos os serviços são gratuitos para os idosos e suas famílias.

## Missão

> Estimular o desenvolvimento pessoal, familiar e social de idosos, oferecendo atividades corporais, cognitivas e de convívio para que possam envelhecer com mais dignidade, autonomia e longevidade.

## Visão

Ser referência nacional na promoção de oportunidades de desenvolvimento pessoal, familiar e social para idosos em situação de vulnerabilidade.

## Valores

Respeito · Ética · Dedicação · Busca de Excelência · Inserção Social · Felicidade Pessoal · Motivação

---

## Como a Instituição Funciona

- Atendimento: segunda a quinta das 07h às 18h, sexta até 17h (intervalo 11h–13h).
- Cada idoso é recebido por **psicólogo, gerontólogo e assistente social** para uma anamnese inicial.
- A partir da avaliação, monta-se uma **grade de atividades personalizada** (corporais, cognitivas, sociais).
- O foco não é mérito acadêmico — é **envelhecimento ativo, saudável e autônomo**.

---

## Problema que o App Resolve

A instituição aplica pesquisas de satisfação em papel para avaliar atividades e bem-estar. Esse processo é:
- Ineficiente para tabular e analisar
- Inacessível para parte do público (idosos com limitações motoras/visuais)
- Lento para gerar insights para a equipe de coordenação

O **Vida Mais APP** digitaliza esse processo com:
- Interface de alta acessibilidade (fontes ≥20px, botões ≥60×60px, TTS via Expo Speech)
- Acesso por QR Code sem necessidade de login complexo
- Dashboard para coordenadores com relatórios por turma/atividade
- Análise de ML para detectar risco de abandono das atividades

---

## Regras de Negócio

| # | Regra |
|---|-------|
| 1 | Todo idoso passa por anamnese antes de ingressar nas atividades |
| 2 | A grade de atividades é personalizada por perfil individual |
| 3 | Os serviços são sempre gratuitos — o app não pode criar barreiras de acesso |
| 4 | O público é vulnerável: a interface deve ser a mais simples possível |
| 5 | "Evasão" significa abandono das atividades — impacto direto na saúde do idoso |
| 6 | Relatórios medem bem-estar e satisfação, não desempenho acadêmico |

---

## Usuários do Sistema

| Role | Quem é | O que precisa |
|------|--------|--------------|
| `ALUNO` | Idoso 60+, pouco familiarizado com tecnologia | Interface simples, acessível, TTS, acesso por QR Code |
| `PROF` | Coordenador ou instrutor de atividade | Criar questionários por turma, visualizar relatórios |
| `ADMIN` | Gestor da associação | Visão global, relatórios consolidados, gestão de usuários |

---

## Implicações para o Desenvolvimento

- Toda feature nova deve ser avaliada pela lente: **"isso melhora o bem-estar ou a operação da associação?"**
- O ML de predição de evasão tem impacto real: abandono = risco à saúde do idoso.
- A operação é enxuta (sem fins lucrativos) — features devem ser simples de usar pela equipe.
- Acessibilidade não é opcional — é o requisito central do produto.

---
_Atualizado em: 2026-04-21_
