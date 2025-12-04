/**
 * Questionário Padrão de Satisfação - Forms Tech
 * 38 questões aplicadas anualmente aos associados
 */

export interface PerguntaPadrao {
  enunciado: string;
  tipo: 'MULTIPLA' | 'TEXTO' | 'ESCALA';
  opcoes?: string[];
  ordem: number;
  obrigatoria: boolean;
}

export const QUESTIONARIO_PADRAO_2025: PerguntaPadrao[] = [
  {
    ordem: 1,
    enunciado: 'Há quanto tempo você frequenta o Forms Tech?',
    tipo: 'TEXTO',
    obrigatoria: true
  },
  {
    ordem: 2,
    enunciado: 'Se você está no Forms Tech há mais de um ano, responda: O que mudou na sua vida?',
    tipo: 'TEXTO',
    obrigatoria: false
  },
  {
    ordem: 3,
    enunciado: 'Hoje você se sente melhor do que há um ano atrás?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: false
  },
  {
    ordem: 4,
    enunciado: 'O que mudou em sua vida depois que começou a frequentar o Forms Tech?',
    tipo: 'TEXTO',
    obrigatoria: true
  },
  {
    ordem: 5,
    enunciado: 'Como tem sido sua experiência no Forms Tech?',
    tipo: 'TEXTO',
    obrigatoria: true
  },
  {
    ordem: 6,
    enunciado: 'Você se sente uma pessoa mais bem-humorada?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 7,
    enunciado: 'Você se sente uma pessoa mais alegre?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 8,
    enunciado: 'Você sente que tem mais equilíbrio corporal?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 9,
    enunciado: 'Você sente que tem conseguido dormir melhor?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 10,
    enunciado: 'Você sente que tem feito novas amizades?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 11,
    enunciado: 'Você sente que tem melhorado sua qualidade de vida?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 12,
    enunciado: 'Você sente que tem melhorado seu relacionamento com a sua família?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 13,
    enunciado: 'Você sente que tem deixado de tomar remédios (por indicação médica)?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 14,
    enunciado: 'Você sente que tem diminuído a quantidade de remédios (por indicação médica)?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 15,
    enunciado: 'Você sente que tem uma melhor saúde física?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 16,
    enunciado: 'Você sente que tem uma melhor saúde mental?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 17,
    enunciado: 'Como você se imagina nos próximos anos?',
    tipo: 'MULTIPLA',
    opcoes: ['Bem', 'Mal', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 18,
    enunciado: 'Você pretende sair do Forms Tech nos próximos anos?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 19,
    enunciado: 'Você indicaria o Forms Tech para alguém próximo?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não', 'Não sei dizer'],
    obrigatoria: true
  },
  {
    ordem: 20,
    enunciado: 'A Márcia, recepcionista, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 21,
    enunciado: 'A Thais, auxiliar de enfermagem, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 22,
    enunciado: 'A Thamiris, auxiliar de enfermagem, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 23,
    enunciado: 'A Tainara, enfermeira, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 24,
    enunciado: 'A Ana Paula, nutricionista, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 25,
    enunciado: 'A Jéssica, fisioterapeuta, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 26,
    enunciado: 'A Dra. Lilian, médica geriatra, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 27,
    enunciado: 'A Laís, psicóloga, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 28,
    enunciado: 'A Gabriela, terapeuta ocupacional, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 29,
    enunciado: 'A Viviane, assistente social, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 30,
    enunciado: 'A Letícia, fonoaudióloga, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 31,
    enunciado: 'A Carol, dentista, é uma boa profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 32,
    enunciado: 'O Paulo, professor de educação física, é um bom profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 33,
    enunciado: 'O Pedro, coordenador geral, é um bom profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 34,
    enunciado: 'O Rodrigo, auxiliar de serviços gerais, é um bom profissional? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 35,
    enunciado: 'Dê uma nota sobre os serviços prestados pelos voluntários? (0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: true
  },
  {
    ordem: 36,
    enunciado: 'Comentário sobre os voluntários (opcional)',
    tipo: 'TEXTO',
    obrigatoria: false
  },
  {
    ordem: 37,
    enunciado: 'Você faz Aulas de Hidroginástica?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não'],
    obrigatoria: true
  },
  {
    ordem: 38,
    enunciado: 'Você Falta em Dias Nublados/Chuvosos/Frios?',
    tipo: 'MULTIPLA',
    opcoes: ['Sim', 'Não'],
    obrigatoria: false
  },
  {
    ordem: 39,
    enunciado: 'Avalie a Limpeza da Piscina (nota de 0 a 10)',
    tipo: 'ESCALA',
    obrigatoria: false
  }
];

