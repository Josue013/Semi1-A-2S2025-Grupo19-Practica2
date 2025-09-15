-- Base de datos para Plataforma de Recetas - NORMALIZADA
CREATE DATABASE plataforma_recetas;
USE plataforma_recetas;

-- Tabla de categorías de recetas
CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    path VARCHAR(50) NOT NULL UNIQUE,
    imagen_url VARCHAR(500) NOT NULL, -- URL de Azure Blob Storage
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    nombre_completo VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    imagen_perfil VARCHAR(500) NULL, -- URL de Azure Blob Storage
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de recetas
CREATE TABLE recetas (
    id VARCHAR(20) PRIMARY KEY, -- rec-des-01, rec-pos-01, etc.
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    tiempo_preparacion INT NOT NULL, -- En minutos
    porciones INT DEFAULT 1,
    categoria_id INT NOT NULL,
    usuario_id INT NOT NULL, -- Usuario que creó la receta
    imagen_url VARCHAR(500) NOT NULL, -- URL de Azure Blob Storage
    nivel_dificultad ENUM('Fácil', 'Intermedio', 'Difícil') DEFAULT 'Fácil',
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_categoria (categoria_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_activa (activa),
    INDEX idx_fecha (fecha_creacion),
    INDEX idx_dificultad (nivel_dificultad)
);

-- Tabla de ingredientes de recetas
CREATE TABLE receta_ingredientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    receta_id VARCHAR(20) NOT NULL,
    ingrediente VARCHAR(255) NOT NULL,
    cantidad VARCHAR(50) NULL, -- "2", "1/2", "Al gusto"
    unidad VARCHAR(50) NULL, -- "tazas", "cucharadas", "gramos"
    orden INT NOT NULL, -- Para mantener el orden de los ingredientes
    
    FOREIGN KEY (receta_id) REFERENCES recetas(id) ON DELETE CASCADE,
    INDEX idx_receta (receta_id),
    INDEX idx_ingrediente (ingrediente),
    UNIQUE KEY unique_receta_orden (receta_id, orden)
);

-- Tabla de instrucciones de recetas
CREATE TABLE receta_instrucciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    receta_id VARCHAR(20) NOT NULL,
    numero_paso INT NOT NULL,
    descripcion TEXT NOT NULL,
    tiempo_estimado INT NULL, -- minutos para este paso específico (opcional)
    
    FOREIGN KEY (receta_id) REFERENCES recetas(id) ON DELETE CASCADE,
    INDEX idx_receta (receta_id),
    UNIQUE KEY unique_receta_paso (receta_id, numero_paso)
);

-- Tabla de recetas favoritas
CREATE TABLE recetas_favoritas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    receta_id VARCHAR(20) NOT NULL,
    fecha_guardado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (receta_id) REFERENCES recetas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_receta (usuario_id, receta_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_receta (receta_id)
);

-- Insertar categorías de recetas
INSERT INTO categorias (nombre, path, imagen_url) VALUES
('Desayunos', 'desayunos', 'https://practica2imagenes.blob.core.windows.net/practica2imagenes/hotcakesqueso.jpg'),
('Almuerzos', 'almuerzos', 'https://practica2imagenes.blob.core.windows.net/practica2imagenes/costillasbbq.jpg'),
('Cenas', 'cenas', 'https://practica2imagenes.blob.core.windows.net/practica2imagenes/lasanadecarne.jpg'),
('Postres', 'postres', 'https://practica2imagenes.blob.core.windows.net/practica2imagenes/Buñuelosenfreidoradeaire.jpg'),
('Bebidas', 'bebidas', 'https://practica2imagenes.blob.core.windows.net/practica2imagenes/horchata.jpg');

-- ===================== RECETAS REALES ===================== 

