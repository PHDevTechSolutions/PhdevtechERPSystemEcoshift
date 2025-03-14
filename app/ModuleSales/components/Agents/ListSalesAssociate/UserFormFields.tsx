import React, { useState, useEffect } from "react";

// Doughnut Chart
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface FormFieldsProps {
  Firstname: string;
  setFirstname: (value: string) => void;
  Lastname: string;
  setLastname: (value: string) => void;
  Email: string;
  setEmail: (value: string) => void;
  userName: string;
  setuserName: (value: string) => void;
  Status: string;
  setStatus: (value: string) => void;
  TargetQuota: string;
  setTargetQuota: (value: string) => void;
  ReferenceID: string;
  setReferenceID: (value: string) => void;
  editPost: any;
}

const INBOUND_ACTIVITIES = [
  "Inbound Call",
  "Assisting Other Agents Client",
  "Preparation: Bidding Preparation",
  "Client Meeting",
  "Site Visit",
  "Coordination of Pick-Up / Delivery to Client",
  "Email and Viber Checking",
  "Email Blast",
  "Email, SMS & Viber Replies",
  "Inbound Call - Existing",
  "Payment Follow-Up",
  "Quotation Follow-Up",
  "Preparation: Preparation of Quote: Existing Client",
  "Preparation: Preparation of Quote: New Client",
  "Preparation: Preparation of Report",
  "Walk-In Client",
];

const validActivities = new Set([
  "Account Development",
  "Accounting: Accounts Receivable and Payment",
  "Accounting: Billing Concern",
  "Accounting: Refund Request",
  "Accounting: Sales Order Concern",
  "Accounting: TPC Request",
  "Admin Concern: Coordination of Payment Terms Request",
  "CSR Inquiries",
  "Coordination of Pick-Up / Delivery to Client",
  "Coordination With CS (Email Acknowledgement)",
  "Marketing Concern",
  "Email and Viber Checking",
  "Email Blast",
  "Email, SMS & Viber Replies",
  "Inbound Call",
  "Payment Follow-Up",
  "Quotation Follow-Up",
  "Logistic Concern: Shipping Cost Estimation",
  "Outbound Call",
  "Preparation: Bidding Preparation",
  "Preparation: Preparation of Report",
  "Preparation: Preparation of SPF",
  "Preparation: Preparation of Quote: New Client",
  "Preparation: Preparation of Quote: Existing Client",
  "Preparation: Sales Order Preparation",
  "Technical: Dialux Simulation Request",
  "Technical: Drawing Request",
  "Technical: Inquiry",
  "Technical: Site Visit Request",
  "Technical: TDS Request",
  "Walk-In Client",
  "Warehouse: Coordination to Billing",
  "Warehouse: Coordination to Dispatch",
  "Warehouse: Coordination to Inventory",
  "Warehouse: Delivery / Helper Concern",
  "Warehouse: Replacement Request / Concern",
  "Warehouse: Sample Request / Concern",
  "Warehouse: SO Status Follow Up",
]);

