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
    origin: ['https://auth-project-4064d.web.app', 'https://auth-project-4064d.firebaseapp.com'],
    // origin: ['http://localhost:5173', 'http://localhost:5174'],
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
    //https://group-stady-backend-side.vercel.app
async function run() {
    try {
        // Connect the client to the server(optional starting in v4 .7)
        // await client.connect();
        const database = client.db("assginmentDB");
        const AssignmentCollation = database.collection("assginment");
        const databasesubmit = client.db("assginmentDB");
        const SubmitCollation = databasesubmit.collection("submited");
        try {
            app.post('/jwt', async(req, res) => {
                const user = req.body;
                const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '1h',

                })
                res.cookie('token', token, {
                        httpOnly: true,
                        // secure: false,
                        secure: true,
                        sameSite: 'none'

                    })
                    .send({ success: true })
            })
        } catch (error) {
            console.log(error)
        }
        try {
            app.post('/logout', async(req, res) => {
                const user = req.body;
                res.clearCookie('token', { maxAge: 0 }).send({ success: true })
            })
        } catch (error) {
            console.log(error)
        }
        try {
            app.get('/assignment', async(req, res) => {
                const queryObj = {};
                const level = req.query.level;
                const page = parseInt(req.query.page);
                const parpage = 9
                if (level) {
                    queryObj.level = level;
                }
                const cours = AssignmentCollation.find(queryObj).skip(page * parpage).limit(parpage);
                const result = await cours.toArray();
                const count = await AssignmentCollation.estimatedDocumentCount();
                res.send({
                    result,
                    count
                })
            });
        } catch (error) {
            console.log(error)
        }
        try {
            app.get('/assarmentCount', async(req, res) => {
                const result = await AssignmentCollation.estimatedDocumentCount();
                res.send(result)
            })
        } catch (error) {
            console.log(error)
        }
        try {
            app.get('/assignment/:id', verifiedtoken, async(req, res) => {
                const id = req.params.id;
                // const id = req.query.id
                const cours = { _id: new ObjectId(id) }
                const result = await AssignmentCollation.findOne(cours);
                res.send(result)
            })
        } catch (error) {
            console.log(error)
        }
        try {
            app.post('/assignment', async(req, res) => {
                const assigment = req.body;
                console.log(assigment)
                const result = await AssignmentCollation.insertOne(assigment);
                res.send(result)
            });
        } catch (error) {
            console.log(error)
        }
        try {
            app.put('/assignment/:id', async(req, res) => {
                const data = req.body;
                const id = req.params.id;
                const quarys = {
                    _id: new ObjectId(id)
                };
                const options = { upsert: true };
                const update = {
                    $set: {
                        title: data.title,
                        marks: data.marks,
                        img: data.img,
                        description: data.description,
                        date: data.date,
                        level: data.level
                    }
                };
                console.log(id, data)
                const result = await AssignmentCollation.updateOne(quarys, update, options);
                return res.send(result)
            })
        } catch (error) {
            console.log(error)
        }

        try {
            app.post('/submitedata', verifiedtoken, async(req, res) => {
                const data = req.body;
                console.log(data)
                result = await SubmitCollation.insertOne(data);
                res.send(result)
            })
        } catch (error) {
            console.log(error)
        };
        try {
            app.put('/submitedata/:id', verifiedtoken, async(req, res) => {
                const id = req.params.id;
                const data = req.body;
                console.log(id, data)
                const quarys = {
                    _id: new ObjectId(id),
                };
                const options = { upsert: true };
                const update = {
                    $set: {
                        status: data.status,
                        pdf: data.pdf,
                        text: data.text,
                        mainmark: data.mainmark,
                        feedback: data.notes
                    }
                };
                const result = await SubmitCollation.updateOne(quarys, update, options);
                res.send(result)
            })
        } catch (error) {
            console.log(error)
        }
        try {
            app.get('/submitedata', verifiedtoken, async(req, res) => {
                const sataus = req.query.status;
                const email = req.query.email

                const quary = { status: sataus, useremail: email };
                const options = {
                    projection: {
                        title: 1,
                        marks: 1,
                        username: 1,
                        status: 1,
                        pdf: 1,
                        text: 1,
                        useremail: 1,
                        mainmark: 1,
                    },
                };
                const cours = SubmitCollation.find(quary, options);

                const result = await cours.toArray();
                res.send(result)
            })
        } catch (error) {
            console.log(error)
        }
        try {
            app.get('/submitedata/:id', verifiedtoken, async(req, res) => {
                const id = req.params.id;
                // const id = req.query.id
                console.log(id)
                const cours = { _id: new ObjectId(id) }
                const options = {
                    projection: {
                        title: 1,
                        status: 1,
                        pdf: 1,
                        text: 1,

                    },
                };
                const result = await SubmitCollation.findOne(cours, options);
                res.send(result)
            })
        } catch (error) {
            console.log(error)
        }


        try {
            app.delete('/assginment', verifiedtoken, async(req, res) => {
                const id = req.query.id;
                const useremail = req.query.email
                console.log(id, useremail)

                const quary = { _id: new ObjectId(id), email: useremail }
                const result = await AssignmentCollation.deleteOne(quary);
                res.send(result)
            })
        } catch (error) {
            console.log(error)
        }
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
    res.send('Hello word')
})

app.listen(port, () => {
    console.log(`
Example app listening on port ${port}
`)
})