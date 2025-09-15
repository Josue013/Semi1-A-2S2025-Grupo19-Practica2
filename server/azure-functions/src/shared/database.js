const mysql = require('mysql2');

// Validar variables de entorno requeridas
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is required`);
  }
}

// CONFIGURACIÓN OPTIMIZADA PARA AZURE FUNCTIONS
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  
  // CONFIGURACIONES ESPECÍFICAS PARA AZURE + AWS RDS
  connectTimeout: 60000,        // 60 segundos
  acquireTimeout: 60000,        // 60 segundos  
  timeout: 60000,               // 60 segundos
  
  // CONFIGURACIONES DE POOL OPTIMIZADAS
  connectionLimit: 5,           // Reducir para Azure Functions
  queueLimit: 0,
  waitForConnections: true,
  
  // CONFIGURACIONES DE RECONEXIÓN
  reconnect: true,
  idleTimeout: 30000,
  
  // SSL para conexiones externas (AWS RDS)
  ssl: {
    rejectUnauthorized: false
  }
});

const promisePool = pool.promise();

// TEST DE CONEXIÓN MEJORADO CON TIMEOUT
const testConnection = async () => {
  try {
    console.log('🔍 Testing database connection with extended timeout...');
    
    // Crear una promesa con timeout manual
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000);
    });
    
    const connectionPromise = promisePool.execute('SELECT 1 as test_connection, NOW() as server_time');
    
    const [result] = await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log('✅ Database connection test successful:', result[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    throw error;
  }
};

module.exports = { 
  pool: promisePool,
  testConnection
};