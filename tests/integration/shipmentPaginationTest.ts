import request from "supertest";
import { app } from "../../src/app";

describe("Shipment Pagination", () => {
  const createShipment = (index: number) => ({
    senderName: `Sender ${index}`,
    receiverName: `Receiver ${index}`,
    origin: `Origin ${index}`,
    destination: `Destination ${index}`,
  });

  beforeEach(async () => {
    // Create 25 shipments for pagination testing
    const promises = [];
    for (let i = 1; i <= 25; i++) {
      promises.push(
        request(app).post("/api/v1/shipments").send(createShipment(i))
      );
    }
    await Promise.all(promises);
  });

  describe("Default Pagination", () => {
    it("should return first page with default limit of 10", async () => {
      const response = await request(app).get("/api/v1/shipments").expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });
  });

  describe("Custom Page and Limit", () => {
    it("should return specified page with custom limit", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?page=2&limit=5")
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination).toMatchObject({
        currentPage: 2,
        itemsPerPage: 5,
        totalItems: 25,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    it("should return last page correctly", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?page=3&limit=10")
        .expect(200);

      expect(response.body.data).toHaveLength(5); // 25 - 20 = 5 remaining
      expect(response.body.pagination).toMatchObject({
        currentPage: 3,
        totalPages: 3,
        hasNextPage: false,
        hasPrevPage: true,
      });
    });
  });

  describe("Edge Cases", () => {
    it("should return empty array for page beyond total pages", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?page=100")
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.currentPage).toBe(100);
    });

    it("should enforce maximum limit of 100", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?limit=200")
        .expect(200);

      // Should cap at 100, but we only have 25 items
      expect(response.body.data).toHaveLength(25);
      expect(response.body.pagination.itemsPerPage).toBe(100);
    });

    it("should default to page 1 for invalid page value", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?page=-1")
        .expect(200);

      expect(response.body.pagination.currentPage).toBe(1);
    });

    it("should default to limit 10 for invalid limit value", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?limit=0")
        .expect(200);

      expect(response.body.pagination.itemsPerPage).toBe(10);
    });
  });

  describe("Pagination Metadata Accuracy", () => {
    it("should calculate totalPages correctly", async () => {
      // With 25 items and limit 7, should be ceil(25/7) = 4 pages
      const response = await request(app)
        .get("/api/v1/shipments?limit=7")
        .expect(200);

      expect(response.body.pagination.totalPages).toBe(4);
    });

    it("should show correct hasNextPage on last page", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?page=5&limit=5")
        .expect(200);

      expect(response.body.pagination.hasNextPage).toBe(false);
    });

    it("should show correct hasPrevPage on first page", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?page=1")
        .expect(200);

      expect(response.body.pagination.hasPrevPage).toBe(false);
    });
  });
});
