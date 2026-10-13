-- ========================================================
-- MenuApp (Entrepanes) - Schema, Seed & Realtime para Supabase
-- ========================================================

DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Table" CASCADE;
DROP TABLE IF EXISTS "Kitchen" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Local" CASCADE;

CREATE TABLE "Local" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "logo" TEXT,
    "slug" TEXT UNIQUE NOT NULL,
    "cbuAlias" TEXT,
    "linkPago" TEXT,
    "mercadoPagoLink" TEXT,
    "horarioApertura" TEXT,
    "horarioCierre" TEXT,
    "direccion" TEXT,
    "diasAtencion" TEXT
);

CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'owner',
    "localId" INTEGER REFERENCES "Local"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Table" (
    "id" SERIAL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "localId" INTEGER NOT NULL REFERENCES "Local"("id") ON DELETE CASCADE
);

CREATE TABLE "Kitchen" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "localId" INTEGER NOT NULL REFERENCES "Local"("id") ON DELETE CASCADE
);

CREATE TABLE "Category" (
    "id" SERIAL PRIMARY KEY,
    "localId" INTEGER NOT NULL REFERENCES "Local"("id") ON DELETE CASCADE,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL
);

CREATE TABLE "Product" (
    "id" SERIAL PRIMARY KEY,
    "categoryId" INTEGER NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "imagen" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER NOT NULL DEFAULT 20,
    "kitchenId" INTEGER REFERENCES "Kitchen"("id") ON DELETE SET NULL
);

CREATE TABLE "Order" (
    "id" SERIAL PRIMARY KEY,
    "codigo" TEXT,
    "localId" INTEGER NOT NULL REFERENCES "Local"("id") ON DELETE CASCADE,
    "mesa" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Recibido',
    "total" DOUBLE PRECISION NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "tipoOrden" TEXT NOT NULL DEFAULT 'salon',
    "pagoConfirmado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "OrderItem" (
    "id" SERIAL PRIMARY KEY,
    "orderId" INTEGER NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "productId" INTEGER NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "aclaracion" TEXT
);

-- Habilitar Row Level Security con acceso completo
ALTER TABLE "Local" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Table" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Kitchen" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all Local" ON "Local" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all User" ON "User" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all Table" ON "Table" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all Kitchen" ON "Kitchen" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all Category" ON "Category" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all Product" ON "Product" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all Order" ON "Order" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all OrderItem" ON "OrderItem" FOR ALL USING (true) WITH CHECK (true);

-- Activar Realtime para sincronización inmediata entre dispositivos
ALTER PUBLICATION supabase_realtime ADD TABLE "Order";
ALTER PUBLICATION supabase_realtime ADD TABLE "OrderItem";

-- Carga inicial del local
INSERT INTO "Local" ("id", "nombre", "logo", "slug", "linkPago", "mercadoPagoLink")
VALUES (1, 'Entrepanes', '/images/entrepanes/logo.jpg', 'entrepanes', 'https://checkout.baccredomatic.com/YWUwYmUzMjIyMTg5NTUuN2FiNjlmMjkxNzkwMDkwOTI2', 'https://checkout.baccredomatic.com/YWUwYmUzMjIyMTg5NTUuN2FiNjlmMjkxNzkwMDkwOTI2');

-- Usuarios (passwords: admin123 y mozo123)
INSERT INTO "User" ("email", "password", "nombre", "rol", "localId") VALUES
('admin@entrepanes.com', '$2a$10$wGRtKEhcgyZTXVkJS0y4fO7H4hI2j1YbgqHp245RwMfzlnDyHkm/C', 'Administrador', 'owner', 1),
('caja@entrepanes.com', '$2a$10$wGRtKEhcgyZTXVkJS0y4fO7H4hI2j1YbgqHp245RwMfzlnDyHkm/C', 'Caja', 'owner', 1),
('mozo@entrepanes.com', '$2a$10$hxGgcWU6CVteeg1sU/KDBOUdE7a.nP0jCNCJ0bRDYFXrk6lTBkRlK', 'Mozo 1', 'mozo', 1);

INSERT INTO "Kitchen" ("id", "nombre", "localId") VALUES
(1, 'Cocina', 1),
(2, 'Barra', 1);

