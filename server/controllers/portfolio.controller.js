import { calculateRebalance } from "../services/rebalance.service.js";
import db from "../database/conn/db.js";

export const getComparison = (req, res) => {
  try {
    const data = calculateRebalance(process.env.CLIENT_ID);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "rebalance failed" });
  }
};

export const getHoldings = (req, res) => {
  try {
    const holdings = db
      .prepare(
        `
        SELECT * FROM client_holdings
        WHERE client_id = ?
      `,
      )
      .all(process.env.CLIENT_ID);

    res.json(holdings);
  } catch {
    res.status(500).json({ message: "holdings error" });
  }
};

export const getHistory = (req, res) => {
  try {
    const sessions = db
      .prepare(
        `
        SELECT * FROM rebalance_sessions
        WHERE client_id = ?
        ORDER BY created_at DESC
      `,
      )
      .all(process.env.CLIENT_ID);

    res.json(sessions);
  } catch {
    res.status(500).json({ message: "history error" });
  }
};

export const saveRebalance = (req, res) => {
  try {
    const data = calculateRebalance(process.env.CLIENT_ID);

    const insertSession = db.prepare(`
      INSERT INTO rebalance_sessions
      (client_id, created_at, portfolio_value, total_to_buy, total_to_sell, net_cash_needed, status)
      VALUES (?, datetime('now'), ?, ?, ?, ?, 'PENDING')
    `);

    const session = insertSession.run(
      process.env.CLIENT_ID,
      data.portfolioTotal,
      data.totalBuy,
      data.totalSell,
      data.netCashNeeded,
    );

    const sessionId = session.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO rebalance_items
      (session_id, fund_id, fund_name, action, amount, current_pct, target_pct, post_rebalance_pct, is_model_fund)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of data.items) {
      insertItem.run(
        sessionId,
        item.fund_id,
        item.fund_name,
        item.action,
        item.amount,
        item.current_pct,
        item.target_pct,
        item.target_pct,
        item.is_model_fund,
      );
    }

    res.json({ message: "Rebalance saved", sessionId });
  } catch (err) {
    res.status(500).json({ message: "save failed" });
  }
};

export const updateModelPortfolio = (req, res) => {
  try {
    const updates = req.body;

    const total = updates.reduce((sum, f) => sum + f.allocation_pct, 0);

    if (total !== 100) {
      return res.status(400).json({ message: "Percentages must equal 100" });
    }

    const updateStmt = db.prepare(`
      UPDATE model_funds
      SET allocation_pct = ?
      WHERE fund_id = ?
    `);

    const transaction = db.transaction((funds) => {
      for (const fund of funds) {
        updateStmt.run(fund.allocation_pct, fund.fund_id);
      }
    });

    transaction(updates);

    res.json({ message: "Model portfolio updated" });
  } catch {
    res.status(500).json({ message: "update failed" });
  }
};
