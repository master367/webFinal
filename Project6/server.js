const express = require('express');
const mongo = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
app.use(express.json());

const project6Path = path.join(__dirname);
app.use(express.static(project6Path));

const publicPath = path.join(__dirname, '..', 'public');
app.use('/public', express.static(publicPath));

mongo.connect('mongodb://127.0.0.1/userDB');

const User = mongo.model('User' , new mongo.Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
}));

app.post('/register', async (req,res) => {
    const { username, password } = req.body;

    try {
        await new User({ username, password: await bcrypt.hash(password,10).save });
        res.json({ message: 'regis success' });
    } catch (e) {
        if(e.code === 11000) res.status(400).json({ message: 'user exists' });
        else res.status(400).json({ message : 'failed' });
    }
});

app.post('/login', async (req,res) => {
    const user = await User.findOne({ username: req.body.username });

    if (user && await bcrypt.compare(req.body.password, user.password)) {
        // Можно сохранить пользователя в сессии, если требуется
        res.json({ success: true, redirect: 'http://localhost:3000' });
    } else {
        res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
    }
});

app.get('/' , (req,res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.listen(3006 , () => console.log(`http://localhost:3006`))
