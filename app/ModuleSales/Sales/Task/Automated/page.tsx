"use client";
import React, { useState, useEffect, useRef } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

// Components
import AddPostForm from "../../../components/Task/DailyActivity/AddUserForm";
import SearchFilters from "../../../components/Task/DailyActivity/SearchFilters";
import UsersTable from "../../../components/Task/DailyActivity/UsersTable";

// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Icons
import { CiSaveUp1, CiTrash, CiTurnL1 } from "react-icons/ci";
import { PiHandTapThin } from "react-icons/pi";
import { IoCheckmarkDoneCircleOutline, IoTrashOutline } from "react-icons/io5";
import { FcManager, FcPhone, FcFeedback, FcHome } from "react-icons/fc";
import { AiOutlineStop } from "react-icons/ai";

// Function to get formatted Manila timestamp
const getFormattedTimestamp = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    };

    // Get Manila time correctly formatted
    const manilaTimeStr = new Intl.DateTimeFormat("en-US", options).format(now);
    const [month, day, year, hour, minute, second] = manilaTimeStr.match(/\d+/g)!;

    // Return Manila date in `YYYY-MM-DDTHH:MM:SS` format
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};

interface Company {
    companyname: string;
    referenceid: string;
    tsm: string;
    manager: string;
    typeclient: string;
    contactnumber: string;
    contactperson: string;
    emailaddress: string;
    address: string;
    area: string;
    remarks: string;
    typeactivity: string;
    startdate: string;
    enddate: string;
    status: string;
    id?: number;
    [key: string]: any;
}

interface UserDetails {
    ReferenceID: string;
}

