"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

// Components
import AddPostForm from "../../../components/UserManagement/CompanyAccounts/AddUserForm";
import SearchFilters from "../../../components/Companies/DeletionCompanies/SearchFilters";
import UsersTable from "../../../components/UserManagement/CompanyAccounts/UsersTable";
import Pagination from "../../../components/UserManagement/CompanyAccounts/Pagination";

// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ExcelJS from "exceljs";


// Icons
import { CiSquarePlus, CiImport, CiExport } from "react-icons/ci";
import { FiUpload } from "react-icons/fi";
import Select from "react-select";

const ListofUser: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [showImportForm, setShowImportForm] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(12);
    const [selectedClientType, setSelectedClientType] = useState("");
    const [startDate, setStartDate] = useState(""); // Default to null
    const [endDate, setEndDate] = useState(""); // Default to null

    const [userDetails, setUserDetails] = useState({
        UserId: "", Firstname: "", Lastname: "", Email: "", Role: "", Department: "", Company: "",
    });

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [referenceid, setreferenceid] = useState("");
    const [tsm, settsm] = useState("");
    const [manager, setmanager] = useState("");
    const [status, setstatus] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [managerOptions, setManagerOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedManager, setSelectedManager] = useState<{ value: string; label: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [TSMOptions, setTSMOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedTSM, setSelectedTSM] = useState<{ value: string; label: string } | null>(null);
    const [TSAOptions, setTSAOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedReferenceID, setSelectedReferenceID] = useState<{ value: string; label: string } | null>(null);

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error("Please upload a file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = event.target?.result as ArrayBuffer;
            const workbook = new ExcelJS.Workbook();

            await workbook.xlsx.load(data);
            const worksheet = workbook.worksheets[0];

            const jsonData: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header row

                jsonData.push({
                    referenceid,
                    tsm,
                    manager,
                    status,
                    companyname: row.getCell(1).value || "",
                    contactperson: row.getCell(2).value || "",
                    contactnumber: row.getCell(3).value || "",
                    emailaddress: row.getCell(4).value || "",
                    typeclient: row.getCell(5).value || "",
                    address: row.getCell(6).value || "",
                    area: row.getCell(7).value || "",
                });
            });

            // Debug log to check parsed data
            console.log("Parsed Excel Data:", jsonData);

            try {
                const response = await fetch("/api/ModuleSales/UserManagement/CompanyAccounts/ImportAccounts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",  // Set correct header for JSON
                    },
                    body: JSON.stringify({
                        referenceid,
                        tsm,
                        manager,
                        status,
                        data: jsonData,  // Send parsed data as JSON
                    }),
                });

                const result = await response.json();
                if (result.success) {
                    toast.success(`${result.insertedCount} records imported successfully!`);
                    setreferenceid(""); // Reset input fields
                    settsm("");
                    setFile(null);
                } else {
                    toast.error(result.message || "Import failed.");
                }
            } catch (error) {
                toast.error("Error uploading file.");
            }
        };

        reader.readAsArrayBuffer(file);
    };

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
                        Firstname: data.Firstname || "",
                        Lastname: data.Lastname || "",
                        Email: data.Email || "",
                        Role: data.Role || "",
                        Department: data.Department || "",
                        Company: data.Company || "",
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

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const response = await fetch("/api/manager?Role=Manager");
                if (!response.ok) {
                    throw new Error("Failed to fetch managers");
                }
                const data = await response.json();

                // Use ReferenceID as value
                const options = data.map((user: any) => ({
                    value: user.ReferenceID, // ReferenceID ang isesend
                    label: `${user.Firstname} ${user.Lastname}`, // Pero ang nakikita sa UI ay Name
                }));

                setManagerOptions(options);
            } catch (error) {
                console.error("Error fetching managers:", error);
            }
        };

        fetchManagers();
    }, []);

    useEffect(() => {
        const fetchTSM = async () => {
            try {
                const response = await fetch("/api/tsm?Role=Territory Sales Manager");
                if (!response.ok) {
                    throw new Error("Failed to fetch managers");
                }
                const data = await response.json();

                // Use ReferenceID as value
                const options = data.map((user: any) => ({
                    value: user.ReferenceID, // ReferenceID ang isesend
                    label: `${user.Firstname} ${user.Lastname}`, // Pero ang nakikita sa UI ay Name
                }));

                setTSMOptions(options);
            } catch (error) {
                console.error("Error fetching managers:", error);
            }
        };

        fetchTSM();
    }, []);

    useEffect(() => {
        const fetchTSA = async () => {
            try {
                const response = await fetch("/api/tsa?Role=Territory Sales Associate");
                if (!response.ok) {
                    throw new Error("Failed to fetch agents");
                }
                const data = await response.json();

                // Use ReferenceID as value
                const options = data.map((user: any) => ({
                    value: user.ReferenceID, // ReferenceID ang isesend
                    label: `${user.Firstname} ${user.Lastname}`, // Pero ang nakikita sa UI ay Name
                }));

                setTSAOptions(options);
            } catch (error) {
                console.error("Error fetching agents:", error);
            }
        };

        fetchTSA();
    }, []);

    // Fetch all users from the API
    const fetchAccount = async () => {
        try {
            const response = await fetch("/api/ModuleSales/UserManagement/CompanyAccounts/FetchAccount");
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
        ? posts.filter((post) => {
            // Check if the company name matches the search term
            const matchesSearchTerm = post?.companyname?.toLowerCase().includes(searchTerm.toLowerCase());

            // Parse the date_created field
            const postDate = post.date_created ? new Date(post.date_created) : null;

            // Check if the post's date is within the selected date range
            const isWithinDateRange = (
                (!startDate || (postDate && postDate >= new Date(startDate))) &&
                (!endDate || (postDate && postDate <= new Date(endDate)))
            );

            // Check if the post matches the selected client type
            const matchesClientType = selectedClientType
                ? post?.typeclient === selectedClientType
                : true;

            // Return the filtered result
            return matchesSearchTerm && isWithinDateRange && matchesClientType;
        })
        : [];

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredAccounts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredAccounts.length / postsPerPage);


    // Handle editing a post
    const handleEdit = (post: any) => {
        setEditUser(post);
        setShowForm(true);
    };

    const exportToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Company Accounts");

        // Set column headers
        worksheet.columns = [
            { header: 'companyname', key: 'companyname', width: 20 },
            { header: 'contactperson', key: 'contactperson', width: 20 },
            { header: 'contactnumber', key: 'contactnumber', width: 20 },
            { header: 'emailaddress', key: 'emailaddress', width: 20 },
            { header: 'typeclient', key: 'typeclient', width: 20 },
            { header: 'address', key: 'address', width: 20 },
            { header: 'area', key: 'area', width: 20 },
        ];

        // Loop through all filtered posts to ensure the full set of data is exported
        filteredAccounts.forEach((post) => {
            worksheet.addRow({
                companyname: post.companyname,
                contactperson: post.contactperson,
                contactnumber: post.contactnumber,
                emailaddress: post.emailaddress,
                typeclient: post.typeclient,
                address: post.address,
                area: post.area
            });
        });

        // Save to file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "CompanyAccounts.xlsx";
            link.click();
        });
    };

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="container mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
                                {showForm ? (
                                    <AddPostForm
                                        onCancel={() => {
                                            setShowForm(false);
                                            setEditUser(null);
                                        }}
                                        refreshPosts={fetchAccount}  // Pass the refreshPosts callback
                                        userDetails={{ id: editUser ? editUser.id : userDetails.UserId }}  // Ensure id is passed correctly
                                        editUser={editUser}
                                    />
                                ) : showImportForm ? (
                                    <div className="bg-white p-4 shadow-md rounded-md">
                                        <h2 className="text-lg font-bold mb-2">Import Accounts</h2>
                                        <form onSubmit={handleFileUpload}>
                                            <div className="flex flex-wrap -mx-4">
                                                <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4">
                                                    <label className="block text-xs font-bold mb-2" htmlFor="Manager">Manager</label>
                                                    {isEditing ? (
                                                        <input type="text" id="manager" value={manager} onChange={(e) => setmanager(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" readOnly />
                                                    ) : (
                                                        <Select id="Manager" options={managerOptions} value={selectedManager} onChange={(option) => {
                                                            setSelectedManager(option);
                                                            setmanager(option ? option.value : ""); // Save ReferenceID as Manager
                                                        }} className="text-xs capitalize" />
                                                    )}
                                                </div>
                                                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                                    <label className="block text-xs font-bold mb-2" htmlFor="TSM">Territory Sales Manager</label>
                                                    {isEditing ? (
                                                        <input type="text" id="tsm" value={tsm} onChange={(e) => settsm(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" readOnly />
                                                    ) : (
                                                        <Select id="TSM" options={TSMOptions} value={selectedTSM} onChange={(option) => {
                                                            setSelectedTSM(option);
                                                            settsm(option ? option.value : ""); // Save ReferenceID as Manager
                                                        }} className="text-xs capitalize" />
                                                    )}
                                                </div>
                                                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                                    <label className="block text-xs font-bold mb-2" htmlFor="referenceid">Territory Sales Associate</label>
                                                    {isEditing ? (
                                                        <input type="text" id="referenceid" value={referenceid} onChange={(e) => setreferenceid(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" readOnly />
                                                    ) : (
                                                        <Select id="ReferenceID" options={TSAOptions} value={selectedReferenceID} onChange={(option) => {
                                                            setSelectedReferenceID(option);
                                                            setreferenceid(option ? option.value : ""); // Save ReferenceID as Manager
                                                        }} className="text-xs capitalize" />
                                                    )}
                                                </div>
                                                <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4">
                                                    <select value={status} onChange={(e) => setstatus(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize">
                                                        <option value="">Select Status</option>
                                                        <option value="Active">Active</option>
                                                        <option value="Used">Used</option>
                                                        <option value="Inactive">Inactive</option>
                                                    </select>
                                                </div>
                                                <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4">
                                                    <input type="file" className="w-full px-3 py-2 border rounded text-xs capitalize" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="submit" className="bg-blue-600 text-xs text-white px-4 py-2 rounded">Upload</button>
                                                <button type="button" className="bg-gray-500 text-xs text-white px-4 py-2 rounded" onClick={() => setShowImportForm(false)}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <button className="flex items-center gap-1 border bg-white text-black text-xs px-4 py-2 shadow-sm rounded hover:bg-blue-900 hover:text-white transition" onClick={() => setShowForm(true)} >
                                                <CiSquarePlus size={16} /> Add Companies
                                            </button>
                                            <div className="flex gap-2">
                                                <button onClick={exportToExcel} className="flex items-center gap-1 border bg-white text-black text-xs px-4 py-2 shadow-sm rounded hover:bg-orange-500 hover:text-white transition">
                                                    <CiExport size={16} /> Export
                                                </button>
                                                <button className="flex items-center gap-1 border bg-white text-black text-xs px-4 py-2 shadow-sm rounded hover:bg-green-800 hover:text-white transition" onClick={() => setShowImportForm(true)}>
                                                    <CiImport size={16} /> Import Account
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                                            <h2 className="text-lg font-bold mb-2">Company Accounts</h2>
                                            <SearchFilters
                                                searchTerm={searchTerm}
                                                setSearchTerm={setSearchTerm}
                                                postsPerPage={postsPerPage}
                                                setPostsPerPage={setPostsPerPage}
                                                selectedClientType={selectedClientType}
                                                setSelectedClientType={setSelectedClientType}
                                                startDate={startDate}
                                                setStartDate={setStartDate}
                                                endDate={endDate}
                                                setEndDate={setEndDate}
                                            />
                                            <UsersTable
                                                posts={currentPosts}
                                                handleEdit={handleEdit}
                                            />
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                setCurrentPage={setCurrentPage}
                                            />

                                            <div className="text-xs mt-2">
                                                Showing {indexOfFirstPost + 1} to{" "}
                                                {Math.min(indexOfLastPost, filteredAccounts.length)} of{" "}
                                                {filteredAccounts.length} entries
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
