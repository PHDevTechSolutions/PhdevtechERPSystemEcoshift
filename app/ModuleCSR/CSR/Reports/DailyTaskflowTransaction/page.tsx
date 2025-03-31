"use client"; // This should be at the top if you're using Next.js 13 or later with the app directory.

import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

import SearchFilters from "../../../components/DailyTransaction/SearchFilters";
import DailyTransactionTable from "../../../components/Taskflow/DailyTransaction/UsersTable";
import Pagination from "../../../components/Outbound/Pagination";

import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ExcelJS from 'exceljs';
import { CiExport } from "react-icons/ci";

// Main Page Component
const OutboundCallPage: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClientType, setSelectedClientType] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(10);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [userDetails, setUserDetails] = useState({
        UserId: "", ReferenceID: "", Firstname: "", Lastname: "", Email: "", Role: "",
    });
    const [showAccessModal, setShowAccessModal] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const params = new URLSearchParams(window.location.search);
            const userId = params.get("id");

            if (userId) {
                try {
                    const response = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
                    if (!response.ok) throw new Error("Failed to fetch user data");
                    const data = await response.json();
                    setUserDetails({
                        UserId: data._id, // Set the user's id here
                        ReferenceID: data.ReferenceID || "",  // <-- Siguraduhin na ito ay may value
                        Firstname: data.Firstname || "",
                        Lastname: data.Lastname || "",
                        Email: data.Email || "",
                        Role: data.Role || "",
                    });
                } catch (err: unknown) {
                    console.error("Error fetching user data:", err);
                    setError("Failed to load user data. Please try again later.");
                } finally {
                    setLoading(false);
                }
            } else {
                setError("User ID is missing.");
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch("/api/ModuleSales/Task/DailyActivity/FetchInquiries");
            const data = await response.json();
            setPosts(data.data);
        } catch (error) {
            toast.error("Error fetching progress.");
            console.error("Error Fetching", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/getUsers"); // API endpoint mo
                const data = await response.json();
                setUsersList(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    // Filter posts based on search and selected client type
    const filteredPosts = posts
        .filter((post) => {
            const accountName = post.companyname ? post.companyname.toLowerCase() : "";
            const ticketnumber = post.ticketreferencenumber
                ? post.ticketreferencenumber.toLowerCase()
                : "";
            const AgentFirstname = post.AgentFirstname
                ? post.AgentFirstname.toLowerCase()
                : "";

            const matchesSearch =
                accountName.includes(searchTerm.toLowerCase()) ||
                ticketnumber.includes(searchTerm.toLowerCase()) || // ✅ Added ticket number filter
                AgentFirstname.includes(searchTerm.toLowerCase());

            // Filter by CSR Inquiries only
            const isCSRInquiry = post.typeclient === "CSR Inquiries";

            // Date range filtering
            const postStartDate = post.startdate ? new Date(post.startdate) : null;
            const postEndDate = post.enddate ? new Date(post.enddate) : null;
            const isWithinDateRange =
                (!startDate || (postStartDate && postStartDate >= new Date(startDate))) &&
                (!endDate || (postEndDate && postEndDate <= new Date(endDate)));

            return (
                matchesSearch && isWithinDateRange && isCSRInquiry
            );
        })
        .map((post) => {
            // Find the agent with the same ReferenceID in usersList
            const agent = usersList.find((user) => user.ReferenceID === post.referenceid);

            // Find the manager with the same ReferenceID in usersList
            const salesmanager = usersList.find((user) => user.ReferenceID === post.tsm);

            return {
                ...post,
                AgentFirstname: agent ? agent.Firstname : "Unknown",
                AgentLastname: agent ? agent.Lastname : "Unknown",
                ManagerFirstname: salesmanager ? salesmanager.Firstname : "Unknown",
                ManagerLastname: salesmanager ? salesmanager.Lastname : "Unknown",
            };
        });

    // Pagination logic
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    const exportToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Outbound Calls");

        // Set column headers
        worksheet.columns = [
            { header: 'Company Name', key: 'companyname', width: 20 },
            { header: 'Territory Sales Associates', key: 'AgentFirstname', width: 20 },
            { header: 'Territory Sales Manager', key: 'ManagerFirstname', width: 20 },
            { header: 'Type of Client', key: 'typeclient', width: 20 },
            { header: 'Type of Call', key: 'typecall', width: 20 },
            { header: 'Call Status', key: 'callstatus', width: 20 },
            { header: 'Contact Person', key: 'contactperson', width: 20 },
            { header: 'Contact No.', key: 'contactnumber', width: 20 },
            { header: 'Email', key: 'emailaddress', width: 20 },
            { header: 'Remarks', key: 'remarks', width: 20 },
            { header: 'Call Duration', key: 'start_date_end_date', width: 30 },
            { header: 'Time Consumed', key: 'time_consumed', width: 20 }
        ];

        // Loop through all filtered posts to ensure the full set of data is exported
        filteredPosts.forEach((post) => {
            worksheet.addRow({
                companyname: post.companyname,
                AgentFirstname: post.AgentFirstname,
                ManagerFirstname: post.ManagerFirstname,
                typeclient: post.typeclient,
                typecall: post.typecall,
                callstatus: post.callstatus,
                contactperson: post.contactperson,
                contactnumber: post.contactnumber,
                emailaddress: post.emailaddress,
                remarks: post.remarks,
                start_date_end_date: `${post.startdate} - ${post.enddate}`,
                time_consumed: post.time_consumed
            });
        });

        // Save to file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "outbound_calls.xlsx";
            link.click();
        });
    };

    const isRestrictedUser =
        userDetails?.Role !== "Super Admin" && userDetails?.ReferenceID !== "LR-CSR-849432";

    // Automatically show modal if the user is restricted
    useEffect(() => {
        if (isRestrictedUser) {
            setShowAccessModal(true);
        } else {
            setShowAccessModal(false);
        }
    }, [isRestrictedUser]);

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(userName) => (
                        <div className="container mx-auto p-4 relative">
                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
                            <h2 className="text-lg font-bold mb-2">Daily CSR Transaction</h2>
                                <p className="text-xs mb-2">The Daily CSR Transaction section displays essential details of customer service interactions, including the Ticket Number, Account Name, Contact, Email, Wrap Up, Inquiry/Concern, Remarks, Agent, TSM, and Time Consumed. This helps track and manage customer inquiries efficiently while monitoring agent performance and resolution times.</p>

                                {/* Display total entries */}

                                <div className="mb-4 p-4 bg-white shadow-md rounded-md text-gray-900">
                                    <SearchFilters
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        selectedClientType={selectedClientType}
                                        setSelectedClientType={setSelectedClientType}
                                        postsPerPage={postsPerPage}
                                        setPostsPerPage={setPostsPerPage}
                                        startDate={startDate}
                                        setStartDate={setStartDate}
                                        endDate={endDate}
                                        setEndDate={setEndDate}
                                    />
                                    <button onClick={exportToExcel} className="mb-4 px-4 py-2 bg-gray-100 shadow-sm text-dark text-xs flex items-center gap-1 rounded"><CiExport size={20} /> Export to Excel</button>
                                    <DailyTransactionTable posts={currentPosts} />
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        setCurrentPage={setCurrentPage}
                                    />
                                </div>
                                {showAccessModal && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 rounded-md">
                                        <div className="bg-white p-6 rounded shadow-lg w-96">
                                            <h2 className="text-lg font-bold text-red-600 mb-4">⚠️ Access Denied</h2>
                                            <p className="text-sm text-gray-700 mb-4">
                                                You do not have the necessary permissions to perform this action.
                                                Only <strong>Super Admin</strong> or <strong>Leroux Y Xchire</strong> can access this section.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <ToastContainer />
                            </div>
                        </div>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default OutboundCallPage;
