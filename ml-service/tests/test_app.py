"""
Testes dos endpoints Flask do ML Service
"""
import pytest
from unittest.mock import MagicMock, patch


# ── Fixture: app Flask com dependências mockadas ───────────────────────────────
@pytest.fixture
def mock_db():
    """Mock do DatabaseService"""
    db = MagicMock()
    db.get_alunos_data.return_value = [
        {'id': 'aluno-1', 'nome': 'Maria', 'questionarios_respondidos': 5, 'media_notas': 8.0},
        {'id': 'aluno-2', 'nome': 'João', 'questionarios_respondidos': 2, 'media_notas': 6.5},
    ]
    db.get_questionarios_stats.return_value = [
        {'id': 'q-1', 'titulo': 'Satisfação', 'total_respostas': 30},
    ]
    db.get_engagement_data.return_value = [
        {'alunoId': 'aluno-1', 'engajamento': 0.9},
    ]
    db.get_aluno_data.return_value = {
        'id': 'aluno-1',
        'nome': 'Maria',
        'questionarios_respondidos': 5,
        'media_notas': 8.0,
        'dias_desde_ultima_resposta': 3,
        'taxa_conclusao': 0.95,
    }
    db.get_turma_alunos.return_value = [
        {'id': 'aluno-1', 'questionarios_respondidos': 5, 'media_notas': 8.0, 'dias_desde_ultima_resposta': 3, 'taxa_conclusao': 0.95},
    ]
    db.get_response_data.return_value = []
    return db


@pytest.fixture
def app_client(mock_db):
    """Cliente de teste Flask com serviços mockados"""
    with patch('services.database.DatabaseService', return_value=mock_db):
        with patch('services.ml_predictor.MLPredictor') as MockPredictor:
            with patch('services.analytics.AnalyticsService') as MockAnalytics:
                # Configurar mocks
                mock_predictor = MagicMock()
                mock_predictor.get_models_status.return_value = {
                    'evasao_model': 'não treinado',
                    'desempenho_model': 'não treinado',
                }
                mock_predictor.predict_evasao_turma.return_value = {
                    'turmaId': 'turma-1',
                    'predictions': [{'alunoId': 'aluno-1', 'risco': 0.2}]
                }
                mock_predictor.predict_desempenho_aluno.return_value = {
                    'alunoId': 'aluno-1',
                    'tendencia': 'CRESCENTE',
                    'confianca': 0.85
                }
                mock_predictor.train_models.return_value = {
                    'status': 'treinamento concluído',
                    'accuracy': 0.87
                }

                mock_analytics = MagicMock()
                mock_analytics.get_overview.return_value = {
                    'totalAlunos': 2,
                    'alunosAtivos': 2,
                    'totalQuestionarios': 1,
                    'mediaRespostasPorAluno': 3.5,
                    'mediaNotasGeral': 7.25,
                    'taxaEngajamento': 100.0,
                }
                mock_analytics.get_turma_analytics.return_value = {
                    'turmaId': 'turma-1',
                    'totalAlunos': 2,
                    'mediaEngajamento': 0.9,
                }
                mock_analytics.get_aluno_analytics.return_value = {
                    'alunoId': 'aluno-1',
                    'mediaNotas': 8.0,
                    'questionariosRespondidos': 5,
                }
                mock_analytics.get_engagement_patterns.return_value = {
                    'patterns': [],
                    'summary': 'nenhum padrão'
                }
                mock_analytics.get_response_patterns.return_value = {
                    'questionarioId': 'q-1',
                    'patterns': []
                }

                MockPredictor.return_value = mock_predictor
                MockAnalytics.return_value = mock_analytics

                import importlib
                import sys
                # Remover módulos cacheados para forçar reimportação
                for mod in ['app', 'services.database', 'services.ml_predictor', 'services.analytics']:
                    sys.modules.pop(mod, None)

                from app import app
                app.config['TESTING'] = True
                with app.test_client() as client:
                    yield client, mock_predictor, mock_analytics


# ══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════════════════════════════════
class TestHealthCheck:
    def test_health_retorna_200(self, app_client):
        client, _, _ = app_client
        response = client.get('/health')
        assert response.status_code == 200

    def test_health_retorna_status_healthy(self, app_client):
        client, _, _ = app_client
        data = response = client.get('/health').get_json()
        assert data['status'] == 'healthy'
        assert data['service'] == 'ML Analytics Service'

    def test_health_retorna_versao(self, app_client):
        client, _, _ = app_client
        data = client.get('/health').get_json()
        assert 'version' in data


