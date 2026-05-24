import request from "supertest";
import app from "../src/app";

describe("GET /", () => {
  it("devrait retourner hello", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text.trim()).toContain("helloo");
  });
});