-- Insertar usuarios reales
INSERT INTO usuarios (nombre_usuario, correo_electronico, nombre_completo, password_hash) VALUES
('yamilette_gonzalez', 'yamilette@example.com', 'Yamilette González', '$2a$10$BxrK4KwERdvTX0QHsxvok.oaLv.2nd0w33NQVmMjfiUIlgYQuL97e'),
('carlos_lieja', 'carlos.lieja@example.com', 'Carlos Lieja', '$2a$10$GNnPWHJtYp/Cuqzd6jhoCOBZHOAakhRX74xzH.Wrk/PxE0Zil7b7S');

-- ===== RECETA 1: Buñuelos en freidora de aire =====
INSERT INTO recetas (id, titulo, descripcion, tiempo_preparacion, porciones, categoria_id, usuario_id, imagen_url, nivel_dificultad) VALUES
('rec-pos-01', 'Buñuelos en freidora de aire', 'Buñuelos en freidora de aire. Esta receta conserva todo lo crujiente y delicioso de los buñuelos tradicionales, pero usando mucho menos aceite, lo que los hace una excelente opción para consentirte sin culpa. Lo mejor es que son muy fáciles de hacer en casa y perfectos para cumplir ese antojo dulce de forma más saludable. Solo necesitas unos cuantos ingredientes básicos y tu air fryer para lograr buñuelos doraditos, ligeros y llenos de sabor. ¡Una forma moderna y deliciosa de disfrutar este postre tradicional!', 30, 6, 4, 1, 'https://practica2imagenes.blob.core.windows.net/practica2imagenes/Buñuelosenfreidoradeaire.jpg', 'Intermedio');

-- Ingredientes para Buñuelos
INSERT INTO receta_ingredientes (receta_id, ingrediente, cantidad, unidad, orden) VALUES
('rec-pos-01', 'Harina', '1 1/2', 'tazas', 1),
('rec-pos-01', 'Aceite vegetal', '2', 'cucharadas', 2),
('rec-pos-01', 'Sal', '1', 'cucharadita', 3),
('rec-pos-01', 'Azúcar', '1', 'cucharada', 4),
('rec-pos-01', 'Esencia de vainilla', '1', 'cucharada', 5),
('rec-pos-01', 'Agua', '1/2', 'taza', 6),
('rec-pos-01', 'Canela en polvo', '1', 'cucharadita', 7),
('rec-pos-01', 'Piloncillo', '1', 'pieza', 8),
('rec-pos-01', 'Agua para la miel', '1/2', 'taza', 9),
('rec-pos-01', 'Raja de canela', '1', 'pieza', 10),
('rec-pos-01', 'Anís estrella', '1', 'pieza', 11),
('rec-pos-01', 'Guayabas', '2', 'unidades', 12);

-- Instrucciones para Buñuelos
INSERT INTO receta_instrucciones (receta_id, numero_paso, descripcion) VALUES
('rec-pos-01', 1, 'En un bowl grande, mezclar la harina, sal, azúcar y canela en polvo hasta integrar bien'),
('rec-pos-01', 2, 'Hacer un hueco en el centro y agregar el aceite vegetal, esencia de vainilla y agua'),
('rec-pos-01', 3, 'Mezclar todos los ingredientes hasta formar una masa suave y homogénea. Amasar por 5 minutos'),
('rec-pos-01', 4, 'Dejar reposar la masa cubierta con un paño húmedo durante 15 minutos'),
('rec-pos-01', 5, 'Mientras tanto, preparar la miel: en una olla pequeña agregar el piloncillo, agua, raja de canela, anís estrella y guayabas'),
('rec-pos-01', 6, 'Cocinar la miel a fuego medio durante 10-15 minutos hasta que espese ligeramente. Colar y reservar'),
('rec-pos-01', 7, 'Dividir la masa en porciones pequeñas y estirar cada una muy delgada con un rodillo'),
('rec-pos-01', 8, 'Cortar la masa en círculos de aproximadamente 10 cm de diámetro'),
('rec-pos-01', 9, 'Precalentar la freidora de aire a 180°C por 3 minutos'),
('rec-pos-01', 10, 'Colocar los buñuelos en la freidora de aire, sin sobrecargar, y cocinar por 3-4 minutos por cada lado'),
('rec-pos-01', 11, 'Retirar cuando estén dorados y crujientes'),
('rec-pos-01', 12, 'Servir calientes bañados con la miel de piloncillo y guayaba. ¡Disfruta!');