# ══════════════════════════════════════════════════════════════════════════════
# ANALYTICS
# ══════════════════════════════════════════════════════════════════════════════
class TestAnalyticsOverview:
    def test_overview_retorna_200(self, app_client):
        client, _, mock_analytics = app_client
        response = client.get('/analytics/overview')
        assert response.status_code == 200

    def test_overview_retorna_campos_esperados(self, app_client):
        client, _, mock_analytics = app_client
        data = client.get('/analytics/overview').get_json()
        assert 'totalAlunos' in data
        assert 'taxaEngajamento' in data

    def test_overview_chama_service(self, app_client):
        client, _, mock_analytics = app_client
        client.get('/analytics/overview')
        mock_analytics.get_overview.assert_called_once()


class TestAnalyticsTurma:
    def test_turma_analytics_retorna_200(self, app_client):
        client, _, _ = app_client
        response = client.get('/analytics/turma/turma-1')
        assert response.status_code == 200

    def test_turma_analytics_contem_turmaId(self, app_client):
        client, _, _ = app_client
        data = client.get('/analytics/turma/turma-1').get_json()
        assert 'turmaId' in data


class TestAnalyticsAluno:
    def test_aluno_analytics_retorna_200(self, app_client):
        client, _, _ = app_client
        response = client.get('/analytics/aluno/aluno-1')
        assert response.status_code == 200

    def test_aluno_analytics_contem_alunoId(self, app_client):
        client, _, _ = app_client
        data = client.get('/analytics/aluno/aluno-1').get_json()
        assert 'alunoId' in data


# ══════════════════════════════════════════════════════════════════════════════
# PREDIÇÕES
# ══════════════════════════════════════════════════════════════════════════════
class TestPredictEvasao:
    def test_predict_evasao_com_turmaId_valido(self, app_client):
        client, mock_predictor, _ = app_client
        response = client.post('/predict/evasao', json={'turmaId': 'turma-1'})
        assert response.status_code == 200
        mock_predictor.predict_evasao_turma.assert_called_once_with('turma-1')

    def test_predict_evasao_sem_turmaId_retorna_400(self, app_client):
        client, _, _ = app_client
        response = client.post('/predict/evasao', json={})
        assert response.status_code == 400
        data = response.get_json()
        assert 'turmaId' in data['error']

    def test_predict_evasao_retorna_predictions(self, app_client):
        client, _, _ = app_client
        data = client.post('/predict/evasao', json={'turmaId': 'turma-1'}).get_json()
        assert 'predictions' in data


class TestPredictDesempenho:
    def test_predict_desempenho_com_alunoId_valido(self, app_client):
        client, mock_predictor, _ = app_client
        response = client.post('/predict/desempenho', json={'alunoId': 'aluno-1'})
        assert response.status_code == 200
        mock_predictor.predict_desempenho_aluno.assert_called_once_with('aluno-1')

    def test_predict_desempenho_sem_alunoId_retorna_400(self, app_client):
        client, _, _ = app_client
        response = client.post('/predict/desempenho', json={})
        assert response.status_code == 400
        data = response.get_json()
        assert 'alunoId' in data['error']

    def test_predict_desempenho_retorna_tendencia(self, app_client):
        client, _, _ = app_client
        data = client.post('/predict/desempenho', json={'alunoId': 'aluno-1'}).get_json()
        assert 'tendencia' in data


# ══════════════════════════════════════════════════════════════════════════════
# PADRÕES
# ══════════════════════════════════════════════════════════════════════════════
class TestPatterns:
    def test_engagement_patterns_retorna_200(self, app_client):
        client, _, _ = app_client
        response = client.get('/patterns/engagement')
        assert response.status_code == 200

    def test_engagement_patterns_com_turmaId(self, app_client):
        client, _, mock_analytics = app_client
        client.get('/patterns/engagement?turmaId=turma-1')
        mock_analytics.get_engagement_patterns.assert_called_once_with('turma-1')

    def test_response_patterns_com_questionarioId(self, app_client):
        client, _, mock_analytics = app_client
        response = client.get('/patterns/responses?questionarioId=q-1')
        assert response.status_code == 200
        mock_analytics.get_response_patterns.assert_called_once_with('q-1')


# ══════════════════════════════════════════════════════════════════════════════
# MODELOS
# ══════════════════════════════════════════════════════════════════════════════
class TestModels:
    def test_models_status_retorna_200(self, app_client):
        client, mock_predictor, _ = app_client
        response = client.get('/models/status')
        assert response.status_code == 200
        mock_predictor.get_models_status.assert_called_once()

    def test_train_models_retorna_200(self, app_client):
        client, mock_predictor, _ = app_client
        response = client.post('/train/models')
        assert response.status_code == 200
        mock_predictor.train_models.assert_called_once()

    def test_train_models_retorna_status(self, app_client):
        client, _, _ = app_client
        data = client.post('/train/models').get_json()
        assert 'status' in data
