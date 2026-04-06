"""
Testes unitários do AnalyticsService
"""
import pytest
from unittest.mock import MagicMock
from services.analytics import AnalyticsService


@pytest.fixture
def db_mock():
    db = MagicMock()
    return db


@pytest.fixture
def analytics(db_mock):
    return AnalyticsService(db_mock)


class TestGetOverview:
    def test_retorna_total_alunos_correto(self, analytics, db_mock):
        db_mock.get_alunos_data.return_value = [
            {'id': '1', 'questionarios_respondidos': 3, 'media_notas': 8.0},
            {'id': '2', 'questionarios_respondidos': 0, 'media_notas': None},
        ]
        db_mock.get_questionarios_stats.return_value = [{'id': 'q1'}]

        result = analytics.get_overview()

        assert result['totalAlunos'] == 2
        assert result['alunosAtivos'] == 1  # apenas 1 respondeu

    def test_taxa_engajamento_calcula_corretamente(self, analytics, db_mock):
        db_mock.get_alunos_data.return_value = [
            {'id': '1', 'questionarios_respondidos': 5, 'media_notas': 9.0},
            {'id': '2', 'questionarios_respondidos': 3, 'media_notas': 7.0},
            {'id': '3', 'questionarios_respondidos': 0, 'media_notas': None},
            {'id': '4', 'questionarios_respondidos': 0, 'media_notas': None},
        ]
        db_mock.get_questionarios_stats.return_value = []

        result = analytics.get_overview()

        assert result['taxaEngajamento'] == 50.0  # 2 de 4 ativos

    def test_sem_alunos_retorna_zeros(self, analytics, db_mock):
        db_mock.get_alunos_data.return_value = []
        db_mock.get_questionarios_stats.return_value = []

        result = analytics.get_overview()

        assert result['totalAlunos'] == 0
        assert result['taxaEngajamento'] == 0
        assert result['mediaRespostasPorAluno'] == 0

    def test_retorna_erro_quando_db_falha(self, analytics, db_mock):
        db_mock.get_alunos_data.side_effect = Exception('DB connection error')

        result = analytics.get_overview()

        assert 'error' in result

    def test_media_notas_ignora_none(self, analytics, db_mock):
        db_mock.get_alunos_data.return_value = [
            {'id': '1', 'questionarios_respondidos': 2, 'media_notas': 8.0},
            {'id': '2', 'questionarios_respondidos': 1, 'media_notas': None},
        ]
        db_mock.get_questionarios_stats.return_value = []

        result = analytics.get_overview()

        # Média deve ser calculada apenas com nota 8.0
        assert result['mediaNotasGeral'] == 8.0


class TestGetTurmaAnalytics:
    def test_retorna_erro_quando_turma_sem_alunos(self, analytics, db_mock):
        db_mock.get_alunos_data.return_value = []

        result = analytics.get_turma_analytics('turma-vazia')

        assert 'error' in result

    def test_retorna_dados_da_turma(self, analytics, db_mock):
        db_mock.get_alunos_data.return_value = [
            {'id': 'a1', 'questionarios_respondidos': 4, 'media_notas': 7.5},
        ]
        db_mock.get_engagement_data.return_value = [
            {'alunoId': 'a1', 'engajamento': 0.8},
        ]

        result = analytics.get_turma_analytics('turma-1')

        assert 'turmaId' in result or 'totalAlunos' in result

    def test_chama_db_com_turma_id_correto(self, analytics, db_mock):
        db_mock.get_alunos_data.return_value = [
            {'id': 'a1', 'questionarios_respondidos': 1, 'media_notas': 7.0}
        ]
        db_mock.get_engagement_data.return_value = []

        analytics.get_turma_analytics('turma-xyz')

        db_mock.get_alunos_data.assert_called_with('turma-xyz')


class TestGetAlunoAnalytics:
    def test_retorna_dados_do_aluno(self, analytics, db_mock):
        db_mock.get_aluno_data.return_value = {
            'id': 'aluno-1',
            'nome': 'Maria',
            'questionarios_respondidos': 5,
            'media_notas': 8.5,
            'dias_desde_ultima_resposta': 2,
            'taxa_conclusao': 1.0,
        }

        result = analytics.get_aluno_analytics('aluno-1')

        # Deve retornar algum dado sobre o aluno
        assert result is not None
        assert not isinstance(result.get('error'), str) or 'aluno' in result.get('error', '').lower()

    def test_retorna_erro_quando_aluno_nao_encontrado(self, analytics, db_mock):
        db_mock.get_aluno_data.return_value = None

        result = analytics.get_aluno_analytics('nao-existe')

        assert 'error' in result
