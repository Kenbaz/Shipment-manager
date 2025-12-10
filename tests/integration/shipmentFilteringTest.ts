import request from "supertest";
import { app } from "../../src/app";

describe("Shipment Filtering and Sorting", () => {
  beforeEach(async () => {
    // diverse shipments for testing
    const shipments = [
      {
        senderName: "John Doe",
        receiverName: "Jane Smith",
        origin: "Lagos, Nigeria",
        destination: "Abuja, Nigeria",
        status: "pending",
      },
      {
        senderName: "Alice Johnson",
        receiverName: "Bob Williams",
        origin: "Lagos, Nigeria",
        destination: "Kano, Nigeria",
        status: "in_transit",
      },
      {
        senderName: "Charlie Brown",
        receiverName: "Diana Prince",
        origin: "Port Harcourt, Nigeria",
        destination: "Abuja, Nigeria",
        status: "delivered",
      },
      {
        senderName: "John Smith",
        receiverName: "Mary Johnson",
        origin: "Ibadan, Nigeria",
        destination: "Lagos, Nigeria",
        status: "cancelled",
      },
    ];

    for (const shipment of shipments) {
      await request(app).post("/api/v1/shipments").send(shipment);
    }
  });

  describe("Filter by Status", () => {
    it("should filter by pending status", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?status=pending")
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe("pending");
    });

    it("should filter by in_transit status", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?status=in_transit")
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe("in_transit");
    });

    it("should filter by delivered status", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?status=delivered")
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe("delivered");
    });

    it("should return 400 for invalid status value", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?status=invalid")
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Filter by Origin", () => {
    it("should filter by origin (partial match)", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?origin=Lagos")
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach((shipment: { origin: string }) => {
        expect(shipment.origin.toLowerCase()).toContain("lagos");
      });
    });

    it("should be case-insensitive", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?origin=lagos")
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });
  });

  describe("Filter by Destination", () => {
    it("should filter by destination (partial match)", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?destination=Abuja")
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach((shipment: { destination: string }) => {
        expect(shipment.destination.toLowerCase()).toContain("abuja");
      });
    });
  });

  describe("Search", () => {
    it("should search by sender name", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?search=John")
        .expect(200);

      expect(response.body.data).toHaveLength(2); // John Doe and John Smith
    });

    it("should search by receiver name", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?search=Johnson")
        .expect(200);

      expect(response.body.data).toHaveLength(2); // Alice Johnson (sender has Johnson) and Mary Johnson
    });

    it("should be case-insensitive", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?search=john")
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });
  });

  describe("Sorting", () => {
    it("should sort by senderName ascending", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?sortBy=senderName&order=asc")
        .expect(200);

      const names = response.body.data.map(
        (s: { senderName: string }) => s.senderName
      );
      expect(names).toEqual([...names].sort());
    });

    it("should sort by senderName descending", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?sortBy=senderName&order=desc")
        .expect(200);

      const names = response.body.data.map(
        (s: { senderName: string }) => s.senderName
      );
      expect(names).toEqual([...names].sort().reverse());
    });

    it("should default to createdAt descending", async () => {
      const response = await request(app).get("/api/v1/shipments").expect(200);

      const dates = response.body.data.map((s: { createdAt: string }) =>
        new Date(s.createdAt).getTime()
      );
      // Should be in descending order (newest first)
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });

    it("should return 400 for invalid sortBy field", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?sortBy=invalidField")
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Combined Filters", () => {
    it("should combine status and origin filters", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?status=pending&origin=Lagos")
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe("pending");
      expect(response.body.data[0].origin).toContain("Lagos");
    });

    it("should combine filters with sorting", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?origin=Nigeria&sortBy=senderName&order=asc")
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      const names = response.body.data.map(
        (s: { senderName: string }) => s.senderName
      );
      expect(names).toEqual([...names].sort());
    });

    it("should combine filters with pagination", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?origin=Nigeria&page=1&limit=2")
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.itemsPerPage).toBe(2);
    });
  });
});
