const express = require("express");
const app = express();
const PORT = 3001;
const cors = require('cors');

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/calculate-bmi", (req, res) => {
    const { weight, height } = req.body;
    const bmi = (weight / (height / 100) ** 2).toFixed(2);

    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 24.9) category = "Normal weight";
    else if (bmi < 29.9) category = "Overweight";
    else category = "Overweightxxl";

    res.send(`
    <h2>Your BMI: ${bmi}</h2>
    <p> You are classified as:
        <strong style="color: ${
        category === "Normal weight" ? "green" : category === "Overweight" ? "yellow" : "red"
    };">${category}
        </strong>
    </p>
    <a href="/">Back</a>
  `);
});

app.listen(PORT);
