"""
Serviço de Analytics
Análises estatísticas e identificação de padrões
"""
from typing import Dict, List, Any
from datetime import datetime, timedelta
import numpy as np

class AnalyticsService:
    def __init__(self, db_service):
        self.db = db_service
    
    def get_overview(self) -> Dict[str, Any]:
        """Obter visão geral das métricas do sistema"""
        try:
            alunos = self.db.get_alunos_data()
            questionarios = self.db.get_questionarios_stats()
            
            total_alunos = len(alunos)
            total_questionarios = len(questionarios)
            
            # Calcular médias
            alunos_ativos = sum(1 for a in alunos if a.get('questionarios_respondidos', 0) > 0)
            media_respostas = np.mean([a.get('questionarios_respondidos', 0) for a in alunos]) if alunos else 0
            media_notas = np.mean([a.get('media_notas', 0) or 0 for a in alunos if a.get('media_notas')]) if alunos else 0
            
            # Taxa de engajamento
            taxa_engajamento = (alunos_ativos / total_alunos * 100) if total_alunos > 0 else 0
            
            return {
                'totalAlunos': total_alunos,
                'alunosAtivos': alunos_ativos,
                'totalQuestionarios': total_questionarios,
                'mediaRespostasPorAluno': round(media_respostas, 2),
                'mediaNotasGeral': round(media_notas, 2),
                'taxaEngajamento': round(taxa_engajamento, 2)
            }
        except Exception as e:
            print(f"Erro em get_overview: {e}")
            return {
                'error': str(e)
            }
    
    def get_turma_analytics(self, turma_id: str) -> Dict[str, Any]:
        """Análise detalhada de uma turma"""
        try:
            alunos = self.db.get_alunos_data(turma_id)
            engagement = self.db.get_engagement_data(turma_id)
            
            if not alunos:
                return {
                    'turmaId': turma_id,
                    'message': 'Turma não encontrada ou sem alunos'
                }
            
            # Estatísticas básicas
            total_alunos = len(alunos)
            alunos_ativos = sum(1 for a in alunos if a.get('questionarios_respondidos', 0) > 0)
            
            # Distribuição de notas
            notas = [a.get('media_notas', 0) or 0 for a in alunos if a.get('media_notas')]
            if notas:
                distribuicao_notas = {
                    'excelente': sum(1 for n in notas if n >= 8),
                    'bom': sum(1 for n in notas if 6 <= n < 8),
                    'regular': sum(1 for n in notas if 4 <= n < 6),
                    'baixo': sum(1 for n in notas if n < 4)
                }
                media_notas = round(np.mean(notas), 2)
                mediana_notas = round(np.median(notas), 2)
            else:
                distribuicao_notas = {
                    'excelente': 0,
                    'bom': 0,
                    'regular': 0,
                    'baixo': 0
                }
                media_notas = 0
                mediana_notas = 0
            
            # Análise de engajamento
            engagement_dict = {e['aluno_id']: e for e in engagement}
            
            alunos_detalhados = []
            for aluno in alunos:
                eng = engagement_dict.get(aluno['id'], {})
                alunos_detalhados.append({
                    'id': aluno['id'],
                    'nome': aluno['nome'],
                    'questionariosRespondidos': aluno.get('questionarios_respondidos', 0),
                    'mediaNotas': round(aluno.get('media_notas', 0) or 0, 2),
                    'diasAtivo': eng.get('dias_ativo', 0) or 0
                })
            
            # Ordenar por engajamento
            alunos_detalhados.sort(key=lambda x: x['questionariosRespondidos'], reverse=True)
            
            return {
                'turmaId': turma_id,
                'totalAlunos': total_alunos,
                'alunosAtivos': alunos_ativos,
                'taxaEngajamento': round(alunos_ativos / total_alunos * 100, 2) if total_alunos > 0 else 0,
                'mediaNotas': media_notas,
                'medianaNotas': mediana_notas,
                'distribuicaoNotas': distribuicao_notas,
                'topAlunos': alunos_detalhados[:5],
                'alunosEmRisco': alunos_detalhados[-5:]
            }
        except Exception as e:
            print(f"Erro em get_turma_analytics: {e}")
            return {
                'turmaId': turma_id,
                'error': str(e)
            }
    
    def get_aluno_analytics(self, aluno_id: str) -> Dict[str, Any]:
        """Análise detalhada de um aluno"""
        try:
            respostas = self.db.get_respostas_aluno(aluno_id)
            
            if not respostas:
                return {
                    'alunoId': aluno_id,
                    'message': 'Aluno não possui respostas registradas'
                }
            
            # Estatísticas básicas
            total_respostas = len(respostas)
            questionarios_unicos = len(set(r['questionario_id'] for r in respostas))
            
            # Análise temporal
            primeira_resposta = min(r['criado_em'] for r in respostas)
            ultima_resposta = max(r['criado_em'] for r in respostas)
            
            if isinstance(primeira_resposta, str):
                primeira_resposta = datetime.fromisoformat(primeira_resposta.replace('Z', '+00:00'))
            if isinstance(ultima_resposta, str):
                ultima_resposta = datetime.fromisoformat(ultima_resposta.replace('Z', '+00:00'))
            
            dias_ativo = (ultima_resposta - primeira_resposta).days
            
            # Análise de notas
            notas = [r['valor_num'] for r in respostas if r.get('valor_num') is not None]
            if notas:
                media_notas = round(np.mean(notas), 2)
                melhor_nota = max(notas)
                pior_nota = min(notas)
                tendencia_notas = self._calcular_tendencia(notas)
            else:
                media_notas = None
                melhor_nota = None
                pior_nota = None
                tendencia_notas = 'sem_dados'
            
            # Histórico recente (últimas 10 respostas)
            respostas_recentes = sorted(respostas, key=lambda r: r['criado_em'], reverse=True)[:10]
            historico_recente = [
                {
                    'data': r['criado_em'].isoformat() if hasattr(r['criado_em'], 'isoformat') else str(r['criado_em']),
                    'questionario': r.get('questionario_titulo', 'N/A'),
                    'valor': r.get('valor_num') or r.get('valor_texto') or r.get('valor_opcao')
                }
                for r in respostas_recentes
            ]
            
            return {
                'alunoId': aluno_id,
                'totalRespostas': total_respostas,
                'questionariosRespondidos': questionarios_unicos,
                'primeiraResposta': primeira_resposta.isoformat() if hasattr(primeira_resposta, 'isoformat') else str(primeira_resposta),
                'ultimaResposta': ultima_resposta.isoformat() if hasattr(ultima_resposta, 'isoformat') else str(ultima_resposta),
                'diasAtivo': dias_ativo,
                'mediaNotas': media_notas,
                'melhorNota': melhor_nota,
                'piorNota': pior_nota,
                'tendenciaNotas': tendencia_notas,
                'historicoRecente': historico_recente
            }
        except Exception as e:
            print(f"Erro em get_aluno_analytics: {e}")
            return {
                'alunoId': aluno_id,
                'error': str(e)
            }
    
    def get_engagement_patterns(self, turma_id: str = None) -> Dict[str, Any]:
        """Identificar padrões de engajamento"""
        try:
            engagement = self.db.get_engagement_data(turma_id)
            
            if not engagement:
                return {
                    'message': 'Sem dados de engajamento disponíveis'
                }
            
            # Classificar alunos por nível de engajamento
            alto_engajamento = []
            medio_engajamento = []
            baixo_engajamento = []
            
            for aluno in engagement:
                questionarios = aluno.get('questionarios_respondidos', 0)
                
                if questionarios >= 5:
                    alto_engajamento.append(aluno['aluno_nome'])
                elif questionarios >= 2:
                    medio_engajamento.append(aluno['aluno_nome'])
                else:
                    baixo_engajamento.append(aluno['aluno_nome'])
            
            # Padrões temporais
            alunos_com_dados = [a for a in engagement if a.get('dias_ativo') is not None]
            if alunos_com_dados:
                media_dias_ativo = round(np.mean([a['dias_ativo'] for a in alunos_com_dados]), 2)
            else:
                media_dias_ativo = 0
            
            return {
                'totalAlunos': len(engagement),
                'altoEngajamento': {
                    'total': len(alto_engajamento),
                    'percentual': round(len(alto_engajamento) / len(engagement) * 100, 2) if engagement else 0,
                    'alunos': alto_engajamento[:10]  # Top 10
                },
                'medioEngajamento': {
                    'total': len(medio_engajamento),
                    'percentual': round(len(medio_engajamento) / len(engagement) * 100, 2) if engagement else 0
                },
                'baixoEngajamento': {
                    'total': len(baixo_engajamento),
                    'percentual': round(len(baixo_engajamento) / len(engagement) * 100, 2) if engagement else 0,
                    'alunos': baixo_engajamento[:10]  # Top 10
                },
                'mediaDiasAtivo': media_dias_ativo,
                'insights': self._generate_engagement_insights(len(alto_engajamento), len(medio_engajamento), len(baixo_engajamento))
            }
        except Exception as e:
            print(f"Erro em get_engagement_patterns: {e}")
            return {
                'error': str(e)
            }
    
    def get_response_patterns(self, questionario_id: str) -> Dict[str, Any]:
        """Identificar padrões nas respostas de um questionário"""
        try:
            query = """
                SELECT 
                    p.enunciado,
                    p.tipo,
                    COUNT(r.id) as total_respostas,
                    AVG(CASE WHEN r.valor_num IS NOT NULL THEN r.valor_num END) as media,
                    GROUP_CONCAT(r.valor_opcao) as opcoes_escolhidas
                FROM perguntas p
                LEFT JOIN respostas r ON p.id = r.pergunta_id
                WHERE p.questionario_id = %s
                GROUP BY p.id, p.enunciado, p.tipo
                ORDER BY p.ordem
            """
            
            patterns = self.db.execute_query(query, (questionario_id,))
            
            analise_perguntas = []
            for p in patterns:
                item = {
                    'enunciado': p['enunciado'],
                    'tipo': p['tipo'],
                    'totalRespostas': p['total_respostas'] or 0
                }
                
                if p['media'] is not None:
                    item['media'] = round(float(p['media']), 2)
                
                if p['opcoes_escolhidas']:
                    # Contar opções mais escolhidas
                    opcoes = p['opcoes_escolhidas'].split(',')
                    from collections import Counter
                    distribuicao = Counter(opcoes)
                    item['distribuicao'] = dict(distribuicao)
                
                analise_perguntas.append(item)
            
            return {
                'questionarioId': questionario_id,
                'totalPerguntas': len(patterns),
                'analise': analise_perguntas
            }
        except Exception as e:
            print(f"Erro em get_response_patterns: {e}")
            return {
                'questionarioId': questionario_id,
                'error': str(e)
            }
    
    def _calcular_tendencia(self, valores: List[float]) -> str:
        """Calcular tendência de uma série temporal"""
        if len(valores) < 3:
            return 'dados_insuficientes'
        
        primeira_metade = valores[:len(valores)//2]
        segunda_metade = valores[len(valores)//2:]
        
        media_primeira = np.mean(primeira_metade)
        media_segunda = np.mean(segunda_metade)
        
        diferenca = media_segunda - media_primeira
        
        if diferenca > 0.5:
            return 'crescente'
        elif diferenca < -0.5:
            return 'decrescente'
        else:
            return 'estavel'
    
    def _generate_engagement_insights(self, alto: int, medio: int, baixo: int) -> List[str]:
        """Gerar insights sobre engajamento"""
        insights = []
        total = alto + medio + baixo
        
        if total == 0:
            return ["Sem dados disponíveis para análise"]
        
        percentual_alto = alto / total * 100
        percentual_baixo = baixo / total * 100
        
        if percentual_alto > 50:
            insights.append("✅ Excelente engajamento geral da turma!")
        elif percentual_baixo > 50:
            insights.append("⚠️ Atenção: Mais de 50% dos alunos com baixo engajamento")
            insights.append("💡 Sugestão: Revisar estratégias de motivação")
        else:
            insights.append("📊 Engajamento médio equilibrado")
        
        if baixo > 0:
            insights.append(f"🎯 Foco: {baixo} alunos precisam de acompanhamento especial")
        
        return insights

