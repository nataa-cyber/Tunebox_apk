
import "dotenv/config";

import app from "./app.ts";
import connection from "./db/index.ts";
import cors from "cors";

const port = Number(process.env.PORT) || 8000;

async function startServer() {
    try {
        await connection.query("SELECT 1");

        app.listen(port, () => {
            console.log(`Server berjalan di http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Gagal menghubungkan database:", error);
    }
}

startServer();

