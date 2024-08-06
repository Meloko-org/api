const Stock = require('../models/Stock');
const validationModule = require('../modules/validation');

const updateStock = async (req, res) => {
  try {
    
    const checkBodyFields = [
      'product',
      'shop',
      'stock',
      'price',
      'tags'
    ];
    // faire une verification 
    if (validationModule.checkBody(req.body, checkBodyFields)) {
      const { product, shop, stock, price, tags } = req.body;

      // faire une recherche de stock pour le magasin et le produit
      const newstock = await Stock.findOne({ product: product, shop: shop });


      // si pas de stock renvoyer un message d'erreur
      if (!newstock) {
        throw new Error("Stock not found for this product and shop.");
      }
    
      // mettre à jour le stock
      newstock.stock = stock !== undefined ? stock : newstock.stock;
      newstock.price = price !== undefined ? price : newstock.price;
      newstock.tags = tags !== undefined ? tags : newstock.tags;

      await newstock.save();

      res.json({ result: true, stock: newstock });
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateStock,
};