INSERT INTO "Table" ("numero", "localId") VALUES
('1', 1), ('2', 1), ('3', 1), ('4', 1), ('5', 1),
('6', 1), ('7', 1), ('8', 1), ('9', 1), ('10', 1),
('Barra', 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (1, 1, 'Entradas', 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (1001, 1, 'Tequeños (6 unidades)', NULL, 7.5, '/images/entrepanes/tequenos.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (1002, 1, 'Tequeños (12 unidades)', NULL, 13.5, '/images/entrepanes/tequenos.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (1003, 1, 'Mini empanadas (6 unidades)', 'Pollo, carne mechada, queso.', 7.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (1004, 1, 'Mini empanadas (12 unidades)', 'Pollo, carne mechada, queso.', 13.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (1005, 1, 'Canastas de patacón', 'Mini canastas rellenas con pollo, pernil o carne mechada. Ración de 3.', 9.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (1006, 1, 'Sopa del día', 'Preguntar por la opción de hoy.', 7.5, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (2, 1, 'Desayunos', 2);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (2001, 2, 'Desayuno Dr. Fit', 'Huevos al gusto con vegetales o jamón y queso, acompañados de queso a la plancha, bacon y aguacate. @iamdrfit', 12, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (2002, 2, 'Desayuno Criollo', 'Caraotas negras acompañadas con queso blanco y su elección de: carne mechada, pollo o cazón. Opción de arepa, pan o waffle.', 12.95, '/images/entrepanes/desayuno-criollo.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (2003, 2, 'Desayuno Americano', 'Huevos al gusto con vegetales o jamón y queso, acompañados de bacon, queso. Opción de pan tostado, arepa o waffle.', 10.95, '/images/entrepanes/desayuno-americano.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (2004, 2, 'Desayuno Entrepanes', 'Huevos al gusto con vegetales o jamón y queso asado, acompañados con bacon. Opción de pan, arepa o waffle.', 11.95, '/images/entrepanes/desayuno-entrepanes.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (2005, 2, 'Pancakes', 'Tres deliciosos pancakes espolvoreados con azúcar, acompañados de sirope clásico y fresas.', 7.5, '/images/entrepanes/pancakes.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (2006, 2, 'Yogurt Parfait', 'Yogurt natural, acompañado de granola y endulzado con miel, coronado con frutas de temporada.', 7.95, '/images/entrepanes/yogurt-parfait.jpg', 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (3, 1, 'Emparedados', 3);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (3001, 3, 'Emparedado con huevo', 'Pan tostado, huevos revueltos, jamón y queso gouda, acompañado con papas fritas.', 8.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (3002, 3, 'Emparedado de jamón y queso', 'Pan de la casa relleno con delicioso jamón ahumado, queso americano, lechuga y tomate, acompañado de papas fritas y salsas.', 8.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (3003, 3, 'Emparedado Caprese', 'Pan crujiente, queso mozzarella, tomate, lechuga y pesto, acompañado con papas fritas.', 9.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (3004, 3, 'Emparedado de pernil', 'Pernil de cerdo horneado, queso gouda, tomate, lechuga y salsas, acompañado con papas fritas.', 12.5, '/images/entrepanes/emparedado-pernil.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (3005, 3, 'Emparedado de pollo', 'Pechuga a la plancha, queso gouda, tomate, lechuga y salsas, acompañado con papas fritas.', 11, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (3006, 3, 'Emparedado de lomito', 'Filete de res troceado, queso gouda, lechuga, tomate y salsas, acompañado con papas fritas.', 12.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (3007, 3, 'Bocadillo Ibérico', 'Crujiente pan gallego, jamón serrano, queso semicurado y aceite de oliva, acompañado con papas fritas. Opción con tomate.', 9.95, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (4, 1, 'Empanadas, tequeños y más', 4);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4001, 4, 'Cachito de jamón', NULL, 3.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4002, 4, 'Cachito de jamón y queso crema', NULL, 3.75, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4003, 4, 'Cachito de jamón y queso gouda', NULL, 3.75, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4004, 4, 'Cachito de pavo y queso', NULL, 3.75, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4005, 4, 'Cachito de queso', NULL, 3.75, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4006, 4, 'Empanada frita', 'Carne mechada, pollo, queso blanco o carne molida.', 2.85, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4007, 4, 'Empanada frita de cazón', NULL, 3.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4008, 4, 'Empanada frita de pabellón', NULL, 3.75, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4009, 4, 'Empanada horneada', 'Carne, pollo, jamón y queso.', 3.25, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4010, 4, 'Tequeño boquita (6 unidades)', NULL, 7.5, '/images/entrepanes/tequenos.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4011, 4, 'Tequeño boquita (12 unidades)', NULL, 13.5, '/images/entrepanes/tequenos.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4012, 4, 'Tequeñón', NULL, 3, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (4013, 4, 'Tequeyoyo', NULL, 3, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (5, 1, 'Arepas', 5);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (5001, 5, 'Arepa de carne asada', 'Rellena de filete de res al grill, pico de gallo y queso blanco o amarillo.', 9.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (5002, 5, 'Arepa pabellón', 'Carne mechada, caraotas negras, plátano maduro y queso blanco.', 8.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (5003, 5, 'Arepa de pollo y queso', 'Pollo mechado con queso blanco o amarillo.', 7.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (5004, 5, 'Arepa perico', 'Huevos revueltos con vegetales y queso blanco o amarillo.', 7.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (5005, 5, 'Arepa de jamón y queso', 'Jamón y queso blanco o amarillo.', 7.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (5006, 5, 'Arepa de queso telita', 'Rellena con dos deliciosas ruedas de queso blanco arepero.', 7.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (5007, 5, 'Arepa de carne mechada y queso', 'Rellena de nuestra famosa carne mechada con queso blanco o amarillo.', 8.5, '/images/entrepanes/arepa-carne-mechada.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (5008, 5, 'Arepa de pernil', 'Pernil de cerdo horneado con queso blanco o amarillo.', 8.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (5009, 5, 'Arepa Reina Pepiada', 'Mezcla de pollo mechado, aguacate, cebolla, mayonesa y cilantro.', 7.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (5010, 5, 'Mini arepas surtidas', 'Tres mini arepas rellenas. Opciones: pernil, pollo, carne mechada, queso blanco o amarillo.', 9.95, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (6, 1, 'Cachapas', 6);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (6001, 6, 'Cachapa de queso', 'Rellena de queso telita, coronada con queso blanco rallado.', 11.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (6002, 6, 'Cachapa de cerdo frito', 'Queso telita, cerdo frito y queso blanco rallado.', 14.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (6003, 6, 'Cachapa de carne mechada o pollo', 'Queso telita y jugosa carne mechada o pollo y queso blanco rallado.', 14.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (6004, 6, 'Cachapa pabellón', 'Queso telita, carne mechada, caraotas negras, plátano maduro.', 15.95, '/images/entrepanes/cachapa-pabellon.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (6005, 6, 'Cachapa de pernil', 'Queso telita, pernil de cerdo horneado.', 14.5, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (7, 1, 'Croissants', 7);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (7001, 7, 'Croissant Entrepanes', 'Delicioso croissant de mantequilla relleno de jamón ahumado y queso americano.', 3.95, '/images/entrepanes/croissant-entrepanes.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (7002, 7, 'Croissant Americano', 'Relleno con tortilla de huevo, bacon y queso americano.', 5.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (7003, 7, 'Croissant Ibérico', 'Relleno con jamón serrano y queso semicurado.', 6, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (7004, 7, 'Croissant Español', 'Combinación de queso gouda con chorizo español.', 5.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (7005, 7, 'Croissant Fitness', 'Jamón de pavo y queso mozzarella.', 5.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (7006, 7, 'Croissant de Nutella', 'Relleno de Nutella y espolvoreado con azúcar glas.', 4.5, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (8, 1, 'Waffles y tostadas', 8);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (8001, 8, 'Waffle relleno con huevo', 'Rellenos con huevo, bacon y queso americano.', 9.5, '/images/entrepanes/waffle-huevo.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (8002, 8, 'Waffle de Nutella', 'Rellenos de Nutella y coronados con crema y azúcar glas.', 8.85, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (8003, 8, 'Tostada Francesa', 'Pan artesanal dorado, bañado en vino de Jerez y servido con frutas frescas de temporada y frosting de queso crema.', 10.5, '/images/entrepanes/tostada-francesa.jpg', 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (9, 1, 'Bowls de ensalada', 9);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (9001, 9, 'Entrepanes Bowl', 'Salmón sobre cama de lechuga, quinoa, aguacate, zanahorias salteadas y tomates cherry.', 11, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (9002, 9, 'Guadalajara Bowl', 'Nachos, pollo asado, maíz, aguacate, tomates cherry, pimientos y cebolla salteada, mix de lechuga.', 10.5, '/images/entrepanes/guadalajara-bowl.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (9003, 9, 'Ensalada César', 'Lechuga, crotones de ajo con mantequilla, queso parmesano, bacon y aderezo césar.', 8, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (9004, 9, 'Ensalada César con pollo', 'Lechuga, crotones de ajo con mantequilla, queso parmesano, bacon, aderezo césar y pollo.', 9.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (9005, 9, 'Ensalada César con camarones', 'Lechuga, crotones de ajo con mantequilla, queso parmesano, bacon, aderezo césar y camarones.', 13, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (9006, 9, 'Ensalada Mediterránea', 'Lechuga, pollo, aguacate, tomates cherry, zanahorias salteadas y queso de cabra.', 10.5, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (10, 1, 'Wraps', 10);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (10001, 10, 'Wrap César', 'Lechuga, pollo troceado, queso parmesano, crotones y bacon.', 8.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (10002, 10, 'Wrap de salmón', 'Lechuga, salmón, aceitunas negras, tomates cherry y cebollas caramelizadas.', 9.95, '/images/entrepanes/wrap-salmon.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (10003, 10, 'Wrap Granjero', 'Trozos de pechuga apanados, queso americano, bacon, lechuga, cebolla, tomate y salsas.', 9.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (10004, 10, 'Wrap Carnívoro', 'Trozos de carne de res, queso americano, bacon, lechuga, tomate, cebolla y salsas.', 11.95, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (11, 1, 'Pastas', 11);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (11001, 11, 'Pasta boloñesa', 'Espaguetis con la deliciosa y tradicional salsa boloñesa de carne y tomate estilo Entrepanes.', 10.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (11002, 11, 'Pasta carbonara', 'Espaguetis con la tradicional salsa blanca.', 11.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (11003, 11, 'Pasta al pesto', 'Espaguetis con pesto de albahaca y almendras.', 9.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (11004, 11, 'Pasta al pesto con pollo', 'Espaguetis con pesto de albahaca y almendras, con pollo.', 12, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (11005, 11, 'Pasta al pesto con camarones', 'Espaguetis con pesto de albahaca y almendras, con camarones.', 14, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (11006, 11, 'Pasta con camarones', 'Espaguetis con deliciosos camarones cocidos en salsa blanca, mantequilla y ajo.', 13, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (11007, 11, 'Pasta al olio', 'Espaguetis servidos con salsa de aceite de oliva, ajo laminado, tomates cherry y perejil.', 10.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (11008, 11, 'Pasta al olio con pollo', 'Espaguetis al olio con pollo.', 11.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (11009, 11, 'Pasta al olio con camarones', 'Espaguetis al olio con camarones.', 13.5, '/images/entrepanes/pasta-al-olio-camarones.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (11010, 11, 'Pasta Alfredo', 'Espaguetis con salsa Alfredo y pollo.', 11.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (11011, 11, 'Lasaña', 'Tradicional lasaña Entrepanes de boloñesa y salsa blanca.', 10.5, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (12, 1, 'Patacones rellenos', 12);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (12001, 12, 'Patacón sencillo', 'Tapas de patacón verde o maduro con lechuga, tomate, queso americano, queso blanco y un relleno a elegir: pollo, carne mechada o pernil de cerdo.', 12.95, '/images/entrepanes/patacon-sencillo.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (12002, 12, 'Patacón mixto', 'Tapas de patacón verde o maduro con lechuga, tomate, jamón, queso, salsas y dos rellenos a elegir: pollo, carne mechada o pernil de cerdo.', 15.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (12003, 12, 'Patacón carnívoro', 'Tapas de patacón rellenas de filete de res, queso telita, aguacate, lechuga, tomate y salsas.', 15.5, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (13, 1, 'Pollo', 13);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (13001, 13, 'Pollo Dr. Fit', 'Jugosa pechuga de pollo a la plancha con aguacate y ensalada griega. @iamdrfit Incluye dos contornos a elección.', 13.5, '/images/entrepanes/pollo-dr-fit.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (13002, 13, 'Pollo a la plancha', 'Jugosa pechuga de pollo a la plancha. Incluye dos contornos a elección.', 9.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (13003, 13, 'Pollo parmigiana', 'Milanesa de pollo apanada, gratinada con salsa marinara, queso mozzarella y parmesano. Incluye dos contornos a elección.', 13.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (13004, 13, 'Pollo teriyaki', 'Pollo troceado y salteado en nuestra deliciosa salsa teriyaki. Incluye dos contornos a elección.', 10.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (13005, 13, 'Pollo con champiñones', 'Tierna pechuga de pollo bañada en crema blanca con champiñones. Incluye dos contornos a elección.', 10.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (13006, 13, 'Pollo apanado', 'Crujiente pechuga de pollo rebozada. Incluye dos contornos a elección.', 10.95, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (14, 1, 'Alitas', 14);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (14001, 14, 'Alitas de pollo (6 unidades)', 'Bañadas en la salsa de su elección: Mongolian, Búfalo, BBQ o Ajo parmesano. Con aderezo de su preferencia.', 9.95, '/images/entrepanes/alitas-bbq.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (14002, 14, 'Alitas de pollo (10 unidades)', 'Bañadas en la salsa de su elección: Mongolian, Búfalo, BBQ o Ajo parmesano. Con aderezo de su preferencia.', 12.95, '/images/entrepanes/alitas-bbq.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (14003, 14, 'Boneless de pollo (6 unidades)', 'Apanados y bañados en la salsa de su elección: Mongolian, Búfalo, BBQ o Ajo parmesano. Con aderezo de su preferencia.', 9.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (14004, 14, 'Boneless de pollo (10 unidades)', 'Apanados y bañados en la salsa de su elección: Mongolian, Búfalo, BBQ o Ajo parmesano. Con aderezo de su preferencia.', 12.95, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (15, 1, 'Cerdo', 15);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (15001, 15, 'Chuletas BBQ', 'Corte ahumado de chuletas de cerdo en salsa BBQ.', 10.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (15002, 15, 'Costillas de cerdo BBQ', 'Tiernas costillas bañadas en salsa BBQ.', 10.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (15003, 15, 'Costillas chimichurri', 'Tiernas costillas de cerdo con nuestra famosa salsa chimichurri.', 10.5, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (16, 1, 'Pescados y camarones', 16);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (16001, 16, 'Cobia al ajillo', 'Filete de cobia servido con nuestra deliciosa y tradicional salsa al ajillo.', 17.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (16002, 16, 'Cobia a la crema', 'Filete de cobia asado y coronado con una delicada crema especial de la casa.', 19.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (16003, 16, 'Camarones al ajillo', 'Camarones frescos salteados con la tradicional salsa al ajillo.', 13.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (16004, 16, 'Camarones Bam Bam 🌶️', 'Camarones apanados bañados en salsa Bam Bam (picante).', 13.5, '/images/entrepanes/camarones-bam-bam.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (16005, 16, 'Salmón al grill', 'Jugoso filete de salmón al grill servido con ensalada griega.', 14.5, '/images/entrepanes/salmon-al-grill.jpg', 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (17, 1, 'Carnes y especialidades', 17);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (17001, 17, 'Pabellón criollo', 'Carne mechada, arroz blanco, caraotas negras, tajadas de plátano maduro y queso blanco.', 14.5, '/images/entrepanes/pabellon-criollo.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (17002, 17, 'Lomito chimichurri', 'Jugosa porción de filete de res coronada con la famosa salsa argentina.', 12.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (17003, 17, 'Mongolian beef', 'Filete de res troceado y salteado en nuestra salsa oriental estilo Mongolian, decorado con tiras de pimentón, cebolla y cebollín.', 13.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (17004, 17, 'Lomito salteado', 'Tiras de filete de res salteadas con apio, pimientos, zanahorias, cebollas.', 13.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (17005, 17, 'Lomito encebollado', 'Filete de lomito coronado con cebolla salteada.', 13.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (17006, 17, 'Dr. Fit Bites', 'Tiernos trozos de entraña al grill, vegetales salteados y aguacate. @iamdrfit', 13.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (17007, 17, 'Asado negro', 'Delicioso asado negro tradicional venezolano.', 15, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (17008, 17, 'Filet Mignon', 'Medallón de filete de res bordeado de bacon y bañado en salsa mignon.', 17.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (17009, 17, 'New York Steak', 'Fino corte importado de 8 oz. al grill.', 23.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (17010, 17, 'Entraña importada', 'Fino corte importado de 8 oz. al grill.', 26, '/images/entrepanes/entrana-importada.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (17011, 17, 'Parrilla mixta', 'Jugoso New York importado, filete de pollo al grill, acompañado de chorizo argentino, papas fritas, yuca frita, patacones, mini arepas, queso asado y chimichurri.', 32.5, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (18, 1, 'Pizzas', 18);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (18001, 18, 'Pizza de jamón', 'Pizza de 12" con salsa de tomate, mozzarella y jamón.', 12.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (18002, 18, 'Pizza de pepperoni', 'Pizza de 12" con salsa de tomate, mozzarella y pepperoni.', 12.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (18003, 18, 'Pizza margarita', 'Pizza de 12" con salsa de tomate, mozzarella, albahaca, ruedas de tomate y salsa pesto.', 12.5, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (19, 1, 'Hamburguesas', 19);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (19001, 19, 'Hamburguesa clásica', 'Hamburguesa de res o pollo con queso amarillo, lechuga, tomate, papas ralladas y salsas de la casa. Incluye papas fritas.', 11.5, '/images/entrepanes/hamburguesa-clasica.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (19002, 19, 'Hamburguesa de pollo', 'Pechuga crispy o a la plancha, queso asado, lechuga, tomate, jamón ahumado, queso americano, papas ralladas. Incluye papas fritas.', 11.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (19003, 19, 'Hamburguesa Maracucha', 'Carne de res, repollo rallado, queso americano, queso telita, jamón ahumado, papas ralladas y salsas de la casa. Incluye papas fritas.', 13.5, '/images/entrepanes/hamburguesa-maracucha.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (19004, 19, 'Hamburguesa Gringa', 'Carne de res, bacon, cebolla, queso americano, salsa BBQ, lechuga, pepinillos y tomate. Incluye papas fritas.', 13.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (19005, 19, 'Hamburguesa Vaquera', 'Carne de res, jamón, bacon, queso amarillo, queso blanco, lechuga, tomate, papas ralladas y salsas de la casa. Incluye papas fritas.', 14.95, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (20, 1, 'Hot dogs, pepitos y más', 20);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (20001, 20, 'Pepito sencillo', 'Pan francés relleno con queso amarillo, tomate, cebolla, papas ralladas y salsas de la casa. Relleno: pollo, filete de res o pernil.', 13.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (20002, 20, 'Pepito mixto', 'Pan francés relleno con queso amarillo, tomate, cebolla, papas ralladas y salsas de la casa, con dos rellenos: pollo, filete de res o pernil.', 15.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (20003, 20, 'Club House', 'Pollo crispy o a la plancha, jamón, queso americano, tomate, lechuga, salsas, servido con crujientes papas fritas.', 14.5, '/images/entrepanes/club-house.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (20004, 20, 'Hot Dog', 'Salchicha Beef Franks, tomate, cebolla, queso americano, papas ralladas, queso parmesano, salsas de la casa, acompañado de papas fritas.', 6.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (20005, 20, 'Dúo Hot Dog', 'Dos hot dogs con salchichas Beef Franks, tomate, cebolla, queso americano, papas ralladas, queso parmesano y salsas de la casa, acompañados de papas fritas.', 11.5, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (21, 1, 'Menú infantil', 21);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (21001, 21, 'Pizza infantil', 'Pizza de 8" con el sabor de su preferencia: pepperoni, margarita o jamón.', 8.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (21002, 21, 'Pasta infantil', 'Con su elección de nuestra salsa tradicional: Alfredo, carbonara o boloñesa.', 8.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (21003, 21, 'Mini hamburguesas', '2 mini hamburguesas con queso americano, salsas de la casa, papas ralladas y papas fritas.', 8.5, '/images/entrepanes/mini-hamburguesas.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (21004, 21, 'Boneless de pollo infantil', '6 unidades de boneless de pollo con papas fritas.', 9.95, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (22, 1, 'Bebidas calientes', 22);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22001, 22, 'Americano 8 oz', NULL, 2.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22002, 22, 'Americano 12 oz', NULL, 3.75, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22003, 22, 'Americano 16 oz', NULL, 4.75, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22004, 22, 'Latte o Cappuccino 8 oz', NULL, 3.95, '/images/entrepanes/cappuccino.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22005, 22, 'Latte o Cappuccino 12 oz', NULL, 4.95, '/images/entrepanes/cappuccino.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22006, 22, 'Latte o Cappuccino 16 oz', NULL, 5.95, '/images/entrepanes/cappuccino.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22007, 22, 'Espresso', NULL, 2.9, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22008, 22, 'Espresso doble', NULL, 3.25, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22009, 22, 'Macchiato', NULL, 3.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22010, 22, 'Macchiato doble', NULL, 3.95, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22011, 22, 'Mocaccino 8 oz', NULL, 4.25, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22012, 22, 'Mocaccino 12 oz', NULL, 5.25, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22013, 22, 'Mocaccino 16 oz', NULL, 6.25, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22014, 22, 'Chocolate caliente 8 oz', NULL, 3.8, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22015, 22, 'Chocolate caliente 12 oz', NULL, 4.6, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (22016, 22, 'Chocolate caliente 16 oz', NULL, 5.5, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (23, 1, 'Infusiones y té', 23);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (23001, 23, 'Infusión fría', 'Sabores: Lemongrass, Cranberry, Fresa Kiwi, Mango Flip, Herbal Chai, Advent Tea y Matcha.', 5, '/images/entrepanes/te-frio-cranberry.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (23002, 23, 'Infusión caliente', 'Sabores: Lemongrass, Cranberry, Fresa Kiwi, Mango Flip, Herbal Chai, Advent Tea y Matcha.', 5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (23003, 23, 'Té con leche', NULL, 3.75, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (23004, 23, 'Chai Latte', NULL, 4.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (23005, 23, 'Matcha Latte', NULL, 4.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (23006, 23, 'Nestea limón o durazno', NULL, 2.95, NULL, 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (24, 1, 'Bebidas frías', 24);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (24001, 24, 'Iced Americano 16 oz', NULL, 4.5, NULL, 20, 2);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (24002, 24, 'Iced Cappuccino 16 oz', NULL, 4.95, NULL, 20, 2);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (24003, 24, 'Iced Latte 16 oz', NULL, 4.95, NULL, 20, 2);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (24004, 24, 'Iced Mocaccino 16 oz', NULL, 4.95, NULL, 20, 2);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (24005, 24, 'Frappé 16 oz', 'Opciones: chocolate, vainilla, cookies and cream, mocca o café caramelo.', 5, NULL, 20, 2);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (24006, 24, 'Jugo natural', 'Opciones: piña, melón, papaya, mora, fresa, limonada, raspadura con limón, mango, lulo y guanábana.', 4.5, NULL, 20, 2);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (24007, 24, 'Jugo de naranja', NULL, 5.5, NULL, 20, 2);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (25, 1, 'Recomendados', 25);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (25001, 25, 'Batido de banana - fresa', NULL, 5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (25002, 25, 'Merengada de Oreo', NULL, 5, '/images/entrepanes/merengada-oreo.jpg', 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (25003, 25, 'Merengada de chocolate', NULL, 4.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (25004, 25, 'Toddy', 'Tradicional bebida venezolana con sabor a chocolate.', 5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (25005, 25, 'Cerveza sin alcohol', NULL, 3, '/images/entrepanes/cerveza-sin-alcohol.jpg', 20, 1);

INSERT INTO "Category" ("id", "localId", "nombre", "orden") VALUES (26, 1, 'Adicionales', 26);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (26001, 26, 'Rueda de queso telita adicional', 'Para arepas y patacones.', 2.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (26002, 26, 'Huevo adicional (Club House)', NULL, 1, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (26003, 26, 'Leche vegetal (bebida caliente 8 oz)', 'Almendras, soya, avena o coco.', 0.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (26004, 26, 'Leche vegetal (bebida caliente 12 oz)', 'Almendras, soya, avena o coco.', 0.75, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (26005, 26, 'Leche vegetal (bebida caliente 16 oz)', 'Almendras, soya, avena o coco.', 1, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (26006, 26, 'Leche regular (bebida fría)', NULL, 0.5, NULL, 20, 1);
INSERT INTO "Product" ("id", "categoryId", "nombre", "descripcion", "precio", "imagen", "stock", "kitchenId") VALUES (26007, 26, 'Leche vegetal (bebida fría)', 'Almendras, soya, avena o coco.', 1, NULL, 20, 1);
