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
      const existingStock = await Stock.findOne({ product: product, shop: shop });

      // si pas de stock renvoyer un message d'erreur
      if (!existingStock) {
        throw new Error("Stock not found for this product and shop.");
      }
    
      // mettre à jour le stock
      existingStock.stock = stock !== undefined ? stock : existingStock.stock;
      existingStock.price = price !== undefined ? price : existingStock.price;
      existingStock.tags = tags !== undefined ? tags : existingStock.tags;

      await existingStock.save();

      res.json({ result: true, stock: existingStock });
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
