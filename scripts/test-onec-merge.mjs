/**
 * Sanity check against production mergeOnecItems.
 * Run: npx tsx scripts/test-onec-merge.mjs
 */
import { mergeOnecItems } from "../lib/onec-catalog.ts";

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
