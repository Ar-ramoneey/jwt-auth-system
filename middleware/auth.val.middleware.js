export const validate = (schma) => {
  return (req, res, next) => {
    const { error } = schma.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.map((err) => err.message).join(", ");
      console.error("Validation error:", details);
      return res.status(400).json({
        message: "Validation failed",
        errors: details,
      });
    }
    next();
  };
};
