/**
 * Serviço de Exportação Excel Avançada
 * Gera relatórios completos com múltiplas sheets, estatísticas e formatação
 */
import ExcelJS from 'exceljs';
import { Response } from 'express';

interface QuestionarioData {
  id: string;
  titulo: string;
  descricao: string | null;
  turma: any;
  perguntas: any[];
}

interface RespostaData {
  alunoId: string;
  perguntaId: string;
  aluno: {
    nome: string;
    email: string;
  };
  pergunta: any;
  valorTexto: string | null;
  valorNum: number | null;
  valorBool: boolean | null;
  valorOpcao: string | null;
}

export class ExcelExportService {
  /**
   * Exporta questionário com formatação avançada
   */
  static async exportQuestionario(
    questionario: QuestionarioData,
    respostas: RespostaData[],
    res: Response
  ) {
    const workbook = new ExcelJS.Workbook();
    
    // Metadados
    workbook.creator = 'Sistema Vida Mais';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Sheet 1: Dados Brutos
    this.createDadosSheet(workbook, questionario, respostas);

    // Sheet 2: Estatísticas
    this.createEstatisticasSheet(workbook, questionario, respostas);

    // Sheet 3: Resumo
    this.createResumoSheet(workbook, questionario, respostas);

    // Configurar resposta HTTP
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=relatorio-${questionario.titulo.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Sheet 1: Dados Brutos
   */
  private static createDadosSheet(
    workbook: ExcelJS.Workbook,
    questionario: QuestionarioData,
    respostas: RespostaData[]
  ) {
    const worksheet = workbook.addWorksheet('📊 Dados', {
      views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }]
    });

    // Cabeçalhos
    const headers = ['Aluno', 'Email', ...questionario.perguntas.map(p => p.enunciado)];
    const headerRow = worksheet.addRow(headers);

    // Estilizar cabeçalho
    headerRow.height = 30;
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colNumber <= 2 ? 'FF075D94' : 'FFFF7E00' } // Azul/Laranja Vida Mais
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 12
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agrupar por aluno
    const alunosUnicos = [...new Set(respostas.map(r => r.alunoId))];

