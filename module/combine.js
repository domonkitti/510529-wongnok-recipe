const Recipe = require('../model/food.js');
const RandR = require('../model/RandR.js');


async function getRecipesWithLikes(req, res, next) {
  try {
    const recipesWithLikes = await Recipe.aggregate([
      {
        $addFields: {
          "recipeIdStr": { $toString: "$_id" }
        }
      },
      {
        $lookup: {
          from: "randrs",
          localField: "recipeIdStr",
          foreignField: "foodid",
          as: "RandRData"
        }
      },
      {
        $addFields: {
          likesCount: {
            $size: {
              $filter: {
                input: "$RandRData",
                as: "item",
                cond: { $eq: ["$$item.like", "like"] }
              }
            }
          }
        }
      },
      {
        $project: {
          _idAsString: 0,
          RandRData :0 
        }
      }
    ]);

    req.recipesWithLikes = recipesWithLikes;
    next(); 
} catch (error) {
    console.error("Error during aggregation: ", error);
    res.status(500).send("Error during aggregation");
}
}

module.exports = getRecipesWithLikes;