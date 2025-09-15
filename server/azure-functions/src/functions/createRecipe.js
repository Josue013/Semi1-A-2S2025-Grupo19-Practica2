const { app } = require('@azure/functions');
const { uploadToBlob } = require('../shared/storage');
const { pool } = require('../shared/database');

app.http('createRecipe', {
  methods: ['POST', 'PUT'],
  route: 'recipes',
  handler: async (request, context) => {
    context.log('🍽️ Create Recipe function triggered - MYSQL TRANSACTION FIXED');

    try {
      // VALIDAR VARIABLES DE ENTORNO CRÍTICAS
      const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT', 'STORAGE_CONNECTION_STRING'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        context.log('❌ Missing environment variables:', missingVars);
        return {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          jsonBody: {
            success: false,
            message: 'Server configuration error',
            details: `Missing: ${missingVars.join(', ')}`
          }
        };
      }

      context.log('✅ Environment variables validated');

      // TEST DE CONEXIÓN A BASE DE DATOS
      try {
        await pool.execute('SELECT 1 as test');
        context.log('✅ Database connection successful');
      } catch (dbError) {
        context.log('❌ Database connection failed:', dbError.message);
        return {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          jsonBody: {
            success: false,
            message: 'Database connection failed',
            details: dbError.message
          }
        };
      }

      // OBTENER Y VALIDAR DATOS DEL BODY
      let body;
      try {
        const requestText = await request.text();
        context.log('📥 Raw request body length:', requestText.length);
        body = JSON.parse(requestText);
        context.log('📥 Parsed body keys:', Object.keys(body));
      } catch (parseError) {
        context.log('❌ JSON parsing failed:', parseError.message);
        return {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          jsonBody: {
            success: false,
            message: 'Invalid JSON format',
            details: parseError.message
          }
        };
      }

      const {
        userId,
        title,
        description,
        category,
        prepTime,
        servings,
        difficulty,
        ingredients,
        instructions,
        images,
        recipeId
      } = body;

      context.log('📋 Request data:', {
        userId,
        title: title ? title.substring(0, 50) + '...' : 'undefined',
        category,
        prepTime,
        difficulty,
        ingredientsCount: ingredients ? ingredients.length : 0,
        instructionsCount: instructions ? instructions.length : 0,
        imagesCount: images ? images.length : 0
      });

      // VALIDAR QUE SE PROPORCIONE USERID
      if (!userId) {
        context.log('❌ No userId provided');
        return {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          jsonBody: {
            success: false,
            message: 'Se requiere userId para identificar el usuario'
          }
        };
      }

      // VERIFICAR QUE EL USUARIO EXISTE EN LA BASE DE DATOS
      let user;
      try {
        const [users] = await pool.execute(
          'SELECT id, nombre_usuario, correo_electronico, nombre_completo FROM usuarios WHERE id = ? AND activo = true',
          [userId]
        );

        if (users.length === 0) {
          context.log(`❌ User not found: ${userId}`);
          return {
            status: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            jsonBody: {
              success: false,
              message: 'Usuario no encontrado'
            }
          };
        }

        user = users[0];
        context.log(`✅ User identified: ${user.nombre_usuario} (ID: ${user.id})`);
      } catch (userError) {
        context.log('❌ User validation failed:', userError.message);
        return {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          jsonBody: {
            success: false,
            message: 'Error validating user',
            details: userError.message
          }
        };
      }

      // VALIDACIONES BÁSICAS
      const validationErrors = [];
      
      if (!title || title.trim().length === 0) validationErrors.push('title is required');
      if (!description || description.trim().length === 0) validationErrors.push('description is required');
      if (!category) validationErrors.push('category is required');
      if (!prepTime || prepTime <= 0) validationErrors.push('prepTime must be greater than 0');
      if (!difficulty) validationErrors.push('difficulty is required');
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        validationErrors.push('at least one ingredient is required');
      }
      if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
        validationErrors.push('at least one instruction is required');
      }

      if (validationErrors.length > 0) {
        context.log('❌ Validation errors:', validationErrors);
        return {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          jsonBody: {
            success: false,
            message: 'Validation errors',
            details: validationErrors
          }
        };
      }

      context.log('✅ Basic validation passed');

      // PROCESAR IMAGEN
      let imageUrl = 'https://practica2imagenes.blob.core.windows.net/practica2imagenes/default-recipe.jpg';
      let imageProcessed = false;
      
      if (images && Array.isArray(images) && images.length > 0) {
        const firstImage = images[0];
        
        if (firstImage && firstImage.startsWith('data:image/')) {
          try {
            context.log('📸 Processing image upload...');
            const [header, base64Data] = firstImage.split(',');
            
            if (header && base64Data) {
              const imageBuffer = Buffer.from(base64Data, 'base64');
              context.log(`📸 Image buffer size: ${imageBuffer.length} bytes`);
              
              // Validar tamaño (10MB máximo)
              const maxSize = 10 * 1024 * 1024;
              if (imageBuffer.length <= maxSize) {
                const timestamp = Date.now();
                const filename = `recipe-${user.id}-${timestamp}.jpg`;
                
                imageUrl = await uploadToBlob('recipes', imageBuffer, filename);
                imageProcessed = true;
                context.log(`✅ Image uploaded successfully: ${imageUrl}`);
              } else {
                context.log(`❌ Image too large: ${imageBuffer.length} bytes (max: ${maxSize})`);
              }
            }
          } catch (imageError) {
            context.log('❌ Image upload failed:', imageError.message);
            // Continuar con imagen por defecto
          }
        }
      }

      const now = new Date();

      // CREAR NUEVA RECETA
      if (request.method === 'POST') {
        const categoryPrefix = getCategoryPrefix(category);
        const timestamp = Date.now().toString().slice(-4);
        const newRecipeId = `rec-${categoryPrefix}-${timestamp}`;

        context.log(`🔄 Creating recipe with ID: ${newRecipeId}`);

        // SOLUCIÓN AL ERROR: USAR CONEXIÓN MANUAL PARA TRANSACCIONES
        const mysql = require('mysql2');
        const connection = mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: parseInt(process.env.DB_PORT, 10),
          ssl: {
            rejectUnauthorized: false
          }
        });

        const promiseConnection = connection.promise();

        try {
          // INICIAR TRANSACCIÓN CON CONEXIÓN MANUAL
          await promiseConnection.query('START TRANSACTION');
          context.log('✅ Transaction started');
          
          try {
            // Insertar receta principal
            context.log('📝 Inserting main recipe...');
            await promiseConnection.query(`
              INSERT INTO recetas (
                id, usuario_id, titulo, descripcion, categoria_id,
                tiempo_preparacion, porciones, nivel_dificultad,
                imagen_url, fecha_creacion, fecha_actualizacion
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              newRecipeId, user.id, title, description, getCategoryId(category),
              prepTime, servings || 4, difficulty,
              imageUrl, now, now
            ]);
            context.log('✅ Main recipe inserted');

            // Insertar ingredientes
            context.log(`📝 Inserting ${ingredients.length} ingredients...`);
            for (let i = 0; i < ingredients.length; i++) {
              if (ingredients[i] && ingredients[i].trim()) {
                await promiseConnection.query(`
                  INSERT INTO receta_ingredientes (receta_id, ingrediente, orden) 
                  VALUES (?, ?, ?)
                `, [newRecipeId, ingredients[i].trim(), i + 1]);
              }
            }
            context.log('✅ Ingredients inserted');

            // Insertar instrucciones
            context.log(`📝 Inserting ${instructions.length} instructions...`);
            for (let i = 0; i < instructions.length; i++) {
              if (instructions[i] && instructions[i].trim()) {
                await promiseConnection.query(`
                  INSERT INTO receta_instrucciones (receta_id, numero_paso, descripcion) 
                  VALUES (?, ?, ?)
                `, [newRecipeId, i + 1, instructions[i].trim()]);
              }
            }
            context.log('✅ Instructions inserted');

            // COMMIT CON CONEXIÓN MANUAL
            await promiseConnection.query('COMMIT');
            context.log('✅ Transaction committed successfully');

            // Cerrar conexión manual
            connection.end();

            return {
              status: 201,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              jsonBody: {
                success: true,
                message: 'Receta creada exitosamente',
                recipeId: newRecipeId,
                imageUrl: imageUrl,
                imageProcessed: imageProcessed,
                user: {
                  id: user.id,
                  name: user.nombre_usuario
                }
              }
            };

          } catch (insertError) {
            // ROLLBACK CON CONEXIÓN MANUAL
            await promiseConnection.query('ROLLBACK');
            context.log('❌ Transaction rolled back due to error:', insertError.message);
            connection.end();
            throw insertError;
          }

        } catch (transactionError) {
          context.log('❌ Transaction error:', transactionError.message);
          connection.end();
          return {
            status: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            jsonBody: {
              success: false,
              message: 'Error creating recipe',
              details: transactionError.message
            }
          };
        }
      }

      // ACTUALIZAR RECETA EXISTENTE (PUT)
      if (request.method === 'PUT' && recipeId) {
        context.log(`🔄 Updating recipe with ID: ${recipeId}`);

        // Verificar que la receta existe y pertenece al usuario
        try {
          const [existingRecipes] = await pool.execute(
            'SELECT id, usuario_id FROM recetas WHERE id = ? AND activa = true',
            [recipeId]
          );

          if (existingRecipes.length === 0) {
            return {
              status: 404,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              jsonBody: {
                success: false,
                message: 'Receta no encontrada'
              }
            };
          }

          const existingRecipe = existingRecipes[0];
          if (existingRecipe.usuario_id !== user.id) {
            return {
              status: 403,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              jsonBody: {
                success: false,
                message: 'No tienes permisos para editar esta receta'
              }
            };
          }

          // USAR CONEXIÓN MANUAL PARA UPDATE TRANSACTION
          const mysql = require('mysql2');
          const connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT, 10),
            ssl: {
              rejectUnauthorized: false
            }
          });

          const promiseConnection = connection.promise();

          try {
            await promiseConnection.query('START TRANSACTION');
            
            // Actualizar receta principal
            await promiseConnection.query(`
              UPDATE recetas SET 
                titulo = ?, descripcion = ?, categoria_id = ?,
                tiempo_preparacion = ?, porciones = ?, nivel_dificultad = ?,
                imagen_url = ?, fecha_actualizacion = ?
              WHERE id = ?
            `, [
              title, description, getCategoryId(category),
              prepTime, servings || 4, difficulty,
              imageUrl, now, recipeId
            ]);

            // Eliminar ingredientes e instrucciones existentes
            await promiseConnection.query('DELETE FROM receta_ingredientes WHERE receta_id = ?', [recipeId]);
            await promiseConnection.query('DELETE FROM receta_instrucciones WHERE receta_id = ?', [recipeId]);

            // Insertar nuevos ingredientes
            for (let i = 0; i < ingredients.length; i++) {
              if (ingredients[i] && ingredients[i].trim()) {
                await promiseConnection.query(`
                  INSERT INTO receta_ingredientes (receta_id, ingrediente, orden) 
                  VALUES (?, ?, ?)
                `, [recipeId, ingredients[i].trim(), i + 1]);
              }
            }

            // Insertar nuevas instrucciones
            for (let i = 0; i < instructions.length; i++) {
              if (instructions[i] && instructions[i].trim()) {
                await promiseConnection.query(`
                  INSERT INTO receta_instrucciones (receta_id, numero_paso, descripcion) 
                  VALUES (?, ?, ?)
                `, [recipeId, i + 1, instructions[i].trim()]);
              }
            }

            await promiseConnection.query('COMMIT');
            connection.end();

            return {
              status: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              jsonBody: {
                success: true,
                message: 'Receta actualizada exitosamente',
                recipeId: recipeId,
                imageUrl: imageUrl,
                imageProcessed: imageProcessed
              }
            };

          } catch (updateError) {
            await promiseConnection.query('ROLLBACK');
            connection.end();
            throw updateError;
          }

        } catch (updateError) {
          context.log('❌ Update error:', updateError.message);
          return {
            status: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            jsonBody: {
              success: false,
              message: 'Error updating recipe',
              details: updateError.message
            }
          };
        }
      }

    } catch (error) {
      context.log('❌ Unexpected error in createRecipe:');
      context.log('❌ Error message:', error.message);
      context.log('❌ Error stack:', error.stack);

      return {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        jsonBody: {
          success: false,
          message: 'Error interno del servidor',
          details: error.message
        }
      };
    }
  }
});

function getCategoryId(categoryName) {
  const categories = {
    'Desayunos': 1,
    'Almuerzos': 2,
    'Cenas': 3,
    'Postres': 4,
    'Bebidas': 5
  };
  return categories[categoryName] || 1;
}

function getCategoryPrefix(categoryName) {
  const prefixes = {
    'Desayunos': 'des',
    'Almuerzos': 'alm',
    'Cenas': 'cen',
    'Postres': 'pos',
    'Bebidas': 'beb'
  };
  return prefixes[categoryName] || 'gen';
}