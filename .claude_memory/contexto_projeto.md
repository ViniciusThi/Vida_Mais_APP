# Contexto do Projeto — Vida Mais APP

## O que é

O **Vida Mais APP** é uma plataforma digital de pesquisas e questionários de satisfação criada para a **Associação Centro do Idoso Vida Mais Itapira**. O objetivo é substituir formulários em papel por um sistema digital com foco total em **acessibilidade para idosos**.

## O Cliente — Associação Centro do Idoso Vida Mais Itapira

- **O que é**: Espaço de convivência gratuito para homens e mulheres com 60+ anos, em Itapira-SP.
- **Iniciativa privada**: Serviços 100% gratuitos para os idosos e suas famílias.
- **Funcionamento**: Segunda a quinta, 07h–18h; sexta até 17h (intervalo 11h–13h).
- **Missão**: Estimular o desenvolvimento pessoal, familiar e social de idosos, oferecendo atividades corporais, cognitivas e de convívio para que possam envelhecer com mais dignidade, autonomia e longevidade.
- **Visão**: Ser referência nacional na promoção de oportunidades de desenvolvimento para idosos em situação de vulnerabilidade.
- **Valores**: Respeito, Ética, Dedicação, Busca de Excelência, Inserção Social, Felicidade Pessoal, Motivação.

## Regras de Negócio da Instituição

1. Cada idoso passa por uma **anamnese inicial** com psicólogo, gerontólogo e assistente social.
2. A partir da avaliação, é montada uma **grade de atividades personalizada** por perfil.
3. Atividades são **corporais, cognitivas e de convívio social** — não são aulas formais.
4. O objetivo é o **envelhecimento ativo, saudável e autônomo** — não mérito acadêmico.
5. O público é **vulnerável** (familiar/social) — o app nunca pode ser uma barreira de acesso.

## Problema que o App Resolve

A instituição aplica pesquisas de satisfação em papel para avaliar as atividades e o bem-estar dos idosos. Esse processo é ineficiente, difícil de tabular e inacessível para parte do público. O app digitaliza com:
- Interface acessível (fontes grandes, TTS, QR Code sem login complexo)
- Relatórios automáticos para a equipe de coordenação
- Análise de ML para detectar risco de evasão e tendências por turma/atividade

## Usuários do Sistema

| Tipo | Perfil | Necessidades |
|------|--------|-------------|
| ALUNO | Idoso 60+, pouco familiarizado com tecnologia | Interface simples, acessível, TTS, nenhum login complexo |
| PROF | Coordenador/instrutor de atividade | Criar questionários por turma, ver relatórios |
| ADMIN | Gestor da associação | Visão global, relatórios consolidados, gestão de usuários |

## Implicações para Funcionalidades

- Qualquer feature deve respeitar que o usuário final é um **idoso em situação de vulnerabilidade**.
- Relatórios devem ajudar a equipe a medir **bem-estar e satisfação**, não desempenho acadêmico.
- O ML de "evasão" aqui significa **abandono das atividades**, o que tem impacto direto na saúde do idoso.
- Sugestões de novas features devem fazer sentido para uma **associação sem fins lucrativos**, com operação enxuta.

## Terminologia da UI (já implementada)

A UI usa linguagem da Vida Mais, não acadêmica:

| Código interno (não mudar) | UI exibida ao usuário |
|---|---|
| `aluno` / `ALUNO` | Participante |
| `professor` / `PROF` | Coordenador |
| `turma` | Grupo |
| `riscoEvasao` (JSON ML) | "Risco de abandono das atividades" |
| `mediaNotas` (JSON ML) | "Índice de Bem-Estar" |

## Status do Projeto

- Monorepo com 4 serviços: backend, web-admin, mobile, ml-service
- Banco de dados MySQL via Prisma ORM
- Docker Compose para orquestração local
- UI alinhada com contexto Vida Mais Itapira (terminologia corrigida em abril/2026)
- **Pendente (Fase 3):** adicionar enum `TipoAtividade` ao schema Prisma para categorizar grupos (CORPORAL, COGNITIVA, SOCIAL, MISTA)

---
_Última atualização: 2026-04-21_
