export function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado.",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Você não possui permissão para acessar este recurso. Entre em contato com um administrador ou tente novamente com um login válido!",
            });
        }

        return next();
    };
}