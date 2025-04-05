"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

// Components
import AddPostForm from "../../../components/UserManagement/CompanyAccounts/AddUserForm";
import SearchFilters from "../../../components/Taskflow/ActivityLogs/SearchFilters";
import UsersTable from "../../../components/Taskflow/ProgressLogs/ProgressTable";
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
    const [targetquota, settargetquota] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [jsonData, setJsonData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [managerOptions, setManagerOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedManager, setSelectedManager] = useState<{ value: string; label: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [TSMOptions, setTSMOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedTSM, setSelectedTSM] = useState<{ value: string; label: string } | null>(null);
    const [TSAOptions, setTSAOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedReferenceID, setSelectedReferenceID] = useState<{ value: string; label: string } | null>(null);

    const [filterTSA, setFilterTSA] = useState<string>(""); // ✅ Fixed TSA Filter
    const [tsaList, setTsaList] = useState<any[]>([]); // ✅ Fixed TSA List

    const [selectedStatus, setSelectedStatus] = useState<string>(""); // Status filter ✅ Corrected

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = event.target?.result as ArrayBuffer;
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(data);
            const worksheet = workbook.worksheets[0];

            const parsedData: any[] = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header row

                parsedData.push({
                    referenceid,
                    tsm,
                    manager,
                    targetquota,
                    activitynumber: row.getCell(1).value || "",
                    companyname: row.getCell(2).value || "",
                    contactperson: row.getCell(3).value || "",
                    contactnumber: row.getCell(4).value || "",
                    emailaddress: row.getCell(5).value || "",
                    typeclient: row.getCell(6).value || "",
                    address: row.getCell(7).value || "",
                    area: row.getCell(8).value || "",
                    projectname: row.getCell(9).value || "",
                    projectcategory: row.getCell(10).value || "",
                    projecttype: row.getCell(11).value || "",
                    source: row.getCell(12).value || "",
                    typeactivity: row.getCell(13).value || "",
                    callback: row.getCell(14).value || "",
                    callstatus: row.getCell(15).value || "",
                    typecall: row.getCell(16).value || "",
                    remarks: row.getCell(17).value || "",
                    quotationnumber: row.getCell(18).value || "",
                    quotationamount: row.getCell(19).value || "",
                    sonumber: row.getCell(20).value || "",
                    soamount: row.getCell(21).value || "",
                    startdate: row.getCell(22).value || "",
                    enddate: row.getCell(23).value || "",
                    activitystatus: row.getCell(24).value || "",
                    actualsales: row.getCell(25).value || "",
                });
            });

            console.log("Parsed Excel Data:", parsedData);
            setJsonData(parsedData);
        };
        reader.readAsArrayBuffer(selectedFile);
    };


    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!file) {
            toast.error("Please upload a file.");
            setIsLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
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
                        targetquota,
                        activitynumber: row.getCell(1).value || "",
                        companyname: row.getCell(2).value || "",
                        contactperson: row.getCell(3).value || "",
                        contactnumber: row.getCell(4).value || "",
                        emailaddress: row.getCell(5).value || "",
                        typeclient: row.getCell(6).value || "",
                        address: row.getCell(7).value || "",
                        area: row.getCell(8).value || "",
                        projectname: row.getCell(9).value || "",
                        projectcategory: row.getCell(10).value || "",
                        projecttype: row.getCell(11).value || "",
                        source: row.getCell(12).value || "",
                        typeactivity: row.getCell(13).value || "",
                        callback: row.getCell(14).value || "",
                        callstatus: row.getCell(15).value || "",
                        typecall: row.getCell(16).value || "",
                        remarks: row.getCell(17).value || "",
                        quotationnumber: row.getCell(18).value || "",
                        quotationamount: row.getCell(19).value || "",
                        sonumber: row.getCell(20).value || "",
                        soamount: row.getCell(21).value || "",
                        startdate: row.getCell(22).value || "",
                        enddate: row.getCell(23).value || "",
                        activitystatus: row.getCell(24).value || "",
                        actualsales: row.getCell(25).value || "",
                    });
                });

                console.log("Sending Data to Backend:", jsonData);

                const response = await fetch("/api/ModuleSales/UserManagement/ProgressLogs/ImportProgress", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        referenceid,
                        tsm,
                        manager,
                        targetquota,
                        data: jsonData,
                    }),
                });

                const result = await response.json();
                console.log("Response from server:", result);

                if (result.success) {
                    toast.success(`${result.insertedCount} records imported successfully!`);
                    setreferenceid("");
                    settsm("");
                    setmanager("");
                    settargetquota("");
                    setFile(null);
                } else {
                    toast.error(result.message || "Import failed.");
                }
            } catch (error) {
                console.error("Error processing file:", error);
                toast.error("Error uploading file.");
            } finally {
                setIsLoading(false);
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
            const response = await fetch("/api/ModuleSales/UserManagement/ProgressLogs/FetchAccount");
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

    useEffect(() => {
        fetch("/api/tsa?Role=Territory Sales Associate")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setTsaList(data);
                } else {
                    console.error("Invalid TSA list format:", data);
                    setTsaList([]);
                }
            })
            .catch((err) => console.error("Error fetching TSA list:", err));
    }, []);

    // Filter users by search term (firstname, lastname)
    const filteredAccounts = Array.isArray(posts)
        ? posts.filter((post) => {
            // ✅ Check if the company name or status matches the search term
            const matchesSearchTerm =
                post?.companyname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post?.activitystatus?.toLowerCase().includes(searchTerm.toLowerCase());

            // ✅ Parse the date_created field
            const postDate = post.date_created ? new Date(post.date_created) : null;

            // ✅ Check if the post's date is within the selected date range
            const isWithinDateRange =
                (!startDate || (postDate && postDate >= new Date(startDate))) &&
                (!endDate || (postDate && postDate <= new Date(endDate)));

            // ✅ Check if the post matches the selected client type
            const matchesClientType = selectedClientType
                ? post?.typeclient === selectedClientType
                : true;

            // ✅ Check if the post matches the selected status
            const matchesStatus = selectedStatus ? post?.activitystatus === selectedStatus : true;

            // ✅ Check if the post matches the selected TSA
            const matchesTSA = filterTSA ? post?.referenceid === filterTSA : true;

            // ✅ Return the filtered result
            return (
                matchesSearchTerm &&
                isWithinDateRange &&
                matchesClientType &&
                matchesStatus &&
                matchesTSA
            );
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

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="container mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
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
                                                    <select value={targetquota} onChange={(e) => settargetquota(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize">
                                                        <option value="">Select Quota</option>
                                                        <option value="1750000">1,750,000</option>
                                                        <option value="1000000">1,000,000</option>
                                                        <option value="950000">950,000</option>
                                                        <option value="700000">700,000</option>
                                                        <option value="500000">500,000</option>
                                                        <option value="300000">300,000</option>
                                                        <option value="0">0</option>
                                                    </select>
                                                </div>
                                                <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4">
                                                    <input type="file" className="w-full px-3 py-2 border rounded text-xs" onChange={handleFileChange} />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="submit"
                                                    className={`bg-blue-600 text-xs text-white px-4 py-2 rounded flex items-center gap-2 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                                                        }`}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        "Upload"
                                                    )}
                                                </button>
                                                <button type="button" className="bg-gray-500 text-xs text-white px-4 py-2 rounded" onClick={() => setShowImportForm(false)}>Cancel</button>
                                            </div>
                                        </form>

                                        {/* Display Table if Data is Loaded */}
                                        {jsonData.length > 0 && (
                                            <div className="mt-4">
                                                <h3 className="text-sm font-bold mb-2">Preview Data ({jsonData.length} records)</h3>
                                                <div className="overflow-auto max-h-64 border rounded-md">
                                                    <table className="w-full border-collapse text-left">
                                                        <thead>
                                                            <tr className="bg-gray-200 text-xs">
                                                                <th className="border px-2 py-1">Activity Number</th>
                                                                <th className="border px-2 py-1">Company Name</th>
                                                                <th className="border px-2 py-1">Contact Person</th>
                                                                <th className="border px-2 py-1">Contact Number</th>
                                                                <th className="border px-2 py-1">Email Address</th>
                                                                <th className="border px-2 py-1">Type of Client</th>
                                                                <th className="border px-2 py-1">Address</th>
                                                                <th className="border px-2 py-1">Area</th>
                                                                <th className="border px-2 py-1">Project Name</th>
                                                                <th className="border px-2 py-1">Project Category</th>
                                                                <th className="border px-2 py-1">Project Type</th>
                                                                <th className="border px-2 py-1">Source</th>
                                                                <th className="border px-2 py-1">Type Activity</th>
                                                                <th className="border px-2 py-1">Callback</th>
                                                                <th className="border px-2 py-1">Call Status</th>
                                                                <th className="border px-2 py-1">Type Call</th>
                                                                <th className="border px-2 py-1">Remarks</th>
                                                                <th className="border px-2 py-1">Quotation Number</th>
                                                                <th className="border px-2 py-1">Quotation Amount</th>
                                                                <th className="border px-2 py-1">SO Number</th>
                                                                <th className="border px-2 py-1">SO Amount</th>
                                                                <th className="border px-2 py-1">Start Date</th>
                                                                <th className="border px-2 py-1">End Date</th>
                                                                <th className="border px-2 py-1">Activity Status</th>
                                                                <th className="border px-2 py-1">Actual Sales</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {jsonData.map((item, index) => (
                                                                <tr key={index} className="text-xs border">
                                                                    <td className="border px-2 py-1">{item.activitynumber}</td>
                                                                    <td className="border px-2 py-1">{item.companyname}</td>
                                                                    <td className="border px-2 py-1">{item.contactperson}</td>
                                                                    <td className="border px-2 py-1">{item.contactnumber}</td>
                                                                    <td className="border px-2 py-1">{item.emailaddress}</td>
                                                                    <td className="border px-2 py-1">{item.typeclient}</td>
                                                                    <td className="border px-2 py-1">{item.address}</td>
                                                                    <td className="border px-2 py-1">{item.area}</td>
                                                                    <td className="border px-2 py-1">{item.projectname}</td>
                                                                    <td className="border px-2 py-1">{item.projectcategory}</td>
                                                                    <td className="border px-2 py-1">{item.projecttype}</td>
                                                                    <td className="border px-2 py-1">{item.source}</td>
                                                                    <td className="border px-2 py-1">{item.typeactivity}</td>
                                                                    <td className="border px-2 py-1">{item.callback}</td>
                                                                    <td className="border px-2 py-1">{item.callstatus}</td>
                                                                    <td className="border px-2 py-1">{item.typecall}</td>
                                                                    <td className="border px-2 py-1">{item.remarks}</td>
                                                                    <td className="border px-2 py-1">{item.quotationnumber}</td>
                                                                    <td className="border px-2 py-1">{item.quotationamount}</td>
                                                                    <td className="border px-2 py-1">{item.sonumber}</td>
                                                                    <td className="border px-2 py-1">{item.soamount}</td>
                                                                    <td className="border px-2 py-1">{item.startDate}</td>
                                                                    <td className="border px-2 py-1">{item.enddate}</td>
                                                                    <td className="border px-2 py-1">{item.activitystatus}</td>
                                                                    <td className="border px-2 py-1">{item.actualsales}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex gap-2">
                                                <button className="flex items-center gap-1 border bg-white text-black text-xs px-4 py-2 shadow-sm rounded hover:bg-green-800 hover:text-white transition" onClick={() => setShowImportForm(true)}>
                                                    <CiImport size={16} /> Import Account
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                                            <h2 className="text-lg font-bold mb-2">Progress Logs</h2>
                                            <SearchFilters
                                                searchTerm={searchTerm}
                                                setSearchTerm={setSearchTerm}
                                                postsPerPage={postsPerPage}
                                                setPostsPerPage={setPostsPerPage}
                                                selectedClientType={selectedClientType}
                                                setSelectedClientType={setSelectedClientType}
                                                selectedStatus={selectedStatus} // ✅ Corrected
                                                setSelectedStatus={setSelectedStatus} // ✅ Corrected
                                                startDate={startDate}
                                                setStartDate={setStartDate}
                                                endDate={endDate}
                                                setEndDate={setEndDate}
                                                filterTSA={filterTSA} // ✅ Added
                                                setFilterTSA={setFilterTSA} // ✅ Added
                                                tsaList={tsaList} // ✅ Added
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
