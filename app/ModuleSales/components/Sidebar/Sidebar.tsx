"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { FaRegCircle } from "react-icons/fa";
import { CiTimer, CiUser, CiGrid42, CiBullhorn, CiSettings, CiCoins1, CiCalendarDate, CiViewBoard, CiViewTimeline, CiKeyboard, CiMemoPad   } from "react-icons/ci";
import { RiDonutChartLine, RiBuilding2Line  } from "react-icons/ri";

import Link from 'next/link';
import { useRouter } from "next/navigation";

const Sidebar: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState({Firstname: "", Lastname: "", Location: "", Role: "", Company: "",});
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUserId(params.get("id"));
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error("Failed to fetch user details");

        const data = await response.json();
        setUserDetails({
          Firstname: data.Firstname || "Leroux ",
          Lastname: data.Lastname || "Xchire",
          Location: data.Location || "Philippines",
          Role: data.Role || "Admin",
          Company: data.Company || "Ecoshift Corporation",
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleToggle = (section: string) => {
    setOpenSections((prevSections: any) => ({
      ...prevSections,
      [section]: !prevSections[section],
    }));
  };

  const menuItems = [
    {
      title: 'My Companies',
      icon: RiBuilding2Line,
      subItems: [
        { title: 'List of Company Accounts', href: `/ModuleSales/Sales/Companies/CompanyAccounts${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Group of Companies', href: `/ModuleSales/Sales/Companies/GroupCompanies${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
    {
      title: 'Task',
      icon: CiViewTimeline,
      subItems: [
        { title: 'Daily Activity', href: `/ModuleSales/Sales/Task/DailyActivity${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'CSR Inquiries', href: `/ModuleSales/Sales/Task/CSRInquiries${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Quotation', href: `/ModuleSales/Sales/Task/Quotation${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
    {
      title: 'Boards',
      icon: CiMemoPad,
      subItems: [
        { title: 'Notes', href: `/ModuleSales/Sales/Boards/Notes${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
    {
      title: 'Sales Performance',
      icon: RiDonutChartLine,
      subItems: [
        { title: 'MTD and YTD', href: `/ModuleSales/Sales/SalesPerformance/MTDYTD${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
    {
      title: 'Agents',
      icon: CiUser,
      subItems: [
        { title: 'Daily Call Ranking', href: `/ModuleSales/Sales/Agents/DailyCallRanking${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'List of Sales Associate', href: `/ModuleSales/Sales/Agents/ListSalesAssociate${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Sales Associate Activity', href: `/ModuleSales/Sales/Agents/SalesAssociateActivity${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Deletion', href: `/ModuleSales/Sales/Agents/Deletion${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Quota', href: `/ModuleSales/Sales/Agents/Quota${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
    {
      title: 'Conversion Rates',
      icon: CiCoins1,
      subItems: [
        { title: 'Calls to Quote', href: `/ModuleSales/Sales/ConversionRates/CallsToQuote${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Quote to SO', href: `/ModuleSales/Sales/ConversionRates/QuoteToSO${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'SO to SI', href: `/ModuleSales/Sales/ConversionRates/SOToSI${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Conversion Rate Summary', href: `/ModuleSales/Sales/ConversionRates/ConversionRateSummary${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
    {
      title: 'TSA Activities',
      icon: CiCalendarDate,
      subItems: [
        { title: 'Outbound Calls', href: `/ModuleSales/Sales/Activities/OutboundCalls${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'TSA Activities', href: `/ModuleSales/Sales/Activities/QuoteToSO${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
    {
      title: 'Client Activity Board',
      icon: CiViewBoard,
      subItems: [
        { title: 'Account Records', href: `/ModuleSales/Sales/ClientActivityBoard/AccountRecords${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'List of Companies', href: `/ModuleSales/Sales/ClientActivityBoard/ListofCompanies${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
    {
      title: 'Logs',
      icon: CiTimer,
      subItems: [
        { title: 'Activity Logs', href: `/ModuleSales/Sales/Logs/ActivityLogs${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Progress Logs', href: `/ModuleSales/Sales/Logs/ProgressLogs${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Approvals', href: `/ModuleSales/Sales/Logs/Approvals${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Historical Records', href: `/ModuleSales/Sales/Logs/HistoricalRecords${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
    {
      title: 'Announcements',
      icon: CiBullhorn,
      subItems: [
        { title: 'System Updates', href: `/ModuleSales/Sales/Announcements/SystemUpdates${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
    {
      title: 'User Management',
      icon: CiUser,
      subItems: [
        { title: 'Company Accounts', href: `/ModuleSales/Sales/UserManagement/CompanyAccounts${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Territory Sales Associates', href: `/ModuleSales/Sales/UserManagement/TSA${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Territory Sales Manager', href: `/ModuleSales/Sales/UserManagement/TSM${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Managers & Directors', href: `/ModuleSales/Sales/UserManagement/ManagerDirectors${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
    {
      title: 'Settings',
      icon: CiSettings,
      subItems: [
        { title: 'Maintenance', href: `/ModuleSales/Sales/Settings/Maintenance${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'API Keys', href: `/ModuleSales/Sales/Settings/APIKeys${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
    {
      title: 'Profile',
      icon: CiSettings,
      subItems: [
        { title: 'Update Profile', href: `/ModuleSales/Sales/Profile${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        { title: 'Developers', href: `/ModuleSales/Sales/Profile/Developers${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
      ],
    },
  ];
  

  // Filter menu items based on the user's role
  const filteredMenuItems = userDetails.Role === "Admin" || userDetails.Role === "Super Admin" ? menuItems: menuItems.filter((item) => {
    if (userDetails.Role === "Manager") {
      return [
        "Sales Performance",
        "Conversion Rates",
        "TSA Activities",
        "Client Activity Board",
        "Announcements",
        "Profile"
      ].includes(item.title);
    }
    if (userDetails.Role === "Territory Sales Manager") {
      return [
        "Sales Performance",
        "Agents",
        "Client Activity Board",
        "Announcements",
        "Profile"
      ].includes(item.title);
    }
    if (userDetails.Role === "Territory Sales Associate") {
      return [
        "My Companies",
        "Task",
        "Boards",
        "Announcements",
        "Profile"
      ].includes(item.title);
    }
    return false; // Default: walang access
  });

  return (
    <div className={`fixed inset-y-0 left-0 z-50 h-screen bg-white text-black shadow-lg transition-all duration-300 flex flex-col ${collapsed ? "w-16" : "w-64"} ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between p-5 border-b">
        <div className="flex items-center">
          <img src="/taskflow.png" alt="Logo" className="h-8 mr-2"/>
          <Link href={`/ModuleSales/Sales/Dashboard${userId ? `?id=${encodeURIComponent(userId)}` : ''}`}>
            <h1 className={`text-md font-bold transition-opacity ${collapsed ? "opacity-0" : "opacity-100"}`}>
              TASKFLOW
            </h1>
          </Link>
        </div>
      </div>

      {/* User Details Section */}
      {!collapsed && (
          <div className="p-8 text-xs text-left border-b">
            <p className="font-bold uppercase">
            {userDetails.Firstname}, {userDetails.Lastname}
            </p>
            <p>{userDetails.Company}</p>
            <p>( {userDetails.Role} )</p>
          </div>
        )}
      
      {/* Menu Section */}
      <div className="flex flex-col items-center rounded-md flex-grow overflow-y-auto text-xs p-2">
        <div className="w-full">
          <Link href={`/ModuleSales/Sales/Dashboard/${userId ? `?id=${encodeURIComponent(userId)}` : ''}`} className="flex items-center w-full p-4 bg-green-900 mb-1 text-white rounded transition-all duration-300 ease-in-out hover:shadow-md 
                  active:scale-95"><CiGrid42 size={22} className="mr-1"/>Dashboard</Link>
        </div>
          {filteredMenuItems.map((item, index) => (
            <div key={index} className="w-full">
              <button
                onClick={() => handleToggle(item.title)}
                className={`flex items-center w-full p-4 hover:bg-green-900 rounded hover:rounded-md hover:text-white transition-all duration-300 ease-in-out hover:shadow-md 
                  active:scale-95 ${collapsed ? "justify-center" : ""}`}
              >
                <item.icon size={18} />
                {!collapsed && <span className="ml-2">{item.title}</span>}
                {!collapsed && (
                  <span className="ml-auto">
                    {openSections[item.title] ? <FaMinus size={10} /> : <FaPlus size={10} />}
                  </span>
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openSections[item.title] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {openSections[item.title] && !collapsed && (
                  <div> {/* Added margin-left for submenu spacing */}
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        prefetch={true}
                        className="flex items-center text-dark w-full p-4 bg-gray-200 hover:bg-green-900 hover:text-white transition-all border-transparent transition-all duration-300 ease-in-out"
                      >
                        {/* Adding small circle icon for each submenu item */}
                        <FaRegCircle size={10} className="mr-2 ml-2" />
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};

export default Sidebar;
