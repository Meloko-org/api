const { Shop, User, Producer, Product, ProductFamily, Stock } = require('../models')
const { validationModule } = require('../modules')
const Fuse = require('fuse.js')

const createNewShop = async (req, res) => {
  try {
    // define the fields coming from req.body to check
    const checkBodyFields = [
      'name',
      'description',
      'address',
      'siret',
      'types'
    ]

    // If all expected fields are present
    if(validationModule.checkBody(req.body, checkBodyFields)) {
      // Retreive the logged user and its producer profile
      const user = await User.findOne({ clerkUUID: req.auth.userId})
      const producer = await Producer.findOne({ owner: user._id })

      // If the user has no producer profile, trow an error
      if(!producer) {
        throw new Error("User has no existing producer profile."); 
      } 

      // Create and save the new shop
      const { name, description, address, siret, types } = req.body

      const newShop = new Shop({
        producer: producer._id,
        name,
        description,
        siret,
        address,
        types
      })

      await newShop.save()

      res.json({ result: true, producer: producer })
    } else {
      throw new Error("Missing fields."); 
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message})
    return
  }
}

const searchShops = async (req, res) => {
  try {
    // define the fields coming from req.body to check
    const checkBodyFields = [
      'query',
      'radius',
      'userPosition'
    ]

    // If all expected fields are present
    if(validationModule.checkBody(req.body, checkBodyFields)) {
      const { query, userPosition, radius } = req.body

      // Get the min and max latitude and longitude
      const searchArea = calculateMaxLatitudeLongitude(userPosition, radius)

      // Aggregate the shops that have an address (lat, lon) between the min-max
      let searchResults = await Shop.aggregate([
        { 
            $match: { 
              'address.latitude': { 
                $lte: searchArea.latitude.max, 
                $gte: searchArea.latitude.min 
              },
              'address.longitude': { 
                $lte: searchArea.longitude.max, 
                $gte: searchArea.longitude.min 
              } 
            }
          },
          {
            $lookup: {
              from: 'stocks',
              localField: '_id',
              let: { product_id: "$product" },
              pipeline: [
                  {
                      $lookup: {
                          from: "products",
                          localField: "product",
                          let: { family_id: "$family" },
                          pipeline: [
                            {
                                $lookup: {
                                    from: "productfamilies",
                                    localField: "family",
                                    foreignField: "_id",
                                    as: "family"
                                }
                            },
                            {
                              $unwind: {
                                path: '$family',
                                preserveNullAndEmptyArrays: true
                              }
                            }
                          ],
                          foreignField: "_id",
                          as: "product"
                      }
                  },
                  {
                    $unwind: {
                      path: '$product',
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $lookup: {
                        from: "tags",
                        localField: "tags",
                        foreignField: "_id",
                        as: "tags"
                    }
                }
              ],
              foreignField: 'shop',
              as: 'stocks'
            }
          },
          {
            $lookup: {
              from: 'types',
              localField: 'types',
              foreignField: '_id',
              as: 'types'
            }
          },
          {
            $lookup: {
              from: 'notes',
              localField: 'notes',
              foreignField: '_id',
              as: 'notes'
            }
          }
      ])

      // If there are query terms
      if(query !== '') {

        // Define the keys and weights that the fuzzy search will be applied
        const searchKeys = [
          {
            name: 'name',
            weight: 1
          },
          {
            name: 'description',
            weight: 1
          },
          {
            name: 'stocks.product.name',
            weight: 1
          },
          {
            name: 'stocks.product.family.name',
            weight: 1
          },
          {
            name: 'types.name',
            weight: 0.5
          },
          {
            name: 'stocks.product.tags.name',
            weight: 0.5
          }
        ]
        
        // Define additional fuseSearch options
        const searchOptions = {
          minMatchCharLength: 2,
          includeScore: true,
          includeMatches: true,
          keys: searchKeys
        }

        // Instantiate a Fuse class
        const fuse = new Fuse(searchResults, searchOptions)
        // Execute the fuse search
        const fuseSearch = fuse.search(query)

        // Remap the searchResults array to be the same as if there are no fuse search
        // Also add the distance between the user and the shop
        searchResults = fuseSearch.map(sr =>  {
          const item = sr.item

          item.searchData = {
            documentIndex: sr.refIndex,
            matches: sr.matches,
            score: sr.score,
            distance: calculateDistance(item.address.latitude, item.address.longitude, userPosition.latitude, userPosition.longitude, 'K')
          }

          return item
        })

        
        for (const result of searchResults) { 
          for (const matche of result.searchData.matches) { 
            if(matche.key === 'stocks.product.family.name') {
              const productsFromFamily = await getStocksFromProductsFamily(matche.value, result._id)
                if(result.searchData.relevantProducts) {
                  result.searchData.relevantProducts.push(...productsFromFamily)
                } else {
                  result.searchData.relevantProducts = productsFromFamily
                }
              
            }
          }
        }


      } else {
        // Add the distance between the user and the shop
        searchResults = searchResults.map(sr => {
          sr.searchData = {
            distance: calculateDistance(sr.address.latitude, sr.address.longitude, userPosition.latitude, userPosition.longitude, 'K')
          }
          return sr
        })

        // Trie les resultats par distance
        searchResults.sort((a, b) => a.searchData.distance - b.searchData.distance)
      }
      
      res.json({ result: true, searchResults})
    } else {
      throw new Error("Missing fields."); 
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message})
    return
  }
}

