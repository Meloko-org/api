const { Stock, Shop, User } = require('../models');
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

      const shopData = await Shop.findOne({_id: shop}).populate('producer') 

      const user = await User.findOne({ clerkUUID:"user_2kHhC1eGdQcKdPwk9hY2gz3kKHi" })

      // Si l'utilisateur n'est pas le proprietaire du shop concerné
      if(!shopData.producer.owner.equals(user._id)) {
        throw new Error("You do not have privileges to change this stock.");
      }

      // faire une recherche de stock pour le magasin et le produit
      let existingStock = await Stock.findOne({ product: product, shop: shop });

      // si le stock n'existe pas, on le crée
      if (!existingStock) {
        existingStock = new Stock({
          product,
          shop,
          stock,
          price,
          tags
        })

      } else {
        // sinon mettre à jour le stock
        existingStock.stock = stock !== undefined ? stock : existingStock.stock;
        existingStock.price = price !== undefined ? price : existingStock.price;
        existingStock.tags = tags !== undefined ? tags : existingStock.tags;

      }

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

const getStocksByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    // Recherche
    const stocks = await Stock.find({ shop: shopId })
      .populate({
        path: 'product',
        populate: { path: 'family', model: 'productFamily',
        populate: { path: 'category', model: 'productcategory' }},
      }
      ) 
      .populate('tags') 
      .populate({
        path: 'shop',
        populate: {
          path: 'producer', 
          model: 'producers'
        }
      });

    if (!stocks) {
      return res.status(404).json({ message: "Aucun stock trouvé pour ce magasin." });
    }

    
    res.json({ result: true, stocks });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateStock, 
  getStocksByShop, 
};

