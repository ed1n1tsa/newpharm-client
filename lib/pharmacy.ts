export type CartLine = { productId: string; qty: number };

export type WarehouseStock = {
  warehouse_id: string;
  product_id: string;
  quantity: number;
};

export type WarehouseInfo = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active?: boolean;
};

export type LineAvailability = {
  productId: string;
  requested: number;
  available: number;
  shortfall: number;
};

export type WarehouseFit = {
  warehouse: WarehouseInfo;
  coveredLines: number;
  coveredUnits: number;
  totalLines: number;
  totalUnits: number;
  lines: LineAvailability[];
  fullyCovers: boolean;
};

/** Friendlier labels for 1C warehouse names. */
export function pharmacyDisplayName(name: string): string {
  const map: Record<string, string> = {
    "Склад Алмагул": "Аптека Алмагул",
    "Склад Нурсая": "Аптека Нурсая",
    "Склад Привокзальный": "Аптека Привокзальный",
  };
  return map[name] || name.replace(/^Склад\s+/i, "Аптека ");
}

/**
 * Pick the warehouse that best covers the cart:
 * 1) more line items fully in stock
 * 2) tie-break: more total units available toward requested qty
 */
export function rankWarehouses(
  warehouses: WarehouseInfo[],
  cart: CartLine[],
  stocks: WarehouseStock[]
): WarehouseFit[] {
  const byWh = new Map<string, Map<string, number>>();
  for (const s of stocks) {
    if (!byWh.has(s.warehouse_id)) byWh.set(s.warehouse_id, new Map());
    byWh.get(s.warehouse_id)!.set(s.product_id, Number(s.quantity) || 0);
  }

  const totalLines = cart.length;
  const totalUnits = cart.reduce((sum, l) => sum + l.qty, 0);

  const fits: WarehouseFit[] = warehouses
    .filter((w) => w.is_active !== false)
    .map((warehouse) => {
      const stockMap = byWh.get(warehouse.id) || new Map();
      const lines: LineAvailability[] = cart.map((line) => {
        const available = stockMap.get(line.productId) ?? 0;
        const shortfall = Math.max(0, line.qty - available);
        return {
          productId: line.productId,
          requested: line.qty,
          available,
          shortfall,
        };
      });
      const coveredLines = lines.filter((l) => l.shortfall === 0).length;
      const coveredUnits = lines.reduce(
        (sum, l) => sum + Math.min(l.available, l.requested),
        0
      );
      return {
        warehouse,
        coveredLines,
        coveredUnits,
        totalLines,
        totalUnits,
        lines,
        fullyCovers: coveredLines === totalLines && totalLines > 0,
      };
    });

  fits.sort((a, b) => {
    if (b.coveredLines !== a.coveredLines) return b.coveredLines - a.coveredLines;
    if (b.coveredUnits !== a.coveredUnits) return b.coveredUnits - a.coveredUnits;
    return a.warehouse.name.localeCompare(b.warehouse.name, "ru");
  });

  return fits;
}

export function autoSelectWarehouse(
  warehouses: WarehouseInfo[],
  cart: CartLine[],
  stocks: WarehouseStock[]
): WarehouseFit | null {
  const ranked = rankWarehouses(warehouses, cart, stocks);
  return ranked[0] ?? null;
}
