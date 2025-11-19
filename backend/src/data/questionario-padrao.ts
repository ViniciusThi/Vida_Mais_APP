/**
 * Questionário Padrão de Satisfação - Vida Mais
 * 38 questões aplicadas anualmente aos associados
 */

export interface PerguntaPadrao {
  texto: string;
  tipo: 'MULTIPLA_ESCOLHA' | 'TEXTO' | 'ESCALA';
  opcoes?: string[];
  ordem: number;
  obrigatoria: boolean;
  escalaMin?: number;
  escalaMax?: number;
}

export const QUESTIONARIO_PADRAO_2025: PerguntaPadrao[] = [
  {
    ordem: 1,
    texto: 'Há quanto tempo você frequenta o Vida Mais?',
    tipo: 'TEXTO',
    obrigatoria: true
  },
  {
    ordem: 2,
    texto: 'Se você está no Vida Mais há mais de um ano, responda: O que mudou na sua vida?',
    tipo: 'TEXTO',
    obrigatoria: false
  },
  {
    ordem: 3,
    texto: 'Hoje você se sente melhor do que há um ano atrás?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: false
  },
  {
    ordem: 4,
    texto: 'O que mudou em sua vida depois que começou a frequentar o Vida Mais?',
    tipo: 'TEXTO',
    obrigatoria: true
  },
  {
    ordem: 5,
    texto: 'Como tem sido sua experiência no Vida Mais?',
    tipo: 'TEXTO',
    obrigatoria: true
  },
  {
    ordem: 6,
    texto: 'Você se sente uma pessoa mais bem-humorada?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 7,
    texto: 'Você se sente uma pessoa mais alegre?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 8,
    texto: 'Você sente que tem mais equilíbrio corporal?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 9,
    texto: 'Você sente que tem conseguido dormir melhor?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 10,
    texto: 'Você sente que tem feito novas amizades?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 11,
    texto: 'Você sente que tem melhorado sua qualidade de vida?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 12,
    texto: 'Você sente que tem melhorado seu relacionamento com a sua família?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 13,
    texto: 'Você sente que tem deixado de tomar remédios (por indicação médica)?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 14,
    texto: 'Você sente que tem diminuído a quantidade de remédios (por indicação médica)?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 15,
    texto: 'Você sente que tem uma melhor saúde física?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 16,
    texto: 'Você sente que tem uma melhor saúde mental?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 17,
    texto: 'Como você se imagina nos próximos anos?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Bem', 'Mal', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 18,
    texto: 'Você pretende sair do Vida Mais nos próximos anos?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 19,
    texto: 'Você indicaria o Vida Mais para alguém próximo?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 20,
    texto: 'A Márcia, recepcionista, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 21,
    texto: 'A Thais, auxiliar de enfermagem, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 22,
    texto: 'A Thamiris, auxiliar de enfermagem, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 23,
    texto: 'A Tainara, enfermeira, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 24,
    texto: 'A Ana Paula, nutricionista, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 25,
    texto: 'A Jéssica, fisioterapeuta, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 26,
    texto: 'A Dra. Lilian, médica geriatra, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 27,
    texto: 'A Laís, psicóloga, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 28,
    texto: 'A Gabriela, terapeuta ocupacional, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 29,
    texto: 'A Viviane, assistente social, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 30,
    texto: 'A Letícia, fonoaudióloga, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 31,
    texto: 'A Carol, dentista, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 32,
    texto: 'O Paulo, professor de educação física, é um bom profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 33,
    texto: 'O Pedro, coordenador geral, é um bom profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 34,
    texto: 'O Rodrigo, auxiliar de serviços gerais, é um bom profissional? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 35,
    texto: 'Dê uma nota sobre os serviços prestados pelos voluntários? (0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: true
  },
  {
    ordem: 36,
    texto: 'Comentário sobre os voluntários (opcional)',
    tipo: 'TEXTO',
    obrigatoria: false
  },
  {
    ordem: 37,
    texto: 'Você faz Aulas de Hidroginástica?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não'],
    obrigatoria: true
  },
  {
    ordem: 38,
    texto: 'Você Falta em Dias Nublados/Chuvosos/Frios?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: ['Sim', 'Não'],
    obrigatoria: false
  },
  {
    ordem: 39,
    texto: 'Avalie a Limpeza da Piscina (nota de 0 a 10)',
    tipo: 'ESCALA',
    escalaMin: 0,
    escalaMax: 10,
    obrigatoria: false
  }
];