-- ===== RECETA 2: Costillas BBQ =====
INSERT INTO recetas (id, titulo, descripcion, tiempo_preparacion, porciones, categoria_id, usuario_id, imagen_url, nivel_dificultad) VALUES
('rec-alm-01', 'Costillas BBQ', 'Las costillas BBQ es un clásico dentro de la gastronomía americana y son ideales para una carne asada. Ya lo sabes, estas costillitas van bañadas con una salsa BBQ agridulce y se pueden acompañar con papas a la francesa, un elote asado y más.', 80, 4, 2, 2, 'https://practica2imagenes.blob.core.windows.net/practica2imagenes/costillasbbq.jpg', 'Fácil');

-- Ingredientes para Costillas BBQ
INSERT INTO receta_ingredientes (receta_id, ingrediente, cantidad, unidad, orden) VALUES
('rec-alm-01', 'Costilla de cerdo', '1', 'kilo', 1),
('rec-alm-01', 'Cebolla', '1/4', 'pieza', 2),
('rec-alm-01', 'Diente de ajo', '1', 'unidad', 3),
('rec-alm-01', 'Ajo en polvo', '1', 'cucharada', 4),
('rec-alm-01', 'Azúcar', '125', 'gramos', 5),
('rec-alm-01', 'Mostaza', '20', 'gramos', 6),
('rec-alm-01', 'Salsa de tomate', '125', 'mililitros', 7),
('rec-alm-01', 'Cebolla picada', '20', 'gramos', 8),
('rec-alm-01', 'Jugo de limón', '1', 'cucharada', 9),
('rec-alm-01', 'Vinagre de manzana', '60', 'mililitros', 10),
('rec-alm-01', 'Salsa inglesa', '60', 'mililitros', 11),
('rec-alm-01', 'Sal', '3', 'pizcas', 12),
('rec-alm-01', 'Pimienta', '1', 'pizca', 13),
('rec-alm-01', 'Agua', '1', 'litro', 14);

-- Instrucciones para Costillas BBQ
INSERT INTO receta_instrucciones (receta_id, numero_paso, descripcion) VALUES
('rec-alm-01', 1, 'Lavar bien las costillas de cerdo y cortarlas en porciones individuales si es necesario'),
('rec-alm-01', 2, 'En una olla grande, hervir agua con sal y cocinar las costillas por 30 minutos para ablandarlas'),
('rec-alm-01', 3, 'Mientras tanto, preparar la salsa BBQ: picar finamente la cebolla y el ajo'),
('rec-alm-01', 4, 'En una sartén, sofreír la cebolla picada y el ajo hasta que estén transparentes'),
('rec-alm-01', 5, 'Agregar el azúcar, mostaza, salsa de tomate, ajo en polvo, sal y pimienta'),
('rec-alm-01', 6, 'Incorporar el vinagre de manzana, salsa inglesa y jugo de limón. Mezclar bien'),
('rec-alm-01', 7, 'Cocinar la salsa a fuego lento por 15 minutos hasta que espese, revolviendo ocasionalmente'),
('rec-alm-01', 8, 'Escurrir las costillas del agua de cocción y secarlas con papel absorbente'),
('rec-alm-01', 9, 'Calentar la parrilla o plancha a fuego medio-alto'),
('rec-alm-01', 10, 'Asar las costillas por 8-10 minutos de cada lado, pintándolas constantemente con la salsa BBQ'),
('rec-alm-01', 11, 'Continuar cocinando hasta que estén bien doradas y caramelizadas'),
('rec-alm-01', 12, 'Servir calientes acompañadas de papas a la francesa y elote asado. ¡Disfruta!');

