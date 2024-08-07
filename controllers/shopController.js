const { Shop, User, Producer } = require('../models')
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

      const searchArea = calculateMaxLatitudeLongitude(userPosition, radius)

      const shops = await Shop.aggregate([
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
          // { $addFields : {
          //     'address.latitude': {"$toString" : "$address.latitude"},
          //     'address.longitude': {"$toString" : "$address.longitude"},
          //     'stocks.stock': {"$toString" : "$stocks.stock"},
          //   }
          // }
      ])

      if(query !== '') {
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
          }
        ]
        
        const searchOptions = {
          minMatchCharLength: 2,
          includeScore: true,
          includeMatches: true,
          keys: searchKeys
        }

        const fuse = new Fuse(shops, searchOptions)
  
        const searchResults = fuse.search(query)

        res.json({ result: true, searchResults})
        return
      }


      res.json({ result: true, shops})
      // res.json({ result: true, shops})
    } else {
      throw new Error("Missing fields."); 
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message})
    return
  }
}

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

module.exports = {
  createNewShop,
  searchShops
}