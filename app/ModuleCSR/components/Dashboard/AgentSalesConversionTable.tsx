import React, { useEffect, useState, useMemo, useCallback } from "react";
import { RiRefreshLine } from "react-icons/ri";

interface Metric {
  userName: string;
  ReferenceID: string;
  Traffic: string;
  Amount: any;
  QtySold: any;
  Status: string;
  createdAt: string;
  CustomerStatus: string;
  TicketEndorsed: string;
  TicketReceived: string;
}

interface AgentSalesConversionProps {
  ReferenceID: string;
  Role: string;
  month: number;
  year: number;
  startDate?: string;
  endDate?: string;
}

const AgentSalesConversion: React.FC<AgentSalesConversionProps> = ({ ReferenceID, Role, month, year, startDate, endDate }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  const referenceIdToNameMap: Record<string, string> = {
    "MQ-CSR-170039": "Quinto, Myra",
    "LM-CSR-809795": "Miguel, Lester",
    "RP-CSR-451122": "Paje, Rikki",
    "SA-CSR-517304": "Almoite, Sharmaine",
    "AA-CSR-785895": "Arendain, Armando",
    "GL-CSR-586725": "Lumabao, Grace",
    "MD-CSR-152985": "Dungso, Mary Grace",
    "LR-CSR-654001": "LX",
    "MC-CSR-947264": "Capin, Mark Vincent",
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `/api/ModuleCSR/Dashboard/AgentSalesConversion?ReferenceID=${ReferenceID}&Role=${Role}&month=${month}&year=${year}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        // Filter by Role
        let filteredData = Role === "Staff"
          ? data.filter((item: Metric) => item.ReferenceID === ReferenceID)
          : data;

        // Date range filtering
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);

        const finalData = filteredData.filter((item: Metric) => {
          if (!item.createdAt) return false;

          const createdAt = new Date(item.createdAt);
          const matchesMonthYear =
            createdAt.getMonth() + 1 === month &&
            createdAt.getFullYear() === year;

          const inRange =
            (!start || createdAt >= start) &&
            (!end || createdAt <= end);

          return matchesMonthYear && inRange;
        });

        setMetrics(finalData);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [ReferenceID, Role, month, year, startDate, endDate]);

  // ✅ Group by ReferenceID
  const groupedMetrics: Record<string, Metric[]> = useMemo(() => {
    return metrics.reduce((acc, metric) => {
      if (!acc[metric.ReferenceID]) {
        acc[metric.ReferenceID] = [];
      }
      acc[metric.ReferenceID].push(metric);
      return acc;
    }, {} as Record<string, Metric[]>);
  }, [metrics]);

  // ✅ Calculate totals per agent
  const calculateAgentTotals = useCallback((agentMetrics: Metric[]) => {
    return agentMetrics.reduce(
      (acc, metric) => {
        const amount = parseFloat(metric.Amount) || 0;
        const qtySold = parseFloat(metric.QtySold) || 0;
        const isSale = metric.Traffic === "Sales";
        const isConverted = metric.Status === "Converted Into Sales";

        acc.sales += isSale ? 1 : 0;
        acc.nonSales += !isSale ? 1 : 0;
        acc.totalAmount += amount;
        acc.totalQtySold += qtySold;
        acc.totalConversionToSale += isConverted ? 1 : 0;

        // Add customer status totals
        switch (metric.CustomerStatus) {
          case "New Client":
            acc.newClientAmount += amount;
            break;
          case "New Non-Buying":
            acc.newNonBuyingAmount += amount;
            break;
          case "Existing Active":
            acc.existingActiveAmount += amount;
            break;
          case "Existing Inactive":
            acc.existingInactiveAmount += amount;
            break;
          default:
            break;
        }

        return acc;
      },
      {
        sales: 0,
        nonSales: 0,
        totalAmount: 0,
        totalQtySold: 0,
        totalConversionToSale: 0,
        newClientAmount: 0,
        newNonBuyingAmount: 0,
        existingActiveAmount: 0,
        existingInactiveAmount: 0,
      }
    );
  }, []);

  // ✅ Format amount with Peso sign
  const formatAmountWithPeso = useCallback((amount: any) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return "₱0.00";
    }
    return `₱${parsedAmount
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  }, []);

  // ✅ Calculate overall totals for tfoot
  const totalMetrics = useMemo(() => {
    return Object.values(groupedMetrics).reduce(
      (acc, agentMetrics) => {
        const totals = calculateAgentTotals(agentMetrics);

        acc.sales += totals.sales;
        acc.nonSales += totals.nonSales;
        acc.totalAmount += totals.totalAmount;
        acc.totalQtySold += totals.totalQtySold;
        acc.totalConversionToSale += totals.totalConversionToSale;
        acc.newClientAmount += totals.newClientAmount;
        acc.newNonBuyingAmount += totals.newNonBuyingAmount;
        acc.existingActiveAmount += totals.existingActiveAmount;

        acc.totalATU += totals.totalConversionToSale > 0
          ? totals.totalQtySold / totals.totalConversionToSale
          : 0;
        acc.totalATV += totals.totalConversionToSale > 0
          ? totals.totalAmount / totals.totalConversionToSale
          : 0;

        acc.totalConversionPercentage += totals.sales > 0
          ? (totals.totalConversionToSale / totals.sales) * 100
          : 0;

        acc.agentCount += 1;
        return acc;
      },
      {
        sales: 0,
        nonSales: 0,
        totalAmount: 0,
        totalQtySold: 0,
        totalConversionToSale: 0,
        newClientAmount: 0,
        newNonBuyingAmount: 0,
        existingActiveAmount: 0,
        existingInactiveAmount: 0,
        totalATU: 0,
        totalATV: 0,
        totalConversionPercentage: 0,
        agentCount: 0,
      }
    );
  }, [groupedMetrics, calculateAgentTotals]);

  const calculateResponseTime = useCallback((TicketReceived: string, TicketEndorsed: string) => {
    if (!TicketReceived || !TicketEndorsed) return "N/A";

    const start = new Date(TicketReceived);
    const end = new Date(TicketEndorsed);

    const diffInSeconds = (end.getTime() - start.getTime()) / 1000;
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = Math.floor(diffInSeconds % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
  }, []);


  // ✅ Final Averages for % Conversion, ATU, and ATV
  return (
    <div className="overflow-x-auto max-h-screen overflow-y-auto">
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <div className="flex justify-center items-center w-30 h-30">
            <RiRefreshLine size={30} className="animate-spin" />
          </div>
        </div>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 shadow-md">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="border p-2">Agent Name</th>
              <th className="border p-2">Sales</th>
              <th className="border p-2">Non-Sales</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">QTY Sold</th>
              <th className="border p-2">Conversion to Sale</th>
              <th className="border p-2">% Conversion Inquiry to Sales</th>
              <th className="border p-2">Avg Transaction Unit</th>
              <th className="border p-2">Avg Transaction Value</th>
              <th className="border p-2">Sales Per (New Client)</th>
              <th className="border p-2">Sales Per (New-Non Buying)</th>
              <th className="border p-2">Sales Per (Existing Active)</th>
              <th className="border p-2">Sales Per (Existing Inactive)</th>
              <th className="border p-2">CSR Response Time</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedMetrics).length > 0 ? (
              Object.keys(groupedMetrics).map((refId, index) => {
                const agentMetrics = groupedMetrics[refId];
                const totals = calculateAgentTotals(agentMetrics);

                // ✅ Calculate Conversion %
                const conversionPercentage =
                  totals.sales === 0
                    ? "0.00%"
                    : `${((totals.totalConversionToSale / totals.sales) * 100).toFixed(2)}%`;

                // ✅ Calculate Avg Transaction Unit (ATU)
                const avgTransactionUnit =
                  totals.totalConversionToSale === 0
                    ? "0.00"
                    : (totals.totalQtySold / totals.totalConversionToSale).toFixed(2);

                // ✅ Calculate Avg Transaction Value (ATV)
                const avgTransactionValue =
                  totals.totalConversionToSale === 0
                    ? "0.00"
                    : formatAmountWithPeso(
                      totals.totalAmount / totals.totalConversionToSale
                    );

                // ✅ Calculate CSR Response Time
                const csrResponseTime =
                  agentMetrics.length > 0
                    ? calculateResponseTime(
                      agentMetrics[0].TicketReceived,
                      agentMetrics[0].TicketEndorsed
                    )
                    : "N/A";

                return (
                  <tr key={index} className="text-center border-t text-xs">
                    <td className="border p-2 whitespace-nowrap capitalize">
                      {referenceIdToNameMap[refId] || "Unknown"}
                    </td>
                    <td className="border p-2">{totals.sales}</td>
                    <td className="border p-2">{totals.nonSales}</td>
                    <td className="border p-2">
                      {formatAmountWithPeso(totals.totalAmount)}
                    </td>
                    <td className="border p-2">{totals.totalQtySold}</td>
                    <td className="border p-2">{totals.totalConversionToSale}</td>
                    <td className="border p-2">{conversionPercentage}</td>
                    <td className="border p-2">{avgTransactionUnit}</td>
                    <td className="border p-2">{avgTransactionValue}</td>
                    <td className="border p-2">
                      {formatAmountWithPeso(totals.newClientAmount)}
                    </td>
                    <td className="border p-2">
                      {formatAmountWithPeso(totals.newNonBuyingAmount)}
                    </td>
                    <td className="border p-2">
                      {formatAmountWithPeso(totals.existingActiveAmount)}
                    </td>
                    <td className="border p-2">
                      {formatAmountWithPeso(totals.existingInactiveAmount)}
                    </td>
                    <td className="border p-2">{csrResponseTime}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="p-2 text-center text-gray-500 text-xs">
                  No data available
                </td>
              </tr>
            )}
          </tbody>

          {/* ✅ TFOOT for Total Summary */}
          <tfoot className="bg-gray-100 text-xs text-center font-bold">
            <tr>
              <td className="border p-2">TOTAL</td>
              <td className="border p-2">{totalMetrics.sales}</td>
              <td className="border p-2">{totalMetrics.nonSales}</td>
              <td className="border p-2">
                {formatAmountWithPeso(totalMetrics.totalAmount)}
              </td>
              <td className="border p-2">{totalMetrics.totalQtySold}</td>
              <td className="border p-2">{totalMetrics.totalConversionToSale}</td>
              <td className="border p-2">-</td>
              <td className="border p-2">-</td>
              <td className="border p-2">
                {totalMetrics.totalATV.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="border p-2">
                {formatAmountWithPeso(totalMetrics.newClientAmount)}
              </td>
              <td className="border p-2">
                {formatAmountWithPeso(totalMetrics.newNonBuyingAmount)}
              </td>
              <td className="border p-2">
                {formatAmountWithPeso(totalMetrics.existingActiveAmount)}
              </td>
              <td className="border p-2">
                {formatAmountWithPeso(totalMetrics.existingInactiveAmount)}
              </td>
              <td className="border p-2">-</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export default AgentSalesConversion;
