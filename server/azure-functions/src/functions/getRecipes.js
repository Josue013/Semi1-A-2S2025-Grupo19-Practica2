const { app } = require('@azure/functions');

app.http('getRecipesHandler', {
  methods: ['GET'],
  route: 'recipes/{id?}',
  handler: async (request, context) => {
    context.log('📖 Get Recipes function triggered - COMPLETE VERSION');

    try {
      // Validar variables de entorno
      const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        context.log('❌ Missing environment variables:', missingVars);
        return {
          status: 500,
          jsonBody: {
            success: false,
            message: 'Server configuration error'
          }
        };
      }

      context.log('✅ Environment variables validated');

      // Importar database
      const { pool } = require('../shared/database');

      // Test de conexión
      context.log('🔍 Testing database connection...');
      await pool.execute('SELECT 1 as test');
      context.log('✅ Database connection successful');

      const recipeId = request.params.id;
      context.log('🔍 Recipe ID:', recipeId);

      // SI HAY ID - OBTENER UNA RECETA ESPECÍFICA
      if (recipeId) {
        context.log(`🔍 Fetching specific recipe: ${recipeId}`);
        
        const [recipes] = await pool.execute(`
          SELECT 
            r.id,
            r.titulo as title,
            r.descripcion as description,
            c.nombre as category,
            r.tiempo_preparacion as prepTime,
            r.porciones as servings,
            r.nivel_dificultad as difficulty,
            r.imagen_url as imageUrl,
            r.fecha_creacion as createdAt,
            r.fecha_actualizacion as updatedAt,
            u.nombre_completo as author,
            u.nombre_usuario as authorUsername,
            u.imagen_perfil as authorImage
          FROM recetas r
          JOIN usuarios u ON r.usuario_id = u.id
          JOIN categorias c ON r.categoria_id = c.id
          WHERE r.id = ? AND r.activa = true
        `, [recipeId]);

        if (recipes.length === 0) {
          return {
            status: 404,
            jsonBody: {
              success: false,
              message: 'Receta no encontrada'
            }
          };
        }

        const recipe = recipes[0];

        // Obtener ingredientes
        const [ingredients] = await pool.execute(`
          SELECT ingrediente
          FROM receta_ingredientes 
          WHERE receta_id = ? 
          ORDER BY orden
        `, [recipeId]);

        // Obtener instrucciones
        const [instructions] = await pool.execute(`
          SELECT descripcion
          FROM receta_instrucciones 
          WHERE receta_id = ? 
          ORDER BY numero_paso
        `, [recipeId]);

        // Formatear respuesta
        recipe.ingredients = ingredients.map(ing => ing.ingrediente);
        recipe.instructions = instructions.map(inst => inst.descripcion);
        recipe.image = [recipe.imageUrl];
        recipe._id = recipe.id.toString();
        delete recipe.imageUrl;

        context.log(`✅ Recipe ${recipeId} retrieved successfully`);

        return {
          status: 200,
          jsonBody: {
            success: true,
            recipe: recipe
          }
        };
      }

      // SI NO HAY ID - OBTENER TODAS LAS RECETAS CON INGREDIENTES E INSTRUCCIONES
      context.log('🔍 Fetching ALL recipes with complete data...');
      
      // Query para obtener recetas básicas
      const [recipes] = await pool.execute(`
        SELECT 
          r.id,
          r.titulo as title,
          r.descripcion as description,
          c.nombre as category,
          r.tiempo_preparacion as prepTime,
          r.porciones as servings,
          r.nivel_dificultad as difficulty,
          r.imagen_url as imageUrl,
          r.fecha_creacion as createdAt,
          u.nombre_completo as author,
          u.nombre_usuario as authorUsername,
          u.imagen_perfil as authorImage
        FROM recetas r
        JOIN usuarios u ON r.usuario_id = u.id
        JOIN categorias c ON r.categoria_id = c.id
        WHERE r.activa = true
        ORDER BY r.fecha_creacion DESC
        LIMIT 50
      `);

      context.log(`✅ Retrieved ${recipes.length} recipes`);

      if (recipes.length === 0) {
        return {
          status: 200,
          jsonBody: {
            success: true,
            recipes: [],
            total: 0,
            message: 'No se encontraron recetas'
          }
        };
      }

      // Obtener todos los ingredientes de una vez
      const recipeIds = recipes.map(r => r.id);
      const placeholders = recipeIds.map(() => '?').join(',');
      
      context.log('🔍 Fetching ingredients for all recipes...');
      const [allIngredients] = await pool.execute(`
        SELECT receta_id, ingrediente
        FROM receta_ingredientes 
        WHERE receta_id IN (${placeholders})
        ORDER BY receta_id, orden
      `, recipeIds);

      context.log('🔍 Fetching instructions for all recipes...');
      const [allInstructions] = await pool.execute(`
        SELECT receta_id, descripcion
        FROM receta_instrucciones 
        WHERE receta_id IN (${placeholders})
        ORDER BY receta_id, numero_paso
      `, recipeIds);

      context.log(`✅ Retrieved ingredients and instructions`);

      // Agrupar ingredientes e instrucciones por receta
      const ingredientsByRecipe = {};
      const instructionsByRecipe = {};

      allIngredients.forEach(ing => {
        if (!ingredientsByRecipe[ing.receta_id]) {
          ingredientsByRecipe[ing.receta_id] = [];
        }
        ingredientsByRecipe[ing.receta_id].push(ing.ingrediente);
      });

      allInstructions.forEach(inst => {
        if (!instructionsByRecipe[inst.receta_id]) {
          instructionsByRecipe[inst.receta_id] = [];
        }
        instructionsByRecipe[inst.receta_id].push(inst.descripcion);
      });

      // Procesar recetas para el frontend CON DATOS REALES
      const processedRecipes = recipes.map(recipe => {
        return {
          id: recipe.id,
          _id: recipe.id.toString(),
          title: recipe.title,
          description: recipe.description,
          category: recipe.category,
          prepTime: recipe.prepTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          image: [recipe.imageUrl],
          createdAt: recipe.createdAt,
          author: recipe.author,
          authorUsername: recipe.authorUsername,
          authorImage: recipe.authorImage,
          // Usar datos reales en lugar de placeholders
          ingredients: ingredientsByRecipe[recipe.id] || ['Sin ingredientes'],
          instructions: instructionsByRecipe[recipe.id] || ['Sin instrucciones']
        };
      });

      context.log(`✅ Processed ${processedRecipes.length} recipes with complete data`);

      return {
        status: 200,
        jsonBody: {
          success: true,
          recipes: processedRecipes,
          total: processedRecipes.length,
          message: `${processedRecipes.length} recetas encontradas con datos completos`
        }
      };

    } catch (error) {
      context.log('❌ Error in getRecipes:');
      context.log('❌ Message:', error.message);
      context.log('❌ Code:', error.code);
      context.log('❌ SQL:', error.sql);

      return {
        status: 500,
        jsonBody: {
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        }
      };
    }
  }
});