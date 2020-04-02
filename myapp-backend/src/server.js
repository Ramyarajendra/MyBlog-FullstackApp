import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path';
const app=express();
app.use(express.static(path.join(__dirname, '/build')))
app.use(bodyParser.json());

// app.get('/hello', (req,res) => res.send("hello"));
// app.get('/hello/:name', (req,res) => res.send(`Hello ${req.params.name}`));

const withDb=async (operations,res) => {
    try{
        const client=await MongoClient.connect('mongodb://localhost:27017',{useNewUrlParser:true});
        const db=client.db('myappdb');
        await operations(db);
        client.close();
    }catch(error){
        res.status(500).json({message:'Error',error});
    }
}
app.get('/api/articles/:name',async (req,res)=>{
        withDb(async(db)=>{
            const articleName = req.params.name;
            const articlesInfo =await db.collection('articles').findOne({name :articleName});
            res.status(200).json(articlesInfo);
        }, res);
})
app.post('/api/articles/:name/upvote', async(req,res)=>{
    // articlesInfo[articleName].upvotes+=1;
    // res.status(200).send(`${articleName} has ${articlesInfo[articleName].upvotes} upvotes`);
    withDb(async(db)=>{
        const articleName = req.params.name;
    const articlesInfo =await db.collection('articles').findOne({name :articleName});
    await db.collection('articles').updateOne({name: articleName },{
        '$set':{
            upvotes : articlesInfo.upvotes + 1,
        },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({name :articleName});
    res.status(200).json(updatedArticleInfo);
    }, res);
});

app.post('/api/articles/:name/add-comment', (req,res)=>{
    const {username, text} = req.body;
    const articleName = req.params.name;
    withDb(async(db)=>{
    const articlesInfo =await db.collection('articles').findOne({name :articleName});
    await db.collection('articles').updateOne({name: articleName },{
        '$set':{
            comments : articlesInfo.comments.concat({username,text}),
        },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({name :articleName});
    res.status(200).json(updatedArticleInfo);
    },res);
});

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname +'/build/index.html'));
})

// app.post('/hello', (req,res) =>res.send(`Hello ${req.body.name}`));
app.listen(8000, ()=> console.log("listening on port 8000"));