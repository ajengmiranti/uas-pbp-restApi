import Joi from "joi";

const createProductValidation = Joi.object({
  nama: Joi.string().max(100).required(),
  deskripsi: Joi.string().max(100).optional(),
  harga: Joi.string().max(200).required(),
  stok: Joi.string().max(20).required(),
  kategori: Joi.string().max(20).required(),
});

const getProductValidation = Joi.number().positive().required();

const updateProductValidation = Joi.object({
  id: Joi.number().positive().required(),
  nama: Joi.string().max(100).required(),
  deskripsi: Joi.string().max(100).optional(),
  harga: Joi.string().max(200).required(),
  stok: Joi.string().max(20).required(),
  kategori: Joi.string().max(20).required(),
});

const searchProductValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(100).default(10),
  name: Joi.string().optional(),
  deskripsi: Joi.string().optional(),
  harga: Joi.string().optional(),
  stok: Joi.string().optional(),
  kategori: Joi.string().optional(),
});

export {
  createProductValidation,
  getProductValidation,
  updateProductValidation,
  searchProductValidation,
};