const ListofUser: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);

    const [post, setPost] = useState<Company[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false); // Modal visibility
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null); // Selected company data

    const [activeTab, setActiveTab] = useState("Automated Task");
    const [remainingBalance, setRemainingBalance] = useState<number>(0);
    const [todayCompanies, setTodayCompanies] = useState<any[]>([]);

    const [startDuration, setStartDuration] = useState<string>("");
    const [endDuration, setEndDuration] = useState<string>("");

    const [duration, setDuration] = useState<string>("");
    const [timeValue, setTimeValue] = useState<string>("");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClientType, setSelectedClientType] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [startDate, setStartDate] = useState(""); // Default to null
    const [endDate, setEndDate] = useState(""); // Default to null
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);

    const [userDetails, setUserDetails] = useState({
        UserId: "", ReferenceID: "", Manager: "", TSM: "", Firstname: "", Lastname: "", Email: "", Role: "", Department: "", Company: "", TargetQuota: "",
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showPersonalForm, setShowPersonalForm] = useState(false);

    const [activitystatus, setactivitystatus] = useState(""); // Default to null
    const [activityremarks, setactivityremarks] = useState(""); // Default to null
    const [startdate, setstartdate] = useState(""); // Default to null
    const [enddate, setenddate] = useState(""); // Default to null
    const [referenceid, setreferenceid] = useState(userDetails.ReferenceID);
    const [tsm, settsm] = useState(userDetails.TSM);
    const [manager, setmanager] = useState(userDetails.Manager);
    const [timeDuration, setTimeDuration] = useState("");

    const [showTimerModal, setShowTimerModal] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);

    const [showAccessModal, setShowAccessModal] = useState(false);

    const taskRef = useRef<HTMLDivElement | null>(null); // Reference for My Task div
    const [totalActivityCount, setTotalActivityCount] = useState<number>(0);

    // Fetch user data based on query parameters (user ID)
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
                        ReferenceID: data.ReferenceID || "",
                        Manager: data.Manager || "",
                        TSM: data.TSM || "",
                        Firstname: data.Firstname || "",
                        Lastname: data.Lastname || "",
                        Email: data.Email || "",
                        Role: data.Role || "",
                        Department: data.Department || "",
                        Company: data.Company || "",
                        TargetQuota: data.TargetQuota || "",
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

    // Fetch all users from the API
    const fetchAccount = async () => {
        try {
            const response = await fetch("/api/ModuleSales/Task/DailyActivity/FetchTask");
            const data = await response.json();
            console.log("Fetched data:", data); // Debugging line
            setPosts(data.data); // Make sure you're setting `data.data` if API response has `{ success: true, data: [...] }`
        } catch (error) {
            toast.error("Error fetching users.");
            console.error("Error Fetching", error);
        }
    };

    useEffect(() => {
        fetchAccount();
    }, []);

    // Filter users by search term (firstname, lastname)
    const filteredAccounts = Array.isArray(posts)
        ? posts
            .filter((post) => {
                // Check if company name or activity status matches the search term
                const matchesSearchTerm =
                    (post?.companyname?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (post?.activitystatus?.toLowerCase().includes(searchTerm.toLowerCase()));

                // Parse the date_created field safely
                const postDate = post?.date_created ? new Date(post.date_created) : null;

                // Check if the post's date is within the selected date range
                const isWithinDateRange =
                    (!startDate || (postDate && postDate >= new Date(startDate))) &&
                    (!endDate || (postDate && postDate <= new Date(endDate)));

                // Check if the post matches the selected client type
                const matchesClientType = selectedClientType
                    ? post?.typeclient === selectedClientType
                    : true;

                const matchesStatus = selectedStatus
                    ? post?.activitystatus === selectedStatus
                    : true;

                // Check if the post matches the current user's ReferenceID (PostgreSQL or MongoDB)
                const matchesReferenceID =
                    post?.referenceid === userDetails.ReferenceID || // PostgreSQL referenceid
                    post?.ReferenceID === userDetails.ReferenceID;   // MongoDB ReferenceID

                // Check the user's role for filtering
                const matchesRole =
                    userDetails.Role === "Super Admin" ||
                    userDetails.Role === "Special Access" ||
                    userDetails.Role === "Territory Sales Associate" ||
                    userDetails.Role === "Territory Sales Manager";

                // Return the final filtering condition
                return (
                    matchesSearchTerm &&
                    isWithinDateRange &&
                    matchesClientType &&
                    matchesStatus &&
                    matchesReferenceID && // Ensures the user sees only their data
                    matchesRole
                );
            })
            .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()) // Sort by date_created (newest first)
        : [];

    const currentPosts = filteredAccounts.slice();
    const totalPages = Math.ceil(filteredAccounts.length);

    // Handle editing a post
    const handleEdit = (post: any) => {
        setEditUser(post); // Set editUser to populate form fields
        setSelectedCompany({
            companyname: post.companyname || "",
            typeclient: post.typeclient || "",
            contactperson: post.contactperson || "",
            contactnumber: post.contactnumber || "",
            emailaddress: post.emailaddress || "",
            address: post.address || "",
            area: post.area || "",
            referenceid: post.referenceid || "",
            tsm: post.tsm || "",
            manager: post.manager || "",
            remarks: post.remarks || "",
            status: post.status || "",
            typeactivity: post.typeactivity || "", // ✅ Added missing field
            startdate: post.startdate || "",       // ✅ Added missing field
            enddate: post.enddate || "",           // ✅ Added missing field
        });
        setShowForm(true); // Show the AddPostForm with populated data
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const response = await fetch("/api/ModuleSales/Task/DailyActivity/UpdateStatus", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, activitystatus: newStatus }),
            });

            if (response.ok) {
                toast.success("Status updated successfully.");
                fetchAccount(); // Auto-refresh table after update
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to update status.");
            }
        } catch (error) {
            toast.error("Failed to update status.");
            console.error("Error updating status:", error);
        }
    };

    const confirmDelete = (postId: string) => {
        setPostToDelete(postId);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!postToDelete) return;
        try {
            const response = await fetch(`/api/ModuleSales/Task/DailyActivity/DeleteActivity`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: postToDelete }),
            });

            if (response.ok) {
                setPosts(posts.filter((post) => post.id !== postToDelete));
                toast.success("Post deleted successfully.");
            } else {
                toast.error("Failed to delete post.");
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post.");
        } finally {
            setShowDeleteModal(false);
            setPostToDelete(null);
        }
    };

    // Set start date when the component mounts
    useEffect(() => {
        setstartdate(getFormattedTimestamp());
    }, []);

    // Function to calculate end date based on selected duration
    const calculateEndDate = (duration: string) => {
        if (!startdate) return;

        // Convert `startdate` string into a Date object (Manila time)
        const start = new Date(startdate);

        // Ensure the start date is correctly in Manila timezone
        const manilaDate = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate(),
            start.getHours(),
            start.getMinutes(),
            start.getSeconds()
        );

        // Adjust time based on selected duration
        switch (duration) {
            case "1 Minute":
                manilaDate.setMinutes(manilaDate.getMinutes() + 1);
                break;
            case "5 Minutes":
                manilaDate.setMinutes(manilaDate.getMinutes() + 5);
                break;
            case "10 Minutes":
                manilaDate.setMinutes(manilaDate.getMinutes() + 10);
                break;
            case "15 Minutes":
                manilaDate.setMinutes(manilaDate.getMinutes() + 15);
                break;
            case "20 Minutes":
                manilaDate.setMinutes(manilaDate.getMinutes() + 20);
                break;
            case "30 Minutes":
                manilaDate.setMinutes(manilaDate.getMinutes() + 30);
                break;
            case "1 Hour":
                manilaDate.setHours(manilaDate.getHours() + 1);
                break;
            case "2 Hours":
                manilaDate.setHours(manilaDate.getHours() + 2);
                break;
            case "3 Hours":
                manilaDate.setHours(manilaDate.getHours() + 3);
                break;
            default:
                return;
        }

        // Ensure correct formatting for datetime-local input
        const formattedEndDate = `${manilaDate.getFullYear()}-${String(manilaDate.getMonth() + 1).padStart(2, '0')}-${String(manilaDate.getDate()).padStart(2, '0')}T${String(manilaDate.getHours()).padStart(2, '0')}:${String(manilaDate.getMinutes()).padStart(2, '0')}`;

        setenddate(formattedEndDate);
    };

    // Handle button click to set start date
    const handleButtonClick = () => {
        setstartdate(getFormattedTimestamp());
        setShowPersonalForm(true);
    };

    // Handle time selection change
    const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTime = e.target.value;
        setTimeDuration(selectedTime);
        calculateEndDate(selectedTime);
    };

    // Close form and reset fields
    const closeForm = () => {
        setShowPersonalForm(false);
        setstartdate("");
        setenddate("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!activitystatus || !activityremarks) {
            toast.error("Please fill in all fields before submitting.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/ModuleSales/Task/DailyActivity/AddActivity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    activitystatus,
                    activityremarks,
                    startdate,
                    enddate,
                    referenceid,
                    tsm,
                    manager,
                }),
            });

            if (response.ok) {
                toast.success("Activity submitted successfully!");
                setShowPersonalForm(false); // Close the form
                setactivitystatus("");
                setactivityremarks("");

                // Convert time duration to seconds
                const durationMap: Record<string, number> = {
                    "1 Minute": 1 * 60,
                    "5 Minutes": 5 * 60,
                    "10 Minutes": 10 * 60,
                    "15 Minutes": 15 * 60,
                    "20 Minutes": 20 * 60,
                    "30 Minutes": 30 * 60,
                    "1 Hour": 60 * 60,
                    "2 Hours": 2 * 60 * 60,
                    "3 Hours": 3 * 60 * 60,
                };

                const durationInSeconds = durationMap[timeDuration] || 0;
                if (durationInSeconds > 0) {
                    startCountdown(durationInSeconds);
                }

            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to submit activity.");
            }
        } catch (err) {
            console.error("Submission Error:", err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userDetails) {
            // Update state only if the value exists in userDetails
            if (userDetails.ReferenceID) {
                setreferenceid(userDetails.ReferenceID);
            }
            if (userDetails.TSM) {
                settsm(userDetails.TSM);
            }
            if (userDetails.Manager) {
                setmanager(userDetails.Manager);
            }
        }
    }, [userDetails]); // Only trigger when userDetails changes

    let timer: NodeJS.Timeout | null = null;

    const startCountdown = (durationInSeconds: number) => {
        if (timer) clearInterval(timer); // Clear existing timer before starting a new one

        setCountdown(durationInSeconds);
        setShowTimerModal(true);
        setTimerRunning(true);

        timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer!);
                    setShowTimerModal(false);
                    setTimerRunning(false);

                    // Refresh the entire page after timer ends
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Cleanup timer when component unmounts
    useEffect(() => {
        return () => {
            if (timer) clearInterval(timer);
        };
    }, []);

    function calculateDate(selectedDuration: string, selectedTime: string) {
        // Get current date in Manila timezone
        const now = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
        );
        let newDate = new Date(now);

        // Set date based on selected duration
        switch (selectedDuration) {
            case "Today":
                newDate = now;
                break;
            case "Tomorrow":
                newDate.setDate(now.getDate() + 1);
                break;
            case "After a Week":
                newDate.setDate(now.getDate() + 7);
                break;
            case "After a Month":
                newDate.setMonth(now.getMonth() + 1);
                break;
            default:
                newDate = now;
        }

        // Format date to 'yyyy-mm-ddThh:mm' in Manila timezone
        const dateTimeString = formatDateToLocal(newDate);
        setStartDuration(dateTimeString);
        setEndDuration(addTimeToDate(newDate, selectedTime));
    }

    // Function to add time (minutes/hours) to the selected date
    function addTimeToDate(date: Date, selectedTime: string) {
        const newDate = new Date(date);
        const [value, unit] = selectedTime.split(" ");
        const timeValue = parseInt(value);

        if (unit === "Minutes") {
            newDate.setMinutes(date.getMinutes() + timeValue);
        } else if (unit === "Hour" || unit === "Hours") {
            newDate.setHours(date.getHours() + timeValue);
        }

        return formatDateToLocal(newDate);
    }

    // Format date to 'yyyy-mm-ddThh:mm' in Manila timezone
    function formatDateToLocal(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Handle duration change
    function handleDurationChange(e: any) {
        const selectedDuration = e.target.value;
        setDuration(selectedDuration);
        calculateDate(selectedDuration, timeValue);
    }

    // Handle time change
    function handleTimeDateChange(e: any) {
        const selectedTime = e.target.value;
        setTimeValue(selectedTime);
        calculateDate(duration, selectedTime);
    }

    useEffect(() => {
        fetchCompanies();
    }, [userDetails.ReferenceID]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    // Fetch companies from API with ReferenceID as query param
    const fetchCompanies = async () => {
        try {
            const referenceid = userDetails.ReferenceID;
            if (!referenceid) return;

            let url = `/api/ModuleSales/Companies/CompanyAccounts/FetchAutomatedAccounts?referenceid=${referenceid}`;

            const response = await fetch(url, { cache: "no-store" }); // <== important: disable cache
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setPost(data.data);
                console.log("✅ Companies fetched:", data.data.length);
                console.log("📦 Current batch status:", data.batchStatus);
            } else {
                setPost([]);
                console.warn("⚠ No company data returned.");
            }
        } catch (error) {
            console.error("❌ Error fetching companies:", error);
        }
    };


    // This triggers once the ReferenceID is available and starts the batch cycle
    useEffect(() => {
        if (userDetails.ReferenceID) {
            fetchCompanies();
        }
    }, [userDetails.ReferenceID]);


    const handleProceed = async () => {
        if (!selectedCompany) return;

        try {

            let newStatus = selectedCompany.status === "Active" ? "Used" : "Active";

            console.log("Updating company:", selectedCompany.id, "→", newStatus);

            // Call API to update the status on the backend
            const response = await fetch("/api/ModuleSales/Task/DailyActivity/UpdateCompanyStatus", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: selectedCompany.id,
                    status: newStatus,  // Update status to new status
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Update failed:", errorText);
                return;
            }

            const result = await response.json();
            console.log("Company status updated:", result);

            // Update the local state of todayCompanies list with the new status
            setTodayCompanies(prevCompanies =>
                prevCompanies.map(company =>
                    company.id === selectedCompany.id ? { ...company, status: newStatus } : company
                )
            );

            setSelectedCompany(prev => ({
                ...prev,
                status: newStatus,
                companyname: prev?.companyname ?? "",
                referenceid: prev?.referenceid ?? "",
                tsm: prev?.tsm ?? "",
                manager: prev?.manager ?? "",
                typeclient: prev?.typeclient ?? "",
                id: prev?.id ?? 0,  // Default to 0 if undefined
                contactnumber: prev?.contactnumber ?? "",  // Default to empty string if undefined
                contactperson: prev?.contactperson ?? "",  // Default to empty string if undefined
                emailaddress: prev?.emailaddress ?? "",  // Default to empty string if undefined
                address: prev?.address ?? "",  // Default to empty string if undefined
                area: prev?.area ?? "",  // Default to empty string if undefined
                remarks: prev?.remarks ?? "",  // Default to empty string if undefined
                typeactivity: prev?.typeactivity ?? "",  // Default to empty string if undefined
                startdate: prev?.startdate ?? "",  // Default to empty string if undefined
                enddate: prev?.enddate ?? "",  // Default to empty string if undefined
            }));

            setShowForm(true); // Optionally show the form after the status change

        } catch (error) {
        } finally {
            setShowModal(false); // Close modal after action
            await fetchCompanies();
        }
    };

    // Handle Accept button to show modal
    const handleAccept = (company: any) => {
        setSelectedCompany(company);
        setShowModal(true);
    };

    const handleVoid = async (company: any) => {
        if (!company) return;

        try {
            let newStatus = company.status === "Used" ? "Active" : "Used";

            const response = await fetch("/api/ModuleSales/Task/DailyActivity/UpdateCompanyStatus", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: company.id,
                    status: newStatus,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Update failed:", errorText);
                return;
            }

            const result = await response.json();
            console.log("Company status updated:", result);

            setTodayCompanies(prevCompanies =>
                prevCompanies.map(c =>
                    c.id === company.id ? { ...c, status: newStatus } : c
                )
            );

            fetchCompanies();
        } catch (error) {
            console.error("An error occurred while updating status", error);
        }
    };

    // Handle Cancel to Close Modal
    const handleCancel = () => {
        setShowModal(false);
        setSelectedCompany(null);
    };

    const [currentPage, setCurrentPage] = useState(1);

    const companiesPerPage = 35;
    // Pagination logic
    const indexOfLastCompany = currentPage * companiesPerPage;
    const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
    const currentCompanies = post.slice(indexOfFirstCompany, indexOfLastCompany);

    const totalPagesCount = Math.ceil(post.length / companiesPerPage); // Avoid redeclaration

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="container mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1">
                                {showForm && selectedCompany ? (
                                    <AddPostForm
                                        onCancel={() => {
                                            setShowForm(false);
                                            setEditUser(null);
                                            setSelectedCompany(null);
                                        }}
                                        refreshPosts={fetchAccount} // Pass the refreshPosts callback
                                        userDetails={{
                                            id: editUser ? editUser.id : userDetails.UserId,
                                            referenceid: editUser ? editUser.referenceid : userDetails.ReferenceID,
                                            manager: editUser ? editUser.manager : userDetails.Manager,
                                            tsm: editUser ? editUser.tsm : userDetails.TSM,
                                            targetquota: editUser ? editUser.targetquota : userDetails.TargetQuota,
                                        }}
                                        editUser={editUser} // ✅ Properly pass editUser for editing
                                        companyData={{
                                            companyname: selectedCompany?.companyname || "",
                                            typeclient: selectedCompany?.typeclient || "",
                                            contactperson: selectedCompany?.contactperson || "",
                                            contactnumber: selectedCompany?.contactnumber || "",
                                            emailaddress: selectedCompany?.emailaddress || "",
                                            address: selectedCompany?.address || "",
                                            area: selectedCompany?.area || "",
                                        }}
                                    />
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                            {/* Task */}
                                            <div className="col-span-1 lg:col-span-3 bg-white shadow-md rounded-lg p-4">
                                                <h2 className="text-lg font-bold mb-2">Automated Task</h2>
                                                <p className="text-xs text-gray-600 mb-4">
                                                    This section displays your <strong>tasks</strong> in a <strong>card layout</strong>. Each task is represented as a card, offering a visually appealing and more flexible design compared to traditional tables. You can filter tasks based on various criteria like <strong>client type</strong>, <strong>date range</strong>, and other parameters using the search filters.
                                                </p>

                                                {/* Search Filters */}
                                                <SearchFilters
                                                    searchTerm={searchTerm}
                                                    setSearchTerm={setSearchTerm}
                                                    selectedClientType={selectedClientType}
                                                    setSelectedClientType={setSelectedClientType}
                                                    selectedStatus={selectedStatus}
                                                    setSelectedStatus={setSelectedStatus}
                                                    startDate={startDate}
                                                    setStartDate={setStartDate}
                                                    endDate={endDate}
                                                    setEndDate={setEndDate}
                                                />

                                                {/* Users Table */}
                                                <UsersTable
                                                    posts={currentPosts}
                                                    handleEdit={(user) => handleEdit(user)}
                                                    handleStatusUpdate={handleStatusUpdate}
                                                    handleDelete={confirmDelete}
                                                    Role={userDetails.Role}
                                                />
                                            </div>

                                            {/* Automated Task */}
                                            <div className="col-span-1 bg-white shadow-md rounded-lg p-4">
                                                <div className="bg-blue-200 text-black shadow-md rounded-lg p-2 flex flex-col items-center justify-center">
                                                    <h3 className="text-xs mb-1 font-light">My Overall Activity Count for Today</h3>
                                                    <p className="text-4xl font-light">{totalActivityCount.toLocaleString()}</p>
                                                </div>

                                                <div className="flex mb-4 mt-4 border-b">
                                                    <button
                                                        onClick={() => handleTabChange("Automated Task")}
                                                        className={`text-xs px-4 py-2 border-b-2 w-full ${activeTab === "Automated Task" ? "border-blue-500 font-semibold" : "text-gray-600"
                                                            }`}
                                                    >
                                                        Automated Task
                                                    </button>
                                                </div>

                                                {activeTab === "Automated Task" ? (
                                                    <>
                                                        <h3 className="text-sm font-semibold mb-2">Automated Task</h3>
                                                        <p className="text-xs text-gray-600 mb-4">
                                                            Below are some company names fetched from the system.
                                                        </p>

                                                        <div className="space-y-4">
                                                            {currentCompanies.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {currentCompanies.map((company) => (
                                                                        <div
                                                                            key={company.id}
                                                                            className={`p-2 rounded-lg shadow-lg text-[10px] transition-all duration-200 ease-in-out transform hover:scale-[1.02] uppercase font-medium
                ${company.typeclient === "New Account - Client Development"
                                                                                    ? "bg-yellow-200 text-black"
                                                                                    : company.status === "Used"
                                                                                        ? "bg-lime-200 text-black"
                                                                                        : "bg-teal-300 text-black"
                                                                                }`}
                                                                        >
                                                                            {/* Company Info */}
                                                                            <div className="space-y-1">
                                                                                <strong>{company.companyname}</strong>
                                                                                <br />
                                                                                <span>{company.typeclient} / {company.status}</span>
                                                                                <br />
                                                                                <div className="flex gap-1 items-start">
                                                                                    <FcManager size={10} className="flex-shrink-0 mt-[2px]" />
                                                                                    <span>{company.contactperson}</span>
                                                                                </div>
                                                                                <div className="flex gap-1 items-start">
                                                                                    <FcPhone size={10} className="flex-shrink-0 mt-[2px]" />
                                                                                    <span className="italic">{company.contactnumber}</span>
                                                                                </div>
                                                                                <div className="flex gap-1 items-start">
                                                                                    <FcFeedback size={10} className="flex-shrink-0 mt-[2px]" />
                                                                                    <span className="break-all italic lowercase">{company.emailaddress}</span>
                                                                                </div>
                                                                                <div className="flex gap-1 items-start">
                                                                                    <FcHome size={10} className="flex-shrink-0 mt-[2px]" />
                                                                                    <span className="break-words capitalize">{company.address}</span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Action Buttons */}
                                                                            <div className="mt-3 flex justify-end gap-2">
                                                                                <button
                                                                                    onClick={() => handleAccept(company)}
                                                                                    className={`px-3 py-1 text-[10px] rounded hover:bg-blue-600 transition flex items-center gap-1
                    ${company.status === "Used"
                                                                                            ? "bg-green-900 text-white"
                                                                                            : "bg-gray-100 text-black"}`}
                                                                                >
                                                                                    Accept <IoCheckmarkDoneCircleOutline size={15} />
                                                                                </button>

                                                                                <button
                                                                                    onClick={() => handleVoid(company)}
                                                                                    className={`px-3 py-1 text-[10px] rounded hover:bg-blue-600 transition flex items-center gap-1
                    ${company.status === "Used"
                                                                                            ? "bg-red-900 text-white"
                                                                                            : "bg-gray-100 text-black"}`}
                                                                                >
                                                                                    Void <AiOutlineStop size={15} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-gray-500 text-center p-2">
                                                                    No companies found.
                                                                </div>
                                                            )}

                                                            {/* Pagination Buttons */}
                                                            {totalPagesCount > 1 && (
                                                                <div className="flex justify-center mt-4 gap-2">
                                                                    <button
                                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                                        disabled={currentPage === 1}
                                                                        className={`px-4 py-1 text-xs rounded border shadow ${currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white hover:bg-gray-100"
                                                                            }`}
                                                                    >
                                                                        Previous
                                                                    </button>

                                                                    <button
                                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                                        disabled={currentPage === totalPagesCount}
                                                                        className={`px-4 py-1 text-xs rounded border shadow ${currentPage === totalPagesCount ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white hover:bg-gray-100"
                                                                            }`}
                                                                    >
                                                                        Next
                                                                    </button>
                                                                </div>
                                                            )}


                                                            {/* Modal for Proceed/Cancel */}
                                                            {showModal && (
                                                                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
                                                                    <div className="bg-white rounded-lg p-5 w-72 text-center shadow-lg">
                                                                        <p className="text-xs font-semibold mb-4">
                                                                            Are you sure you want to proceed?
                                                                        </p>

                                                                        <div className="flex justify-between text-xs">
                                                                            <button
                                                                                onClick={handleCancel}
                                                                                className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                onClick={handleProceed}
                                                                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                                                            >
                                                                                Proceed
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                    </>
                                                ) : (
                                                    <></>
                                                )}

                                            </div>
                                        </div>
                                    </>
                                )}

                                <ToastContainer className="text-xs" autoClose={1000} />
                            </div>
                        </div>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default ListofUser;