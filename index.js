const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
var jwt = require('jsonwebtoken');
const cookiesParser = require('cookie-parser');
require("dotenv").config();
const port = process.env.PORT || 5000;

//middle were data bancend get koror jonno.
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());
app.use(cookiesParser());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uruvxpx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const verifiedtoken = async(req, res, next) => {
    const token = req.cookies.token;
    console.log('value is token', token)
    if (!token) {
        return res.status(401).send({ message: 'unauthrazion' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).send({ messange: 'not ok auth' })
        }
        req.user = decoded;
        next()
    })
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // const ServicesCollation = client.db("serviceDB").collection("service");
        const database = client.db("assginmentDB");
        const AssignmentCollation = database.collection("assginment");
        try {
            app.post('/jwt', async(req, res) => {
                const user = req.body;
                const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '1h',

                })
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,

                })

                .send({ success: true })
            })

        } catch (errro) {
            console.log(errro)
        }
        try {
            app.post('/logout', async(req, res) => {
                const user = req.body;
                console.log(user)
                res.clearCookie('token', { maxAge: 0 }).send({ success: true })
            })
        } catch (erroe) {
            console.log(erroe)
        }
        app.get('/assignment', async(req, res) => {
            const cours = AssignmentCollation.find();
            const result = await cours.toArray();
            res.send(result)
        });
        app.post('/assignment', async(req, res) => {
            const assigment = req.body;
            console.log(assigment)
            const result = await AssignmentCollation.insertOne(assigment);
            res.send(result)
        });
        app.put('/assignment/:id', async(req, res) => {
            const data = req.body;
            const id = req.params.id;
            const quarys = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const update = {
                $set: {
                    title: data.title,
                    price: data.price,
                    img: data.img,
                    description: data.description
                }
            };
            console.log(id, data)
            const result = await AssignmentCollation.updateOne(quarys, update, options);
            res.send(result)
            console.log(id, data)
        })


        app.delete('/assginment/:id', async(req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            const result = await AssignmentCollation.deleteOne(quary);
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Hassaaaaaaaaaaaaaaaaaaaaaaaaaaaaannnnnnnnnnnnnnnnnn')
})

app.listen(port, () => {
    console.log(`
Example app listening on port ${port}
`)
})