const Stock = require('../models/Stock');
const validationModule = require('../modules/validation');

const updateStock = async (req, res) => {
  try {
    // Définir les champs 
    const checkBodyFields = [
      'product',
      'shop',
      'stock',
      'price',
      'tags'
    ];
    // Vérifier les champs 
    if (validationModule.checkBody(req.body, checkBodyFields)) {
      const { product, shop, stock, price, tags } = req.body;

      // Rechercher le stock pour le produit et le magasin
      const newstock = await Stock.findOne({ product: product, shop: shop });


      // Si le stock n'existe pas, renvoyer une erreur
      if (!newstock) {
        throw new Error("Stock not found for this product and shop.");
      }
    
      // Mettre à jour les champs du stock
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
