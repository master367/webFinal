const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = 3002;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('Project2'));

const upload = multer({ dest: 'uploads/' });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "adiko7634@gmail.com",
        pass: "yxpq nkxy itqx bbty"
    }
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


app.post('/send-email', upload.single('attachment'), (req, res) => {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).send("Все поля (to, subject, text) обязательны.");
    }

    const mailOptions = {
        from: "adiko7634@gmail.com",
        to: to,
        subject: subject,
        text: text,
    };

    if (req.file) {
        mailOptions.attachments = [
            {
                filename: req.file.originalname || 'attachment',
                path: req.file.path,
            }
        ];
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send("Ошибка при отправке: " + error.toString());
        }
        res.send('Email отправлен: ' + info.response);
    });
});

app.listen(port, () => {
    console.log(`Project2 запущен на http://localhost:${port}`);
});
