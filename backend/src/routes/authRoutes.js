import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, (req, res) => {
    return res.status(200).json({
        message: "Usuário autenticado com sucesso!",
        user: req.user,
    });
});

export default router;