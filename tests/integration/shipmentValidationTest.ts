import request from "supertest";
import { app } from "../../src/app";

describe("Shipment Input Validation", () => {
  describe("Create Shipment Validation", () => {
    describe("Required Fields", () => {
      it("should require senderName", async () => {
        const response = await request(app)
          .post("/api/v1/shipments")
          .send({
            receiverName: "Jane Smith",
            origin: "Lagos",
            destination: "Abuja",
          })
          .expect(400);

        expect(response.body.error.code).toBe("VALIDATION_ERROR");
        expect(response.body.error.details).toContainEqual(
          expect.objectContaining({ field: "senderName" })
        );
      });

      it("should require receiverName", async () => {
        const response = await request(app)
          .post("/api/v1/shipments")
          .send({
            senderName: "John Doe",
            origin: "Lagos",
            destination: "Abuja",
          })
          .expect(400);

        expect(response.body.error.details).toContainEqual(
          expect.objectContaining({ field: "receiverName" })
        );
      });

      it("should require origin", async () => {
        const response = await request(app)
          .post("/api/v1/shipments")
          .send({
            senderName: "John Doe",
            receiverName: "Jane Smith",
            destination: "Abuja",
          })
          .expect(400);

        expect(response.body.error.details).toContainEqual(
          expect.objectContaining({ field: "origin" })
        );
      });

      it("should require destination", async () => {
        const response = await request(app)
          .post("/api/v1/shipments")
          .send({
            senderName: "John Doe",
            receiverName: "Jane Smith",
            origin: "Lagos",
          })
          .expect(400);

        expect(response.body.error.details).toContainEqual(
          expect.objectContaining({ field: "destination" })
        );
      });

      it("should report all missing fields at once", async () => {
        const response = await request(app)
          .post("/api/v1/shipments")
          .send({})
          .expect(400);

        expect(response.body.error.details.length).toBeGreaterThanOrEqual(4);
      });
    });

    describe("Field Length Constraints", () => {
      it("should reject senderName shorter than 2 characters", async () => {
        const response = await request(app)
          .post("/api/v1/shipments")
          .send({
            senderName: "J",
            receiverName: "Jane Smith",
            origin: "Lagos",
            destination: "Abuja",
          })
          .expect(400);

        expect(response.body.error.details).toContainEqual(
          expect.objectContaining({
            field: "senderName",
            message: expect.stringContaining("at least 2 characters"),
          })
        );
      });

      it("should reject senderName longer than 100 characters", async () => {
        const response = await request(app)
          .post("/api/v1/shipments")
          .send({
            senderName: "A".repeat(101),
            receiverName: "Jane Smith",
            origin: "Lagos",
            destination: "Abuja",
          })
          .expect(400);

        expect(response.body.error.details).toContainEqual(
          expect.objectContaining({
            field: "senderName",
            message: expect.stringContaining("at most 100 characters"),
          })
        );
      });

      it("should reject origin longer than 200 characters", async () => {
        const response = await request(app)
          .post("/api/v1/shipments")
          .send({
            senderName: "John Doe",
            receiverName: "Jane Smith",
            origin: "A".repeat(201),
            destination: "Abuja",
          })
          .expect(400);

        expect(response.body.error.details).toContainEqual(
          expect.objectContaining({ field: "origin" })
        );
      });
    });

    describe("Status Validation", () => {
      it("should accept valid status values", async () => {
        const validStatuses = [
          "pending",
          "in_transit",
          "delivered",
          "cancelled",
        ];

        for (const status of validStatuses) {
          const response = await request(app).post("/api/v1/shipments").send({
            senderName: "John Doe",
            receiverName: "Jane Smith",
            origin: "Lagos",
            destination: "Abuja",
            status,
          });

          expect(response.status).toBe(201);
          expect(response.body.data.status).toBe(status);
        }
      });

      it("should reject invalid status values", async () => {
        const response = await request(app)
          .post("/api/v1/shipments")
          .send({
            senderName: "John Doe",
            receiverName: "Jane Smith",
            origin: "Lagos",
            destination: "Abuja",
            status: "invalid_status",
          })
          .expect(400);

        expect(response.body.error.details).toContainEqual(
          expect.objectContaining({ field: "status" })
        );
      });
    });

    describe("Whitespace Handling", () => {
      it("should trim whitespace from string fields", async () => {
        const response = await request(app)
          .post("/api/v1/shipments")
          .send({
            senderName: "  John Doe  ",
            receiverName: "  Jane Smith  ",
            origin: "  Lagos  ",
            destination: "  Abuja  ",
          })
          .expect(201);

        expect(response.body.data.senderName).toBe("John Doe");
        expect(response.body.data.receiverName).toBe("Jane Smith");
        expect(response.body.data.origin).toBe("Lagos");
        expect(response.body.data.destination).toBe("Abuja");
      });
    });
  });

  describe("Update Shipment Validation", () => {
    let shipmentId: string;

    beforeEach(async () => {
      const response = await request(app).post("/api/v1/shipments").send({
        senderName: "John Doe",
        receiverName: "Jane Smith",
        origin: "Lagos",
        destination: "Abuja",
      });
      shipmentId = response.body.data.id;
    });

    it("should require at least one field", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.message).toContain("At least one field");
    });

    it("should validate field constraints on update", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ senderName: "J" })
        .expect(400);

      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({ field: "senderName" })
      );
    });

    it("should allow partial updates", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ receiverName: "Updated Receiver" })
        .expect(200);

      expect(response.body.data.receiverName).toBe("Updated Receiver");
      expect(response.body.data.senderName).toBe("John Doe");
    });
  });

  describe("ID Parameter Validation", () => {
    it("should reject invalid MongoDB ObjectId format", async () => {
      const invalidIds = [
        "invalid",
        "123",
        "xyz123abc",
        "507f1f77bcf86cd79943901", // 23 chars (should be 24)
        "507f1f77bcf86cd7994390111", // 25 chars
      ];

      for (const id of invalidIds) {
        const response = await request(app)
          .get(`/api/v1/shipments/${id}`)
          .expect(400);

        expect(response.body.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should accept valid MongoDB ObjectId format", async () => {
      const response = await request(app)
        .get("/api/v1/shipments/507f1f77bcf86cd799439011")
        .expect(404); // Valid format but not found

      expect(response.body.error.code).toBe("RESOURCE_NOT_FOUND");
    });
  });

  describe("Query Parameter Validation", () => {
    it("should reject invalid sortBy values", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?sortBy=invalidField")
        .expect(400);

      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject invalid order values", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?order=invalid")
        .expect(400);

      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject invalid status filter", async () => {
      const response = await request(app)
        .get("/api/v1/shipments?status=invalid")
        .expect(400);

      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should accept valid query parameters", async () => {
      const response = await request(app)
        .get(
          "/api/v1/shipments?page=1&limit=10&sortBy=createdAt&order=desc&status=pending"
        )
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe("JSON Body Validation", () => {
    it("should reject invalid JSON", async () => {
      const response = await request(app)
        .post("/api/v1/shipments")
        .set("Content-Type", "application/json")
        .send("{ invalid json }")
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
