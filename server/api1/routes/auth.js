const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();

// RUTAS PÚBLICAS
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// RUTA DE PRUEBA
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API funcionando correctamente',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    },
    note: 'Sin autenticación JWT - login/register directo'
  });
});

module.exports = router;