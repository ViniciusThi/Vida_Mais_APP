"""
Serviço de Machine Learning para Análise Preditiva
Sistema de análise de desempenho e predição de risco de evasão
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Importar serviços
from services.database import DatabaseService
from services.ml_predictor import MLPredictor
from services.analytics import AnalyticsService

load_dotenv()

app = Flask(__name__)
CORS(app)

# Inicializar serviços
db_service = DatabaseService()
ml_predictor = MLPredictor(db_service)
analytics_service = AnalyticsService(db_service)

# ========== HEALTH CHECK ==========
@app.route('/health', methods=['GET'])
def health_check():
    """Verificar saúde do serviço"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Analytics Service',
        'version': '1.0.0'
    })

# ========== ANALYTICS ==========
@app.route('/analytics/overview', methods=['GET'])
def get_overview():
    """Obter visão geral das métricas"""
    try:
        overview = analytics_service.get_overview()
        return jsonify(overview)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analytics/turma/<turma_id>', methods=['GET'])
def get_turma_analytics(turma_id):
    """Obter análise de uma turma específica"""
    try:
        analytics = analytics_service.get_turma_analytics(turma_id)
        return jsonify(analytics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analytics/aluno/<aluno_id>', methods=['GET'])
def get_aluno_analytics(aluno_id):
    """Obter análise de um aluno específico"""
    try:
        analytics = analytics_service.get_aluno_analytics(aluno_id)
        return jsonify(analytics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== PREDIÇÕES ==========
@app.route('/predict/evasao', methods=['POST'])
def predict_evasao():
    """Predizer risco de evasão"""
    try:
        data = request.get_json()
        turma_id = data.get('turmaId')
        
        if not turma_id:
            return jsonify({'error': 'turmaId é obrigatório'}), 400
        
        predictions = ml_predictor.predict_evasao_turma(turma_id)
        return jsonify(predictions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/desempenho', methods=['POST'])
def predict_desempenho():
    """Predizer tendência de desempenho"""
    try:
        data = request.get_json()
        aluno_id = data.get('alunoId')
        
        if not aluno_id:
            return jsonify({'error': 'alunoId é obrigatório'}), 400
        
        prediction = ml_predictor.predict_desempenho_aluno(aluno_id)
        return jsonify(prediction)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== PADRÕES ==========
@app.route('/patterns/engagement', methods=['GET'])
def get_engagement_patterns():
    """Identificar padrões de engajamento"""
    try:
        turma_id = request.args.get('turmaId')
        patterns = analytics_service.get_engagement_patterns(turma_id)
        return jsonify(patterns)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/patterns/responses', methods=['GET'])
def get_response_patterns():
    """Identificar padrões de resposta"""
    try:
        questionario_id = request.args.get('questionarioId')
        patterns = analytics_service.get_response_patterns(questionario_id)
        return jsonify(patterns)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== TREINAMENTO ==========
@app.route('/train/models', methods=['POST'])
def train_models():
    """Treinar/retreinar modelos de ML"""
    try:
        result = ml_predictor.train_models()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/models/status', methods=['GET'])
def get_models_status():
    """Obter status dos modelos"""
    try:
        status = ml_predictor.get_models_status()
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

