import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, (req, res) => {
    return res.status(200).json({
        message: "Usuário autenticado com sucesso!",
        user: req.user,
    });
});
router.get(
    "/organizer",
    authenticate,
    authorize("ORGANIZER"),
    (req, res) => {
        return res.status(200).json({
            message: "Acesso autorizado para Organizador.",
        });
    }
);

router.get(
    "/client",
    authenticate,
    authorize("CLIENT"),
    (req, res) => {
        return res.status(200).json({
            message: "Acesso autorizado para Cliente.",
        });
    }
);

router.get(
    "/checkin",
    authenticate,
    authorize("CHECKIN"),
    (req, res) => {
        return res.status(200).json({
            message: "Acesso autorizado para Portaria.",
        });
    }
);

export default router;