import "dotenv/config";

import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import checkinRoutes from "./routes/checkinRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/tickets", ticketRoutes);
app.use("/checkin", checkinRoutes);
app.use("/events", eventRoutes);

app.get("/", (req, res) => {
    return res.json({
        message: "Boraí API funcionando",
    });
});

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Servidor rodando na porta ${PORT}`
    );
});