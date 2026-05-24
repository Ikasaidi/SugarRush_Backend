import request from "supertest";
import app from "../src/app";

describe("GET /", () => {
  it("should return hello", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text.trim()).toContain("helloo");
  });
});