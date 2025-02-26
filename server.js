require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongo = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

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

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(403).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = decoded;
        next();
    });
};

const protectedProxy = (target) => [
    authMiddleware,
    createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: { "^/api": "" },
    }),
];

app.get("/auth", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "auth.html"));
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({ username, password: hashedPassword }).save();
        res.json({ message: "Registration is successful" });
    } catch (e) {
        if (e.code === 11000) res.status(400).json({ message: "The user already exists" });
        else res.status(400).json({ message: "Registration error" });
    }
});

app.post("/login", async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        res.json({ success: true, redirect: "http://localhost:3000" });
    } else {
        res.status(401).json({ success: false, message: "Invalid username or password" });
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie("token").json({ success: true, message: "Logged out" });
});

app.use("/Project1", protectedProxy("http://localhost:3001"));
app.use("/Project2", protectedProxy("http://localhost:3002"));
app.use("/Project3", protectedProxy("http://localhost:3003"));
app.use("/Project4", protectedProxy("http://localhost:3004"));
app.use("/Project5", protectedProxy("http://localhost:3005"));

app.listen(PORT, () => console.log(`API Gateway running on http://localhost:${PORT}`));