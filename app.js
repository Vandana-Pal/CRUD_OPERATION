const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./User.model');
const config = require('./config/config');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const currentPath = process.cwd();
const morgan = require('morgan');
const port = process.env.Port;

app.use(express.json());
app.use(morgan('tiny'));

//Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(currentPath, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },

});

const upload = multer({ storage: storage });


//Insert Data
app.post('/addData', upload.single('image'), async (req, res) => {
    const { name, summary } = req.body;
    const image = req.file ? req.file.originalname : '';
    try {
        const userData = new User({ name, summary, image });
        await userData.save();
        res.status(200).send({
            message: 'Added Data successfully',
        })
    }
    catch (error) {
        res.status(500).send(error)
    }
})

//Get ALLData
app.get('/getData', async (req, res) => {
    try {
        const data = await User.find({})
        res.status(200).send(data)
    }
    catch (error) {
        res.status(500).send(error)
    }
})

//Get DataBYID
app.get('/getDataById/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const data = await User.findById(id);
        if (!data) {
            return res.status(404).send({ message: 'Data not found' });
        }
        res.status(200).send(data);
    }
    catch (error) {
        res.status(500).send(error);
    }
})

//UpdateData
app.put('/UpdateData/:id', upload.single('image'), async (req, res) => {
    const id = req.params.id;
    const { name, summary } = req.body;
    const image = req.file ? req.file.originalname : '';
    try {
        const data = await User.findByIdAndUpdate(id, { name, summary, image }, { new: true, runValidators: true });
        if (!data) {
            return res.status(404).send({
                message: 'Data not found for the given id.'
            });
        }
        res.status(200).send({
            message: 'Updated Data successfully',
        });
    }
    catch (error) {
        res.status(500).send(error);
    }
})

//Delete DataBYID
app.delete('/deleteData/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const data = await User.findByIdAndDelete(id);
        if (!data) {
            return res.status(404).send({ message: 'Data not found' });
        }
        res.status(200).send({
            message: 'Deleted Data successfully',
        });
    }
    catch (error) {
        res.status(500).send(error);
    }
})

//Mongo Connection
mongoose.connect(config.mongoose.url)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));


app.listen(port, () => {
    console.log(`Listening to Port ${port}`)
})