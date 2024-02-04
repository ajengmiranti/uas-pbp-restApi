import { validate } from "../validation/validation.js";
import {
  createProductValidation,
  getProductValidation,
  searchProductValidation,
  updateProductValidation,
} from "../validation/product-validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";

const create = async (user, request) => {
  const product = validate(createProductValidation, request);

  return prismaClient.product.create({
    data: {
      ...product,
      user: { connect: { username: user.username } },
    },
    select: {
      id: true,
      nama: true,
      deskripsi: true,
      harga: true,
      stok: true,
      kategori: true,
    },
  });
};

const get = async (user, productId) => {
  productId = validate(getProductValidation, productId);

  const product = await prismaClient.product.findFirst({
    where: {
      userId: user.username, // Ganti username dengan userId
      id: productId,
    },
    select: {
      id: true,
      nama: true,
      deskripsi: true,
      harga: true,
      stok: true,
      kategori: true,
    },
  });

  if (!product) {
    throw new ResponseError(404, "product is not found");
  }

  return product;
};

const update = async (user, request) => {
  const product = validate(updateProductValidation, request);

  const totalproductInDatabase = await prismaClient.product.count({
    where: {
      userId: user.username, // Ganti username dengan userId
      id: product.id,
    },
  });

  if (totalproductInDatabase !== 1) {
    throw new ResponseError(404, "product is not found");
  }

  return prismaClient.product.update({
    where: {
      id: product.id,
    },
    data: {
      nama: product.nama,
      deskripsi: product.deskripsi,
      harga: product.harga,
      stok: product.stok,
      kategori: product.kategori,
    },
    select: {
      id: true,
      nama: true,
      deskripsi: true,
      harga: true,
      stok: true,
      kategori: true,
    },
  });
};

const remove = async (user, productId) => {
  productId = validate(getProductValidation, productId);

  const totalInDatabase = await prismaClient.product.count({
    where: {
      userId: user.username, // Ganti username dengan userId
      id: 1,
    },
  });

  if (totalInDatabase !== 1) {
    throw new ResponseError(404, "product is not found");
  }

  return prismaClient.product.delete({
    where: {
      id: productId,
    },
  });
};

const search = async (user, request) => {
  request = validate(searchProductValidation, request);

  // 1 ((page - 1) * size) = 0
  // 2 ((page - 1) * size) = 10
  const skip = (request.page - 1) * request.size;

  const filters = [];

  filters.push({
    userId: user.username, // Ganti username dengan userId
  });

  if (request.name) {
    filters.push({
      OR: [
        {
          nama: {
            contains: request.name,
          },
        },
        {
          nama: {
            contains: request.name,
          },
        },
      ],
    });
  }
  if (request.email) {
    filters.push({
      email: {
        contains: request.email,
      },
    });
  }
  if (request.phone) {
    filters.push({
      phone: {
        contains: request.phone,
      },
    });
  }

  const products = await prismaClient.product.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
  });

  const totalItems = await prismaClient.product.count({
    where: {
      AND: filters,
    },
  });

  return {
    data: products,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default {
  create,
  get,
  update,
  remove,
  search,
};
