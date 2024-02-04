import {
  createManyTestProducts,
  createTestProduct,
  createTestUser,
  getTestProduct,
  removeAllTestProducts,
  removeTestUser,
} from "./test-util.js";
import supertest from "supertest";
import { web } from "../src/application/web.js";
import { logger } from "../src/application/logging.js";

describe("POST /api/products", function () {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    await removeAllTestProducts();
    await removeTestUser();
  });

  it("should can create new products", async () => {
    const result = await supertest(web)
      .post("/api/products")
      .set("Authorization", "test")
      .send({
        nama: "test",
        deskripsi: "test",
        harga: "69000",
        stok: "300",
        kategori: "pakaian",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.id).toBeDefined();
    expect(result.body.data.nama).toBe("test");
    expect(result.body.data.deskripsi).toBe("test");
    expect(result.body.data.harga).toBe("69000");
    expect(result.body.data.stok).toBe("300");
    expect(result.body.data.kategori).toBe("pakaian");
  });

  it("should reject if request is not valid", async () => {
    const result = await supertest(web)
      .post("/api/products")
      .set("Authorization", "test")
      .send({
        nama: "",
        deskripsi: "test",
        harga: "6900087223920931093293",
        stok: "300",
        kategori: "pakaian",
      });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });
});

describe("GET /api/products/:productId", function () {
  beforeEach(async () => {
    await createTestUser();
    await createTestProduct();
  });

  afterEach(async () => {
    await removeAllTestProducts();
    await removeTestUser();
  });

  it("should can get products", async () => {
    const testProduct = await getTestProduct();

    const result = await supertest(web)
      .get("/api/cproducts/" + testProduct.id)
      .set("Authorization", "test");

    expect(result.status).toBe(200);
    expect(result.body.data.id).toBe(testProduct.id);
    expect(result.body.data.nama).toBe(testProduct.nama);
    expect(result.body.data.deskripsi).toBe(testProduct.deskripsi);
    expect(result.body.data.harga).toBe(testProduct.harga);
    expect(result.body.data.stok).toBe(testProduct.stok);
    expect(result.body.data.kategori).toBe(testProduct.kategori);
  });

  it("should return 404 if Products id is not found", async () => {
    const testProduct = await getTestProduct();

    const result = await supertest(web)
      .get("/api/products/" + (testProduct.id + 1))
      .set("Authorization", "test");

    expect(result.status).toBe(404);
  });
});

describe("PUT /api/products/:productId", function () {
  beforeEach(async () => {
    await createTestUser();
    await createTestProducts();
  });

  afterEach(async () => {
    await removeAllTestProducts();
    await removeTestUser();
  });

  it("should can update existing products", async () => {
    const testProduct = await getTestProduct();

    const result = await supertest(web)
      .put("/api/products/" + testProduct.id)
      .set("Authorization", "test")
      .send({
        first_name: "Eko",
        last_name: "Khannedy",
        email: "eko@pzn.com",
        phone: "09999999",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.id).toBe(testProduct.id);
    expect(result.body.data.nama).toBe("Ajeng");
    expect(result.body.data.deskripsi).toBe("Bahan katun lembut");
    expect(result.body.data.harga).toBe("67000");
    expect(result.body.data.stok).toBe(200);
    expect(result.body.data.kategori).toBe("Pakaian");
  });

  it("should reject if request is invalid", async () => {
    const testProduct = await getTestProduct();

    const result = await supertest(web)
      .put("/api/products/" + testProduct.id)
      .set("Authorization", "test")
      .send({
        nama: "",
        deskripsi: "",
        harga: "69000",
        stok: "",
        kategori: "",
      });

    expect(result.status).toBe(400);
  });

  it("should reject if products is not found", async () => {
    const testProduct = await getTestProduct();

    const result = await supertest(web)
      .put("/api/products/" + (testProduct.id + 1))
      .set("Authorization", "test")
      .send({
        nama: "test",
        deskripsi: "test",
        harga: "69000",
        stok: "30078867868765657656",
        kategori: "pakaian",
      });

    expect(result.status).toBe(404);
  });
});

describe("DELETE /api/products/:productId", function () {
  beforeEach(async () => {
    await createTestUser();
    await createTestProducts();
  });

  afterEach(async () => {
    await removeAllTestProducts();
    await removeTestUser();
  });

  it("should can delete products", async () => {
    let testProduct = await getTestProduct();
    const result = await supertest(web)
      .delete("/api/Products/" + testProduct.id)
      .set("Authorization", "test");

    expect(result.status).toBe(200);
    expect(result.body.data).toBe("OK");

    testProduct = await getTestProduct();
    expect(testProduct).toBeNull();
  });

  it("should reject if products is not found", async () => {
    let testProduct = await getTestProduct();
    const result = await supertest(web)
      .delete("/api/products/" + (testProduct.id + 1))
      .set("Authorization", "test");

    expect(result.status).toBe(404);
  });
});

describe("GET /api/products", function () {
  beforeEach(async () => {
    await createTestUser();
    await createManyTestProducts();
  });

  afterEach(async () => {
    await removeAllTestProducts();
    await removeTestUser();
  });

  it("should can search without parameter", async () => {
    const result = await supertest(web)
      .get("/api/products")
      .set("Authorization", "test");

    expect(result.status).toBe(200);
    expect(result.body.data.length).toBe(10);
    expect(result.body.paging.page).toBe(1);
    expect(result.body.paging.total_page).toBe(2);
    expect(result.body.paging.total_item).toBe(15);
    expect(result.body.paging.total_item).toBe(15);
  });

  it("should can search to page 2", async () => {
    const result = await supertest(web)
      .get("/api/products")
      .query({
        page: 2,
      })
      .set("Authorization", "test");

    logger.info(result.body);

    expect(result.status).toBe(200);
    expect(result.body.data.length).toBe(5);
    expect(result.body.paging.page).toBe(2);
    expect(result.body.paging.total_page).toBe(2);
    expect(result.body.paging.total_item).toBe(15);
    expect(result.body.paging.total_item).toBe(15);
  });

  it("should can search using name", async () => {
    const result = await supertest(web)
      .get("/api/products")
      .query({
        name: "test 1",
      })
      .set("Authorization", "test");

    logger.info(result.body);

    expect(result.status).toBe(200);
    expect(result.body.data.length).toBe(6);
    expect(result.body.paging.page).toBe(1);
    expect(result.body.paging.total_page).toBe(1);
    expect(result.body.paging.total_item).toBe(6);
    expect(result.body.paging.total_item).toBe(6);
  });

  it("should can search using email", async () => {
    const result = await supertest(web)
      .get("/api/products")
      .query({
        email: "test1",
      })
      .set("Authorization", "test");

    logger.info(result.body);

    expect(result.status).toBe(200);
    expect(result.body.data.length).toBe(6);
    expect(result.body.paging.page).toBe(1);
    expect(result.body.paging.total_page).toBe(1);
    expect(result.body.paging.total_item).toBe(6);
    expect(result.body.paging.total_item).toBe(6);
  });

  it("should can search using phone", async () => {
    const result = await supertest(web)
      .get("/api/products")
      .query({
        phone: "0809000001",
      })
      .set("Authorization", "test");

    logger.info(result.body);

    expect(result.status).toBe(200);
    expect(result.body.data.length).toBe(6);
    expect(result.body.paging.page).toBe(1);
    expect(result.body.paging.total_page).toBe(1);
    expect(result.body.paging.total_item).toBe(6);
    expect(result.body.paging.total_item).toBe(6);
  });
});
