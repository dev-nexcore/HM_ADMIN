"use client";
import React, { useState, useEffect } from "react";
import { FaRupeeSign } from "react-icons/fa";
import api from "@/lib/api";


const Dashboard = () => {
  const [checkInOutData, setCheckInOutData] = useState({
    checkIns: 0,
    checkOuts: 0,
  });

  const [bedData, setBedData] = useState({
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
  });

  const [financialData, setFinancialData] = useState({
    revenue: {
      totalRevenue: 0,
      pendingPayments: 0
    }
  });

  const [activeFilter, setActiveFilter] = useState("All");
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    const fetchCheckInOutStatus = async () => {
      try {
        const { data } = await api.get(
          `/api/adminauth/todays-checkin-checkout`,
        );
        setCheckInOutData(data);
      } catch (error) {
        console.error("Failed to fetch check-in/out status:", error);
      }
    };

    const fetchBedOccupancyStatus = async () => {
      try {
        const { data } = await api.get(
          `/api/adminauth/bed-occupancy-status`,
        );
        setBedData(data);
      } catch (error) {
        console.error("Failed to fetch bed occupancy status:", error);
      }
    };

    const fetchFinancialSummary = async () => {
      try {
        const { data } = await api.get(
          `/api/adminauth/dashboard/financial-summary`
        );
        if (data && data.revenue) {
          setFinancialData(data);
        }
      } catch (error) {
        console.error("Failed to fetch financial summary:", error);
      }
    };

    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const { data } = await api.get(
          `/api/adminauth/audit-logs/statistics`
        );
        if (data && data.recentActivities) {
          setActivities(data.recentActivities);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchCheckInOutStatus();
    fetchBedOccupancyStatus();
    fetchFinancialSummary();
    fetchActivities();
  }, []);

  return (
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen mt-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7">
        <div className="flex items-center">
          <div className="h-6 w-1 bg-[#4F8CCF] mr-2"></div>
          <h2 className="text-2xl font-bold text-black">Dashboard</h2>
        </div>
        {activeFilter !== "All" && (
          <button 
            onClick={() => setActiveFilter("All")}
            className="mt-2 sm:mt-0 px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            title: "Total Revenue",
            value: financialData.revenue.totalRevenue.toLocaleString('en-IN'),
            color: "text-green-600",
            isCurrency: true,
          },
          {
            title: "Pending Payments",
            value: financialData.revenue.pendingPayments.toLocaleString('en-IN'),
            color: "text-orange-500",
            isCurrency: true,
          },
          {
            title: "Occupied Beds",
            value: `${bedData.occupiedBeds} / ${bedData.totalBeds}`,
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Available Beds",
            value: `${bedData.availableBeds} / ${bedData.totalBeds}`,
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Today's Check-In",
            value: checkInOutData.checkIns,
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Today's Check-Outs",
            value: checkInOutData.checkOuts,
            color: "text-black",
            isCurrency: false,
          },
        ].map((card, i) => (
          <button
            key={i}
            onClick={() => setActiveFilter(card.title)}
            className={`bg-white shadow-lg rounded-2xl overflow-hidden border-2 hover:shadow-2xl transition text-center relative min-h-[140px] flex flex-col justify-between ${
              activeFilter === card.title 
                ? "border-[#4F8CCF] ring-4 ring-[#4F8CCF]/10 scale-[1.02]" 
                : "border-transparent hover:border-gray-200"
            }`}
          >
            <div className={`relative w-full px-1 pl-4 py-2 rounded-3xl text-start transition-colors ${
              activeFilter === card.title ? "bg-[#4F8CCF] text-white" : "bg-[#c2c9b0] text-black"
            }`}>
              <span className="font-semibold text-lg">{card.title}</span>
            </div>
            <div
              className={`py-6 font-bold text-3xl flex justify-center items-center gap-2 ${card.color}`}
            >
              {card.isCurrency ? (
                <>
                  <FaRupeeSign className="text-2xl" />
                  {card.value}
                </>
              ) : (
                card.value
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="rounded-t-2xl bg-[#c2c9b0] p-5 font-semibold text-black text-xl pl-8 flex justify-between items-center">
        <span>Recent Activities {activeFilter !== "All" && `(${activeFilter})`}</span>
      </div>
      <div className="bg-white shadow-md rounded-b-2xl p-8 space-y-4 text-base">
        {loadingActivities ? (
          <div className="flex justify-center py-6 text-gray-500">Loading activities...</div>
        ) : activities.length > 0 ? (
          activities
            .filter((activity) => {
              if (activeFilter === "All") return true;
              
              const desc = activity.description?.toLowerCase() || "";
              const action = activity.action?.toLowerCase() || "";
              
              if (activeFilter === "Today's Check-In") {
                return action.includes("check_in") || desc.includes("check in") || desc.includes("checked in");
              }
              if (activeFilter === "Today's Check-Outs") {
                return action.includes("check_out") || desc.includes("check out") || desc.includes("checked out");
              }
              if (activeFilter === "Total Revenue" || activeFilter === "Pending Payments") {
                return action.includes("payment") || action.includes("fee") || action.includes("invoice");
              }
              if (activeFilter === "Occupied Beds" || activeFilter === "Available Beds") {
                return action.includes("bed") || action.includes("room") || action.includes("inventory");
              }
              
              return true; // fallback
            })
            .map((activity) => (
              <div key={activity._id} className="flex flex-col sm:flex-row justify-between p-3 hover:bg-gray-50 rounded-lg transition border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-black font-medium">{activity.description || `${activity.action} by ${activity.user}`}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.user} • {activity.target || "System"}</p>
                </div>
                <p className="text-gray-500 mt-1 sm:mt-0 font-medium text-sm whitespace-nowrap">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  <span className="block sm:inline sm:ml-2 text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </p>
              </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 italic">
            No recent activities found in the system.
          </div>
        )}

        {/* Show empty state if filtering results in no matches */}
        {!loadingActivities && activities.length > 0 && activities.filter((activity) => {
              if (activeFilter === "All") return true;
              const desc = activity.description?.toLowerCase() || "";
              const action = activity.action?.toLowerCase() || "";
              if (activeFilter === "Today's Check-In") return action.includes("check_in") || desc.includes("check in") || desc.includes("checked in");
              if (activeFilter === "Today's Check-Outs") return action.includes("check_out") || desc.includes("check out") || desc.includes("checked out");
              if (activeFilter === "Total Revenue" || activeFilter === "Pending Payments") return action.includes("payment") || action.includes("fee") || action.includes("invoice");
              if (activeFilter === "Occupied Beds" || activeFilter === "Available Beds") return action.includes("bed") || action.includes("room") || action.includes("inventory");
              return true;
        }).length === 0 && (
          <div className="text-center py-8 text-gray-500 italic">
            No recent activities found matching the filter "{activeFilter}".
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
