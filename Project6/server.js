const express = require("express");
const mongo = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Разрешаем CORS и передачу cookie
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

const project6Path = path.join(__dirname);
app.use(express.static(project6Path));

const publicPath = path.join(__dirname, "..", "public");
app.use("/public", express.static(publicPath));

mongo.connect("mongodb://127.0.0.1/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const User = mongo.model(
    "User",
    new mongo.Schema({
        username: { type: String, unique: true, required: true },
        password: { type: String, required: true },
    })
);

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({ username, password: hashedPassword }).save();
        res.json({ message: "Регистрация успешна" });
    } catch (e) {
        if (e.code === 11000) res.status(400).json({ message: "Пользователь уже существует" });
        else res.status(400).json({ message: "Ошибка регистрации" });
    }
});

app.post("/login", async (req, res) => {
    const user = await User.findOne({ username: req.body.username });

    if (user && (await bcrypt.compare(req.body.password, user.password))) {
        // Генерация токена
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Устанавливаем cookie с токеном
        res.cookie("token", token, {
            httpOnly: true, // Доступно только серверу
            secure: false, // Поменяй на true, если используешь HTTPS
            sameSite: "strict",
        });

        res.json({ success: true, redirect: "http://localhost:3000" });
    } else {
        res.status(401).json({ success: false, message: "Неверный логин или пароль" });
    }
});

// Выход (очистка токена)
app.post("/logout", (req, res) => {
    res.clearCookie("token").json({ success: true, message: "Вы вышли" });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3006, () => console.log(`Auth service running on http://localhost:3006`));
