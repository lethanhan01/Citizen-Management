const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if(!req.user) {
            return res.status(401).json({
                success: false,
                message: "Chưa đăng nhập!"
            });
        }

        const userRole = req.user.role;

        if(allowedRoles.includes(userRole)) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền thực hiện chức năng này!"
            });
        }
    };
};

export default checkRole;