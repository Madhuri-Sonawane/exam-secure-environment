require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = 4000;
connectDB();

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
