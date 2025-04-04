import React, { useEffect, useState, useMemo } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { CiClock2, CiExport } from "react-icons/ci";
import ExcelJS from "exceljs";

interface OutboundTableProps {
    posts: any[];
}

const OutboundTable: React.FC<OutboundTableProps> = ({ posts }) => {
    const [agentFilter, setAgentFilter] = useState<string>("");
    const [idNumberFilter, setIdNumberFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [startDateFilter, setStartDateFilter] = useState<string>("");  // Added start date filter
    const [endDateFilter, setEndDateFilter] = useState<string>("");      // Added end date filter
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [postsPerPage, setPostsPerPage] = useState<number>(10); // Default to 10 posts per page

    const agentNumbers = useMemo(
        () => Array.from(new Set(posts.map((post) => post.agent_number))),
        [posts]
    );
    const idNumbers = useMemo(
        () => Array.from(new Set(posts.map((post) => post.id_number))),
        [posts]
    );
    const statuses = useMemo(
        () => Array.from(new Set(posts.map((post) => post.status))),
        [posts]
    );

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const dateFinished = new Date(post.date_finished);
            const startDate = startDateFilter ? new Date(startDateFilter) : null;
            const endDate = endDateFilter ? new Date(endDateFilter) : null;

            const isDateInRange =
                (!startDate || dateFinished >= startDate) &&
                (!endDate || dateFinished <= endDate);

            return (
                (agentFilter ? post.agent_number === agentFilter : true) &&
                (idNumberFilter ? post.id_number === idNumberFilter : true) &&
                (statusFilter ? post.status === statusFilter : true) &&
                isDateInRange
            );
        });
    }, [posts, agentFilter, idNumberFilter, statusFilter, startDateFilter, endDateFilter]);

    const sortedPosts = useMemo(() => {
        return [...filteredPosts].sort((a, b) => {
            const dateA = a.date_finished ? new Date(a.date_finished) : new Date(0);
            const dateB = b.date_finished ? new Date(b.date_finished) : new Date(0);
            return dateB.getTime() - dateA.getTime(); // Sorting in descending order
        });
    }, [filteredPosts]);


    // Pagination logic
    const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
    const currentPosts = useMemo(() => {
        const indexOfLastPost = currentPage * postsPerPage;
        const indexOfFirstPost = indexOfLastPost - postsPerPage;
        return sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
    }, [sortedPosts, currentPage, postsPerPage]);

    const exportToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Activities");

        worksheet.columns = [
            { header: "Reference ID", key: "agent_number", width: 20 },
            { header: "TSM ID", key: "id_number", width: 20 },
            { header: "Company Name", key: "account_name", width: 20 },
            { header: "Contact Person", key: "contact_person", width: 20 },
            { header: "Contact Number", key: "contact_number", width: 20 },
            { header: "Email Address", key: "email", width: 20 },
            { header: "Type Client", key: "type_of_client", width: 20 },
            { header: "Address.", key: "address", width: 20 },
            { header: "Area", key: "area", width: 20 },
            { header: "Project Name", key: "project_name", width: 20 },
            { header: "Project Category", key: "product_category", width: 30 },
            { header: "Project Type", key: "project_type", width: 20 },
            { header: "Source", key: "source", width: 20 },
            { header: "Date Created", key: "date_finished", width: 20 },
            { header: "Activity Status", key: "status", width: 20 },
            { header: "Activity Number", key: "activity_id", width: 20 },
        ];

        sortedPosts.forEach((post) => {
            worksheet.addRow({
                agent_number: post.agent_number,
                id_number: post.id_number,
                account_name: post.account_name,
                contact_person: post.contact_person,
                contact_number: post.contact_number,
                email: post.email,
                type_of_client: post.type_of_client,
                address: post.address,
                area: post.area,
                project_name: post.project_name,
                product_category: post.product_category,
                project_type: post.project_type,
                source: post.source,
                date_finished: post.date_finished,
                status: post.status,
                activity_id: post.activity_id,
            });
        });

        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Activities.xlsx";
            link.click();
        });
    };

    // Handle page changes
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Handle posts per page change
    const handlePostsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setPostsPerPage(Number(event.target.value));
    };

    return (
        <div className="overflow-x-auto">
            {/* Filters */}
            <div className="flex gap-4 pb-2">
                <select
                    value={agentFilter}
                    onChange={(e) => setAgentFilter(e.target.value)}
                    className="px-3 py-2 border rounded text-xs"
                >
                    <option value="">Filter by Agent Number</option>
                    {agentNumbers.map((agentNumber) => (
                        <option key={agentNumber} value={agentNumber}>
                            {agentNumber}
                        </option>
                    ))}
                </select>

                <select
                    value={idNumberFilter}
                    onChange={(e) => setIdNumberFilter(e.target.value)}
                    className="px-3 py-2 border rounded text-xs"
                >
                    <option value="">Filter by ID Number</option>
                    {idNumbers.map((idNumber) => (
                        <option key={idNumber} value={idNumber}>
                            {idNumber}
                        </option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded text-xs"
                >
                    <option value="">Filter by Status</option>
                    {statuses.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>

                {/* Date Range Filter */}
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                        className="px-3 py-2 border rounded text-xs"
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                        className="px-3 py-2 border rounded text-xs"
                    />
                </div>

                <div className="text-xs">
                    <select
                        value={postsPerPage}
                        onChange={handlePostsPerPageChange}
                        className="px-3 py-2 border rounded text-xs"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={500}>500</option>
                        <option value={1000}>1000</option>
                        <option value={5000}>5000</option>
                        <option value={10000}>10000</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handlePrevPage}
                        className={`px-3 py-1 text-xs ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-100"
                            }`}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    <div className="text-sm text-gray-700">
                        {currentPage}
                    </div>

                    <button
                        onClick={handleNextPage}
                        className={`px-3 py-1 text-xs ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-gray-100"
                            }`}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Export Button */}
            <button
                onClick={exportToExcel}
                className="mb-4 px-4 py-2 bg-gray-100 shadow-sm text-dark text-xs flex items-center gap-1 rounded"
            >
                <CiExport size={20} /> Export to Excel
            </button>
            <div className="text-xs mb-2 text-gray-700">
                {`Showing ${currentPosts.length} of ${sortedPosts.length} entries`}
            </div>


            {/* Table */}
            <table className="min-w-full bg-white border border-gray-300 text-xs">
                <thead>
                    <tr className="bg-gray-100 text-left uppercase font-bold border-b">
                        <th className="p-3 border">Reference Number</th>
                        <th className="p-3 border">Agent Name</th>
                        <th className="p-3 border">TSM Name</th>
                        <th className="p-3 border">Company Name</th>
                        <th className="p-3 border">Contact Person</th>
                        <th className="p-3 border">Contact Number</th>
                        <th className="p-3 border">Email Address</th>
                        <th className="p-3 border">Type Client</th>
                        <th className="p-3 border">Address</th>
                        <th className="p-3 border">Area</th>
                        <th className="p-3 border">Project Name</th>
                        <th className="p-3 border">Project Category</th>
                        <th className="p-3 border">Project Type</th>
                        <th className="p-3 border">Source</th>
                        <th className="p-3 border">Type Activity</th>
                        <th className="p-3 border">Callback</th>
                        <th className="p-3 border">Call Status</th>
                        <th className="p-3 border">Type Call</th>
                        <th className="p-3 border">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPosts.map((post, index) => (
                        <tr key={post._id || index} className={`border-b hover:bg-gray-50`}>
                            <td className="p-3 border whitespace-nowrap">{post.activity_id}</td>
                            <td className="p-3 border whitespace-nowrap">{post.agent_fullname}</td>
                            <td className="p-3 border whitespace-nowrap">{post.tsm_fullname}</td>
                            <td className="p-3 border whitespace-nowrap">{post.account_name}</td>
                            <td className="p-3 border whitespace-nowrap"></td>
                            <td className="p-3 border whitespace-nowrap"></td>
                            <td className="p-3 border whitespace-nowrap"></td>
                            <td className="p-3 border whitespace-nowrap">{post.type_of_client}</td>
                            <td className="p-3 border whitespace-nowrap"></td>
                            <td className="p-3 border whitespace-nowrap"></td>
                            <td className="p-3 border whitespace-nowrap"></td>
                            <td className="p-3 border whitespace-nowrap"></td>
                            <td className="p-3 border whitespace-nowrap"></td>
                            <td className="p-3 border whitespace-nowrap"></td>
                            <td className="p-3 border whitespace-nowrap">{post.type_of_activity}</td>
                            <td className="p-3 border whitespace-nowrap">{post.callback}</td>
                            <td className="p-3 border whitespace-nowrap">{post.call_status}</td>
                            <td className="p-3 border whitespace-nowrap">{post.type_of_call}</td>
                            <td className="p-3 border whitespace-nowrap">{post.remarks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OutboundTable;