-- Agregar algunas recetas favoritas de ejemplo
INSERT INTO recetas_favoritas (usuario_id, receta_id) VALUES
(1, 'rec-pos-01'), -- Yamilette guardó Buñuelos
(2, 'rec-alm-01'); -- Carlos guardó sus propias Costillas

-- Agregar nuevos usuarios
INSERT INTO usuarios (nombre_usuario, correo_electronico, nombre_completo, password_hash) VALUES
('karen_melgarejo', 'karen.melgarejo@example.com', 'Karen Melgarejo', '$2a$10$6d0LOIi.944oLAX00AvJ1u4Yb/9NwzaDFH6F7EXhNhzPmQzbk9eQu'),
('bismarck_romero', 'bismarck.romero@example.com', 'Bismarck Romero', '$2a$10$7qXSI8CuANchzBYhuMIayeRzIzP0TxxIH8Y/M9XMUsLjfoPe6EphG');

-- ===== RECETA 3: Hot cakes de queso cottage (DESAYUNOS) =====
INSERT INTO recetas (id, titulo, descripcion, tiempo_preparacion, porciones, categoria_id, usuario_id, imagen_url, nivel_dificultad) VALUES
('rec-des-01', 'Hot cakes de queso cottage', '¿Tienes ganas de un desayuno rico, fácil y ligero? No busques más y prepara estos hot cakes de queso cottage para el desayuno o el brunch. ¿Con qué acompañarías estos hot cakes de queso cottage? A nosotros se nos antojan con un poco de miel de maple y frutos rojos. Lo que más nos gustó de esta receta de hot cakes es que se preparan con avena, así que te aportarán fibra. Además, le damos un par de secretos para que te queden muy esponjosos. ¡Pruébalos!', 15, 4, 1, 3, 'https://practica2imagenes.blob.core.windows.net/practica2imagenes/hotcakesqueso.jpg', 'Fácil');

-- Ingredientes para Hot cakes de queso cottage
INSERT INTO receta_ingredientes (receta_id, ingrediente, cantidad, unidad, orden) VALUES
('rec-des-01', 'Queso cottage', '1', 'taza', 1),
('rec-des-01', 'Avena', '1/2', 'taza', 2),
('rec-des-01', 'Huevos', '2', 'unidades', 3),
('rec-des-01', 'Polvo para hornear', '1', 'cucharadita', 4),
('rec-des-01', 'Esencia de vainilla', '1', 'cucharadita', 5),
('rec-des-01', 'Canela en polvo', '1', 'cucharadita', 6),
('rec-des-01', 'Mantequilla sin sal', 'Cantidad suficiente', '', 7),
('rec-des-01', 'Fresas', 'Al gusto', '', 8),
('rec-des-01', 'Frambuesas', 'Al gusto', '', 9),
('rec-des-01', 'Azúcar glas', 'Al gusto', '', 10);

-- Instrucciones para Hot cakes de queso cottage
INSERT INTO receta_instrucciones (receta_id, numero_paso, descripcion) VALUES
('rec-des-01', 1, 'En un bowl grande, batir los huevos hasta que estén espumosos'),
('rec-des-01', 2, 'Agregar el queso cottage y mezclar bien hasta integrar completamente'),
('rec-des-01', 3, 'Incorporar la avena, polvo para hornear, esencia de vainilla y canela en polvo'),
('rec-des-01', 4, 'Mezclar todos los ingredientes hasta obtener una masa homogénea pero sin batir demasiado'),
('rec-des-01', 5, 'Dejar reposar la mezcla por 5 minutos para que la avena se hidrate'),
('rec-des-01', 6, 'Calentar una sartén antiadherente a fuego medio y agregar un poco de mantequilla'),
('rec-des-01', 7, 'Verter porciones de la mezcla formando círculos en la sartén caliente'),
('rec-des-01', 8, 'Cocinar por 2-3 minutos hasta que aparezcan burbujas en la superficie'),
('rec-des-01', 9, 'Voltear cuidadosamente y cocinar por 2 minutos más hasta dorar'),
('rec-des-01', 10, 'Servir calientes decorados con fresas, frambuesas y azúcar glas al gusto');

