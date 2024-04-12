//----------------ตั้งค่า และนำเข้า--------------------------------
const express = require('express')
const foodrouter = express.Router()
const path = require('path')
const Recipe = require('../model/food.js')
const multer = require('multer')
const { authenticate, authorize } = require('../module/auth.js')
const rolecheck = require('../module/rolecheck.js')
const RandR = require('../model/RandR.js')
const getRecipesWithLikes = require('../module/combine.js')

const { log } = require('console')
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/images/food')
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+".jpg")
    }
})
const upload = multer({
    storage:storage
})

//------------------------------ส่วนของการแสดงผล  ------------------------//
//ไป index
foodrouter.get("/",getRecipesWithLikes, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = 9; 
        const skip = (page - 1) * limit; 
        //คำสั่ง java(เ้พราะ มาจากโมเดล combine เป็น array ไปแล้วไม่คุ้นเอามากๆ)
        const userData = req.user;
        const doc = req.recipesWithLikes.slice(skip, skip + limit).reverse();
        const totalCount = req.recipesWithLikes.length;
        const totalPages = Math.ceil(totalCount / limit);
        //console.log("เมนูหน้าหลัก",doc)
        

        res.render('index.ejs', {
            recipes: doc,
            userData: userData,
            totalPages: totalPages,
            currentPage: page
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred");
    }
});



