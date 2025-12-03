"""
Serviço de Machine Learning para Predições
Modelos de classificação e regressão
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any

class MLPredictor:
    def __init__(self, db_service):
        self.db = db_service
        self.model_path = os.getenv('MODEL_PATH', './models')
        os.makedirs(self.model_path, exist_ok=True)
        
        # Modelos
        self.evasao_model = None
        self.desempenho_model = None
        self.scaler = StandardScaler()
        
        # Carregar modelos se existirem
        self.load_models()
    
    def load_models(self):
        """Carregar modelos salvos"""
        try:
            evasao_path = os.path.join(self.model_path, 'evasao_model.pkl')
            desempenho_path = os.path.join(self.model_path, 'desempenho_model.pkl')
            scaler_path = os.path.join(self.model_path, 'scaler.pkl')
            
            if os.path.exists(evasao_path):
                self.evasao_model = joblib.load(evasao_path)
            if os.path.exists(desempenho_path):
                self.desempenho_model = joblib.load(desempenho_path)
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
        except Exception as e:
            print(f"Erro ao carregar modelos: {e}")
    
    def save_models(self):
        """Salvar modelos treinados"""
        try:
            if self.evasao_model:
                joblib.dump(self.evasao_model, os.path.join(self.model_path, 'evasao_model.pkl'))
            if self.desempenho_model:
                joblib.dump(self.desempenho_model, os.path.join(self.model_path, 'desempenho_model.pkl'))
            joblib.dump(self.scaler, os.path.join(self.model_path, 'scaler.pkl'))
        except Exception as e:
            print(f"Erro ao salvar modelos: {e}")
    
    def prepare_evasao_features(self, aluno_data: Dict) -> np.array:
        """Preparar features para predição de evasão"""
        # Features:
        # 1. Dias desde última resposta
        # 2. Taxa de resposta (questionários respondidos / total disponível)
        # 3. Média de notas
        # 4. Variação de engajamento (tendência)
        # 5. Dias desde o cadastro
        
        hoje = datetime.now()
        
        # Calcular dias desde última resposta
        ultima_resposta = aluno_data.get('ultima_resposta')
        if ultima_resposta:
            if isinstance(ultima_resposta, str):
                ultima_resposta = datetime.fromisoformat(ultima_resposta.replace('Z', '+00:00'))
            dias_sem_resposta = (hoje - ultima_resposta).days
        else:
            dias_sem_resposta = 999  # Valor alto para quem nunca respondeu
        
        # Taxa de resposta
        questionarios_respondidos = aluno_data.get('questionarios_respondidos', 0)
        total_questionarios = aluno_data.get('total_questionarios_disponiveis', 1)
        taxa_resposta = questionarios_respondidos / max(total_questionarios, 1)
        
        # Média de notas
        media_notas = aluno_data.get('media_notas', 5.0) or 5.0
        
        # Dias desde cadastro
        criado_em = aluno_data.get('criado_em')
        if criado_em:
            if isinstance(criado_em, str):
                criado_em = datetime.fromisoformat(criado_em.replace('Z', '+00:00'))
            dias_cadastrado = (hoje - criado_em).days
        else:
            dias_cadastrado = 0
        
        # Tendência de engajamento (simplificado)
        dias_ativo = aluno_data.get('dias_ativo', 0) or 0
        if dias_ativo > 0:
            engajamento_por_dia = questionarios_respondidos / dias_ativo
        else:
            engajamento_por_dia = 0
        
        features = np.array([
            dias_sem_resposta,
            taxa_resposta,
            media_notas,
            dias_cadastrado,
            engajamento_por_dia
        ]).reshape(1, -1)
        
        return features
    
    def predict_evasao_turma(self, turma_id: str) -> Dict[str, Any]:
        """Predizer risco de evasão para alunos de uma turma"""
        try:
            # Se não há modelo treinado, usar heurística
            if not self.evasao_model:
                return self._heuristic_evasao_prediction(turma_id)
            
            # Obter dados dos alunos
            alunos = self.db.get_alunos_data(turma_id)
            engagement = self.db.get_engagement_data(turma_id)
            
            # Combinar dados
            engagement_dict = {e['aluno_id']: e for e in engagement}
            
            predictions = []
            for aluno in alunos:
                aluno_id = aluno['id']
                engagement_data = engagement_dict.get(aluno_id, {})
                
                # Combinar dados
                aluno_completo = {**aluno, **engagement_data}
                
                # Preparar features
                features = self.prepare_evasao_features(aluno_completo)
                features_scaled = self.scaler.transform(features)
                
                # Predição
                risco_prob = self.evasao_model.predict_proba(features_scaled)[0][1]
                
                # Classificar risco
                if risco_prob > 0.7:
                    nivel_risco = 'alto'
                elif risco_prob > 0.4:
                    nivel_risco = 'medio'
                else:
                    nivel_risco = 'baixo'
                
                predictions.append({
                    'alunoId': aluno_id,
                    'alunoNome': aluno['nome'],
                    'riscoEvasao': round(risco_prob * 100, 2),
                    'nivelRisco': nivel_risco,
                    'fatores': self._get_evasao_factors(aluno_completo)
                })
            
            # Ordenar por risco (maior primeiro)
            predictions.sort(key=lambda x: x['riscoEvasao'], reverse=True)
            
            return {
                'turmaId': turma_id,
                'totalAlunos': len(predictions),
                'alunosRiscoAlto': sum(1 for p in predictions if p['nivelRisco'] == 'alto'),
                'alunosRiscoMedio': sum(1 for p in predictions if p['nivelRisco'] == 'medio'),
                'alunosRiscoBaixo': sum(1 for p in predictions if p['nivelRisco'] == 'baixo'),
                'predictions': predictions
            }
        
        except Exception as e:
            print(f"Erro na predição de evasão: {e}")
            return self._heuristic_evasao_prediction(turma_id)
    
    def _heuristic_evasao_prediction(self, turma_id: str) -> Dict[str, Any]:
        """Predição heurística simples (quando não há modelo)"""
        engagement = self.db.get_engagement_data(turma_id)
        predictions = []
        
        for aluno in engagement:
            # Heurística simples baseada em dias sem resposta
            dias_sem_resposta = 0
            if aluno.get('ultima_resposta'):
                ultima = aluno['ultima_resposta']
                if isinstance(ultima, str):
                    ultima = datetime.fromisoformat(ultima.replace('Z', '+00:00'))
                dias_sem_resposta = (datetime.now() - ultima).days
            else:
                dias_sem_resposta = 999
            
            # Calcular risco baseado em heurística
            if dias_sem_resposta > 30:
                risco = 80
                nivel = 'alto'
            elif dias_sem_resposta > 14:
                risco = 50
                nivel = 'medio'
            else:
                risco = 20
                nivel = 'baixo'
            
            predictions.append({
                'alunoId': aluno['aluno_id'],
                'alunoNome': aluno['aluno_nome'],
                'riscoEvasao': risco,
                'nivelRisco': nivel,
                'fatores': [
                    f"{dias_sem_resposta} dias sem responder" if dias_sem_resposta < 999 else "Nunca respondeu",
                    f"{aluno.get('questionarios_respondidos', 0)} questionários respondidos"
                ]
            })
        
        predictions.sort(key=lambda x: x['riscoEvasao'], reverse=True)
        
        return {
            'turmaId': turma_id,
            'totalAlunos': len(predictions),
            'alunosRiscoAlto': sum(1 for p in predictions if p['nivelRisco'] == 'alto'),
            'alunosRiscoMedio': sum(1 for p in predictions if p['nivelRisco'] == 'medio'),
            'alunosRiscoBaixo': sum(1 for p in predictions if p['nivelRisco'] == 'baixo'),
            'predictions': predictions,
            'metodo': 'heuristica'  # Indica que está usando heurística
        }
    
    def _get_evasao_factors(self, aluno_data: Dict) -> List[str]:
        """Identificar fatores que contribuem para o risco de evasão"""
        fatores = []
        
        # Verificar dias sem resposta
        ultima_resposta = aluno_data.get('ultima_resposta')
        if ultima_resposta:
            if isinstance(ultima_resposta, str):
                ultima_resposta = datetime.fromisoformat(ultima_resposta.replace('Z', '+00:00'))
            dias_sem_resposta = (datetime.now() - ultima_resposta).days
            
            if dias_sem_resposta > 30:
                fatores.append(f"Inativo há {dias_sem_resposta} dias")
            elif dias_sem_resposta > 14:
                fatores.append(f"Baixa atividade recente ({dias_sem_resposta} dias)")
        else:
            fatores.append("Nunca respondeu questionários")
        
        # Verificar taxa de resposta
        questionarios_respondidos = aluno_data.get('questionarios_respondidos', 0)
        if questionarios_respondidos < 3:
            fatores.append("Poucos questionários respondidos")
        
        # Verificar média de notas
        media_notas = aluno_data.get('media_notas')
        if media_notas and media_notas < 5:
            fatores.append("Baixo desempenho nas avaliações")
        
        return fatores if fatores else ["Nenhum fator de risco identificado"]
    
    def predict_desempenho_aluno(self, aluno_id: str) -> Dict[str, Any]:
        """Predizer tendência de desempenho de um aluno"""
        try:
            respostas = self.db.get_respostas_aluno(aluno_id)
            
            if not respostas:
                return {
                    'alunoId': aluno_id,
                    'tendencia': 'sem_dados',
                    'message': 'Aluno ainda não possui respostas suficientes'
                }
            
            # Extrair notas ao longo do tempo
            notas_temporais = []
            for r in respostas:
                if r.get('valor_num') is not None:
                    notas_temporais.append({
                        'data': r['criado_em'],
                        'nota': r['valor_num']
                    })
            
            if len(notas_temporais) < 3:
                return {
                    'alunoId': aluno_id,
                    'tendencia': 'insuficiente',
                    'message': 'Poucas avaliações para análise de tendência'
                }
            
            # Calcular tendência
            notas = [n['nota'] for n in notas_temporais]
            media_inicial = np.mean(notas[:len(notas)//2])
            media_recente = np.mean(notas[len(notas)//2:])
            
            diferenca = media_recente - media_inicial
            
            if diferenca > 1:
                tendencia = 'melhorando'
            elif diferenca < -1:
                tendencia = 'piorando'
            else:
                tendencia = 'estavel'
            
            return {
                'alunoId': aluno_id,
                'tendencia': tendencia,
                'mediaInicial': round(media_inicial, 2),
                'mediaRecente': round(media_recente, 2),
                'diferenca': round(diferenca, 2),
                'totalAvaliacoes': len(notas),
                'recomendacoes': self._get_recomendacoes(tendencia, media_recente)
            }
        
        except Exception as e:
            print(f"Erro na predição de desempenho: {e}")
            return {
                'alunoId': aluno_id,
                'erro': str(e)
            }
    
    def _get_recomendacoes(self, tendencia: str, media: float) -> List[str]:
        """Gerar recomendações baseadas na tendência"""
        recomendacoes = []
        
        if tendencia == 'piorando':
            recomendacoes.append("Atenção necessária - desempenho em queda")
            recomendacoes.append("Considere agendar uma conversa individual")
            if media < 5:
                recomendacoes.append("Avaliar necessidade de suporte adicional")
        elif tendencia == 'melhorando':
            recomendacoes.append("Continue incentivando - tendência positiva!")
            recomendacoes.append("Reconheça o progresso do aluno")
        else:
            if media < 6:
                recomendacoes.append("Desempenho estável, mas pode melhorar")
                recomendacoes.append("Considere atividades de reforço")
            else:
                recomendacoes.append("Desempenho estável e satisfatório")
        
        return recomendacoes
    
    def train_models(self) -> Dict[str, Any]:
        """Treinar modelos com dados disponíveis"""
        try:
            # Obter dados para treinamento
            alunos = self.db.get_alunos_data()
            
            if len(alunos) < int(os.getenv('TRAIN_THRESHOLD', 30)):
                return {
                    'success': False,
                    'message': 'Dados insuficientes para treinamento',
                    'totalAlunos': len(alunos)
                }
            
            # Preparar dataset
            # (Implementação simplificada - em produção seria mais complexo)
            X = []
            y_evasao = []
            
            for aluno in alunos:
                features = self.prepare_evasao_features(aluno)
                X.append(features[0])
                
                # Label de evasão (exemplo: aluno inativo há mais de 60 dias)
                # Em produção, isso viria de dados históricos reais
                label = 1 if aluno.get('questionarios_respondidos', 0) < 2 else 0
                y_evasao.append(label)
            
            X = np.array(X)
            y_evasao = np.array(y_evasao)
            
            # Normalizar features
            X_scaled = self.scaler.fit_transform(X)
            
            # Treinar modelo de evasão
            self.evasao_model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.evasao_model.fit(X_scaled, y_evasao)
            
            # Salvar modelos
            self.save_models()
            
            return {
                'success': True,
                'message': 'Modelos treinados com sucesso',
                'totalAlunos': len(alunos),
                'accuracy': 'Em produção, calcular métricas reais'
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_models_status(self) -> Dict[str, Any]:
        """Obter status dos modelos"""
        return {
            'evasaoModel': 'treinado' if self.evasao_model else 'nao_treinado',
            'desempenhoModel': 'treinado' if self.desempenho_model else 'nao_treinado',
            'modelPath': self.model_path,
            'lastUpdate': self._get_last_update()
        }
    
    def _get_last_update(self) -> str:
        """Obter data da última atualização dos modelos"""
        try:
            model_file = os.path.join(self.model_path, 'evasao_model.pkl')
            if os.path.exists(model_file):
                mtime = os.path.getmtime(model_file)
                return datetime.fromtimestamp(mtime).isoformat()
            return 'nunca'
        except:
            return 'desconhecido'

