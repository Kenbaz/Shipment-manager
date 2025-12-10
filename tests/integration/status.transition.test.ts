import request from "supertest";
import { app } from "../../src/app";

describe("Shipment Status Transitions", () => {
  let shipmentId: string;

  const createShipment = async (status?: string) => {
    const response = await request(app)
      .post("/api/v1/shipments")
      .send({
        senderName: "John Doe",
        receiverName: "Jane Smith",
        origin: "Lagos, Nigeria",
        destination: "Abuja, Nigeria",
        ...(status && { status }),
      });
    return response.body.data.id;
  };

  describe("Valid Transitions from Pending", () => {
    beforeEach(async () => {
      shipmentId = await createShipment();
    });

    it("should allow pending -> in_transit", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "in_transit" })
        .expect(200);

      expect(response.body.data.status).toBe("in_transit");
    });

    it("should allow pending -> cancelled", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "cancelled" })
        .expect(200);

      expect(response.body.data.status).toBe("cancelled");
    });

    it("should allow staying in pending (same status)", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "pending" })
        .expect(200);

      expect(response.body.data.status).toBe("pending");
    });
  });

  describe("Valid Transitions from In Transit", () => {
    beforeEach(async () => {
      shipmentId = await createShipment();
      // Move to in_transit
      await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "in_transit" });
    });

    it("should allow in_transit -> delivered", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "delivered" })
        .expect(200);

      expect(response.body.data.status).toBe("delivered");
    });

    it("should allow in_transit -> cancelled", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "cancelled" })
        .expect(200);

      expect(response.body.data.status).toBe("cancelled");
    });
  });

  describe("Invalid Transitions from Pending", () => {
    beforeEach(async () => {
      shipmentId = await createShipment();
    });

    it("should reject pending -> delivered", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "delivered" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INVALID_STATUS_TRANSITION");
      expect(response.body.message).toContain("Invalid status transition");
    });
  });

  describe("Invalid Transitions from In Transit", () => {
    beforeEach(async () => {
      shipmentId = await createShipment();
      await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "in_transit" });
    });

    it("should reject in_transit -> pending", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "pending" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INVALID_STATUS_TRANSITION");
    });
  });

  describe("Final State: Delivered", () => {
    beforeEach(async () => {
      shipmentId = await createShipment();
      await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "in_transit" });
      await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "delivered" });
    });

    it("should reject delivered -> pending", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "pending" })
        .expect(400);

      expect(response.body.error.code).toBe("INVALID_STATUS_TRANSITION");
      expect(response.body.message).toContain("final state");
    });

    it("should reject delivered -> in_transit", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "in_transit" })
        .expect(400);

      expect(response.body.error.code).toBe("INVALID_STATUS_TRANSITION");
    });

    it("should reject delivered -> cancelled", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "cancelled" })
        .expect(400);

      expect(response.body.error.code).toBe("INVALID_STATUS_TRANSITION");
    });

    it("should allow staying in delivered (same status)", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "delivered" })
        .expect(200);

      expect(response.body.data.status).toBe("delivered");
    });
  });

  describe("Final State: Cancelled", () => {
    beforeEach(async () => {
      shipmentId = await createShipment();
      await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "cancelled" });
    });

    it("should reject cancelled -> pending", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "pending" })
        .expect(400);

      expect(response.body.error.code).toBe("INVALID_STATUS_TRANSITION");
      expect(response.body.message).toContain("final state");
    });

    it("should reject cancelled -> in_transit", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "in_transit" })
        .expect(400);

      expect(response.body.error.code).toBe("INVALID_STATUS_TRANSITION");
    });

    it("should reject cancelled -> delivered", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "delivered" })
        .expect(400);

      expect(response.body.error.code).toBe("INVALID_STATUS_TRANSITION");
    });

    it("should allow staying in cancelled (same status)", async () => {
      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "cancelled" })
        .expect(200);

      expect(response.body.data.status).toBe("cancelled");
    });
  });

  describe("Error Message Details", () => {
    it("should include allowed transitions in error message", async () => {
      shipmentId = await createShipment();

      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "delivered" })
        .expect(400);

      expect(response.body.message).toContain("in_transit");
      expect(response.body.message).toContain("cancelled");
    });

    it("should indicate final state in error message", async () => {
      shipmentId = await createShipment();
      await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "in_transit" });
      await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "delivered" });

      const response = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .send({ status: "pending" })
        .expect(400);

      expect(response.body.message).toContain("final state");
    });
  });
});
