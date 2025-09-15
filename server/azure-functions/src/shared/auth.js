const jwt = require('jsonwebtoken');
const { pool } = require('./database');

const verifyToken = async (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    // TOKEN HARDCODEADO PARA DESARROLLO
    if (token === 'dev-token-2025' || process.env.NODE_ENV === 'development') {
      console.log('🔧 USING HARDCODED DEV TOKEN');
      
      // Retornar usuario mock para desarrollo
      return {
        id: 'mock-user-id',
        nombre_usuario: 'Usuario Demo',
        correo_electronico: 'demo@saborconecta.com',
        nombre_completo: 'Usuario Demo'
      };
    }

    // VALIDACIÓN REAL SOLO EN PRODUCCIÓN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario existe
    const [users] = await pool.execute(
      'SELECT id, nombre_usuario, correo_electronico, nombre_completo FROM usuarios WHERE id = ? AND activo = true',
      [decoded.userId]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    return users[0];
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    throw new Error('Invalid token');
  }
};

const extractToken = (request) => {
  const authHeader = request.headers.authorization || request.headers.Authorization;
  
  if (!authHeader) {
    return null;
  }

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
};

module.exports = {
  verifyToken,
  extractToken
};