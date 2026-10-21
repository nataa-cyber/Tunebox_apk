
import "dotenv/config";

import app from "./app.ts";
import connection from "./db/index.ts";

const port = Number(process.env.PORT) || 8000;

async function startServer() {
  try {
    await connection.query("SELECT 1");

    app.listen(port, () => {
      console.log(`Server berjalan di port ${port}`);
    });
  } catch (error) {
    console.error("Gagal menghubungkan database:", error);
  }
}

startServer();
