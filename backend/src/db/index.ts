import mysql from 'mysql2/promise';
import "dotenv/config";
// Create the connection to database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: "Nataa28!",
  database: 'music_apk',
  waitForConnections: true,
  connectionLimit: 10
});

export default pool