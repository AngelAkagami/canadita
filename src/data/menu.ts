/**
 * Contenido de la carta "Sugerencias del chef" de La Cañadita Restaurant.
 *
 * FUENTE: transcripción oficial facilitada por el cliente, verificada contra
 * recursos/sugerencias-chef.pdf (4 páginas, original intacto; el PDF no se
 * publica en la página). La estructura de categorías
 * corresponde a los encabezados del PDF: Entradas, Cremas y sopas, Ensaladas,
 * Pastas, Aves, Pescados y mariscos, Carnes y Postres.
 *
 * Los nombres, descripciones y precios deben respetarse tal como están aquí.
 * NO editar sin verificar contra el documento oficial.
 */

export interface Plato {
  nombre: string;
  descripcion?: string;
  /** Precio tal como aparece en la carta, en pesos mexicanos. */
  precio: string;
  /** Peso, piezas u observaciones adicionales que incluye la carta. */
  nota?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  platillos: Plato[];
}

export const menuSugerencias: Categoria[] = [
  {
    id: 'entradas',
    nombre: 'Entradas',
    platillos: [
      {
        nombre: 'Trilogía de maíz',
        descripcion:
          'Mini itacates o sopecitos (3 pzas) de masa de maíz, hechos a mano y acompañados de cecina, longaniza y arrachera. Se complementan con crema, queso fresco y salsas de la casa.',
        precio: '$210',
      },
      {
        nombre: 'Guacamole',
        descripcion:
          'Preparado con aguacate cremoso, cebolla, chile serrano, cilantro y un toque de limón, servido con totopos sazonados.',
        precio: '$220',
      },
      {
        nombre: 'Queso rústico',
        descripcion:
          'Con salsa de jitomates cherry, cebolla morada toque de chimichurri y brotes de chícharo.',
        precio: '$180',
      },
      {
        nombre: 'Tartar de salmón',
        descripcion:
          'Preparado con mango, pepino y cebolla morada, marinado con salsa ponzu y un toque de cítricos.',
        precio: '$270',
      },
      {
        nombre: 'Tiradito de atún',
        descripcion: 'Delicadamente marinado en salsa de cítricos y jengibre fresco.',
        precio: '$280',
      },
      {
        nombre: 'Ceviche de robalo',
        descripcion:
          'Robalo fresco marinado en leche de tigre de coco con jengibre y un toque de chile serrano.',
        precio: '$280',
      },
    ],
  },
  {
    id: 'cremas-y-sopas',
    nombre: 'Cremas y sopas',
    platillos: [
      {
        nombre: 'Sopa de tortilla',
        descripcion:
          'Caldo de fideos artesanales, servido con queso fresco, crema, chicharrón y una crujiente serpentina de tortilla.',
        precio: '$170',
      },
      {
        nombre: 'La milpa',
        descripcion:
          'Crema de flor de calabaza sobre elote tierno y calabacita, cocinados suavemente para conservar el sabor natural de cada ingrediente, terminado con hierbas frescas.',
        precio: '$185',
      },
      {
        nombre: 'Verde de poblano',
        descripcion:
          'Crema tersa y profunda, coronada con rajas de chile poblano y granos de elote salteados.',
        precio: '$210',
      },
      {
        nombre: 'Caldo tlalpeño',
        descripcion:
          'Elaborado con zanahoria, apio, papa y garbanzo, con un sutil toque de chipotle. Servido con arroz, pollo deshebrado, aguacate y quesillo.',
        precio: '$185',
      },
    ],
  },
  {
    id: 'ensaladas',
    nombre: 'Ensaladas',
    platillos: [
      {
        nombre: 'Ensalada higos, burrata y miel',
        descripcion:
          'Higos frescos abiertos, acompañados de burrata cremosa, jamón serrano y coronados con nuez de Castilla tostada, dispuestos con cuidado sobre una cama de lechuga baby y terminados con una vinagreta de agave suave.',
        precio: '$285',
      },
      {
        nombre: 'Ensalada césar',
        descripcion:
          'Lechuga romana fresca con aderezo César a la manera clásica, con crotones dorados y queso parmesano rallado.',
        precio: '$190',
        nota: 'Agrega pollo (120 g) +$100',
      },
      {
        nombre: 'Ensalada de betabel',
        descripcion:
          'Lechuga mixta con arúgula, betabel rostizado (rojo y golden), queso de cabra, nuez, frambuesas y reducción de balsámico.',
        precio: '$220',
      },
      {
        nombre: 'Ensalada cítrica',
        descripcion:
          'Mix de lechugas con manzana, gajos de naranja, fresa, queso de cabra con pistache, reducción de balsámico y vinagreta de cítricos.',
        precio: '$210',
      },
    ],
  },
  {
    id: 'pastas',
    nombre: 'Pastas',
    platillos: [
      {
        nombre: 'Espaguetti con camarones al pimiento',
        descripcion:
          'Pimiento amarillo, toque de chile habanero, vino blanco, ajo, cebolla, con camarones (150 g), acompañado de queso parmesano.',
        precio: '$395',
      },
      {
        nombre: 'Ravioles al cilantro',
        descripcion:
          'Almohadas de pasta rellenas de mascarpone y espinacas, servidas sobre un pesto de cilantro fresco elaborado con almendra y aceite de olivo extra virgen, acompañadas con queso parmesano.',
        precio: '$275',
        nota: '2 pzas',
      },
      {
        nombre: 'Bavette adobado con camarones',
        descripcion:
          'Bañado en un adobo de la casa de sabor profundo y bien balanceado, acompañado de camarones (150 g) salteados al punto.',
        precio: '$415',
      },
    ],
  },
  {
    id: 'aves',
    nombre: 'Aves',
    platillos: [
      {
        nombre: 'Pollo portobello',
        descripcion:
          'Pollito de leche sobre hongo portobello glaseado en aceite de hierbas finas, acompañado de papa cremosa de textura suave.',
        precio: '$365',
      },
      {
        nombre: 'Pollito con mole poblano',
        descripcion:
          'Pollito de leche presentado con mole poblano terso y profundo, acompañado de plátano macho frito.',
        precio: '$395',
      },
    ],
  },
  {
    id: 'pescados-y-mariscos',
    nombre: 'Pescados y mariscos',
    platillos: [
      {
        nombre: 'Filete de salmón',
        descripcion:
          'Lomo de salmón con costra de chiles secos y ajonjolí negro, servido sobre guacamole terso y terminado con brotes de cilantro; una propuesta contemporánea de sabores intensos y frescos.',
        precio: '$395',
      },
      {
        nombre: 'Robalo, limón y eneldo',
        descripcion:
          'Servido con una crema ligera de limón y eneldo, acompañado de papa cambray, jitomate cherry y espárragos salteados en mantequilla; un platillo delicado, fresco y elegante.',
        precio: '$495',
      },
      {
        nombre: 'Salmón de rollo',
        descripcion:
          'Relleno de pistaches, pimientos rostizados y espinacas sobre risotto cremoso, acompañado de espárragos y un espejo de crema de flor de calabaza.',
        precio: '$430',
      },
      {
        nombre: 'Salmón glaseado',
        descripcion:
          'Lonja de salmón con reducción de miel orgánica con chipotle, sobre puré de papa rústico, acompañado de espárragos a la parrilla.',
        precio: '$415',
      },
      {
        nombre: 'Camarones mango habanero',
        descripcion:
          'Camarones (180 g) glaseados con salsa de mango y un delicado toque de chile habanero naranja, acompañados de arroz blanco con un toque de coco y brotes frescos de temporada.',
        precio: '$465',
      },
      {
        nombre: 'Pulpo ahumado',
        descripcion:
          'Pulpo parrillado a las brasas y marinado con chiles secos, sobre un cremoso puré de camote rostizado, acompañado de espárragos verdes salteados y terminado con aceite de hierbas frescas.',
        precio: '$425',
      },
      {
        nombre: 'Pulpo mar y tierra',
        descripcion:
          'Pulpo (150 g) a la parrilla con espejo de mole negro, acompañado de pork belly (100 g) horneado y guacamole rústico.',
        precio: '$480',
      },
    ],
  },
  {
    id: 'carnes',
    nombre: 'Carnes',
    platillos: [
      {
        nombre: 'Tomahawk 1200 g',
        descripcion: 'Acompañado de papa hasselback, verduras asadas y chiles toreados.',
        precio: '$2,500',
      },
      {
        nombre: 'Rib eye a la parrilla 400 g',
        descripcion: 'Acompañado de papa hasselback, verduras asadas y chiles toreados.',
        precio: '$995',
      },
      {
        nombre: 'Gaoneras de picaña 200 g',
        descripcion:
          'Tacos de picaña (3 pzas) con costra de queso manchego, guacamole de manzana, cebollitas cambray con salsa de ceniza de tortilla y toque de chiltepín.',
        precio: '$340',
      },
      {
        nombre: 'Cordero con jamaica 280 g',
        descripcion:
          'Costilla de cordero jugosa glaseada con una reducción de Jamaica aromática y ligeramente ácida, acompañada de un suave puré de papa y ejotes tiernos a la mantequilla.',
        precio: '$685',
      },
      {
        nombre: 'Chamorro de cerdo 450 g',
        descripcion:
          'Cocido lentamente hasta lograr una textura melosa, servido en salsa verde de tomatillo con brotes frescos de verdolaga (o en su versión natural), acompañado de frijoles de la olla.',
        precio: '$445',
      },
      {
        nombre: 'Medallón de res a la pimienta 200 g',
        descripcion:
          'Cocinado al punto, servido con una crema de pimienta suave y envolvente, acompañado de puré de camote y espárragos salteados; una combinación elegante y de carácter atemporal.',
        precio: '$595',
      },
    ],
  },
  {
    id: 'postres',
    nombre: 'Postres',
    platillos: [
      {
        nombre: 'Tentación',
        descripcion:
          'Manzana con corazón de nuez y arándanos, perfumada con canela, envuelta y horneada en una sábana de hojaldre.',
        precio: '$180',
      },
      {
        nombre: 'Churros de mesa',
        descripcion:
          'Orden de mini churros recién hechos, servidos al centro para compartir, acompañados de una trilogía de helados artesanales.',
        precio: '$200',
      },
      {
        nombre: 'Peras al vino tinto',
        descripcion:
          'Carpaccio de peras con reducción de vino tinto, acompañado de helado de frutos secos.',
        precio: '$190',
      },
      {
        nombre: 'Helados y nieves',
        descripcion: 'Tres esferas de helado o nieve artesanal de temporada.',
        precio: '$120',
        nota: 'Sabores a consultar con su mesero.',
      },
    ],
  },
];
