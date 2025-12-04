"""
Serviço de conexão com o banco de dados
"""
import pymysql
import os
from typing import List, Dict, Any

class DatabaseService:
    def __init__(self):
        self.config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'vida_mais'),
            'charset': 'utf8mb4',
            'cursorclass': pymysql.cursors.DictCursor
        }
    
    def get_connection(self):
        """Criar conexão com o banco"""
        return pymysql.connect(**self.config)
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Executar query e retornar resultados"""
        connection = self.get_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params or ())
                result = cursor.fetchall()
            return result
        finally:
            connection.close()
    
    def get_alunos_data(self, turma_id: str = None) -> List[Dict]:
        """Obter dados dos alunos (users com role ALUNO)"""
        query = """
            SELECT 
                u.id, u.nome, u.email, u.criado_em,
                COUNT(DISTINCT at.turma_id) as total_turmas,
                COUNT(DISTINCT r.questionario_id) as questionarios_respondidos,
                AVG(CASE WHEN r.valor_num IS NOT NULL THEN r.valor_num END) as media_notas
            FROM users u
            LEFT JOIN alunos_turmas at ON u.id = at.aluno_id
            LEFT JOIN respostas r ON u.id = r.aluno_id
            WHERE u.role = 'ALUNO' AND u.ativo = 1
        """
        
        if turma_id:
            query += " AND at.turma_id = %s"
            params = (turma_id,)
        else:
            params = None
        
        query += """
            GROUP BY u.id, u.nome, u.email, u.criado_em
            ORDER BY u.criado_em DESC
        """
        
        return self.execute_query(query, params)
    
    def get_respostas_aluno(self, aluno_id: str) -> List[Dict]:
        """Obter todas as respostas de um aluno"""
        query = """
            SELECT 
                r.*,
                p.tipo as pergunta_tipo,
                p.enunciado,
                q.titulo as questionario_titulo,
                q.criado_em as questionario_data
            FROM respostas r
            JOIN perguntas p ON r.pergunta_id = p.id
            JOIN questionarios q ON r.questionario_id = q.id
            WHERE r.aluno_id = %s
            ORDER BY r.criado_em ASC
        """
        return self.execute_query(query, (aluno_id,))
    
    def get_questionarios_stats(self) -> List[Dict]:
        """Obter estatísticas dos questionários"""
        query = """
            SELECT 
                q.id,
                q.titulo,
                q.ativo,
                q.criado_em,
                COUNT(DISTINCT r.aluno_id) as total_respondentes,
                COUNT(DISTINCT p.id) as total_perguntas,
                AVG(CASE WHEN r.valor_num IS NOT NULL THEN r.valor_num END) as media_geral
            FROM questionarios q
            LEFT JOIN perguntas p ON q.id = p.questionario_id
            LEFT JOIN respostas r ON q.id = r.questionario_id
            GROUP BY q.id, q.titulo, q.ativo, q.criado_em
            ORDER BY q.criado_em DESC
        """
        return self.execute_query(query)
    
    def get_engagement_data(self, turma_id: str = None) -> List[Dict]:
        """Obter dados de engajamento (users com role ALUNO)"""
        query = """
            SELECT 
                u.id as aluno_id,
                u.nome as aluno_nome,
                COUNT(DISTINCT r.questionario_id) as questionarios_respondidos,
                COUNT(r.id) as total_respostas,
                MIN(r.criado_em) as primeira_resposta,
                MAX(r.criado_em) as ultima_resposta,
                DATEDIFF(MAX(r.criado_em), MIN(r.criado_em)) as dias_ativo
            FROM users u
            LEFT JOIN respostas r ON u.id = r.aluno_id
            WHERE u.role = 'ALUNO' AND u.ativo = 1
        """
        
        if turma_id:
            query += " AND EXISTS (SELECT 1 FROM alunos_turmas at WHERE at.aluno_id = u.id AND at.turma_id = %s)"
            params = (turma_id,)
        else:
            params = None
        
        query += " GROUP BY u.id, u.nome"
        
        return self.execute_query(query, params)

