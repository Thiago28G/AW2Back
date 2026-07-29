import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

const validarObjectId = (nombreParam = 'id') => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[nombreParam])) {
    return next(new ApiError(400, `El id '${req.params[nombreParam]}' no tiene un formato válido`));
  }
  next();
};

export default validarObjectId;
