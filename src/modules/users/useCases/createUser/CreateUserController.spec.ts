import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("CreateUserController.spec", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Daniel",
      email: "me@me.com",
      password: "1234",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user if user already exists", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Daniel",
      email: "me@me.com",
      password: "1234",
    });
    const response = await request(app).post("/api/v1/users").send({
      name: "Daniel",
      email: "me@me.com",
      password: "1234",
    });

    expect(response.status).toBe(400);
  });
});
