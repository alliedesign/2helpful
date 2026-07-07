// lib/categories.js
// The community categories (from the services screenshot) plus General.
// value = stored in DB, label = shown to users, icon = small emoji.

export const CATEGORIES = [
  { value: "general",      label: "General",        icon: "💬", photo: "photo-1521791136064-7986c2920216" },
  { value: "automotive",   label: "Automotive",     icon: "🚗", photo: "photo-1492144534655-ae79c964c9d7" },
  { value: "beauty",       label: "Beauty",         icon: "💅", photo: "photo-1560066984-138dadb4c035" },
  { value: "cell_mobile",  label: "Cell / Mobile",  icon: "📱", photo: "photo-1512941937669-90a1b58e7e9c" },
  { value: "computer",     label: "Computer",       icon: "💻", photo: "photo-1517336714731-489689fd1ca8" },
  { value: "creative",     label: "Creative",       icon: "🎨", photo: "photo-1452860606245-08befc0ff44b" },
  { value: "cycle",        label: "Cycle",          icon: "🚲", photo: "photo-1485965120184-e220f721d03e" },
  { value: "event",        label: "Event",          icon: "🎉", photo: "photo-1464366400600-7168b8af9bc3" },
  { value: "farm_garden",  label: "Farm + Garden",  icon: "🌱", photo: "photo-1416879595882-3373a0480b5b" },
  { value: "financial",    label: "Financial",      icon: "💰", photo: "photo-1554224155-6726b3ff858f" },
  { value: "health_well",  label: "Health / Well",  icon: "🩺", photo: "photo-1571019613454-1cb2f99b2d8b" },
  { value: "household",    label: "Household",       icon: "🏠", photo: "photo-1581578731548-c64695cc6952" },
  { value: "labor_move",   label: "Labor / Move",   icon: "📦", photo: "photo-1600518464441-9154a4dea21b" },
  { value: "legal",        label: "Legal",          icon: "⚖️", photo: "photo-1589829545856-d10d557cf95f" },
  { value: "lessons",      label: "Lessons",        icon: "📚", photo: "photo-1503676260728-1c00da094a0b" },
  { value: "marine",       label: "Marine",         icon: "⚓", photo: "photo-1544551763-46a013bb70d5" },
  { value: "pet",          label: "Pet",            icon: "🐾", photo: "photo-1450778869180-41d0601e046e" },
  { value: "real_estate",  label: "Real Estate",    icon: "🏘️", photo: "photo-1560518883-ce09059eeffa" },
  { value: "skilled_trade",label: "Skilled Trade",  icon: "🔧", photo: "photo-1581092580497-e0d23cbdf1dc" },
  { value: "sm_biz_ads",   label: "Sm Biz Ads",     icon: "📣", photo: "photo-1556761175-b413da4baf72" },
  { value: "travel_vac",   label: "Travel / Vac",   icon: "✈️", photo: "photo-1488646953014-85cb44e25828" },
  { value: "write_ed_tran",label: "Write / Ed / Tran", icon: "✍️", photo: "photo-1455390582262-044cdead277a" },
];

// Build a sized Unsplash image URL for a category tile.
export function categoryPhoto(value, w = 600, h = 400) {
  const c = CATEGORIES.find((x) => x.value === value);
  if (!c || !c.photo) return "";
  return `https://images.unsplash.com/${c.photo}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;
}

export function categoryLabel(value) {
  const c = CATEGORIES.find((x) => x.value === value);
  return c ? `${c.icon} ${c.label}` : "💬 General";
}
