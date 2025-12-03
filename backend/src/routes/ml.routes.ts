/**
 * Rotas de Machine Learning e Analytics
 * Proxy para o serviço Python de ML
 */
import { Router } from 'express';
import axios from 'axios';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// URL do serviço ML (pode ser configurada via env)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Aplicar autenticação
router.use(authenticate);

// ========== ANALYTICS ==========

// GET /ml/analytics/overview
router.get('/analytics/overview', authorize(Role.ADMIN, Role.PROF), async (req: AuthRequest, res, next) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/analytics/overview`);
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

// GET /ml/analytics/turma/:id
router.get('/analytics/turma/:id', authorize(Role.ADMIN, Role.PROF), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar permissão (professor só pode ver suas turmas)
    if (req.user!.role === Role.PROF) {
      // TODO: Verificar se o professor é dono da turma
      // Por enquanto, permitimos
    }
    
    const response = await axios.get(`${ML_SERVICE_URL}/analytics/turma/${id}`);
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

// GET /ml/analytics/aluno/:id
router.get('/analytics/aluno/:id', authorize(Role.ADMIN, Role.PROF), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    const response = await axios.get(`${ML_SERVICE_URL}/analytics/aluno/${id}`);
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

// ========== PREDIÇÕES ==========

// POST /ml/predict/evasao
router.post('/predict/evasao', authorize(Role.ADMIN, Role.PROF), async (req: AuthRequest, res, next) => {
  try {
    const { turmaId } = req.body;
    
    if (!turmaId) {
      return res.status(400).json({ error: 'turmaId é obrigatório' });
    }
    
    const response = await axios.post(`${ML_SERVICE_URL}/predict/evasao`, {
      turmaId
    });
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

// POST /ml/predict/desempenho
router.post('/predict/desempenho', authorize(Role.ADMIN, Role.PROF), async (req: AuthRequest, res, next) => {
  try {
    const { alunoId } = req.body;
    
    if (!alunoId) {
      return res.status(400).json({ error: 'alunoId é obrigatório' });
    }
    
    const response = await axios.post(`${ML_SERVICE_URL}/predict/desempenho`, {
      alunoId
    });
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

// ========== PADRÕES ==========

// GET /ml/patterns/engagement
router.get('/patterns/engagement', authorize(Role.ADMIN, Role.PROF), async (req: AuthRequest, res, next) => {
  try {
    const { turmaId } = req.query;
    
    const url = turmaId 
      ? `${ML_SERVICE_URL}/patterns/engagement?turmaId=${turmaId}`
      : `${ML_SERVICE_URL}/patterns/engagement`;
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

// GET /ml/patterns/responses
router.get('/patterns/responses', authorize(Role.ADMIN, Role.PROF), async (req: AuthRequest, res, next) => {
  try {
    const { questionarioId } = req.query;
    
    if (!questionarioId) {
      return res.status(400).json({ error: 'questionarioId é obrigatório' });
    }
    
    const response = await axios.get(`${ML_SERVICE_URL}/patterns/responses?questionarioId=${questionarioId}`);
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

// ========== MODELOS ==========

// POST /ml/train - Treinar modelos (apenas admin)
router.post('/train', authorize(Role.ADMIN), async (req: AuthRequest, res, next) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/train/models`);
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

// GET /ml/models/status
router.get('/models/status', authorize(Role.ADMIN), async (req: AuthRequest, res, next) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/models/status`);
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

// GET /ml/health - Health check do serviço ML
router.get('/health', async (req, res, next) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5000
    });
    res.json({
      status: 'connected',
      mlService: response.data
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'disconnected',
      error: 'Serviço ML não disponível'
    });
  }
});

export { router as mlRouter };

