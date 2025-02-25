require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Настройки CORS
app.use(cors({ credentials: true, origin: "http://localhost:3006" }));
app.use(express.static("public"))
app.use(cookieParser());

// Middleware для проверки токена
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(403).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = decoded;
        next();
    });
};

// Проксирование с защитой
const protectedProxy = (target) =>
    [
        authMiddleware,
        createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: { "^/api": "" },
        }),
    ];

// Проксируем мини-проекты (доступны только с авторизацией)
app.use("/Project1", protectedProxy("http://localhost:3001"));
app.use("/Project2", protectedProxy("http://localhost:3002"));
app.use("/Project3", protectedProxy("http://localhost:3003"));
app.use("/Project4", protectedProxy("http://localhost:3004"));
app.use("/Project5", protectedProxy("http://localhost:3005"));

// Разрешаем доступ только к странице логина/регистрации
app.use(
    "/auth",
    createProxyMiddleware({ target: "http://localhost:3006", changeOrigin: true })
);

app.post("/logout", (req, res) => {
    res.clearCookie("token").json({ message: "Logged out" });
});

// Запуск сервера
app.listen(PORT, () => console.log(`API Gateway running on http://localhost:${PORT}`));
