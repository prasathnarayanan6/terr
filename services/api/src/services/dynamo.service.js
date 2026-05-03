import { appConfig } from "../config/env.js";
import { demoApartment } from "../data/demoData.js";

// ─── Demo helpers ──────────────────────────────────────────────────────────
// When running in demo mode we derive everything from the in-memory demoData
// so no real DynamoDB calls are made.

function demoCycle() {
  const bc = demoApartment.billing_cycle;
  return {
    cycleId: `${bc.period_start}`,
    startDate: bc.period_start,
    endDate: bc.period_end,
    dueDate: bc.next_due,
    tariffPerKL: bc.tariff_per_kl,
    leakagePenaltyPerL: 0.5,
    societyInfo: {
      legalName: "Sobha Lakeview Residents Association",
      appName: "MyGate",
      bank: "HDFC Bank",
      accNo: "XXXX1234567",
      ifsc: "HDFC0001234",
    },
  };
}

function demoFlats() {
  return demoApartment.flats.map((f) => ({
    flatId: f.flat_id,
    residentName: f.resident_name,
    email: f.resident_email,
    block: f.block_id,
    flatNo: f.flat_id,
    inletCount: f.devices?.length ?? 5,
    installedMeters: f.devices?.length ?? 5,
    activeMeters: f.devices?.filter((d) => d.status === "active").length ?? 5,
  }));
}

function demoReadingsForFlat(flat) {
  const totalLitres = flat.daily_consumption.reduce(
    (sum, d) => sum + d.litres,
    0
  );
  // Distribute roughly across inlets
  return {
    inlets: {
      kitchen: Math.round(totalLitres * 0.30),
      bath1: Math.round(totalLitres * 0.25),
      bath2: Math.round(totalLitres * 0.20),
      bath3: Math.round(totalLitres * 0.15),
      utility: Math.round(totalLitres * 0.10),
    },
    leakage: {
      kitchen: flat.leak_events?.filter((e) => e.source === "Kitchen").reduce((s, e) => s + e.litres, 0) ?? 0,
      bath1: flat.leak_events?.filter((e) => e.source === "Bathroom").reduce((s, e) => s + e.litres, 0) ?? 0,
      bath2: 0,
      bath3: 0,
      utility: flat.leak_events?.filter((e) => e.source === "Utility").reduce((s, e) => s + e.litres, 0) ?? 0,
    },
    prevConsumed: Math.round(totalLitres * 0.94),
    prevCharges: Math.round((totalLitres * 0.94 / 1000) * demoApartment.billing_cycle.tariff_per_kl),
  };
}

// ─── Exported functions ────────────────────────────────────────────────────

/**
 * Fetch a billing-cycle object by its ID.
 */
export async function getBillingCycle(cycleId) {
  if (appConfig.demoMode) {
    return demoCycle();
  }

  // TODO: real DynamoDB GetCommand against appConfig.tables.billing
  throw new Error("Live DynamoDB not yet implemented for getBillingCycle");
}

/**
 * Return every flat that has an email address.
 */
export async function getAllActiveFlats() {
  if (appConfig.demoMode) {
    return demoFlats().filter((f) => f.email);
  }

  throw new Error("Live DynamoDB not yet implemented for getAllActiveFlats");
}

/**
 * Get a single flat by its ID.
 */
export async function getFlatById(flatId) {
  if (appConfig.demoMode) {
    const rawFlat = demoApartment.flats.find(
      (f) => f.flat_id === flatId
    );
    if (!rawFlat) throw new Error(`Flat ${flatId} not found`);
    return {
      flatId: rawFlat.flat_id,
      residentName: rawFlat.resident_name,
      email: rawFlat.resident_email,
      block: rawFlat.block_id,
      flatNo: rawFlat.flat_id,
      inletCount: rawFlat.devices?.length ?? 5,
      installedMeters: rawFlat.devices?.length ?? 5,
      activeMeters: rawFlat.devices?.filter((d) => d.status === "active").length ?? 5,
    };
  }

  throw new Error("Live DynamoDB not yet implemented for getFlatById");
}

/**
 * Readings for a single flat + cycle.
 */
export async function getReadingsForFlat(flatId, cycleId) {
  if (appConfig.demoMode) {
    const rawFlat = demoApartment.flats.find((f) => f.flat_id === flatId);
    if (!rawFlat) throw new Error(`Flat ${flatId} not found`);
    return demoReadingsForFlat(rawFlat);
  }

  throw new Error("Live DynamoDB not yet implemented for getReadingsForFlat");
}

/**
 * Batch-fetch readings for many flats in a cycle.
 * Returns a map: { [flatId]: readingsObject }
 */
export async function getReadingsForCycle(cycleId, flatIds) {
  if (appConfig.demoMode) {
    const map = {};
    for (const id of flatIds) {
      const rawFlat = demoApartment.flats.find((f) => f.flat_id === id);
      if (rawFlat) {
        map[id] = demoReadingsForFlat(rawFlat);
      }
    }
    return map;
  }

  throw new Error("Live DynamoDB not yet implemented for getReadingsForCycle");
}