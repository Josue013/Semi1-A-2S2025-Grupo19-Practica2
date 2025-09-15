const { app } = require('@azure/functions');

app.http('debugCreateRecipe', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'debug/createRecipe',
  handler: async (request, context) => {
    context.log('🔍 Debug CreateRecipe function started');

    try {
      // Test de variables de entorno
      const envStatus = {
        DB_HOST: process.env.DB_HOST ? '✅ SET' : '❌ NOT SET',
        DB_USER: process.env.DB_USER ? '✅ SET' : '❌ NOT SET',
        DB_PASSWORD: process.env.DB_PASSWORD ? '✅ SET' : '❌ NOT SET',
        DB_NAME: process.env.DB_NAME ? '✅ SET' : '❌ NOT SET',
        DB_PORT: process.env.DB_PORT ? '✅ SET' : '❌ NOT SET',
        STORAGE_CONNECTION_STRING: process.env.STORAGE_CONNECTION_STRING ? '✅ SET' : '❌ NOT SET'
      };

      context.log('🔍 Environment variables:', envStatus);

      // Test de conexión a DB
      let dbTest = { status: 'failed', error: 'Not attempted' };
      try {
        const { pool } = require('../shared/database');
        await pool.execute('SELECT 1 as test');
        dbTest = { status: 'success', message: 'Database connection successful' };
        context.log('✅ Database connection test passed');
      } catch (dbError) {
        dbTest = { status: 'error', error: dbError.message };
        context.log('❌ Database connection failed:', dbError.message);
      }

      // Test de estructura de tablas
      let tableTest = { status: 'failed', error: 'Database connection failed' };
      if (dbTest.status === 'success') {
        try {
          const { pool } = require('../shared/database');
          
          // Verificar tablas necesarias
          const [tables] = await pool.execute('SHOW TABLES');
          const tableNames = tables.map(t => Object.values(t)[0]);
          
          const requiredTables = ['usuarios', 'recetas', 'categorias', 'receta_ingredientes', 'receta_instrucciones'];
          const missingTables = requiredTables.filter(table => !tableNames.includes(table));
          
          if (missingTables.length > 0) {
            tableTest = { 
              status: 'error', 
              error: `Missing tables: ${missingTables.join(', ')}`,
              availableTables: tableNames
            };
          } else {
            // Test específico para usuario
            const [users] = await pool.execute('SELECT COUNT(*) as count FROM usuarios WHERE activo = true');
            const [categories] = await pool.execute('SELECT COUNT(*) as count FROM categorias');
            
            tableTest = { 
              status: 'success', 
              message: 'All required tables exist',
              stats: {
                activeUsers: users[0].count,
                categories: categories[0].count
              }
            };
          }
          
          context.log('✅ Table structure test completed');
        } catch (tableError) {
          tableTest = { status: 'error', error: tableError.message };
          context.log('❌ Table test failed:', tableError.message);
        }
      }

      // Test de Azure Storage
      let storageTest = { status: 'failed', error: 'Not attempted' };
      if (envStatus.STORAGE_CONNECTION_STRING === '✅ SET') {
        try {
          const { BlobServiceClient } = require('@azure/storage-blob');
          const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE_CONNECTION_STRING);
          const containerClient = blobServiceClient.getContainerClient('practica2imagenes');
          
          // Test simple - verificar que el contenedor existe
          const containerExists = await containerClient.exists();
          
          storageTest = { 
            status: containerExists ? 'success' : 'error',
            message: containerExists ? 'Storage container accessible' : 'Container does not exist',
            containerName: 'practica2imagenes'
          };
          
          context.log('✅ Storage test completed');
        } catch (storageError) {
          storageTest = { status: 'error', error: storageError.message };
          context.log('❌ Storage test failed:', storageError.message);
        }
      }

      // Test de datos de muestra para createRecipe
      const sampleRequestData = {
        userId: 1, // Asumiendo que existe un usuario con ID 1
        title: 'Test Recipe',
        description: 'Test recipe description',
        category: 'Desayunos',
        prepTime: 30,
        servings: 4,
        difficulty: 'Fácil',
        ingredients: ['Test ingredient 1', 'Test ingredient 2'],
        instructions: ['Test step 1', 'Test step 2'],
        images: []
      };

      let userValidationTest = { status: 'failed', error: 'Database not available' };
      if (dbTest.status === 'success') {
        try {
          const { pool } = require('../shared/database');
          const [users] = await pool.execute('SELECT id, nombre_usuario FROM usuarios WHERE activo = true LIMIT 1');
          
          if (users.length > 0) {
            userValidationTest = {
              status: 'success',
              message: 'Sample user found',
              sampleUser: users[0],
              recommendedUserId: users[0].id
            };
            sampleRequestData.userId = users[0].id;
          } else {
            userValidationTest = {
              status: 'error',
              error: 'No active users found in database'
            };
          }
        } catch (userError) {
          userValidationTest = { status: 'error', error: userError.message };
        }
      }

      return {
        status: 200,
        jsonBody: {
          success: true,
          message: 'CreateRecipe Debug Complete',
          timestamp: new Date().toISOString(),
          tests: {
            environmentVariables: envStatus,
            databaseConnection: dbTest,
            tableStructure: tableTest,
            azureStorage: storageTest,
            userValidation: userValidationTest
          },
          sampleRequestData: sampleRequestData,
          readyForCreateRecipe: (
            dbTest.status === 'success' && 
            tableTest.status === 'success' && 
            storageTest.status === 'success' &&
            userValidationTest.status === 'success'
          ),
          nextSteps: [
            'If all tests pass, try creating a recipe with the sample data',
            'Check Azure Function logs for detailed error messages',
            'Verify that your frontend is sending the correct userId'
          ]
        }
      };

    } catch (error) {
      context.log('❌ Debug function error:', error);
      
      return {
        status: 500,
        jsonBody: {
          success: false,
          message: 'Debug function failed',
          error: error.message,
          stack: error.stack
        }
      };
    }
  }
});