/**
 * Quick sanity check for 1C duplicate merge rules (max price, sum stock).
 * Run: node scripts/test-onec-merge.mjs
 */

function warehouseKey(w) {
  const id = String(w.Id ?? "").trim();
  const name = String(w.Sklad ?? "").trim();
  return id || name || "_unknown";
}

function mergeOnecItems(items) {
  const byId = new Map();
  for (const item of items) {
    const externalId = String(item.Id ?? "").trim();
    if (!externalId) continue;
    const name = String(item.Name ?? "").trim() || "Без названия";
    const price = Number(item.Price ?? 0) || 0;
    const rows = Array.isArray(item.Склады) ? item.Склады : [];
    let entry = byId.get(externalId);
    if (!entry) {
      entry = { name, price, warehouses: new Map(), duplicateRows: 0 };
      byId.set(externalId, entry);
    } else {
      entry.duplicateRows += 1;
      if (name && name !== "Без названия") entry.name = name;
      if (price > entry.price) entry.price = price;
    }
    for (const w of rows) {
      const key = warehouseKey(w);
      const qty = Number(w.Ostatok ?? 0) || 0;
      const prev = entry.warehouses.get(key);
      if (prev) prev.quantity += qty;
      else
        entry.warehouses.set(key, {
          name: String(w.Sklad ?? "").trim() || key,
          quantity: qty,
        });
    }
  }
  return [...byId.entries()].map(([externalId, entry]) => {
    const warehouses = [...entry.warehouses.values()];
    return {
      externalId,
      name: entry.name,
      price: entry.price,
      stock: warehouses.reduce((s, w) => s + w.quantity, 0),
      duplicateRows: entry.duplicateRows,
    };
  });
}

const sample = [
  {
    Id: "RZ1",
    Name: "Test",
    Price: 100,
    Склады: [{ Id: "A", Sklad: "Склад Алмагул", Ostatok: 2 }],
  },
  {
    Id: "RZ1",
    Name: "Test",
    Price: 250,
    Склады: [{ Id: "A", Sklad: "Склад Алмагул", Ostatok: 3 }],
  },
  {
    Id: "RZ2",
    Name: "Other",
    Price: 50,
    Склады: [{ Id: "B", Sklad: "Склад Нурсая", Ostatok: 1 }],
  },
];

const out = mergeOnecItems(sample);
const rz1 = out.find((p) => p.externalId === "RZ1");
const rz2 = out.find((p) => p.externalId === "RZ2");

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed += 1;
  } else {
    console.log("OK:", msg);
  }
}

assert(out.length === 2, "unique count 2");
assert(rz1?.price === 250, "max price 250");
assert(rz1?.stock === 5, "sum stock 5");
assert(rz1?.duplicateRows === 1, "duplicateRows 1");
assert(rz2?.stock === 1, "rz2 stock 1");

if (failed) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll merge assertions passed");
