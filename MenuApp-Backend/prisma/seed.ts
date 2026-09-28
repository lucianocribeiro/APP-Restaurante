import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const IMG = '/images/entrepanes';
const DOS_CONTORNOS = 'Incluye dos contornos a elección.';

type Item = {
  nombre: string;
  precio: number;
  descripcion?: string;
  imagen?: string;
};

type Section = {
  nombre: string;
  items: Item[];
};

const MENU: Section[] = [
  {
    nombre: 'Entradas',
    items: [
      { nombre: 'Tequeños (6 unidades)', precio: 7.5, imagen: `${IMG}/tequenos.jpg` },
      { nombre: 'Tequeños (12 unidades)', precio: 13.5, imagen: `${IMG}/tequenos.jpg` },
      { nombre: 'Mini empanadas (6 unidades)', precio: 7.5, descripcion: 'Pollo, carne mechada, queso.' },
      { nombre: 'Mini empanadas (12 unidades)', precio: 13.5, descripcion: 'Pollo, carne mechada, queso.' },
      { nombre: 'Canastas de patacón', precio: 9.95, descripcion: 'Mini canastas rellenas con pollo, pernil o carne mechada. Ración de 3.' },
      { nombre: 'Sopa del día', precio: 7.5, descripcion: 'Preguntar por la opción de hoy.' },
    ],
  },
  {
    nombre: 'Desayunos',
    items: [
      { nombre: 'Desayuno Dr. Fit', precio: 12.0, descripcion: 'Huevos al gusto con vegetales o jamón y queso, acompañados de queso a la plancha, bacon y aguacate. @iamdrfit' },
      { nombre: 'Desayuno Criollo', precio: 12.95, descripcion: 'Caraotas negras acompañadas con queso blanco y su elección de: carne mechada, pollo o cazón. Opción de arepa, pan o waffle.', imagen: `${IMG}/desayuno-criollo.jpg` },
      { nombre: 'Desayuno Americano', precio: 10.95, descripcion: 'Huevos al gusto con vegetales o jamón y queso, acompañados de bacon, queso. Opción de pan tostado, arepa o waffle.', imagen: `${IMG}/desayuno-americano.jpg` },
      { nombre: 'Desayuno Entrepanes', precio: 11.95, descripcion: 'Huevos al gusto con vegetales o jamón y queso asado, acompañados con bacon. Opción de pan, arepa o waffle.', imagen: `${IMG}/desayuno-entrepanes.jpg` },
      { nombre: 'Pancakes', precio: 7.5, descripcion: 'Tres deliciosos pancakes espolvoreados con azúcar, acompañados de sirope clásico y fresas.', imagen: `${IMG}/pancakes.jpg` },
      { nombre: 'Yogurt Parfait', precio: 7.95, descripcion: 'Yogurt natural, acompañado de granola y endulzado con miel, coronado con frutas de temporada.', imagen: `${IMG}/yogurt-parfait.jpg` },
    ],
  },
  {
    nombre: 'Emparedados',
    items: [
      { nombre: 'Emparedado con huevo', precio: 8.5, descripcion: 'Pan tostado, huevos revueltos, jamón y queso gouda, acompañado con papas fritas.' },
      { nombre: 'Emparedado de jamón y queso', precio: 8.5, descripcion: 'Pan de la casa relleno con delicioso jamón ahumado, queso americano, lechuga y tomate, acompañado de papas fritas y salsas.' },
      { nombre: 'Emparedado Caprese', precio: 9.95, descripcion: 'Pan crujiente, queso mozzarella, tomate, lechuga y pesto, acompañado con papas fritas.' },
      { nombre: 'Emparedado de pernil', precio: 12.5, descripcion: 'Pernil de cerdo horneado, queso gouda, tomate, lechuga y salsas, acompañado con papas fritas.', imagen: `${IMG}/emparedado-pernil.jpg` },
      { nombre: 'Emparedado de pollo', precio: 11.0, descripcion: 'Pechuga a la plancha, queso gouda, tomate, lechuga y salsas, acompañado con papas fritas.' },
      { nombre: 'Emparedado de lomito', precio: 12.5, descripcion: 'Filete de res troceado, queso gouda, lechuga, tomate y salsas, acompañado con papas fritas.' },
      { nombre: 'Bocadillo Ibérico', precio: 9.95, descripcion: 'Crujiente pan gallego, jamón serrano, queso semicurado y aceite de oliva, acompañado con papas fritas. Opción con tomate.' },
    ],
  },
  {
    nombre: 'Empanadas, tequeños y más',
    items: [
      { nombre: 'Cachito de jamón', precio: 3.5 },
      { nombre: 'Cachito de jamón y queso crema', precio: 3.75 },
      { nombre: 'Cachito de jamón y queso gouda', precio: 3.75 },
      { nombre: 'Cachito de pavo y queso', precio: 3.75 },
      { nombre: 'Cachito de queso', precio: 3.75 },
      { nombre: 'Empanada frita', precio: 2.85, descripcion: 'Carne mechada, pollo, queso blanco o carne molida.' },
      { nombre: 'Empanada frita de cazón', precio: 3.5 },
      { nombre: 'Empanada frita de pabellón', precio: 3.75 },
      { nombre: 'Empanada horneada', precio: 3.25, descripcion: 'Carne, pollo, jamón y queso.' },
      { nombre: 'Tequeño boquita (6 unidades)', precio: 7.5, imagen: `${IMG}/tequenos.jpg` },
      { nombre: 'Tequeño boquita (12 unidades)', precio: 13.5, imagen: `${IMG}/tequenos.jpg` },
      { nombre: 'Tequeñón', precio: 3.0 },
      { nombre: 'Tequeyoyo', precio: 3.0 },
    ],
  },
  {
    nombre: 'Arepas',
    items: [
      { nombre: 'Arepa de carne asada', precio: 9.5, descripcion: 'Rellena de filete de res al grill, pico de gallo y queso blanco o amarillo.' },
      { nombre: 'Arepa pabellón', precio: 8.95, descripcion: 'Carne mechada, caraotas negras, plátano maduro y queso blanco.' },
      { nombre: 'Arepa de pollo y queso', precio: 7.5, descripcion: 'Pollo mechado con queso blanco o amarillo.' },
      { nombre: 'Arepa perico', precio: 7.5, descripcion: 'Huevos revueltos con vegetales y queso blanco o amarillo.' },
      { nombre: 'Arepa de jamón y queso', precio: 7.5, descripcion: 'Jamón y queso blanco o amarillo.' },
      { nombre: 'Arepa de queso telita', precio: 7.5, descripcion: 'Rellena con dos deliciosas ruedas de queso blanco arepero.' },
      { nombre: 'Arepa de carne mechada y queso', precio: 8.5, descripcion: 'Rellena de nuestra famosa carne mechada con queso blanco o amarillo.', imagen: `${IMG}/arepa-carne-mechada.jpg` },
      { nombre: 'Arepa de pernil', precio: 8.5, descripcion: 'Pernil de cerdo horneado con queso blanco o amarillo.' },
      { nombre: 'Arepa Reina Pepiada', precio: 7.5, descripcion: 'Mezcla de pollo mechado, aguacate, cebolla, mayonesa y cilantro.' },
      { nombre: 'Mini arepas surtidas', precio: 9.95, descripcion: 'Tres mini arepas rellenas. Opciones: pernil, pollo, carne mechada, queso blanco o amarillo.' },
    ],
  },
  {
    nombre: 'Cachapas',
    items: [
      { nombre: 'Cachapa de queso', precio: 11.95, descripcion: 'Rellena de queso telita, coronada con queso blanco rallado.' },
      { nombre: 'Cachapa de cerdo frito', precio: 14.5, descripcion: 'Queso telita, cerdo frito y queso blanco rallado.' },
      { nombre: 'Cachapa de carne mechada o pollo', precio: 14.5, descripcion: 'Queso telita y jugosa carne mechada o pollo y queso blanco rallado.' },
      { nombre: 'Cachapa pabellón', precio: 15.95, descripcion: 'Queso telita, carne mechada, caraotas negras, plátano maduro.', imagen: `${IMG}/cachapa-pabellon.jpg` },
      { nombre: 'Cachapa de pernil', precio: 14.5, descripcion: 'Queso telita, pernil de cerdo horneado.' },
    ],
  },
  {
    nombre: 'Croissants',
    items: [
      { nombre: 'Croissant Entrepanes', precio: 3.95, descripcion: 'Delicioso croissant de mantequilla relleno de jamón ahumado y queso americano.', imagen: `${IMG}/croissant-entrepanes.jpg` },
      { nombre: 'Croissant Americano', precio: 5.5, descripcion: 'Relleno con tortilla de huevo, bacon y queso americano.' },
      { nombre: 'Croissant Ibérico', precio: 6.0, descripcion: 'Relleno con jamón serrano y queso semicurado.' },
      { nombre: 'Croissant Español', precio: 5.5, descripcion: 'Combinación de queso gouda con chorizo español.' },
      { nombre: 'Croissant Fitness', precio: 5.5, descripcion: 'Jamón de pavo y queso mozzarella.' },
      { nombre: 'Croissant de Nutella', precio: 4.5, descripcion: 'Relleno de Nutella y espolvoreado con azúcar glas.' },
    ],
  },
  {
    nombre: 'Waffles y tostadas',
    items: [
      { nombre: 'Waffle relleno con huevo', precio: 9.5, descripcion: 'Rellenos con huevo, bacon y queso americano.', imagen: `${IMG}/waffle-huevo.jpg` },
      { nombre: 'Waffle de Nutella', precio: 8.85, descripcion: 'Rellenos de Nutella y coronados con crema y azúcar glas.' },
      { nombre: 'Tostada Francesa', precio: 10.5, descripcion: 'Pan artesanal dorado, bañado en vino de Jerez y servido con frutas frescas de temporada y frosting de queso crema.', imagen: `${IMG}/tostada-francesa.jpg` },
    ],
  },
  {
    nombre: 'Bowls de ensalada',
    items: [
      { nombre: 'Entrepanes Bowl', precio: 11.0, descripcion: 'Salmón sobre cama de lechuga, quinoa, aguacate, zanahorias salteadas y tomates cherry.' },
      { nombre: 'Guadalajara Bowl', precio: 10.5, descripcion: 'Nachos, pollo asado, maíz, aguacate, tomates cherry, pimientos y cebolla salteada, mix de lechuga.', imagen: `${IMG}/guadalajara-bowl.jpg` },
      { nombre: 'Ensalada César', precio: 8.0, descripcion: 'Lechuga, crotones de ajo con mantequilla, queso parmesano, bacon y aderezo césar.' },
      { nombre: 'Ensalada César con pollo', precio: 9.5, descripcion: 'Lechuga, crotones de ajo con mantequilla, queso parmesano, bacon, aderezo césar y pollo.' },
      { nombre: 'Ensalada César con camarones', precio: 13.0, descripcion: 'Lechuga, crotones de ajo con mantequilla, queso parmesano, bacon, aderezo césar y camarones.' },
      { nombre: 'Ensalada Mediterránea', precio: 10.5, descripcion: 'Lechuga, pollo, aguacate, tomates cherry, zanahorias salteadas y queso de cabra.' },
    ],
  },
  {
    nombre: 'Wraps',
    items: [
      { nombre: 'Wrap César', precio: 8.5, descripcion: 'Lechuga, pollo troceado, queso parmesano, crotones y bacon.' },
      { nombre: 'Wrap de salmón', precio: 9.95, descripcion: 'Lechuga, salmón, aceitunas negras, tomates cherry y cebollas caramelizadas.', imagen: `${IMG}/wrap-salmon.jpg` },
      { nombre: 'Wrap Granjero', precio: 9.95, descripcion: 'Trozos de pechuga apanados, queso americano, bacon, lechuga, cebolla, tomate y salsas.' },
      { nombre: 'Wrap Carnívoro', precio: 11.95, descripcion: 'Trozos de carne de res, queso americano, bacon, lechuga, tomate, cebolla y salsas.' },
    ],
  },
  {
    nombre: 'Pastas',
    items: [
      { nombre: 'Pasta boloñesa', precio: 10.5, descripcion: 'Espaguetis con la deliciosa y tradicional salsa boloñesa de carne y tomate estilo Entrepanes.' },
      { nombre: 'Pasta carbonara', precio: 11.5, descripcion: 'Espaguetis con la tradicional salsa blanca.' },
      { nombre: 'Pasta al pesto', precio: 9.5, descripcion: 'Espaguetis con pesto de albahaca y almendras.' },
      { nombre: 'Pasta al pesto con pollo', precio: 12.0, descripcion: 'Espaguetis con pesto de albahaca y almendras, con pollo.' },
      { nombre: 'Pasta al pesto con camarones', precio: 14.0, descripcion: 'Espaguetis con pesto de albahaca y almendras, con camarones.' },
      { nombre: 'Pasta con camarones', precio: 13.0, descripcion: 'Espaguetis con deliciosos camarones cocidos en salsa blanca, mantequilla y ajo.' },
      { nombre: 'Pasta al olio', precio: 10.5, descripcion: 'Espaguetis servidos con salsa de aceite de oliva, ajo laminado, tomates cherry y perejil.' },
      { nombre: 'Pasta al olio con pollo', precio: 11.5, descripcion: 'Espaguetis al olio con pollo.' },
      { nombre: 'Pasta al olio con camarones', precio: 13.5, descripcion: 'Espaguetis al olio con camarones.', imagen: `${IMG}/pasta-al-olio-camarones.jpg` },
      { nombre: 'Pasta Alfredo', precio: 11.5, descripcion: 'Espaguetis con salsa Alfredo y pollo.' },
      { nombre: 'Lasaña', precio: 10.5, descripcion: 'Tradicional lasaña Entrepanes de boloñesa y salsa blanca.' },
    ],
  },
  {
    nombre: 'Patacones rellenos',
    items: [
      { nombre: 'Patacón sencillo', precio: 12.95, descripcion: 'Tapas de patacón verde o maduro con lechuga, tomate, queso americano, queso blanco y un relleno a elegir: pollo, carne mechada o pernil de cerdo.', imagen: `${IMG}/patacon-sencillo.jpg` },
      { nombre: 'Patacón mixto', precio: 15.5, descripcion: 'Tapas de patacón verde o maduro con lechuga, tomate, jamón, queso, salsas y dos rellenos a elegir: pollo, carne mechada o pernil de cerdo.' },
      { nombre: 'Patacón carnívoro', precio: 15.5, descripcion: 'Tapas de patacón rellenas de filete de res, queso telita, aguacate, lechuga, tomate y salsas.' },
    ],
  },
  {
    nombre: 'Pollo',
    items: [
      { nombre: 'Pollo Dr. Fit', precio: 13.5, descripcion: `Jugosa pechuga de pollo a la plancha con aguacate y ensalada griega. @iamdrfit ${DOS_CONTORNOS}`, imagen: `${IMG}/pollo-dr-fit.jpg` },
      { nombre: 'Pollo a la plancha', precio: 9.95, descripcion: `Jugosa pechuga de pollo a la plancha. ${DOS_CONTORNOS}` },
      { nombre: 'Pollo parmigiana', precio: 13.5, descripcion: `Milanesa de pollo apanada, gratinada con salsa marinara, queso mozzarella y parmesano. ${DOS_CONTORNOS}` },
      { nombre: 'Pollo teriyaki', precio: 10.95, descripcion: `Pollo troceado y salteado en nuestra deliciosa salsa teriyaki. ${DOS_CONTORNOS}` },
      { nombre: 'Pollo con champiñones', precio: 10.95, descripcion: `Tierna pechuga de pollo bañada en crema blanca con champiñones. ${DOS_CONTORNOS}` },
      { nombre: 'Pollo apanado', precio: 10.95, descripcion: `Crujiente pechuga de pollo rebozada. ${DOS_CONTORNOS}` },
    ],
  },
  {
    nombre: 'Alitas',
    items: [
      { nombre: 'Alitas de pollo (6 unidades)', precio: 9.95, descripcion: 'Bañadas en la salsa de su elección: Mongolian, Búfalo, BBQ o Ajo parmesano. Con aderezo de su preferencia.', imagen: `${IMG}/alitas-bbq.jpg` },
      { nombre: 'Alitas de pollo (10 unidades)', precio: 12.95, descripcion: 'Bañadas en la salsa de su elección: Mongolian, Búfalo, BBQ o Ajo parmesano. Con aderezo de su preferencia.', imagen: `${IMG}/alitas-bbq.jpg` },
      { nombre: 'Boneless de pollo (6 unidades)', precio: 9.95, descripcion: 'Apanados y bañados en la salsa de su elección: Mongolian, Búfalo, BBQ o Ajo parmesano. Con aderezo de su preferencia.' },
      { nombre: 'Boneless de pollo (10 unidades)', precio: 12.95, descripcion: 'Apanados y bañados en la salsa de su elección: Mongolian, Búfalo, BBQ o Ajo parmesano. Con aderezo de su preferencia.' },
    ],
  },
  {
    nombre: 'Cerdo',
    items: [
      { nombre: 'Chuletas BBQ', precio: 10.5, descripcion: 'Corte ahumado de chuletas de cerdo en salsa BBQ.' },
      { nombre: 'Costillas de cerdo BBQ', precio: 10.5, descripcion: 'Tiernas costillas bañadas en salsa BBQ.' },
      { nombre: 'Costillas chimichurri', precio: 10.5, descripcion: 'Tiernas costillas de cerdo con nuestra famosa salsa chimichurri.' },
    ],
  },
  {
    nombre: 'Pescados y camarones',
    items: [
      { nombre: 'Cobia al ajillo', precio: 17.5, descripcion: 'Filete de cobia servido con nuestra deliciosa y tradicional salsa al ajillo.' },
      { nombre: 'Cobia a la crema', precio: 19.5, descripcion: 'Filete de cobia asado y coronado con una delicada crema especial de la casa.' },
      { nombre: 'Camarones al ajillo', precio: 13.5, descripcion: 'Camarones frescos salteados con la tradicional salsa al ajillo.' },
      { nombre: 'Camarones Bam Bam 🌶️', precio: 13.5, descripcion: 'Camarones apanados bañados en salsa Bam Bam (picante).', imagen: `${IMG}/camarones-bam-bam.jpg` },
      { nombre: 'Salmón al grill', precio: 14.5, descripcion: 'Jugoso filete de salmón al grill servido con ensalada griega.', imagen: `${IMG}/salmon-al-grill.jpg` },
    ],
  },
  {
    nombre: 'Carnes y especialidades',
    items: [
      { nombre: 'Pabellón criollo', precio: 14.5, descripcion: 'Carne mechada, arroz blanco, caraotas negras, tajadas de plátano maduro y queso blanco.', imagen: `${IMG}/pabellon-criollo.jpg` },
      { nombre: 'Lomito chimichurri', precio: 12.5, descripcion: 'Jugosa porción de filete de res coronada con la famosa salsa argentina.' },
      { nombre: 'Mongolian beef', precio: 13.5, descripcion: 'Filete de res troceado y salteado en nuestra salsa oriental estilo Mongolian, decorado con tiras de pimentón, cebolla y cebollín.' },
      { nombre: 'Lomito salteado', precio: 13.5, descripcion: 'Tiras de filete de res salteadas con apio, pimientos, zanahorias, cebollas.' },
      { nombre: 'Lomito encebollado', precio: 13.95, descripcion: 'Filete de lomito coronado con cebolla salteada.' },
      { nombre: 'Dr. Fit Bites', precio: 13.5, descripcion: 'Tiernos trozos de entraña al grill, vegetales salteados y aguacate. @iamdrfit' },
      { nombre: 'Asado negro', precio: 15.0, descripcion: 'Delicioso asado negro tradicional venezolano.' },
      { nombre: 'Filet Mignon', precio: 17.95, descripcion: 'Medallón de filete de res bordeado de bacon y bañado en salsa mignon.' },
      { nombre: 'New York Steak', precio: 23.5, descripcion: 'Fino corte importado de 8 oz. al grill.' },
      { nombre: 'Entraña importada', precio: 26.0, descripcion: 'Fino corte importado de 8 oz. al grill.', imagen: `${IMG}/entrana-importada.jpg` },
      { nombre: 'Parrilla mixta', precio: 32.5, descripcion: 'Jugoso New York importado, filete de pollo al grill, acompañado de chorizo argentino, papas fritas, yuca frita, patacones, mini arepas, queso asado y chimichurri.' },
    ],
  },
  {
    nombre: 'Pizzas',
    items: [
      { nombre: 'Pizza de jamón', precio: 12.5, descripcion: 'Pizza de 12" con salsa de tomate, mozzarella y jamón.' },
      { nombre: 'Pizza de pepperoni', precio: 12.5, descripcion: 'Pizza de 12" con salsa de tomate, mozzarella y pepperoni.' },
      { nombre: 'Pizza margarita', precio: 12.5, descripcion: 'Pizza de 12" con salsa de tomate, mozzarella, albahaca, ruedas de tomate y salsa pesto.' },
    ],
  },
  {
    nombre: 'Hamburguesas',
    items: [
      { nombre: 'Hamburguesa clásica', precio: 11.5, descripcion: 'Hamburguesa de res o pollo con queso amarillo, lechuga, tomate, papas ralladas y salsas de la casa. Incluye papas fritas.', imagen: `${IMG}/hamburguesa-clasica.jpg` },
      { nombre: 'Hamburguesa de pollo', precio: 11.5, descripcion: 'Pechuga crispy o a la plancha, queso asado, lechuga, tomate, jamón ahumado, queso americano, papas ralladas. Incluye papas fritas.' },
      { nombre: 'Hamburguesa Maracucha', precio: 13.5, descripcion: 'Carne de res, repollo rallado, queso americano, queso telita, jamón ahumado, papas ralladas y salsas de la casa. Incluye papas fritas.', imagen: `${IMG}/hamburguesa-maracucha.jpg` },
      { nombre: 'Hamburguesa Gringa', precio: 13.5, descripcion: 'Carne de res, bacon, cebolla, queso americano, salsa BBQ, lechuga, pepinillos y tomate. Incluye papas fritas.' },
      { nombre: 'Hamburguesa Vaquera', precio: 14.95, descripcion: 'Carne de res, jamón, bacon, queso amarillo, queso blanco, lechuga, tomate, papas ralladas y salsas de la casa. Incluye papas fritas.' },
    ],
  },
  {
    nombre: 'Hot dogs, pepitos y más',
    items: [
      { nombre: 'Pepito sencillo', precio: 13.95, descripcion: 'Pan francés relleno con queso amarillo, tomate, cebolla, papas ralladas y salsas de la casa. Relleno: pollo, filete de res o pernil.' },
      { nombre: 'Pepito mixto', precio: 15.95, descripcion: 'Pan francés relleno con queso amarillo, tomate, cebolla, papas ralladas y salsas de la casa, con dos rellenos: pollo, filete de res o pernil.' },
      { nombre: 'Club House', precio: 14.5, descripcion: 'Pollo crispy o a la plancha, jamón, queso americano, tomate, lechuga, salsas, servido con crujientes papas fritas.', imagen: `${IMG}/club-house.jpg` },
      { nombre: 'Hot Dog', precio: 6.95, descripcion: 'Salchicha Beef Franks, tomate, cebolla, queso americano, papas ralladas, queso parmesano, salsas de la casa, acompañado de papas fritas.' },
      { nombre: 'Dúo Hot Dog', precio: 11.5, descripcion: 'Dos hot dogs con salchichas Beef Franks, tomate, cebolla, queso americano, papas ralladas, queso parmesano y salsas de la casa, acompañados de papas fritas.' },
    ],
  },
  {
    nombre: 'Menú infantil',
    items: [
      { nombre: 'Pizza infantil', precio: 8.5, descripcion: 'Pizza de 8" con el sabor de su preferencia: pepperoni, margarita o jamón.' },
      { nombre: 'Pasta infantil', precio: 8.5, descripcion: 'Con su elección de nuestra salsa tradicional: Alfredo, carbonara o boloñesa.' },
      { nombre: 'Mini hamburguesas', precio: 8.5, descripcion: '2 mini hamburguesas con queso americano, salsas de la casa, papas ralladas y papas fritas.', imagen: `${IMG}/mini-hamburguesas.jpg` },
      { nombre: 'Boneless de pollo infantil', precio: 9.95, descripcion: '6 unidades de boneless de pollo con papas fritas.' },
    ],
  },
  {
    nombre: 'Bebidas calientes',
    items: [
      { nombre: 'Americano 8 oz', precio: 2.95 },
      { nombre: 'Americano 12 oz', precio: 3.75 },
      { nombre: 'Americano 16 oz', precio: 4.75 },
      { nombre: 'Latte o Cappuccino 8 oz', precio: 3.95, imagen: `${IMG}/cappuccino.jpg` },
      { nombre: 'Latte o Cappuccino 12 oz', precio: 4.95, imagen: `${IMG}/cappuccino.jpg` },
      { nombre: 'Latte o Cappuccino 16 oz', precio: 5.95, imagen: `${IMG}/cappuccino.jpg` },
      { nombre: 'Espresso', precio: 2.9 },
      { nombre: 'Espresso doble', precio: 3.25 },
      { nombre: 'Macchiato', precio: 3.5 },
      { nombre: 'Macchiato doble', precio: 3.95 },
      { nombre: 'Mocaccino 8 oz', precio: 4.25 },
      { nombre: 'Mocaccino 12 oz', precio: 5.25 },
      { nombre: 'Mocaccino 16 oz', precio: 6.25 },
      { nombre: 'Chocolate caliente 8 oz', precio: 3.8 },
      { nombre: 'Chocolate caliente 12 oz', precio: 4.6 },
      { nombre: 'Chocolate caliente 16 oz', precio: 5.5 },
    ],
  },
  {
    nombre: 'Infusiones y té',
    items: [
      { nombre: 'Infusión fría', precio: 5.0, descripcion: 'Sabores: Lemongrass, Cranberry, Fresa Kiwi, Mango Flip, Herbal Chai, Advent Tea y Matcha.', imagen: `${IMG}/te-frio-cranberry.jpg` },
      { nombre: 'Infusión caliente', precio: 5.0, descripcion: 'Sabores: Lemongrass, Cranberry, Fresa Kiwi, Mango Flip, Herbal Chai, Advent Tea y Matcha.' },
      { nombre: 'Té con leche', precio: 3.75 },
      { nombre: 'Chai Latte', precio: 4.5 },
      { nombre: 'Matcha Latte', precio: 4.5 },
      { nombre: 'Nestea limón o durazno', precio: 2.95 },
    ],
  },
  {
    nombre: 'Bebidas frías',
    items: [
      { nombre: 'Iced Americano 16 oz', precio: 4.5 },
      { nombre: 'Iced Cappuccino 16 oz', precio: 4.95 },
      { nombre: 'Iced Latte 16 oz', precio: 4.95 },
      { nombre: 'Iced Mocaccino 16 oz', precio: 4.95 },
      { nombre: 'Frappé 16 oz', precio: 5.0, descripcion: 'Opciones: chocolate, vainilla, cookies and cream, mocca o café caramelo.' },
      { nombre: 'Jugo natural', precio: 4.5, descripcion: 'Opciones: piña, melón, papaya, mora, fresa, limonada, raspadura con limón, mango, lulo y guanábana.' },
      { nombre: 'Jugo de naranja', precio: 5.5 },
    ],
  },
  {
    nombre: 'Recomendados',
    items: [
      { nombre: 'Batido de banana - fresa', precio: 5.0 },
      { nombre: 'Merengada de Oreo', precio: 5.0, imagen: `${IMG}/merengada-oreo.jpg` },
      { nombre: 'Merengada de chocolate', precio: 4.5 },
      { nombre: 'Toddy', precio: 5.0, descripcion: 'Tradicional bebida venezolana con sabor a chocolate.' },
      { nombre: 'Cerveza sin alcohol', precio: 3.0, imagen: `${IMG}/cerveza-sin-alcohol.jpg` },
    ],
  },
  {
    nombre: 'Adicionales',
    items: [
      { nombre: 'Rueda de queso telita adicional', precio: 2.5, descripcion: 'Para arepas y patacones.' },
      { nombre: 'Huevo adicional (Club House)', precio: 1.0 },
      { nombre: 'Leche vegetal (bebida caliente 8 oz)', precio: 0.5, descripcion: 'Almendras, soya, avena o coco.' },
      { nombre: 'Leche vegetal (bebida caliente 12 oz)', precio: 0.75, descripcion: 'Almendras, soya, avena o coco.' },
      { nombre: 'Leche vegetal (bebida caliente 16 oz)', precio: 1.0, descripcion: 'Almendras, soya, avena o coco.' },
      { nombre: 'Leche regular (bebida fría)', precio: 0.5 },
      { nombre: 'Leche vegetal (bebida fría)', precio: 1.0, descripcion: 'Almendras, soya, avena o coco.' },
    ],
  },
];

