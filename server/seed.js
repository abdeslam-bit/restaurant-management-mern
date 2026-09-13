require('dotenv').config();
const mongoose = require('mongoose');
const AdminUser = require('./models/AdminUser');
const MenuItem = require('./models/MenuItem');

const sampleMenuItems = [
  // Appetizers
  {
    name: 'Burrata & Heirloom Tomatoes',
    description: 'Creamy burrata served with vine-ripened heirloom tomatoes, fresh basil oil, and aged balsamic reduction.',
    price: 14.5,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&q=80',
    tags: ['Vegetarian', 'Gluten-Free', 'Chef Special'],
    preparationTime: 8,
  },
  {
    name: 'Crispy Calamari',
    description: 'Lightly dusted rings and tentacles, flash-fried to golden perfection with house-made aioli and lemon.',
    price: 12.0,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800&q=80',
    tags: ['Popular'],
    preparationTime: 10,
  },
  {
    name: 'Truffle Arancini',
    description: 'Saffron-infused risotto balls with black truffle and fontina, served with a mushroom cream dip.',
    price: 13.0,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
    tags: ['Vegetarian', 'New'],
    preparationTime: 12,
  },
  {
    name: 'Spiced Lamb Kofta',
    description: 'Hand-rolled minced lamb seasoned with cumin, coriander and harissa, served with mint yogurt.',
    price: 15.0,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80',
    tags: ['Spicy', 'Gluten-Free'],
    preparationTime: 15,
  },
  // Mains
  {
    name: 'Pan-Seared Salmon',
    description: 'Atlantic salmon with golden crust, served on saffron cauliflower purée, charred broccolini, and lemon beurre blanc.',
    price: 32.0,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
    tags: ['Gluten-Free', 'Chef Special', 'Popular'],
    preparationTime: 20,
  },
  {
    name: 'Braised Short Rib',
    description: '72-hour bone-in beef short rib, slow-braised in red wine, served with truffle mash and glazed carrots.',
    price: 38.0,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    tags: ['Chef Special', 'Popular'],
    preparationTime: 25,
  },
  {
    name: 'Wild Mushroom Risotto',
    description: 'Arborio rice slowly cooked with a medley of wild mushrooms, aged parmesan, and fresh thyme.',
    price: 26.0,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1673442089565-8c47b2caf0da?w=800&q=80',
    tags: ['Vegetarian', 'Gluten-Free'],
    preparationTime: 22,
  },
  {
    name: 'Harissa Chicken',
    description: 'Free-range chicken supreme, marinated in North African harissa, roasted and served with jewelled couscous.',
    price: 28.0,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
    tags: ['Spicy', 'Popular'],
    preparationTime: 20,
  },
  {
    name: 'Lobster Linguine',
    description: 'Whole Atlantic lobster tossed with house-made linguine, cherry tomatoes, fresh herbs and a bisque reduction.',
    price: 44.0,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1633956408768-5bb49c81aa30?w=800&q=80',
    tags: ['Chef Special', 'New'],
    preparationTime: 28,
  },
  // Drinks
  {
    name: 'Jasmine Cold Brew',
    description: 'Single-origin cold brew steeped for 20 hours, delicately infused with jasmine blossoms.',
    price: 7.5,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
    tags: ['Vegan', 'Dairy-Free'],
    preparationTime: 3,
  },
  {
    name: 'Passion Fruit Spritz',
    description: 'Fresh passion fruit, elderflower cordial, sparkling water and a hint of fresh ginger. Non-alcoholic.',
    price: 8.0,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&q=80',
    tags: ['Vegan', 'Dairy-Free', 'Popular'],
    preparationTime: 4,
  },
  {
    name: 'Smoked Old Fashioned',
    description: 'Bourbon whiskey, demerara syrup, aromatic bitters, finished with applewood smoke and an orange peel.',
    price: 14.0,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
    tags: ['Popular', 'Chef Special'],
    preparationTime: 5,
  },
  {
    name: 'Turmeric Latte',
    description: 'Steamed oat milk with organic turmeric, cinnamon, black pepper, and a touch of raw honey.',
    price: 6.5,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=800&q=80',
    tags: ['Vegan', 'Dairy-Free', 'New'],
    preparationTime: 4,
  },
  // Desserts
  {
    name: 'Chocolate Fondant',
    description: 'Warm Valrhona chocolate fondant with a molten center, served with Madagascan vanilla bean ice cream.',
    price: 11.0,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80',
    tags: ['Vegetarian', 'Popular'],
    preparationTime: 12,
  },
  {
    name: 'Lemon Posset',
    description: 'Silky set lemon cream with candied lemon zest, almond biscotti crumble and raspberry coulis.',
    price: 9.5,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
    tags: ['Vegetarian', 'Gluten-Free'],
    preparationTime: 5,
  },
  {
    name: 'Mango Panna Cotta',
    description: 'Coconut milk panna cotta topped with fresh Alphonso mango, passionfruit curd and toasted coconut.',
    price: 10.0,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
    tags: ['Vegan', 'Gluten-Free', 'New'],
    preparationTime: 5,
  },
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('\n❌  MONGO_URI is not set in .env file.');
      console.error('    Please add your MongoDB connection string and try again.\n');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n✅  Connected to MongoDB\n');

    // Clear existing data
    await AdminUser.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('🗑   Cleared existing admin users and menu items\n');

    // Create default admin
    const admin = await AdminUser.create({
      name: process.env.ADMIN_DEFAULT_NAME || 'Admin',
      email: process.env.ADMIN_DEFAULT_EMAIL,
      password: process.env.ADMIN_DEFAULT_PASSWORD,
      role: 'superadmin',
    });
    console.log('👤  Default Admin Created:');
    console.log('    ┌─────────────────────────────────────────┐');
    console.log(`    │  Email:    ${admin.email.padEnd(29)}│`);
    console.log(`    │  Password: ${(process.env.ADMIN_DEFAULT_PASSWORD || '').padEnd(29)}│`);
    console.log('    └─────────────────────────────────────────┘\n');

    // Seed menu items
    const items = await MenuItem.insertMany(sampleMenuItems);
    console.log(`🍽   Seeded ${items.length} menu items\n`);

    console.log('🎉  Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌  Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