const UserFormFields: React.FC<FormFieldsProps> = ({
  Firstname, setFirstname,
  Lastname, setLastname,
  Email, setEmail,
  userName, setuserName,
  Status, setStatus,
  TargetQuota, setTargetQuota,
  ReferenceID, setReferenceID,
  editPost,
}) => {

  // Date Range
  const [startdate, setStartdate] = useState("");
  const [enddate, setEnddate] = useState("");
  // Functions
  const [touchbaseData, setTouchbaseData] = useState<Record<string, number>>({});
  const [timeMotionData, setTimeMotionData] = useState({ inbound: 0, outbound: 0, others: 0 });
  const [callData, setCallData] = useState({ dailyInbound: 0, dailyOutbound: 0, dailySuccessful: 0, dailyUnsuccessful: 0, mtdInbound: 0, mtdOutbound: 0, mtdSuccessful: 0, mtdUnsuccessful: 0, });
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [countsales, setCountsales] = useState<Record<string, number>>({});

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const chartData = {
    labels: ["Outbound Call", "Inbound Call"],
    datasets: [
      {
        data: [
          callData.dailyOutbound || 0, // Total Outbound Calls
          callData.dailyInbound || 0, // Total Inbound Calls
        ],
        backgroundColor: ["#990000", "#000068"], // Colors for the segments
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {},
      datalabels: {
        color: "#FFFFFF",
        font: {
          weight: "bold" as "bold",
          size: 14,
        },
        formatter: (value: number) => value,
      },
    },
  };

  useEffect(() => {
    fetchProgressData();
  }, [ReferenceID]);

  // Fetch data when date range changes
  useEffect(() => {
    fetchProgressData();
  }, [startdate, enddate]);

  // Fetch Data
  const fetchProgressData = async () => {
    try {
      const response = await fetch(
        `/api/ModuleSales/Agents/SalesAssociateActivity/FetchProgress?referenceid=${encodeURIComponent(ReferenceID)}`
      );
      const data = await response.json();

      if (!data.success) {
        console.error("Failed to fetch progress data:", data.error);
        return;
      }

      const filteredData = data.data.filter((item: any) => {
        const itemDate = new Date(item.date_created).toISOString().split("T")[0];
        return (!startdate || itemDate >= startdate) && (!enddate || itemDate <= enddate);
      });

      setTimeMotionData(computeTimeSpent(filteredData));
      setTouchbaseData(countTouchBase(filteredData));
      setCallData(computeCallSummary(filteredData));
      setActivityData(countActivities(filteredData));

      let totalActualSales = 0;
      let monthToDateSales = 0;
      let yearToDateSales = 0;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      filteredData.forEach((item: any) => {
        totalActualSales += item.actualsales || 0;
        if (new Date(item.date_created).getMonth() + 1 === currentMonth) {
          monthToDateSales += item.actualsales || 0;
        }
        if (new Date(item.date_created).getFullYear() === currentYear) {
          yearToDateSales += item.actualsales || 0;
        }
      });

      setCountsales({
        MonthToDateSales: monthToDateSales,
        YearToDateSales: yearToDateSales,
        TotalActualSales: totalActualSales,
      });
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };


  // Count Quote Productivity
  const countActivities = (data: any[]) =>
    data.reduce((acc: Record<string, number>, item) => {
      if (["Account Development", "Preparation: Preparation of Quote: Existing Client"].includes(item.typeactivity)) {
        acc[item.typeactivity] = (acc[item.typeactivity] || 0) + 1;
      }
      return acc;
    }, {});

  // Update Call Summary computation to consider date range
  const computeCallSummary = (data: any[]): {
    dailyInbound: number;
    dailyOutbound: number;
    dailySuccessful: number;
    dailyUnsuccessful: number;
    mtdInbound: number;
    mtdOutbound: number;
    mtdSuccessful: number;
    mtdUnsuccessful: number;
  } => {
    return data.reduce(
      (acc, item) => {
        const itemDate = item.date_created.split("T")[0];
        const itemMonth = item.date_created.slice(0, 7);

        const isWithinDateRange =
          (!startdate || itemDate >= startdate) && (!enddate || itemDate <= enddate);

        if (isWithinDateRange) {
          if (item.typeactivity === "Inbound Call") {
            acc.dailyInbound += 1;
          }
          if (item.typeactivity === "Outbound Call") {
            acc.dailyOutbound += 1;
          }
          if (item.callstatus === "Successful") {
            acc.dailySuccessful += 1;
          } else if (item.callstatus === "Unsuccessful") {
            acc.dailyUnsuccessful += 1;
          }

          // Total Outbound Calls = Successful + Unsuccessful
          acc.dailyOutbound = acc.dailySuccessful + acc.dailyUnsuccessful;
        }

        if (itemMonth === currentMonth) {
          if (item.typeactivity === "Inbound Call") {
            acc.mtdInbound += 1;
          }
          if (item.typeactivity === "Outbound Call") {
            acc.mtdOutbound += 1;
          }
          if (item.callstatus === "Successful") {
            acc.mtdSuccessful += 1;
          } else if (item.callstatus === "Unsuccessful") {
            acc.mtdUnsuccessful += 1;
          }

          // Total Outbound Calls = Successful + Unsuccessful
          acc.mtdOutbound = acc.mtdSuccessful + acc.mtdUnsuccessful;
        }

        return acc;
      },
      {
        dailyInbound: 0,
        dailyOutbound: 0,
        dailySuccessful: 0,
        dailyUnsuccessful: 0,
        mtdInbound: 0,
        mtdOutbound: 0,
        mtdSuccessful: 0,
        mtdUnsuccessful: 0,
      }
    );
  };

  // Compute Timemotion 
  const computeTimeSpent = (data: any[]) => {
    return data.reduce(
      (acc: { inbound: number; outbound: number; others: number } & Record<string, number>, item) => {
        if (item.startdate && item.enddate) {
          const duration = (new Date(item.enddate).getTime() - new Date(item.startdate).getTime()) / 1000;

          if (INBOUND_ACTIVITIES.includes(item.typeactivity)) {
            acc.inbound += duration;
          } else if (item.typeactivity === "Outbound Call") {
            acc.outbound += duration;
          } else {
            acc.others += duration;
          }

          // List of valid activity keys
          const validActivities = new Set([
            "Account Development",
            "Accounting: Accounts Receivable and Payment",
            "Accounting: Billing Concern",
            "Accounting: Refund Request",
            "Accounting: Sales Order Concern",
            "Accounting: TPC Request",
            "Admin Concern: Coordination of Payment Terms Request",
            "CSR Inquiries",
            "Coordination of Pick-Up / Delivery to Client",
            "Coordination With CS (Email Acknowledgement)",
            "Marketing Concern",
            "Email and Viber Checking",
            "Email Blast",
            "Email, SMS & Viber Replies",
            "Inbound Call",
            "Payment Follow-Up",
            "Quotation Follow-Up",
            "Logistic Concern: Shipping Cost Estimation",
            "Outbound Call",
            "Preparation: Bidding Preparation",
            "Preparation: Preparation of Report",
            "Preparation: Preparation of SPF",
            "Preparation: Preparation of Quote: New Client",
            "Preparation: Preparation of Quote: Existing Client",
            "Preparation: Sales Order Preparation",
            "Technical: Dialux Simulation Request",
            "Technical: Drawing Request",
            "Technical: Inquiry",
            "Technical: Site Visit Request",
            "Technical: TDS Request",
            "Walk-In Client",
            "Warehouse: Coordination to Billing",
            "Warehouse: Coordination to Dispatch",
            "Warehouse: Coordination to Inventory",
            "Warehouse: Delivery / Helper Concern",
            "Warehouse: Replacement Request / Concern",
            "Warehouse: Sample Request / Concern",
            "Warehouse: SO Status Follow Up",
          ]);

          if (validActivities.has(item.typeactivity)) {
            acc[item.typeactivity] = (acc[item.typeactivity] || 0) + duration;
          }
        }
        return acc;
      },
      {
        inbound: 0,
        outbound: 0,
        others: 0,
      } as { inbound: number; outbound: number; others: number } & Record<string, number>
    );
  };

  // Duration 
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours}h ${minutes}m ${secs}s`;
  };

  // Count Touchbase on Table
  const countTouchBase = (data: any[]) =>
    data.reduce((acc: Record<string, number>, item) => {
      if (item.typecall === "Touch Base") {
        const key = `${item.typeclient}-${item.typecall}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

  return (
    <>
      <div className="bg-white w-full max-width mx-auto mb-4">
        {/* Grid Container */}
        <div className="grid grid-cols-2 gap-6">
          {/* Profile Picture Card */}
          <div className="flex flex-col items-center justify-center border rounded-lg p-6">
            <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">Profile Picture</span>
            </div>
          </div>

          {/* User Information Card */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Agent Profile Overview</h3>
            <p className="text-gray-700 capitalize">
              <strong>Full Name:</strong> {Lastname}, {Firstname} ({ReferenceID})
            </p>
            <p className="text-gray-700">
              <strong>Email Address:</strong> {Email}
            </p>
            <p className="text-gray-700 capitalize">
              <strong>Username:</strong> {userName}
            </p>
            <p className="text-gray-700 flex items-center mt-2">
              <strong>Account Status:</strong>
              <span
                className={`ml-2 pb-1 px-3 py-1 font-semibold rounded-full text-[10px]
                  ${Status === "Active" ? "bg-green-800 text-white" : ""}
                  ${Status === "Inactive" ? "bg-red-100 text-red-800" : ""}
                  ${Status === "Locked" ? "bg-red-100 text-red-800" : ""}
                  ${!Status ? "bg-gray-100 text-gray-600" : ""}`}
              >
                {Status || "N/A"}
              </span>
            </p>
            <span className="text-xs text-gray-500">
              Indicates whether the agent's account is active, inactive, or locked.
            </span>

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              {/* Status Dropdown */}
              <div>
                <label className="block text-xs font-bold mb-2" htmlFor="Status">
                  Update Account Status
                </label>
                <select
                  id="Status"
                  value={Status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-xs bg-gray-50"
                >
                  <option value="">Select Status</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Terminated">Terminated</option>
                </select>
                <span className="text-xs text-gray-500">
                  Modify the agent's current account status.
                </span>
              </div>

              {/* Target Quota Input */}
              <div>
                <label className="block text-xs font-bold mb-2" htmlFor="TargetQuota">
                  Sales Target Quota
                </label>
                <input
                  type="text"
                  id="TargetQuota"
                  value={TargetQuota}
                  onChange={(e) => setTargetQuota(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-xs capitalize"
                  required
                />
                <span className="text-xs text-gray-500">
                  Specify the sales goal assigned to the agent.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Start Date</label>
            <input
              type="date"
              value={startdate}
              onChange={(e) => setStartdate(e.target.value)}
              className="w-full px-3 py-2 border rounded text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">End Date</label>
            <input
              type="date"
              value={enddate}
              onChange={(e) => setEnddate(e.target.value)}
              className="w-full px-3 py-2 border rounded text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Additional Information Cards */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* Chart Doughnut */}
          <div className="border rounded-lg p-4 text-center">
            <h3 className="font-semibold text-sm">Chart</h3>
            <Doughnut data={chartData} options={chartOptions} />
          </div>

          {/* Touch Base Summary */}
          <div className="border rounded-lg p-4 text-center">
            <h3 className="font-semibold text-sm">Touchbase</h3>
            <p className="text-gray-600 mt-1 mb-2">Summary of Touchbase Counts</p>
            <table className="w-full text-xs border-collapse border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border border-gray-300 px-2 py-1">Type of Client</th>
                  <th className="border border-gray-300 px-2 py-1">Counts</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(touchbaseData).map(([key, count], index) => {
                  const [typeclient] = key.split("-");
                  return (
                    <tr key={index}>
                      <td className="border border-gray-300 px-2 py-1">{typeclient}</td>
                      <td className="border border-gray-300 px-2 py-1">{count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Time Motion */}
          <div className="border rounded-lg p-4 text-center">
            <h3 className="font-semibold text-sm">Time and Motion Daily Summary</h3>
            <p className="text-gray-600 mt-1 mb-2">Summary of Time and Motion</p>
            <table className="w-full text-xs border-collapse border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border border-gray-300 px-2 py-1">Client Engagement</th>
                  <th className="border border-gray-300 px-2 py-1">Outbound Calls</th>
                  <th className="border border-gray-300 px-2 py-1">Other Activities</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">{formatDuration(timeMotionData.inbound)}</td>
                  <td className="border border-gray-300 px-2 py-1">{formatDuration(timeMotionData.outbound)}</td>
                  <td className="border border-gray-300 px-2 py-1">{formatDuration(timeMotionData.others)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Daily Productivity */}
          <div className="border rounded-lg p-4 text-center">
            <h3 className="font-semibold text-sm">Daily Productivity</h3>
            <p className="text-gray-600 mt-1 mb-2">Details about Activity 4...</p>
            <table className="w-full text-xs border-collapse border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-2 py-1 text-left">Call Productivity</th>
                  <th className="border border-gray-300 px-2 py-1 text-center">Daily</th>
                  <th className="border border-gray-300 px-2 py-1 text-center">MTD</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-2 py-1 text-left">Total Outbound Calls</td>
                  <td className="border border-gray-300 px-2 py-1 font-semibold">{callData.dailyOutbound || 0}</td>
                  <td className="border border-gray-300 px-2 py-1 font-semibold">{callData.mtdOutbound || 0}</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 px-2 py-1 text-left">Successful Calls</td>
                  <td className="border border-gray-300 px-2 py-1">{callData.dailySuccessful || 0}</td>
                  <td className="border border-gray-300 px-2 py-1">{callData.mtdSuccessful || 0}</td>
                </tr>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-2 py-1 text-left">Unsuccessful Calls</td>
                  <td className="border border-gray-300 px-2 py-1">{callData.dailyUnsuccessful || 0}</td>
                  <td className="border border-gray-300 px-2 py-1">{callData.mtdUnsuccessful || 0}</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 px-2 py-1 text-left">Total Inbound Calls</td>
                  <td className="border border-gray-300 px-2 py-1">{callData.dailyInbound || 0}</td>
                  <td className="border border-gray-300 px-2 py-1">{callData.mtdInbound || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quote Productivity */}
          <div className="border rounded-lg p-4 text-center">
            <h3 className="font-semibold text-sm">Quote Productivity</h3>
            <p className="text-gray-600 mt-1 mb-2">Details about Activity 5...</p>
            <table className="w-full text-xs border-collapse border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border border-gray-300 px-2 py-1">Quotation Productivity</th>
                  <th className="border border-gray-300 px-2 py-1">Daily</th>
                  <th className="border border-gray-300 px-2 py-1">MTD</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-2 py-1">New Account Development</td>
                  <td className="border border-gray-300 px-2 py-1">{activityData["Account Development"] || 0}</td>
                  <td className="border border-gray-300 px-2 py-1">{activityData["Account Development"] || 0}</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 px-2 py-1">Existing Client</td>
                  <td className="border border-gray-300 px-2 py-1">{activityData["Preparation: Preparation of Quote: Existing Client"] || 0}</td>
                  <td className="border border-gray-300 px-2 py-1">{activityData["Preparation: Preparation of Quote: Existing Client"] || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Performance */}
          <div className="border rounded-lg p-4 text-center">
            <h3 className="font-semibold text-sm">Performance</h3>
            <p className="text-gray-600 mt-1 mb-2">Sales Performance Overview</p>
            <table className="w-full text-xs border-collapse border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border border-gray-300 px-2 py-1">Sales Performance</th>
                  <th className="border border-gray-300 px-2 py-1">SO to DR (Actual Sales)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-2 py-1">Month to Date</td>
                  <td className="border border-gray-300 px-2 py-1">{countsales["MonthToDateSales"] || 0}</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 px-2 py-1">Year to Date</td>
                  <td className="border border-gray-300 px-2 py-1">{countsales["YearToDateSales"] || 0}</td>
                </tr>
                <tr className="bg-white font-semibold">
                  <td className="border border-gray-300 px-2 py-1">Total Actual Sales</td>
                  <td className="border border-gray-300 px-2 py-1">{countsales["TotalActualSales"] || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Large Card - Full Width */}
          <div className="border rounded-lg p-6 col-span-3">
            <h3 className="font-semibold text-sm">Daily Activities</h3>
            <p className="text-gray-600 mt-1 mb-2">Details about Activity 7...</p>
            <table className="w-full text-xs border-collapse border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border border-gray-300 px-2 py-1">Daily Activities Breakdown</th>
                  <th className="border border-gray-300 px-2 py-1 text-center">Time Spent</th>
                </tr>
              </thead>
              <tbody className="capitalize">
                {Object.entries(timeMotionData)
                  .filter(([activity]) => validActivities.has(activity)) // Filter only valid activities
                  .sort(([a], [b]) => a.localeCompare(b)) // Sort activities alphabetically
                  .map(([activity, duration]) => (
                    <tr key={activity} className="bg-white">
                      <td className="px-2 py-1">{activity}</td>
                      <td className="text-center">{formatDuration(duration)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div >
    </>
  );
};

export default UserFormFields;
