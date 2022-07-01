import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("CreateStatementController.spec", () => {
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

  it("should be able to deposit", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "me@me.com",
      password: "1234",
    });

    const { token } = responseToken.body;

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseDeposit.status).toBe(201);
  });

  it("should be able to withdraw", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "me@me.com",
      password: "1234",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseWithdraw.status).toBe(201);
  });

  it("should not be able to withdraw if insufficient funds", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "me@me.com",
      password: "1234",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 9900,
        description: "Test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseWithdraw.status).toBe(400);
  });
});
