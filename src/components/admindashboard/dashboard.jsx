"use client";
import React, { useState, useEffect } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { 
  TrendingUp, 
  Clock, 
  Bed, 
  CheckCircle, 
  LogIn, 
  LogOut, 
  UserPlus, 
  Megaphone, 
  CreditCard, 
  Calendar,
  AlertCircle,
  Wrench,
  ArrowRight
} from "lucide-react";
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

  const [quickStats, setQuickStats] = useState({
    pendingLeaves: 0,
    pendingComplaints: 0
  });

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const { data } = await api.get('/api/adminauth/dashboard/quick-stats');
        setQuickStats(data);
      } catch (error) {
        console.error("Failed to fetch quick stats:", error);
      }
    };
    fetchQuickStats();
  }, []);

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
            icon: <TrendingUp size={20} />,
          },
          {
            title: "Pending Payments",
            value: financialData.revenue.pendingPayments.toLocaleString('en-IN'),
            color: "text-orange-500",
            isCurrency: true,
            icon: <Clock size={20} />,
          },
          {
            title: "Occupied Beds",
            value: `${bedData.occupiedBeds} / ${bedData.totalBeds}`,
            color: "text-blue-600",
            isCurrency: false,
            icon: <Bed size={20} />,
          },
          {
            title: "Available Beds",
            value: `${Math.max(0, bedData.totalBeds - bedData.occupiedBeds)} / ${bedData.totalBeds}`,
            color: "text-purple-600",
            isCurrency: false,
            icon: <CheckCircle size={20} />,
          },
          {
            title: "Today's Check-In",
            value: checkInOutData.checkIns,
            color: "text-indigo-600",
            isCurrency: false,
            icon: <LogIn size={20} />,
          },
          {
            title: "Today's Check-Outs",
            value: checkInOutData.checkOuts,
            color: "text-rose-600",
            isCurrency: false,
            icon: <LogOut size={20} />,
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
            <div className={`relative w-full px-4 py-3 rounded-t-2xl flex justify-between items-center transition-colors ${
              activeFilter === card.title ? "bg-[#4F8CCF] text-white" : "bg-[#c2c9b0] text-black"
            }`}>
              <span className="font-bold text-sm tracking-tight uppercase">{card.title}</span>
              <div className={activeFilter === card.title ? "text-white/80" : "text-black/40"}>
                {card.icon}
              </div>
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

      {/* Quick Actions & System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Quick Commands
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "New Student", icon: <UserPlus />, path: "/management", color: "bg-blue-50 text-blue-600" },
              { label: "Post Notice", icon: <Megaphone />, path: "/notices", color: "bg-purple-50 text-purple-600" },
              { label: "Check Dues", icon: <CreditCard />, path: "/student-fees", color: "bg-orange-50 text-orange-600" },
              { label: "Attendance", icon: <Calendar />, path: "/attendance", color: "bg-green-50 text-green-600" },
            ].map((action, i) => (
              <a key={i} href={action.path} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-50 hover:border-blue-100 hover:bg-gray-50 transition-all group">
                <span className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform`}>{action.icon}</span>
                <span className="text-xs font-bold text-gray-700 text-center">{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* System Overview / Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
            System Alerts
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-rose-500" />
                <div>
                  <p className="text-xs font-bold text-rose-800 uppercase">Pending Approvals</p>
                  <p className="text-sm font-medium text-rose-600">{quickStats.pendingLeaves} Leave Requests</p>
                </div>
              </div>
              <a href="/leave-requests" className="p-1.5 hover:bg-rose-200 rounded-lg transition-colors text-rose-600">
                <ArrowRight size={16} />
              </a>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3">
                <Wrench size={24} className="text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-amber-800 uppercase">Maintenance</p>
                  <p className="text-sm font-medium text-amber-600">{quickStats.pendingComplaints} Open Complaints</p>
                </div>
              </div>
              <a href="/ticket" className="p-1.5 hover:bg-amber-200 rounded-lg transition-colors text-amber-600">
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
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
