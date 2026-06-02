import { PerguntaPadrao } from './questionario-padrao';

export const TEMPLATE_PI2026: PerguntaPadrao[] = [
  {
    ordem: 1,
    tipo: 'ESCALA',
    enunciado: 'Como você avalia o programa Vida Mais? (0 = muito ruim, 10 = excelente)',
    obrigatoria: true,
  },
  {
    ordem: 2,
    tipo: 'BOOLEAN',
    enunciado: 'Você recomendaria o programa Vida Mais para um familiar ou amigo?',
    obrigatoria: true,
  },
  {
    ordem: 3,
    tipo: 'UNICA',
    enunciado: 'Com que frequência você participa das atividades do programa?',
    opcoes: ['Sempre', 'Quase sempre', 'Às vezes', 'Raramente'],
    obrigatoria: true,
  },
  {
    ordem: 4,
    tipo: 'TEXTO',
    enunciado: 'Deixe um comentário ou sugestão para melhorar o programa:',
    obrigatoria: false,
  },
];
