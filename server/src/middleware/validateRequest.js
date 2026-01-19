import { validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    success: false,
    message: "Dữ liệu không hợp lệ",
    errors: errors.array(),
  });
};

export default validateRequest;