// Calcul les bornes lat, lon pour ne chercher que les shops entre celles ci
const calculateMaxLatitudeLongitude = (initialPosition, radius) => {

  // Convert the radius in meters to latitude degrees
  const radiusInLatitude = (radius / 6378) * (180 / Math.PI)
  // Convert the radius in meters to longitude degrees
  const radiusInLongitude = (radius / 6378) * (180 / Math.PI) / Math.cos(initialPosition.latitude * Math.PI/180)

  return {
    latitude: {
      min: initialPosition.latitude - radiusInLatitude,
      max: initialPosition.latitude + radiusInLatitude
    },
    longitude: {
      min: initialPosition.longitude - radiusInLongitude,
      max: initialPosition.longitude + radiusInLongitude
    }
  }
}

// Calcul la distance entre deux jeux de coordonnées
const calculateDistance = (lat1, lon1, lat2, lon2, unit) => {
  if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
  }
  else {
      var radlat1 = Math.PI * lat1/180;
      var radlat2 = Math.PI * lat2/180;
      var theta = lon1-lon2;
      var radtheta = Math.PI * theta/180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
          dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180/Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit=="K") { dist = dist * 1.609344 }
      if (unit=="N") { dist = dist * 0.8684 }
      return dist;
  }
}

const getById = async (req, res) => {
  try {
    const checkBodyFields = [
      'id'
    ];
    if (validationModule.checkBody(req.params, checkBodyFields)) {
      const mongooseShop = await Shop.findOne({ _id: req.params.id }).populate('notes').populate('types').populate('markets')
      if (!mongooseShop) {
        throw new Error("No shop found.");
      }

      const stocksFound = await Stock.find({ shop: mongooseShop._id })
                                      .populate({
                                        path: 'product',
                                        populate: { path: 'family', model: 'productFamily',
                                        populate: { path: 'category', model: 'productcategory' }
                                      },
                                      }); 
      
      const shop = mongooseShop.toObject()
      shop.categories = []

      if(stocksFound) {
        stocksFound.forEach(p => {
          let category = shop.categories.find(s => s.name === p.product.family.category.name)
          if(category) {
            category.products.push({
              _id: p._id,
              product: p.product.toObject(),
              shop: {
                _id: shop._id,
                name: shop.name,
                markets: shop.markets,
                clickCollect: shop.clickCollect
              },
              stock: p.stock,
              price: p.price
            })
          } else {
            // console.log(p.product.family.category)
            shop.categories.push({
              ...p.product.family.category.toObject(),
              products: [{
                  _id: p._id,
                  product: p.product.toObject(),
                  shop: {
                    _id: shop._id,
                    name: shop.name,
                    markets: shop.markets,
                    clickCollect: shop.clickCollect
                  },
                  stock: p.stock,
                  price: p.price
                
              }]
            })
  
          }
        })
      }

      res.json({ result: true, shop});
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
    return
  }
};

const getStocksFromProductsFamily = async (familyName, shopId) => {
  try {
    const family = await ProductFamily.findOne({ name: familyName })
    const products = await Product.find({ family: family._id })
    const productsInStock = []
    for(const product of products) {
      // console.log(product)
      const productInStock = await Stock.findOne({ product: product._id, shop: shopId }).populate('product').populate('tags').populate('shop')                                      
      .populate({
        path: 'product',
        populate: { path: 'family', model: 'productFamily',
        populate: { path: 'category', model: 'productcategory' }},
      });
      productInStock && productsInStock.push(productInStock)
    }
    return productsInStock
  } catch (error) {
    throw new Error(error.message); 
  }
}

module.exports = {
  createNewShop,
  searchShops,
  getById
}