const express = require("express");
const router = express.Router();

const Hospital = require("../models/Hospital");
const { computeRecommendations } = require("../services/recommendation");

router.get("/health", (req, res) => {
  res.json({ status: "Quick-Aid backend is running" });
});

// LOGIN (Admin or Staff)
router.post("/login", async (req, res) => {
  try {
    const { hospital_id, staff_code, access_code } = req.body;

    if (!hospital_id || !staff_code || !access_code) {
      return res.status(400).json({
        message: "hospital_id, staff_code and access_code are required"
      });
    }

    const hospital = await Hospital.findById(hospital_id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const staff = hospital.staff?.find(
      (s) =>
        s.staff_code === staff_code &&
        s.access_code === access_code
    );

    if (!staff) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      hospital_id: hospital._id,
      hospital_name: hospital.name,
      staff_code: staff.staff_code,
      role: staff.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

// MANAGE STAFF: ADD
router.post("/hospital/:id/staff", async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_code, access_code } = req.body;

    if (!staff_code || !access_code) {
      return res.status(400).json({
        message: "staff code and access code are required"
      });
    }

    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const exists = hospital.staff.find(
      (s) => s.staff_code === staff_code
    );

    if (exists) {
      return res.status(400).json({
        message: "Staff code already exists"
      });
    }

    hospital.staff.push({
      staff_code,
      access_code
    });

    await hospital.save();

    res.json({ message: "Staff added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add staff" });
  }
});

// MANAGE STAFF: REMOVE
router.delete("/hospital/:id/staff/:staff_code", async (req, res) => {
  try {
    const { id, staff_code } = req.params;

    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    hospital.staff = hospital.staff.filter(
      (s) => s.staff_code !== staff_code
    );

    await hospital.save();

    res.json({ message: "Staff removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove staff" });
  }
});

// UPDATE HOSPITAL DETAILS
router.put("/hospital/:id/profile", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    if (req.body.location) {
      const coords = req.body.location.coordinates;
      if (!Array.isArray(coords) || coords.length !== 2) {
        return res.status(400).json({ message: "Invalid location format" });
      }
      const [lng, lat] = coords;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return res.status(400).json({ message: "Invalid coordinates range" });
      }
    }

    const updatableFields = [
      "location",
      "contact",
      "facilities",
      "verification",
      "has_triage_area",
      "has_resuscitation_bay",
      "accepts_medico_legal_cases",
      "insurance",
      "hospital_type"
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        hospital[field] = req.body[field];
      }
    });

    await hospital.save();

    res.json({ message: "Hospital details updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update hospital details" });
  }
});

// GET HOSPITALS LIST
router.get("/hospitals", async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch hospitals" });
  }
});

// GET HOSPITAL SINGLE HOSPITAL
router.get("/hospital/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch hospital" });
  }
});

// UPDATE HOSPITAL STATUS
router.post("/hospital/status", async (req, res) => {
  try {
    const { hospital_id, status, department_status, updated_by } = req.body;

    const hospital = await Hospital.findById(hospital_id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    if (status && status !== hospital.status) {
      hospital.status_logs.push({
        facility: "general",
        from: hospital.status,
        to: status,
        updated_by
      });

      hospital.status = status;
    }

    if (department_status) {
      for (const dept in department_status) {
        const prev = hospital.department_status?.[dept]?.status || hospital.status;
        const next = department_status[dept].status;

        if (prev !== next) {
          hospital.status_logs.push({
            facility: dept,
            from: prev,
            to: next,
            updated_by
          });
        }

        hospital.department_status[dept] = department_status[dept];
      }
    }

    hospital.status_updated_at = new Date();
    hospital.status_updated_by = updated_by || "system";

    await hospital.save();

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// GET HOSPITAL LOGS
router.get("/hospital/:id/logs", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.json(
      (hospital.status_logs || []).slice(-50).reverse()
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

router.post("/recommend", async (req, res) => {
  try {
    const { lat, lng, emergency_type } = req.body;

    if (!lat || !lng || !emergency_type) {
      return res.status(400).json({ message: "lat, lng, and emergency_type are required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: "Invalid latitude (must be between -90 and 90)" });
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: "Invalid longitude (must be between -180 and 180)" });
    }

    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 50000
        }
      }
    }).limit(20);

    const result = computeRecommendations({ lat: latitude, lng: longitude, emergency_type }, hospitals);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch hospitals" });
  }
});

module.exports = router;
