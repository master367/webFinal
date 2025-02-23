import http from "http";
import url from "url";
import qr from "qr-image";
import fs from "fs";

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.url === "/") {
        fs.readFile("index.html", (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Server error");
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(data);
            }
        });
    } else if (parsedUrl.pathname === "/qr") {
        const qrText = parsedUrl.query.text || "";
        if (qrText.trim() === "") {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("Error: empty text");
            return;
        }

        res.writeHead(200, { "Content-Type": "image/png" });
        qr.image(qrText, { type: "png" }).pipe(res);
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Page not found");
    }
});

const PORT = 3005;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
