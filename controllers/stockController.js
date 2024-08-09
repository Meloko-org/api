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
    console.log(req.body)
    // faire une verification 
    if (validationModule.checkBody(req.body, checkBodyFields)) {
      const { product, shop, stock, price, tags } = req.body;

      const shopData = await Shop.findOne({_id: shop}).populate('producer') 

      const user = await User.findOne({ clerkUUID: req.auth.userId })

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


const getStocks = async (req, res) => {
  try {
    const checkParamsFields = ['shopId'];
    const { shopId } = req.params;

    if (!validationModule.checkParams({ shopId }, checkParamsFields)) {
      throw new Error("Missing fields.");
    }

    const shopData = await Shop.findOne({ _id: shopId }).populate('producer');
    const user = await User.findOne({ clerkUUID: req.auth.userId });

    if (!shopData.producer.owner.equals(user._id)) {
      throw new Error("You do not have privileges to view this stock.");
    }

    const stocks = await Stock.find({ shop: shopId })
                              .populate('product')
                              .populate('tags');

    if (!stocks.length) {
      return res.status(404).json({ message: 'No stock found' });
    }

    res.json({ result: true, stocks });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateStock,
  getStocks
};

