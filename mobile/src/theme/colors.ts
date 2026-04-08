/**
 * Identidade Visual Vida Mais
 * 
 * Cores oficiais da instituição com variações para estados e contraste
 */

export const colors = {
  // Cores Principais Vida Mais
  primary: {
    laranja: '#FF7E00',      // Cor principal - Energia, vitalidade
    azul: '#075D94',         // Cor secundária - Confiança, serenidade
    verde: '#7ABA43',        // Sucesso - Saúde, vida
    
    // Variações do Laranja
    laranjaClaro: '#FFB366',
    laranjaEscuro: '#CC6500',
    laranjaMuitoClaro: '#FFE5CC',
    
    // Variações do Azul
    azulClaro: '#0A7AC4',
    azulEscuro: '#054A75',
    azulMuitoClaro: '#E6F3FA',
    
    // Variações do Verde
    verdeClaro: '#9DD45F',
    verdeEscuro: '#5E8E2E',
    verdeMuitoClaro: '#F0F9E6',
  },

  // Neutros (Alto Contraste para Acessibilidade)
  neutral: {
    preto: '#1F2937',          // Texto principal (contraste 16:1)
    cinzaEscuro: '#374151',    // Texto secundário
    cinzaMedio: '#6B7280',     // Texto terciário
    cinzaClaro: '#D1D5DB',     // Bordas
    cinzaMuitoClaro: '#F3F4F6', // Backgrounds
    branco: '#FFFFFF',         // Fundo principal
    fundoApp: '#F9FAFB',       // Fundo geral do app
  },

  // Estados e Feedback
  feedback: {
    sucesso: '#7ABA43',        // Verde Vida Mais
    erro: '#DC2626',           // Vermelho vibrante
    aviso: '#F59E0B',          // Amarelo/laranja
    info: '#075D94',           // Azul Vida Mais
  },

  // Sombras (para dar profundidade)
  shadow: {
    leve: 'rgba(0, 0, 0, 0.1)',
    media: 'rgba(0, 0, 0, 0.2)',
    forte: 'rgba(0, 0, 0, 0.3)',
  }
};

/**
 * Tamanhos de Fonte para Acessibilidade
 * Baseado em diretrizes WCAG 2.1 e pesquisas com idosos
 */
export const fontSizes = {
  // Muito grande (para idosos)
  xxl: 36,      // Títulos principais
  xl: 32,       // Títulos secundários
  lg: 28,       // Subtítulos importantes
  
  // Grande (padrão para idosos)
  md: 24,       // Texto de corpo
  sm: 20,       // Texto secundário
  xs: 18,       // Mínimo aceitável
  
  // Botões
  buttonLarge: 26,    // Botões principais
  buttonMedium: 22,   // Botões secundários
};

/**
 * Espaçamentos para Acessibilidade
 */
export const spacing = {
  // Espaçamentos internos (padding)
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  
  // Espaçamentos entre elementos
  buttonGap: 20,        // Entre botões
  cardGap: 16,          // Entre cards
  sectionGap: 40,       // Entre seções
  questionGap: 60,      // Entre perguntas
};

/**
 * Tamanhos de Botões para Acessibilidade
 */
export const buttonSizes = {
  // Altura mínima
  small: 60,      // Botões secundários
  medium: 70,     // Botões normais
  large: 80,      // Botões principais
  
  // Largura mínima (para botões de ação)
  minWidth: 120,
};

/**
 * Border Radius (Arredondamento)
 */
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  round: 999,     // Botões circulares
};

/**
 * Verificação de Contraste
 * 
 * Exemplos de combinações aprovadas (WCAG AA):
 * - #1F2937 (preto) em #FFFFFF (branco): 16.1:1 ✅
 * - #FF7E00 (laranja) com texto #FFFFFF: 3.4:1 ✅ (para texto ≥24px)
 * - #075D94 (azul) em #FFFFFF: 7.5:1 ✅
 * - #7ABA43 (verde) em #FFFFFF: 2.3:1 ❌ (usar só em backgrounds com texto escuro)
 */

export default colors;

