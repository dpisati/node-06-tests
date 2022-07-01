import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("AuthenticateUserController.spec", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("1234", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at) values('${id}', 'me', 'me@me.com', '${password}', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "me@me.com",
      password: "1234",
    });

    expect(responseToken.status).toBe(200);
  });

  it("should not be able to authenticate with wrong password", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "me@me.com",
      password: "1",
    });

    expect(responseToken.status).toBe(401);
  });

  it("should not be able to authenticate with wrong email", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "1@me.com",
      password: "1",
    });

    expect(responseToken.status).toBe(401);
  });
});
