"use client";

import { useState, useEffect } from "react";

type TxResult = {
  tx_id: string;
  address?: string;
  chain?: string;
  risk?: string;
  reason?: string;
};

type AddressResult = {
  address: string;
  highest_risk: string;
  latest_reason: string;
  tx_count: number;
  transactions: TxResult[];
};

export default function Home() {
  const [apiBase, setApiBase] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState<"tx" | "address">("tx");

  const [loading, setLoading] = useState(false);
  const [resultTx, setResultTx] = useState<TxResult | null>(null);
  const [resultAddress, setResultAddress] = useState<AddressResult | null>(null);
  const [error, setError] = useState("");

  // load saved API_BASE
  useEffect(() => {
    const saved = localStorage.getItem("apiBase");
    if (saved) setApiBase(saved);
  }, []);

  const saveApiUrl = () => {
    localStorage.setItem("apiBase", apiBase);
  };

  const riskColor = (risk?: string) => {
    if (!risk) return "text-gray-400";
    if (risk.includes("HIGH")) return "text-red-600 font-bold";
    if (risk.includes("MEDIUM")) return "text-yellow-600 font-bold";
    if (risk.includes("LOW")) return "text-green-600 font-bold";
    return "text-gray-600";
  };

  const fetchRisk = async () => {
    setError("");
    setResultTx(null);
    setResultAddress(null);

    if (!apiBase) {
      setError("Set API Base URL first.");
      return;
    }
    if (!inputValue) {
      setError("Please enter a value.");
      return;
    }

    const endpoint =
      mode === "tx"
        ? `${apiBase}/risk/tx/${inputValue}`
        : `${apiBase}/risk/address/${inputValue}`;

    try {
      setLoading(true);
      const resp = await fetch(endpoint);
      const data = await resp.json();
      if (mode === "tx") {
        setResultTx(data);
      } else {
        setResultAddress(data);
      }
    } catch (err) {
      setError("Error fetching data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 mt-16">
      <h1 className="text-3xl font-bold mb-6">
        OnChainSentinel — Risk Lookup
      </h1>

      {/* API base URL */}
      <section className="mb-6 border-b pb-4">
        <label className="font-semibold">API Base URL</label>
        <input
          className="w-full border rounded p-2 mt-1"
          placeholder="https://tx-risk-api...run.app"
          value={apiBase}
          onChange={(e) => setApiBase(e.target.value)}
        />
        <button
          onClick={saveApiUrl}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
        >
          Save API
        </button>
      </section>

      {/* Mode selector */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            mode === "tx" ? "bg-gray-800 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("tx")}
        >
          Check Transaction
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === "address" ? "bg-gray-800 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("address")}
        >
          Check Address
        </button>
      </div>

      {/* Input */}
      <section>
        <input
          className="w-full border rounded p-2"
          placeholder={mode === "tx" ? "tx hash…" : "wallet address…"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <button
          onClick={fetchRisk}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-3"
        >
          {loading ? "Checking..." : "Check Risk"}
        </button>
      </section>

      {/* Error */}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {/* TX Result */}
      {resultTx && mode === "tx" && (
        <section className="mt-6 p-4 bg-gray-100 rounded-md">
          <h2 className="text-xl font-semibold">Transaction Risk</h2>
          <p><strong>tx:</strong> {resultTx.tx_id}</p>
          <p><strong>address:</strong> {resultTx.address}</p>
          <p><strong>chain:</strong> {resultTx.chain}</p>
          <p className={riskColor(resultTx.risk)}>
            <strong>risk:</strong> {resultTx.risk}
          </p>
          <p><strong>reason:</strong> {resultTx.reason}</p>
        </section>
      )}

      {/* Address Result */}
      {resultAddress && mode === "address" && (
        <section className="mt-6 p-4 bg-gray-100 rounded-md">
          <h2 className="text-xl font-semibold">Address Risk</h2>
          <p><strong>address:</strong> {resultAddress.address}</p>
          <p className={riskColor(resultAddress.highest_risk)}>
            <strong>highest risk:</strong> {resultAddress.highest_risk}
          </p>
          <p><strong>latest reason:</strong> {resultAddress.latest_reason}</p>
          <p><strong>flagged tx count:</strong> {resultAddress.tx_count}</p>

          {resultAddress.tx_count > 0 && (
            <>
              <h3 className="text-lg font-semibold mt-4">Flagged Transactions:</h3>
              <ul className="mt-2 space-y-2">
                {resultAddress.transactions.map((t) => (
                  <li
                    key={t.tx_id}
                    className="border p-2 rounded bg-white shadow"
                  >
                    <p><strong>tx:</strong> {t.tx_id}</p>
                    <p><strong>chain:</strong> {t.chain}</p>
                    <p className={riskColor(t.risk)}>
                      <strong>risk:</strong> {t.risk}
                    </p>
                    <p><strong>reason:</strong> {t.reason}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </main>
  );
}
