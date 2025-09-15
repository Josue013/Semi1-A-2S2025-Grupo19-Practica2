const { app } = require('@azure/functions');

app.http('test', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'test',
  handler: async (request, context) => {
    context.log('🧪 Test function started - UPDATED VERSION 2.0');

    try {
      // Test básico de variables de entorno
      const envStatus = {
        DB_HOST: process.env.DB_HOST ? '✅ SET' : '❌ NOT SET',
        DB_USER: process.env.DB_USER ? '✅ SET' : '❌ NOT SET',
        DB_PASSWORD: process.env.DB_PASSWORD ? '✅ SET' : '❌ NOT SET',
        DB_NAME: process.env.DB_NAME ? '✅ SET' : '❌ NOT SET',
        DB_PORT: process.env.DB_PORT ? '✅ SET' : '❌ NOT SET',
        JWT_SECRET: process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET'
      };

      // DEBUG: Mostrar valores reales (sin passwords)
      const envValues = {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD ? '***HIDDEN***' : 'NOT SET',
        DB_NAME: process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT,
        JWT_SECRET: process.env.JWT_SECRET ? '***HIDDEN***' : 'NOT SET'
      };

      context.log('🔍 Environment variables status:', envStatus);
      context.log('🔍 Environment variables values:', envValues);

      // Test de conexión a base de datos (si las variables están configuradas)
      let dbTest = { status: 'skipped', reason: 'Environment variables not configured' };

      if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
        try {
          const mysql = require('mysql2/promise');
          
          context.log('🔍 Creating database connection...');
          
          const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT) || 3306,
            connectTimeout: 10000
          });

          context.log('✅ Database connection established');

          // Usar solo consultas SQL básicas y compatibles
          context.log('🔍 Executing simple test query...');
          const testQuery = 'SELECT 1 as test_connection';
          context.log('🔍 Query to execute:', testQuery);
          const [testRows] = await connection.execute(testQuery);
          context.log('✅ Test query result:', testRows);

          //  Usar NOW() sin alias problemático
          context.log('🔍 Executing time query...');
          const timeQuery = 'SELECT NOW() as server_time';
          context.log('🔍 Time query to execute:', timeQuery);
          const [timeRows] = await connection.execute(timeQuery);
          context.log('✅ Time query result:', timeRows);

          // 🔍 DEBUG: Información del servidor MySQL
          context.log('🔍 Getting MySQL server info...');
          const versionQuery = 'SELECT VERSION() as mysql_version';
          context.log('🔍 Version query to execute:', versionQuery);
          const [versionRows] = await connection.execute(versionQuery);
          context.log('✅ MySQL version:', versionRows);

          // TEST ADICIONAL: Query de información del servidor
          context.log('🔍 Getting additional server info...');
          const serverInfoQuery = 'SHOW VARIABLES LIKE "version%"';
          context.log('🔍 Server info query to execute:', serverInfoQuery);
          const [serverInfoRows] = await connection.execute(serverInfoQuery);
          context.log('✅ Server info:', serverInfoRows);

          await connection.end();
          context.log('✅ Database connection closed');

          dbTest = {
            status: 'success',
            testResult: testRows[0],
            timeResult: timeRows[0],
            serverInfo: versionRows[0],
            additionalServerInfo: serverInfoRows,
            message: 'Database connection successful',
            queries: {
              testQuery,
              timeQuery,
              versionQuery,
              serverInfoQuery
            }
          };

          context.log('✅ Database test successful');

        } catch (dbError) {
          context.log('❌ Database test failed:');
          context.log('❌ Error message:', dbError.message);
          context.log('❌ Error code:', dbError.code);
          context.log('❌ Error errno:', dbError.errno);
          context.log('❌ Error sqlState:', dbError.sqlState);
          context.log('❌ Error sql:', dbError.sql);
          context.log('❌ Full error:', dbError);
          
          dbTest = {
            status: 'error',
            error: dbError.message,
            code: dbError.code,
            errno: dbError.errno,
            sqlState: dbError.sqlState,
            sql: dbError.sql,
            fullError: dbError.toString()
          };
        }
      }

      // Test de tablas básicas si la conexión funciona
      let tableTest = { status: 'skipped', reason: 'Database connection failed' };
      
      if (dbTest.status === 'success') {
        try {
          context.log('🔍 Starting table tests...');
          
          const mysql = require('mysql2/promise');
          
          const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT) || 3306,
            connectTimeout: 10000
          });

          // 🔍 DEBUG: Primero ver qué tablas existen
          context.log('🔍 Checking what tables exist...');
          const [tables] = await connection.execute('SHOW TABLES');
          context.log('✅ Available tables:', tables);

          // 🔍 DEBUG: Verificar que existan las tablas principales
          let tableStats = {};

          // Verificar usuarios si existe
          if (tables.some(t => Object.values(t)[0] === 'usuarios')) {
            context.log('🔍 Checking usuarios table...');
            const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM usuarios');
            context.log('✅ Usuarios count:', userCount);
            tableStats.usuarios = userCount[0].count;
          }

          // Verificar recetas si existe
          if (tables.some(t => Object.values(t)[0] === 'recetas')) {
            context.log('🔍 Checking recetas table...');
            const [recipeCount] = await connection.execute('SELECT COUNT(*) as count FROM recetas');
            context.log('✅ Recetas count:', recipeCount);
            tableStats.recetas = recipeCount[0].count;
          }

          // Verificar categorias si existe
          if (tables.some(t => Object.values(t)[0] === 'categorias')) {
            context.log('🔍 Checking categorias table...');
            const [categoryCount] = await connection.execute('SELECT COUNT(*) as count FROM categorias');
            context.log('✅ Categorias count:', categoryCount);
            tableStats.categorias = categoryCount[0].count;
          }

          // 🔍 DEBUG: Obtener algunas muestras de datos si las tablas existen
          let sampleData = {};
          
          if (tableStats.usuarios > 0) {
            context.log('🔍 Getting sample users...');
            const [sampleUsers] = await connection.execute('SELECT id, nombre_usuario, email FROM usuarios LIMIT 3');
            context.log('✅ Sample users:', sampleUsers);
            sampleData.users = sampleUsers;
          }

          if (tableStats.categorias > 0) {
            context.log('🔍 Getting sample categories...');
            const [sampleCategories] = await connection.execute('SELECT id, nombre FROM categorias LIMIT 5');
            context.log('✅ Sample categories:', sampleCategories);
            sampleData.categories = sampleCategories;
          }

          if (tableStats.recetas > 0) {
            context.log('🔍 Getting sample recipes...');
            const [sampleRecipes] = await connection.execute('SELECT id, titulo, usuario_id FROM recetas LIMIT 3');
            context.log('✅ Sample recipes:', sampleRecipes);
            sampleData.recipes = sampleRecipes;
          }
          
          await connection.end();

          tableTest = {
            status: 'success',
            availableTables: tables,
            tables: tableStats,
            sampleData: sampleData,
            message: 'All tables accessible with sample data'
          };

          context.log('✅ Table test successful');

        } catch (tableError) {
          context.log('❌ Table test failed:');
          context.log('❌ Table error message:', tableError.message);
          context.log('❌ Table error code:', tableError.code);
          context.log('❌ Table error sql:', tableError.sql);
          context.log('❌ Full table error:', tableError);
          
          tableTest = {
            status: 'error',
            error: tableError.message,
            code: tableError.code,
            sql: tableError.sql,
            fullError: tableError.toString()
          };
        }
      }

      // DEBUG: Resumen final
      context.log('🔍 Final test summary:');
      context.log('✅ Environment variables:', Object.keys(envStatus).filter(k => envStatus[k] === '✅ SET').length);
      context.log('📊 Database test status:', dbTest.status);
      context.log('📊 Table test status:', tableTest.status);

      return {
        status: 200,
        jsonBody: {
          success: true,
          message: 'Test function working perfectly! 🎉 - VERSION 2.0',
          timestamp: new Date().toISOString(),
          environment: {
            nodeVersion: process.version,
            platform: process.platform,
            functionRuntime: 'Azure Functions v4'
          },
          environmentVariables: envStatus,
          environmentValues: envValues,
          databaseTest: dbTest,
          tableTest: tableTest,
          summary: {
            envVarsConfigured: Object.keys(envStatus).filter(k => envStatus[k] === '✅ SET').length,
            dbConnectionWorking: dbTest.status === 'success',
            tablesAccessible: tableTest.status === 'success',
            readyForProduction: dbTest.status === 'success' && tableTest.status === 'success'
          },
          debugInfo: {
            codeVersion: '2.0',
            timestamp: new Date().toISOString(),
            functionsDetected: 'Updated code is running'
          }
        }
      };

    } catch (error) {
      context.log('❌ Test function error:');
      context.log('❌ Error message:', error.message);
      context.log('❌ Error stack:', error.stack);
      context.log('❌ Full error:', error);

      return {
        status: 500,
        jsonBody: {
          success: false,
          message: 'Test function failed',
          error: error.message,
          stack: error.stack,
          fullError: error.toString(),
          codeVersion: '2.0'
        }
      };
    }
  }
});