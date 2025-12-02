#!/bin/bash

echo "🔍 Verificando perguntas de múltipla escolha no banco de dados..."
echo ""

# Conectar ao MySQL e verificar
mysql -u vidamais -pvidamais2025 vida_mais << 'EOF'

SELECT 
  p.id AS 'ID Pergunta',
  p.ordem AS 'Ordem',
  LEFT(p.enunciado, 50) AS 'Enunciado (50 chars)',
  p.tipo AS 'Tipo',
  p.opcoesJson AS 'Opções JSON',
  LENGTH(p.opcoesJson) AS 'Tamanho',
  q.titulo AS 'Questionário'
FROM Pergunta p
INNER JOIN Questionario q ON p.questionarioId = q.id
WHERE p.tipo IN ('UNICA', 'MULTIPLA')
  AND q.ano = 2025
ORDER BY p.ordem
LIMIT 10;

EOF

echo ""
echo "✅ Verificação concluída!"