async function main() {
  console.log('🧹 Limpiando base de datos...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.kitchen.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.user.deleteMany();
  await prisma.local.deleteMany();

  console.log('🏗️ Creando Local: Entrepanes...');
  const local = await prisma.local.create({
    data: {
      nombre: 'Entrepanes',
      slug: 'entrepanes',
      logo: `${IMG}/logo.jpg`,
      linkPago: 'https://checkout.baccredomatic.com/YWUwYmUzMjIyMTg5NTUuN2FiNjlmMjkxNzkwMDkwOTI2',
    },
  });

  console.log('👤 Creando Administrador...');
  await prisma.user.create({
    data: {
      email: 'admin@menuapp.com',
      password: await bcrypt.hash('admin123', 10),
      rol: 'owner',
      localId: local.id,
    },
  });

  console.log('🪑 Creando Mesas...');
  await prisma.table.createMany({
    data: [...Array.from({ length: 10 }, (_, i) => String(i + 1)), 'Barra'].map((numero) => ({
      numero,
      localId: local.id,
    })),
  });

  console.log('📂 Creando Categorías y Productos...');
  let totalProductos = 0;
  for (const [index, section] of MENU.entries()) {
    const categoria = await prisma.category.create({
      data: { nombre: section.nombre, orden: index + 1, localId: local.id },
    });
    await prisma.product.createMany({
      data: section.items.map((item) => ({ ...item, categoryId: categoria.id })),
    });
    totalProductos += section.items.length;
  }

  console.log(`✅ Entrepanes listo: ${MENU.length} categorías, ${totalProductos} productos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
