import { prepaidZone } from "../data/prepaidDemoData.js";

// ─── Runtime mutable state ──────────────────────────────────────────────────
// Deep-cloned from demo data so the original module is never mutated.
// State resets on server restart — acceptable for demo/single-instance use.

function cloneZone(zone) {
  return {
    ...zone,
    houses: zone.houses.map((h) => ({
      ...h,
      daily_consumption: [...h.daily_consumption],
    })),
  };
}

const state = {
  [prepaidZone.zone_id]: cloneZone(prepaidZone),
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Augment a raw house object with derived metrics.
 */
function enrichHouse(house, tariffPerKL) {
  const total30d = house.daily_consumption.reduce((s, d) => s + d.litres, 0);
  const todayEntry = house.daily_consumption[house.daily_consumption.length - 1];
  const today = todayEntry?.litres ?? 0;
  const dailyAvg = Math.round(total30d / house.daily_consumption.length);
  const dailyCharge = (dailyAvg / 1000) * tariffPerKL;
  const estimatedDaysLeft =
    dailyCharge > 0 ? Math.floor(house.credit_balance_inr / dailyCharge) : null;

  return {
    house_id: house.house_id,
    meter_id: house.meter_id,
    resident_name: house.resident_name,
    resident_email: house.resident_email,
    address: house.address,
    valve_status: house.valve_status,
    credit_balance_inr: house.credit_balance_inr,
    consumption_30d_litres: total30d,
    today_litres: today,
    daily_avg_litres: dailyAvg,
    estimated_days_left: estimatedDaysLeft,
  };
}

/** Aggregate zone-wide daily consumption series for charting. */
function buildDailySeries(zone) {
  const map = {};
  for (const house of zone.houses) {
    for (const { date, litres } of house.daily_consumption) {
      map[date] = (map[date] || 0) + litres;
    }
  }
  const labels = Object.keys(map).sort();
  return { labels, values: labels.map((d) => map[d]) };
}

// ─── Exported service functions ─────────────────────────────────────────────

/**
 * Return the full zone overview: zone-level stats + per-house enriched data.
 */
export function getZoneOverview(zoneId) {
  const zone = state[zoneId];
  if (!zone) throw new Error(`Zone ${zoneId} not found`);

  const houses = zone.houses.map((h) => enrichHouse(h, zone.tariff_per_kl));

  const openCount = houses.filter((h) => h.valve_status === "open").length;
  const shutoffCount = houses.length - openCount;
  const lowBalanceCount = houses.filter(
    (h) => h.credit_balance_inr < zone.low_balance_threshold_inr
  ).length;
  const totalCredit = houses.reduce((s, h) => s + h.credit_balance_inr, 0);

  return {
    zone: {
      zone_id: zone.zone_id,
      name: zone.name,
      address: zone.address,
      tariff_per_kl: zone.tariff_per_kl,
      low_balance_threshold_inr: zone.low_balance_threshold_inr,
      total_houses: houses.length,
      open_valves: openCount,
      shutoff_valves: shutoffCount,
      low_balance_count: lowBalanceCount,
      total_credit_inr: totalCredit,
      daily_series: buildDailySeries(zone),
    },
    houses,
  };
}

/**
 * Add credit to a house.
 * Auto-reopens the valve when the balance crosses the threshold after recharge.
 */
export function rechargeHouse(zoneId, houseId, amount) {
  const zone = state[zoneId];
  if (!zone) throw new Error(`Zone ${zoneId} not found`);

  const house = zone.houses.find((h) => h.house_id === houseId);
  if (!house) throw new Error(`House ${houseId} not found in zone ${zoneId}`);
  if (amount <= 0) throw new Error("Recharge amount must be positive");

  house.credit_balance_inr = Math.round((house.credit_balance_inr + amount) * 100) / 100;

  // Auto-reopen valve when balance reaches or exceeds the threshold
  if (
    house.valve_status === "shutoff" &&
    house.credit_balance_inr >= zone.low_balance_threshold_inr
  ) {
    house.valve_status = "open";
  }

  return enrichHouse(house, zone.tariff_per_kl);
}

/**
 * Return a single enriched house — used by the public payment page (no auth required).
 */
export function getHouseInfo(zoneId, houseId) {
  const zone = state[zoneId];
  if (!zone) throw new Error(`Zone ${zoneId} not found`);

  const house = zone.houses.find((h) => h.house_id === houseId);
  if (!house) throw new Error(`House ${houseId} not found in zone ${zoneId}`);

  return {
    enriched: enrichHouse(house, zone.tariff_per_kl),
    zone: {
      zone_id: zone.zone_id,
      name: zone.name,
      tariff_per_kl: zone.tariff_per_kl,
      low_balance_threshold_inr: zone.low_balance_threshold_inr,
    },
  };
}
export function setValve(zoneId, houseId, action) {
  const zone = state[zoneId];
  if (!zone) throw new Error(`Zone ${zoneId} not found`);

  const house = zone.houses.find((h) => h.house_id === houseId);
  if (!house) throw new Error(`House ${houseId} not found in zone ${zoneId}`);
  if (!["open", "shutoff"].includes(action))
    throw new Error("action must be 'open' or 'shutoff'");

  house.valve_status = action;
  return enrichHouse(house, zone.tariff_per_kl);
}
