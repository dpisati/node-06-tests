import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("GetBalanceController.spec", () => {
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

  it("should be able to get the balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "me@me.com",
      password: "1234",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });
});