//-----------------Search Page------------------
//เซิจและ sort
foodrouter.get('/search', getRecipesWithLikes, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const criterion = req.query.criterion;
        const query = req.query.query;
        const sortMethod = req.query.sort;

        // ใช้ ja ไม่ใช่ mongoose
        const filteredData = req.recipesWithLikes.filter(recipe => {
            return query ? new RegExp(query, 'i').test(recipe[criterion]) : true;
        });

    
        let sortedData;
        if (sortMethod === "Like") {
            sortedData = [...filteredData].sort((a, b) => b.likesCount - a.likesCount);
        } else if (sortMethod === "New") {
            sortedData = [...filteredData].reverse();
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = sortedData.slice(startIndex, endIndex);

        // Counting total matching documents
        const totalCount = filteredData.length;
        const totalPages = Math.ceil(totalCount / limit);

        res.render('search.ejs', {
            recipes: paginatedData,
            userData: req.user,
            totalPages: totalPages,
            currentPage: page
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred during the search");
    }
});

//แสดงผลรายเมนู
foodrouter.get('/recipe/:id', async (req, res) => {  //รับข้อมูลมา  หา แล้วส่งไป render
    try {
        const userData = req.user;
        const recipe_id = req.params.id; //รับ มาบอกว่าเป็น id นะ   
        //console.log("หมูกรอบ",recipe_id)
        const doc = await Recipe.findOne({ _id: recipe_id,}).exec(); //รอให้หาเสร็จ> หาที่ field _id ที่เท่ากับ Recipe id ที่ได้มา เก็บไว้ทืี่ doc
        const ratingsAndReviews = await RandR.find({foodid: recipe_id }).exec()
        //console.log(doc)
        res.render('recipe.ejs',{recipe:doc,userData: userData,RandR: ratingsAndReviews})//เรนเดอที่ recipe โดดใช้ชื่อว่า recipe ที่มีข้อมูบ doc
        // You might want to send a response here, for example:
        // res.json(doc);
    } catch (err) {
        res.status(500).send('An error occurred');
    }
})
//--------------ส่วนระบบจัดการ---------------------
//ไปที่form
foodrouter.get("/add",authenticate,(req,res)=>{
    const userData = req.user;
    //console.log("ส่งชื่อมา=",userData)
    res.render('add.ejs',{userData: userData})
})
//trigger สร้างรายการ
foodrouter.post("/new",upload.single('Image'), async (req, res) => {//อัพ เมนูใหม่ๆ
    try {let documentData = {
            ...req.body,
            Image : req.file ? req.file.filename : null, // Include the filename of the uploaded picture
        };
        let document = new Recipe(documentData);
        
        await document.save();
        res.redirect('/add');
    } catch (error) {
        console.error("Error during asynchronous operation", error);
        res.status(500).send("An error occurred");
    }
})
//ไปหน้ารวมเมนูของแต่ละคน(อ้างอิงตามusertrack)
foodrouter.get('/edit', async (req, res) => {
    try {
        const criterion = req.user.displayname;
        const userData = req.user
        const docs = await Recipe.find({Author:criterion}).sort({ _id: -1 }).exec();
        res.render('edit.ejs', {recipes: docs,userData: userData});
    } catch (err) {
        console.error(err);
        res.render('404', {errorMessage: 'กรุณา login'})
    }
});
//เข้าสู่หน้าแก้ไข
foodrouter.get('/edit/:id', async (req, res) => {  //รับข้อมูลมา  หา แล้วส่งไป render
    try {
        const recipe_id = req.params.id;
        //console.log("เซิจหาแก้",recipe_id)
        const userData = req.user; //รับ มาบอกว่าเป็น id นะ   
        const doc = await Recipe.findOne({ _id: recipe_id,}).exec(); //รอให้หาเสร็จ> หาที่ field _id ที่เท่ากับ Recipe id ที่ได้มา เก็บไว้ทืี่ doc
        //console.log(doc)
        res.render('fix.ejs',{recipe:doc,userData: userData})//เรนเดอที่ recipe โดดใช้ชื่อว่า recipe ที่มีข้อมูบ doc
        // You might want to send a response here, for example:
        // res.json(doc);
    } catch (err) {
        res.render('404', {errorMessage: 'ไม่ทราบสาเหตุ'})
    }
})
//trigger ลบ
foodrouter.post("/delete", async (req, res) => {
    const { delete_id } = req.body;
    try {
        await Recipe.findByIdAndDelete(delete_id);
        res.redirect('/edit');
    } catch (error) {
        //console.error("Error deleting the document:", error);
        res.render('404', {errorMessage: 'ไม่ทราบสาเหตุ'})
    }
});
//trigger แก้ไขข้อมูล
foodrouter.post("/update", upload.single('Image'), async (req, res) => {
    const update_id = req.body.update_id; // Assuming this is the _id of the document to update
    try {
        let updateData = {
            ...req.body,
            Image: req.file ? req.file.filename : undefined, //ใช้รูปใหม่
        };
        if (!req.file) {
            delete updateData.Image; // ไม่ให้รูปเก่าโดนลบถ้าไม่มีรูปใหม่
        }
        await Recipe.findByIdAndUpdate(update_id, updateData, { new: true });

        res.redirect('/edit');
    } catch (error) {
        //console.error("Error updating the document:", error);
        res.render('404', {errorMessage: 'อัพเดทเมนูผิดพลาดผมก็ไม่เคยเห็นหน้านี้นะ'})
    }
});

//------------------------ส่วนของadmin--------------------ยังไม่ได้ทำ
foodrouter.get("/admin", rolecheck, (req, res) => {
    console.log("Attempting to access /admin");
    res.render('admin.ejs');
});


//------------------------ระบบ Rating----------------------
//like
foodrouter.get('/recipe/like/:who/:foodid', rolecheck, async (req, res) => {
    //console.log(req.params)
    const who=req.params.who;
    const foodid=req.params.foodid;
    //console.log("เซิจหาแก้",who,foodid)
    try {let documentData = {
        who:who,
        like:"like",
        foodid:foodid
    }
        let document = new RandR(documentData);
        await document.save();
        res.redirect(req.headers.referer);
} catch (error) {
    //console.error("Error during asynchronous operation", error);
    res.render('404', {errorMessage: 'ให้คะแนนไม่สำเร็จ'})
}
})
//dislike สงสัยว่าทำแยกทำไม ตอนทำไม่คิดไง
foodrouter.get('/recipe/dislike/:who/:foodid', rolecheck, async (req, res) => {
    const who=req.params.who;
    const foodid=req.params.foodid;
    //console.log("เซิจหาแก้",who)
    try {let documentData = {
        who:who,
        like:"dislike",
        foodid:foodid
    }
        let document = new RandR(documentData);
        await document.save();
        res.redirect(req.headers.referer);
} catch (error) {
    //console.error("Error during asynchronous operation", error);
    res.render('404', {errorMessage: 'ให้คะแนนไม่สำเร็จ'})
}
})

//-----------------------สำหรับ postman-------------------
//เซิจ
foodrouter.get('/search/json', async (req, res) => {
    try {
        const criterion = req.query.criterion;
        const query = req.query.query;
        const sortMethod = req.query.sort;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9; 
        let searchCriteria = {};
        if (query) {
            searchCriteria[criterion] = new RegExp(query, 'i');
        }

        const recipes = await searchRecipesWithPagination(criterion, query, sortMethod, page, limit);

        // Adjusted to count documents based on the same search criteria
        const count = await Recipe.aggregate([
            { $match: searchCriteria },
            { $count: "filteredCount" }
        ]);

        // Use the count from the aggregation if available, otherwise 0
        const filteredCount = count.length > 0 ? count[0].filteredCount : 0;
        const totalPages = Math.ceil(filteredCount / limit);
        //console.log(recipes)
        res.json(recipes)
        ;
    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing your search.');
    }
});
foodrouter.get("/json", async (req, res) => {
    try {
        const userData = req.user;
        const doc = await Recipe.find().sort({ _id: -1 });
        res.json({recipes: doc});
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred");
    }
})



module.exports = foodrouter
//------------------------------------ของเก่าที่ทำเอง
// ------------index
// foodrouter.get("/", async (req, res) => {
//     try {
//         const userData = req.user;
//         const doc = await Recipe.find().sort({ _id: -1 });
//         res.render('index.ejs', {recipes: doc,userData: userData});
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("An error occurred");
//     }
// })

// อันนี้คือ การเมิจกัน ของ2 colection แต่ไม่แน่ใจว่า ถ้าเปลี่น db ต้องเปลี่ยนไหม 
// อันนี้ยากจริงจดกันลืม
// async function addLikesToRecipes() {
//     try {
//       const recipesWithLikes = await Recipe.aggregate([
//         {
//           $lookup: {
//             from: "likes", 
//             localField: "_id", // base
//             foreignField: "recipeId", // likes collection > localField
//             as: "likes" // จับกันมาแ้ลวเรียกมันว่า like.ในนี้จะมี ข้อมูลถูกจับคู่หลายๆตัว
//           }
//         },
//         {
//           $addFields: {
//             likesCount: { $size: "$likes" } // นับจำนวน likes
//           }
//         },
//         {
//           $project: {
//             likes: 0 // ลบ filed likes ที่ดป็น array ทิ้ง
//           }
//         }
//       ]);
  
//       console.log(recipesWithLikes);
//     } catch (error) {
//       console.error("Error adding likes to recipes: ", error);
//     }
//   }
//------------------หน้าแรก----------------
//----------ระบบค้นหา
// foodrouter.get('/search', async (req, res) => {
//     try {
//         const criterion = req.query.criterion;
//         const query = req.query.query;
//         const sortMethod = req.query.sort; 
//         //console.log(sortMethod)
//         let searchCriteria = {};
//         if (query) { // Only add to search criteria if query is not empty
//             searchCriteria[criterion] = new RegExp(query, 'i');
//         }

//         const userData = req.user

//         let sortStage = {};
//         if (sortMethod === "Like") {
//             sortStage = { $sort: { likesCount: -1 } };
//         } else if (sortMethod === "New") {
//             sortStage = { $sort: { Date: -1 } };
//         }

//         const recipesWithLikes = await Recipe.aggregate([
//             {
//                 $match: searchCriteria
//             },
//             {
//                 $lookup: {
//                     from: "likes",
//                     localField: "_id",
//                     foreignField: "recipeId",
//                     as: "likes"
//                 }
//             },
//             {
//                 $addFields: {
//                     likesCount: { $size: "$likes" }
//                 }
//             },
//             {
//                 $project: {
//                     likes: 0 
//                 }
//             },
//             sortStage 
//         ]);

//         res.render('search.ejs', {recipes: recipesWithLikes, userData: userData});
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Error processing your search.');
//     }
// });