    alunosUnicos.forEach((alunoId, index) => {
      const respostasAluno = respostas.filter(r => r.alunoId === alunoId);
      const aluno = respostasAluno[0]?.aluno;

      const row = [aluno?.nome || '', aluno?.email || ''];

      questionario.perguntas.forEach(pergunta => {
        const resposta = respostasAluno.find(r => r.perguntaId === pergunta.id);
        let valor: string | number = '';

        if (resposta) {
          if (resposta.valorTexto) valor = resposta.valorTexto;
          else if (resposta.valorNum !== null) valor = resposta.valorNum;
          else if (resposta.valorBool !== null) valor = resposta.valorBool ? 'Sim' : 'Não';
          else if (resposta.valorOpcao) valor = resposta.valorOpcao;
        }

        row.push(valor);
      });

      const dataRow = worksheet.addRow(row);

      // Zebrado (linhas alternadas)
      if (index % 2 === 0) {
        dataRow.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }
          };
        });
      }

      // Bordas
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    });

    // Ajustar largura das colunas
    worksheet.columns.forEach((column, index) => {
      if (index === 0) column.width = 25; // Nome
      else if (index === 1) column.width = 30; // Email
      else column.width = 20; // Perguntas
    });
  }

  /**
   * Sheet 2: Estatísticas
   */
  private static createEstatisticasSheet(
    workbook: ExcelJS.Workbook,
    questionario: QuestionarioData,
    respostas: RespostaData[]
  ) {
    const worksheet = workbook.addWorksheet('📈 Estatísticas');

    // Título
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📈 Análise Estatística do Questionário';
    titleCell.font = { bold: true, size: 16, color: { argb: 'FF075D94' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFF6FF' }
    };
    worksheet.getRow(1).height = 40;

    let currentRow = 3;

    // Para cada pergunta, calcular estatísticas
    questionario.perguntas.forEach(pergunta => {
      const respostasPergunta = respostas.filter(r => r.perguntaId === pergunta.id);

      // Cabeçalho da pergunta
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const perguntaCell = worksheet.getCell(`A${currentRow}`);
      perguntaCell.value = `❓ ${pergunta.enunciado}`;
      perguntaCell.font = { bold: true, size: 12 };
      perguntaCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF7ED' }
      };
      worksheet.getRow(currentRow).height = 25;
      currentRow++;

      // Estatísticas baseadas no tipo
      if (pergunta.tipo === 'ESCALA') {
        const valores = respostasPergunta
          .map(r => r.valorNum)
          .filter((v): v is number => v !== null);

        if (valores.length > 0) {
          const stats = this.calculateNumericStats(valores);

          worksheet.addRow(['Total de Respostas:', stats.count]);
          worksheet.addRow(['Média:', stats.mean.toFixed(2)]);
          worksheet.addRow(['Mediana:', stats.median]);
          worksheet.addRow(['Mínimo:', stats.min]);
          worksheet.addRow(['Máximo:', stats.max]);
          worksheet.addRow(['Desvio Padrão:', stats.stdDev.toFixed(2)]);
        }
      } else if (pergunta.tipo === 'UNICA' || pergunta.tipo === 'MULTIPLA') {
        const distribuicao = this.calculateDistribution(respostasPergunta);

        worksheet.addRow(['Opção', 'Quantidade', 'Percentual', 'Barra']);
        Object.entries(distribuicao).forEach(([opcao, count]) => {
          const percentual = ((count / respostasPergunta.length) * 100).toFixed(1);
          const barra = '█'.repeat(Math.round(count / respostasPergunta.length * 20));
          worksheet.addRow([opcao, count, `${percentual}%`, barra]);
        });
      } else if (pergunta.tipo === 'TEXTO') {
        worksheet.addRow(['Total de Respostas:', respostasPergunta.length]);
        worksheet.addRow(['Tipo:', 'Resposta Aberta (ver aba Dados)']);
      }

      currentRow = worksheet.lastRow!.number + 2;
    });

    // Estilizar colunas
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 30;
  }

  /**
   * Sheet 3: Resumo
   */
  private static createResumoSheet(
    workbook: ExcelJS.Workbook,
    questionario: QuestionarioData,
    respostas: RespostaData[]
  ) {
    const worksheet = workbook.addWorksheet('📋 Resumo');

    // Título principal
    worksheet.mergeCells('A1:B1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📋 Resumo do Questionário';
    titleCell.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF075D94' }
    };
    worksheet.getRow(1).height = 50;

    worksheet.addRow([]);

    // Informações gerais
    const info = [
      ['📝 Título:', questionario.titulo],
      ['📄 Descrição:', questionario.descricao || 'N/A'],
      ['🎓 Turma:', questionario.turma?.nome || 'Global'],
      ['❓ Total de Perguntas:', questionario.perguntas.length],
      ['👥 Total de Respondentes:', new Set(respostas.map(r => r.alunoId)).size],
      ['💬 Total de Respostas:', respostas.length],
      ['📅 Data de Exportação:', new Date().toLocaleString('pt-BR')]
    ];

    info.forEach(([label, value]) => {
      const row = worksheet.addRow([label, value]);
      row.getCell(1).font = { bold: true };
      row.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' }
      };
      row.height = 25;
    });

    worksheet.addRow([]);
    worksheet.addRow([]);

    // Taxa de resposta por pergunta
    worksheet.mergeCells(`A${worksheet.lastRow!.number + 1}:B${worksheet.lastRow!.number + 1}`);
    const taxaTitle = worksheet.getCell(`A${worksheet.lastRow!.number + 1}`);
    taxaTitle.value = '📊 Taxa de Resposta por Pergunta';
    taxaTitle.font = { bold: true, size: 14 };
    taxaTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFF6FF' }
    };
    worksheet.lastRow!.height = 30;

    worksheet.addRow(['Pergunta', 'Taxa de Resposta']);

    const totalRespondentes = new Set(respostas.map(r => r.alunoId)).size;
    questionario.perguntas.forEach(pergunta => {
      const respostasPergunta = respostas.filter(r => r.perguntaId === pergunta.id);
      const taxa = totalRespondentes > 0
        ? ((respostasPergunta.length / totalRespondentes) * 100).toFixed(1)
        : 0;
      
      worksheet.addRow([
        pergunta.enunciado.substring(0, 50) + (pergunta.enunciado.length > 50 ? '...' : ''),
        `${taxa}%`
      ]);
    });

    // Ajustar larguras
    worksheet.getColumn(1).width = 40;
    worksheet.getColumn(2).width = 20;
  }

  /**
   * Calcular estatísticas numéricas
   */
  private static calculateNumericStats(valores: number[]) {
    const sorted = [...valores].sort((a, b) => a - b);
    const count = valores.length;
    const sum = valores.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const median = count % 2 === 0
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];
    const variance = valores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    return {
      count,
      sum,
      mean,
      median,
      min: Math.min(...valores),
      max: Math.max(...valores),
      stdDev
    };
  }

  /**
   * Calcular distribuição de respostas
   */
  private static calculateDistribution(respostas: RespostaData[]) {
    const distribuicao: Record<string, number> = {};

    respostas.forEach(r => {
      const valor = r.valorOpcao || r.valorTexto || (r.valorBool !== null ? (r.valorBool ? 'Sim' : 'Não') : 'N/A');
      distribuicao[valor] = (distribuicao[valor] || 0) + 1;
    });

    return distribuicao;
  }
}

