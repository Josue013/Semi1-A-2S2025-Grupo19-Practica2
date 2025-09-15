const { pool } = require('../config/database');

class User {
  // MANTENER PARA REGISTRO (verificar que username no exista)
  static async findByUsername(nombre_usuario) {
    const [users] = await pool.execute(
      'SELECT id, nombre_usuario, correo_electronico, nombre_completo, password_hash, imagen_perfil FROM usuarios WHERE nombre_usuario = ? AND activo = true',
      [nombre_usuario]
    );
    
    return users[0] || null;
  }

  // LOGIN CON EMAIL
  static async findByEmail(correo_electronico) {
    console.log('🔍 Buscando usuario por email:', correo_electronico);
    const [users] = await pool.execute(
      'SELECT id, nombre_usuario, correo_electronico, nombre_completo, password_hash, imagen_perfil FROM usuarios WHERE correo_electronico = ? AND activo = true',
      [correo_electronico]
    );
    
    console.log('📊 Resultado búsqueda:', users.length, 'usuarios encontrados');
    return users[0] || null;
  }

  static async findById(id) {
    const [users] = await pool.execute(
      'SELECT id, nombre_usuario, correo_electronico, nombre_completo, imagen_perfil FROM usuarios WHERE id = ? AND activo = true',
      [id]
    );
    
    return users[0] || null;
  }

  static async create(userData) {
    const { nombre_usuario, correo_electronico, nombre_completo, password_hash, imagen_perfil } = userData;
    
    console.log('💾 Creando usuario con datos:', {
      nombre_usuario,
      correo_electronico,
      nombre_completo,
      hasPassword: !!password_hash,
      hasImage: !!imagen_perfil
    });

    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre_usuario, correo_electronico, nombre_completo, password_hash, imagen_perfil) VALUES (?, ?, ?, ?, ?)',
      [nombre_usuario, correo_electronico, nombre_completo, password_hash, imagen_perfil || null]
    );

    console.log('✅ Usuario creado con ID:', result.insertId);
    return result.insertId;
  }

  // Método para obtener el conteo de recetas del usuario
  static async getRecipeCount(userId) {
    try {
      const [result] = await pool.execute(
        'SELECT COUNT(*) as total FROM recetas WHERE usuario_id = ? AND activa = true',
        [userId]
      );
      return result[0].total;
    } catch (error) {
      console.log('⚠️ Error obteniendo conteo de recetas:', error.message);
      return 0;
    }
  }

  // Método para obtener recetas favoritas del usuario
  static async getFavoriteCount(userId) {
    try {
      const [result] = await pool.execute(
        'SELECT COUNT(*) as total FROM recetas_favoritas WHERE usuario_id = ?',
        [userId]
      );
      return result[0].total;
    } catch (error) {
      console.log('⚠️ Error obteniendo conteo de favoritas:', error.message);
      return 0;
    }
  }
}

module.exports = User;