-- ===== RECETA 4: Agua de Horchata (BEBIDAS) =====
INSERT INTO recetas (id, titulo, descripcion, tiempo_preparacion, porciones, categoria_id, usuario_id, imagen_url, nivel_dificultad) VALUES
('rec-beb-01', 'Agua de Horchata', 'Refrescante y rica agua de horchata hecha con arroz para la temporada de calor.', 15, 6, 5, 4, 'https://practica2imagenes.blob.core.windows.net/practica2imagenes/horchata.jpg', 'Fácil');

-- Ingredientes para Agua de Horchata
INSERT INTO receta_ingredientes (receta_id, ingrediente, cantidad, unidad, orden) VALUES
('rec-beb-01', 'Agua', '2', 'litros', 1),
('rec-beb-01', 'Arroz', '1', 'taza', 2),
('rec-beb-01', 'Rajas de canela', '4', 'piezas', 3),
('rec-beb-01', 'Leche evaporada', '1', 'lata', 4),
('rec-beb-01', 'Azúcar', '1/2', 'taza', 5);

-- Instrucciones para Agua de Horchata
INSERT INTO receta_instrucciones (receta_id, numero_paso, descripcion) VALUES
('rec-beb-01', 1, 'En una olla, hervir 1 litro de agua con las rajas de canela por 5 minutos'),
('rec-beb-01', 2, 'Agregar el arroz al agua hirviendo y cocinar por 15 minutos a fuego medio'),
('rec-beb-01', 3, 'Retirar del fuego y dejar enfriar completamente con la canela dentro'),
('rec-beb-01', 4, 'Una vez frío, colar la mezcla y reservar solo el líquido'),
('rec-beb-01', 5, 'En la licuadora, agregar el líquido colado, el resto del agua fría, leche evaporada y azúcar'),
('rec-beb-01', 6, 'Licuar por 2 minutos hasta que esté completamente integrado'),
('rec-beb-01', 7, 'Colar nuevamente para obtener una textura suave'),
('rec-beb-01', 8, 'Refrigerar por al menos 2 horas antes de servir'),
('rec-beb-01', 9, 'Servir bien fría con hielo y espolvorear canela en polvo por encima si se desea');

-- ===== RECETA 5: Lasaña de Carne Molida y Queso Fácil (CENAS) =====
INSERT INTO recetas (id, titulo, descripcion, tiempo_preparacion, porciones, categoria_id, usuario_id, imagen_url, nivel_dificultad) VALUES
('rec-cen-01', 'Lasaña de Carne Molida y Queso Fácil', 'Prueba esta receta de lasaña de carne molida clásica con boloñesa y salsa bechamel, pues está llena de sabor y hecha con deliciosas capas de carne, salsa y queso. La lasaña es un platillo completo y que puedes acompañar con una guarnición ligera, como una ensalada, y una copa de vino. Así podrías armar una cena sencilla y romántica o perfecta para una reunión u ocasión especial con familia o amigos.', 50, 8, 3, 4, 'https://practica2imagenes.blob.core.windows.net/practica2imagenes/lasanadecarne.jpg', 'Fácil');

