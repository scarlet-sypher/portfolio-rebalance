import db from "../database/conn/db.js";

export function calculateRebalance(clientId = process.env.CLIENT_ID) {
  const modelFunds = db
    .prepare(
      `
      SELECT * FROM model_funds
    `,
    )
    .all();

  const holdings = db
    .prepare(
      `
      SELECT * FROM client_holdings
      WHERE client_id = ?
    `,
    )
    .all(clientId);

  const portfolioTotal = holdings.reduce((sum, h) => sum + h.current_value, 0);

  const results = [];

  for (const fund of modelFunds) {
    const holding = holdings.find((h) => h.fund_id === fund.fund_id);

    const currentValue = holding ? holding.current_value : 0;

    const currentPct = portfolioTotal
      ? (currentValue / portfolioTotal) * 100
      : 0;

    const drift = fund.allocation_pct - currentPct;

    const amount = (drift / 100) * portfolioTotal;

    let action = "HOLD";

    if (amount > 0) action = "BUY";
    if (amount < 0) action = "SELL";

    results.push({
      fund_id: fund.fund_id,
      fund_name: fund.fund_name,
      target_pct: fund.allocation_pct,
      current_pct: Number(currentPct.toFixed(2)),
      drift: Number(drift.toFixed(2)),
      action,
      amount: Math.abs(Math.round(amount)),
      is_model_fund: 1,
    });
  }

  // non-model funds
  for (const holding of holdings) {
    const exists = modelFunds.find((f) => f.fund_id === holding.fund_id);

    if (!exists) {
      const currentPct = portfolioTotal
        ? (holding.current_value / portfolioTotal) * 100
        : 0;

      results.push({
        fund_id: holding.fund_id,
        fund_name: holding.fund_name,
        target_pct: null,
        current_pct: Number(currentPct.toFixed(2)),
        drift: null,
        action: "REVIEW",
        amount: holding.current_value,
        is_model_fund: 0,
      });
    }
  }

  const totalBuy = results
    .filter((r) => r.action === "BUY")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalSell = results
    .filter((r) => r.action === "SELL")
    .reduce((sum, r) => sum + r.amount, 0);

  const netCashNeeded = totalBuy - totalSell;

  return {
    portfolioTotal,
    totalBuy,
    totalSell,
    netCashNeeded,
    items: results,
  };
}
