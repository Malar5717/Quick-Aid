const {
    emergencyToDepartmentStatusMap,
    emergencyToFacilityMap,
    emergencyNormalizationMap,
    emergencyResourceRequirements,
    resourceToFacilityMap,
    resourceToDepartmentStatusMap
} = require("../config/emergencyMappings");

// Map technical facility keys to human-readable names
const facilityDisplayNames = {
    has_er: "Emergency Room",
    has_24x7_doctors: "24/7 Doctors",
    has_icu: "ICU beds",
    has_nicu: "Neonatal ICU",
    has_picu: "Pediatric ICU",
    has_ventilators: "Ventilators",
    has_maternity_unit: "Maternity unit",
    has_trauma_center: "Trauma center",
    has_burn_unit: "Burn unit",
    has_cath_lab: "Cardiac catheterization lab",
    has_dialysis: "Dialysis facility",
    has_anti_venom: "Anti-venom treatment"
};

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function computeRecommendations({ lat, lng, emergency_type }, hospitals) {
    const normalizedEmergency = emergencyNormalizationMap[emergency_type] || "general";
    const facilityKey = emergencyToFacilityMap[normalizedEmergency];
    const departmentKey = emergencyToDepartmentStatusMap[normalizedEmergency];
    const requiredResources = emergencyResourceRequirements[emergency_type] || [];

    hospitals = hospitals.filter((hospital) => hospital.status !== "red");
    if (hospitals.length === 0) {
        return {
            message: "No hospitals available",
            emergency_type,
            count: 0,
            hospitals: [],
            warning: "All nearby hospitals are at full capacity (red status)"
        };
    }

    hospitals = hospitals.map((hospital) => {
        const [hospitalLng, hospitalLat] = hospital.location.coordinates;

        const distance_km = haversineDistance(lat, lng, hospitalLat, hospitalLng);

        const tags = [];
        const warnings = [];

        let effectiveStatus = hospital.status;
        let mode = "general";

        if (
            departmentKey &&
            hospital.facilities?.[facilityKey] &&
            hospital.department_status?.[departmentKey]?.status &&
            hospital.department_status[departmentKey].status !== "red"
        ) {
            effectiveStatus = hospital.department_status[departmentKey].status;
            mode = "specialized";
        }

        let score = 100;

        if(distance_km > 20) score -= 30;
        else if(distance_km > 10) score -= 15;
        else if(distance_km < 3) score += 10;
        else score -= (distance_km * 5);

        if (effectiveStatus === "green") score += 25;
        if (effectiveStatus === "yellow") score += 8;

        if (mode === "general" && facilityKey) {
            score -= 30;
            tags.push("General emergency only");
            warnings.push(`Specialized unit for ${normalizedEmergency} emergencies not available - patient may need transfer for advanced care`);
        } else if (mode === "specialized") {
            tags.push("Specialized care available");
        }

        requiredResources.forEach((resource) => {
            const resFacilityKey = resourceToFacilityMap[resource];
            if (!hospital.facilities?.[resFacilityKey]) {
                score -= 40;
                const displayName = facilityDisplayNames[resFacilityKey] || resource;
                warnings.push(`Missing: ${displayName}`);
            }
        });

        if (effectiveStatus === "green") {
            tags.push("Available now");
        } else if (effectiveStatus === "yellow") {
            tags.push("Moderate wait expected");
            warnings.push("Higher patient load - wait time may be longer than usual");
        }

        // plain json object for spreading
        const base = typeof hospital.toObject === "function" ? hospital.toObject() : hospital;

        const whyRecommended = [];

        if (distance_km < 5) {
            whyRecommended.push(`Very close - only ${distance_km.toFixed(1)} km away`);
        } else if (distance_km < 15) {
            whyRecommended.push(`Nearby option at ${distance_km.toFixed(1)} km`);
        } else {
            whyRecommended.push(`${distance_km.toFixed(1)} km away`);
        }

        if (effectiveStatus === "green") {
            whyRecommended.push("Currently accepting all patients");
        } else if (effectiveStatus === "yellow") {
            whyRecommended.push("Accepting patients with possible delays");
        }

        if (mode === "specialized") {
            whyRecommended.push(`Equipped for ${normalizedEmergency} emergencies`);
        }

        return {
            ...base,
            distance_km: Number(distance_km.toFixed(2)),
            score: Math.round(score),
            effective_status: effectiveStatus,
            mode,
            tags,
            warnings,
            why_recommended: whyRecommended
        };
    });

    hospitals.sort((a, b) => b.score - a.score);
    let top = hospitals.slice(0, 3);

    const hasSpecialized = top.some(h => h.mode === "specialized");
    if (!hasSpecialized && facilityKey) {
        const remainingSpecialized = hospitals.slice(3).find(h => h.mode === "specialized");
        if (remainingSpecialized) {
            top.push(remainingSpecialized);
        }
    }

    return {
        message: "Fetched hospitals successfully",
        emergency_type,
        count: top.length,
        hospitals: top
    };
}

module.exports = {
    computeRecommendations,
};