-- Ingredientes para Lasaña de Carne Molida
INSERT INTO receta_ingredientes (receta_id, ingrediente, cantidad, unidad, orden) VALUES
('rec-cen-01', 'Aceite de oliva', '3', 'cucharadas', 1),
('rec-cen-01', 'Cebolla picada finamente', '1', 'taza', 2),
('rec-cen-01', 'Ajo picado finamente', '2', 'cucharadas', 3),
('rec-cen-01', 'Apio picado finamente', '1', 'taza', 4),
('rec-cen-01', 'Zanahoria picada en cubos chicos', '1', 'taza', 5),
('rec-cen-01', 'Jitomate picado en cubos chicos', '1', 'taza', 6),
('rec-cen-01', 'Carne de res molida', '500', 'gramos', 7),
('rec-cen-01', 'Sal', 'Al gusto', '', 8),
('rec-cen-01', 'Pimienta', 'Al gusto', '', 9),
('rec-cen-01', 'Puré de tomate', '1/2', 'taza', 10),
('rec-cen-01', 'Vino tinto', '1/2', 'taza', 11),
('rec-cen-01', 'Tomillo', '1', 'cucharadita', 12),
('rec-cen-01', 'Orégano', '1', 'cucharadita', 13),
('rec-cen-01', 'Hoja de laurel', '1', 'pieza', 14),
('rec-cen-01', 'Mantequilla sin sal', '2', 'cucharadas', 15),
('rec-cen-01', 'Harina', '3', 'cucharadas', 16),
('rec-cen-01', 'Leche', '1 1/2', 'tazas', 17),
('rec-cen-01', 'Pimienta blanca', '1/2', 'cucharadita', 18),
('rec-cen-01', 'Nuez moscada', '1/4', 'cucharadita', 19),
('rec-cen-01', 'Pasta para lasaña', 'Cantidad suficiente', '', 20),
('rec-cen-01', 'Agua para pasta', 'Cantidad suficiente', '', 21),
('rec-cen-01', 'Queso manchego en láminas', 'Cantidad suficiente', '', 22);

-- Instrucciones para Lasaña de Carne Molida
INSERT INTO receta_instrucciones (receta_id, numero_paso, descripcion) VALUES
('rec-cen-01', 1, 'Calentar el aceite de oliva en una sartén grande y sofreír la cebolla, ajo, apio y zanahoria hasta que estén suaves'),
('rec-cen-01', 2, 'Agregar el jitomate picado y cocinar por 5 minutos más'),
('rec-cen-01', 3, 'Incorporar la carne molida y cocinar hasta que esté dorada, desmenuzándola con una cuchara'),
('rec-cen-01', 4, 'Sazonar con sal y pimienta, agregar el puré de tomate, vino tinto, tomillo, orégano y hoja de laurel'),
('rec-cen-01', 5, 'Cocinar a fuego lento por 20 minutos hasta que espese. Retirar la hoja de laurel'),
('rec-cen-01', 6, 'Para la bechamel: derretir la mantequilla en una olla, agregar la harina y cocinar por 2 minutos'),
('rec-cen-01', 7, 'Gradualmente agregar la leche, batiendo constantemente para evitar grumos'),
('rec-cen-01', 8, 'Sazonar con sal, pimienta blanca y nuez moscada. Cocinar hasta que espese'),
('rec-cen-01', 9, 'Hervir agua con sal y cocinar la pasta para lasaña según las instrucciones del paquete'),
('rec-cen-01', 10, 'Precalentar el horno a 180°C'),
('rec-cen-01', 11, 'En un refractario, alternar capas de pasta, salsa boloñesa, bechamel y queso'),
('rec-cen-01', 12, 'Terminar con una capa de bechamel y queso por encima'),
('rec-cen-01', 13, 'Hornear por 25-30 minutos hasta que esté dorada por encima'),
('rec-cen-01', 14, 'Dejar reposar 10 minutos antes de cortar y servir');

-- Agregar más recetas favoritas
INSERT INTO recetas_favoritas (usuario_id, receta_id) VALUES
(3, 'rec-des-01'), -- Karen guardó sus hot cakes
(4, 'rec-beb-01'), -- Bismarck guardó su agua de horchata
(4, 'rec-cen-01'), -- Bismarck guardó su lasaña
(1, 'rec-des-01'), -- Yamilette guardó hot cakes
(2, 'rec-beb-01'); -- Carlos guardó agua de horchata