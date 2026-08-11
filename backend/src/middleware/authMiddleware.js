import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({
            message: "Token de autenticação não informado. Tente novamente!",
        });
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            message: "Formato do token inválido. Verifique o token e tente novamente!",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Token inválido ou expirado. Tente novamente com um token válido!",
        });
    }
}