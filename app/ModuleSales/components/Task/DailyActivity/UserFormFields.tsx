import React, { useEffect, useState, useRef } from "react";
import Select from 'react-select';
import { CiCircleMinus, CiSquarePlus, CiSquareMinus } from "react-icons/ci";
import { CiPaperplane } from "react-icons/ci";


interface Activity {
    id: number;
    typeactivity: string;
    callback: string;
    callstatus: string;
    typecall: string;
    remarks: string;
    quotationnumber: string;
    quotationamount: string;
    sonumber: string;
    soamount: string;
    activitystatus: string;
    date_created: string;
}

interface FormFieldsProps {
    referenceid: string; setreferenceid: (value: string) => void;
    manager: string; setmanager: (value: string) => void;
    tsm: string; settsm: (value: string) => void;
    companyname: string; setcompanyname: (value: string) => void;
    contactperson: string; setcontactperson: (value: string) => void;
    contactnumber: string; setcontactnumber: (value: string) => void;
    emailaddress: string; setemailaddress: (value: string) => void;
    typeclient: string; settypeclient: (value: string) => void;
    address: string; setaddress: (value: string) => void;
    area: string; setarea: (value: string) => void;
    projectname: string; setprojectname: (value: string) => void;
    projectcategory: string; setprojectcategory: (value: string) => void;
    projecttype: string; setprojecttype: (value: string) => void;
    source: string; setsource: (value: string) => void;
    typeactivity: string; settypeactivity: (value: string) => void;
    remarks: string; setremarks: (value: string) => void;
    callback: string; setcallback: (value: string) => void;
    typecall: string; settypecall: (value: string) => void;
    quotationnumber: string; setquotationnumber: (value: string) => void;
    quotationamount: string; setquotationamount: (value: string) => void;
    sonumber: string; setsonumber: (value: string) => void;
    soamount: string; setsoamount: (value: string) => void;
    actualsales: string; setactualsales: (value: string) => void;
    callstatus: string; setcallstatus: (value: string) => void;

    startdate: string; setstartdate: (value: string) => void;
    enddate: string; setenddate: (value: string) => void;
    activitynumber: string; setactivitynumber: (value: string) => void;
    activitystatus: string; setactivitystatus: (value: string) => void;
    currentRecords: Activity[];
    editPost?: any;
}

const UserFormFields: React.FC<FormFieldsProps> = ({
    referenceid, setreferenceid,
    manager, setmanager,
    tsm, settsm,
    companyname, setcompanyname,
    contactperson, setcontactperson,
    contactnumber, setcontactnumber,
    emailaddress, setemailaddress,
    typeclient, settypeclient,
    address, setaddress,
    area, setarea,
    projectname, setprojectname,
    projectcategory, setprojectcategory,
    projecttype, setprojecttype,
    source, setsource,
    typeactivity, settypeactivity,
    remarks, setremarks,
    callback, setcallback,
    typecall, settypecall,
    quotationnumber, setquotationnumber,
    quotationamount, setquotationamount,
    sonumber, setsonumber,
    soamount, setsoamount,
    actualsales, setactualsales,
    callstatus, setcallstatus,

    startdate, setstartdate,
    enddate, setenddate,
    activitynumber, setactivitynumber,
    activitystatus, setactivitystatus,
    currentRecords, // Destructure the `currentRecords` prop
    editPost,
}) => {
    const [companies, setCompanies] = useState<any[]>([]);
    const [contactPersons, setContactPersons] = useState<string[]>([]);
    const [contactNumbers, setContactNumbers] = useState<string[]>([]);
    const [emailAddresses, setEmailAddresses] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const [showFields, setShowFields] = useState(false);
    const [showOutboundFields, setShowOutboundFields] = useState(false);
    const [showInboundFields, setShowInboundFields] = useState(false);
    const [showQuotationField, setShowQuotationField] = useState(false);
    const [showSOField, setShowSOField] = useState(false);
    const [showDeliverField, setShowDeliverField] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState("");

    const [contactPerson, setContactPerson] = useState("");
    const [actualSales, setActualSales] = useState("");

    const dropdownRef = useRef<HTMLUListElement>(null);

    const isQuotationEmpty = !quotationnumber || !quotationamount;

    const [showInput, setShowInput] = useState(false);

    // Handle the email selection and send request to the API
    const handleEmailSubmit = async () => {
        if (!emailaddress) {  // Check if emailaddress is empty or not
            alert("Please select an email.");
            return;
        }
    
        const response = await fetch("/api/sendEmail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: emailaddress,  // Use the selected email address directly here
            }),
        });
    
        const data = await response.json();
    
        if (data.success) {
            alert("Email sent successfully!");
        } else {
            alert("Error sending email: " + data.message);
        }
    
        // Ensure the form stays visible and doesn't reload or navigate away
    };
    
    useEffect(() => {
        // Sort currentRecords by date_created in descending order
        const sortedRecords = [...currentRecords].sort((a, b) => {
            const dateA = new Date(a.date_created); // Assuming `date_created` is in string format or timestamp
            const dateB = new Date(b.date_created);
            return dateB.getTime() - dateA.getTime(); // Sort descending (most recent first)
        });

        // Get the last record's status from the sorted array (the most recent record)
        const lastRecord = sortedRecords[0]; // This will be the most recent record

        if (lastRecord) {
            setactivitystatus(lastRecord.activitystatus); // Set the activity status to the last record's activity status
        }

        // Automatically update the activity status based on input fields
        if (quotationnumber && quotationamount) {
            setactivitystatus("Warm"); // Set to Warm if Quotation number and amount are filled
        } else if (sonumber && soamount) {
            setactivitystatus("Hot"); // Set to Hot if SO number and amount are filled
        }

        // If actualsales has a value, set the status to Done
        if (actualsales) {
            setactivitystatus("Done"); // Set to Done if there's a value in actualsales
        }
    }, [currentRecords, quotationnumber, quotationamount, sonumber, soamount, actualsales]); // Added actualsales dependency    

    const generateActivityNumber = () => {
        if (editPost?.activitynumber) return; // Keep existing number in Edit Mode
        if (!companyname || !referenceid) return;

        const firstLetter = companyname.charAt(0).toUpperCase();
        const firstTwoRef = referenceid.substring(0, 2).toUpperCase();

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
        }).replace("/", "");

        const randomNumber = String(Math.floor(100000 + Math.random() * 900000)).slice(0, 6);

        const generatedNumber = `${firstLetter}-${firstTwoRef}-${formattedDate}-${randomNumber}`;
        setactivitynumber(generatedNumber);
    };

    useEffect(() => {
        if (!editPost) {
            generateActivityNumber();
        } else {
            setactivitynumber(editPost.activitynumber);
        }
    }, [editPost, companyname, referenceid]);

    // Fetch companies based on referenceid
    useEffect(() => {
        if (referenceid) {
            // API call to fetch company data
            fetch(`/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${referenceid}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        setCompanies(data.data.map((company: any) => ({
                            value: company.companyname,
                            label: company.companyname,
                            contactperson: company.contactperson,
                            contactnumber: company.contactnumber,
                            emailaddress: company.emailaddress,
                            typeclient: company.typeclient,
                            address: company.address,
                            area: company.area,
                        })));
                    } else {
                        console.error("Error fetching companies:", data.error);
                    }
                })
                .catch((error) => console.error("Error fetching companies:", error));
        }
    }, [referenceid]);

    useEffect(() => {
        setContactPersons(contactperson ? contactperson.split(", ") : [""]);
        setContactNumbers(contactnumber ? contactnumber.split(", ") : [""]);
        setEmailAddresses(emailaddress ? emailaddress.split(", ") : [""]);
    }, [contactperson, contactnumber, emailaddress]);

    const handleCompanySelect = (selectedOption: any) => {
        setcompanyname(selectedOption ? selectedOption.value : "");
        setcontactperson(selectedOption ? selectedOption.contactperson : "");
        setcontactnumber(selectedOption ? selectedOption.contactnumber : "");
        setemailaddress(selectedOption ? selectedOption.emailaddress : "");
        settypeclient(selectedOption ? selectedOption.typeclient : "");
        setaddress(selectedOption ? selectedOption.address : "");
        setarea(selectedOption ? selectedOption.area : "");
    };

    const handleContactPersonChange = (index: number, value: string) => {
        const newContactPersons = [...contactPersons];
        newContactPersons[index] = value;
        setContactPersons(newContactPersons);
    };

    const handleContactNumberChange = (index: number, value: string) => {
        const newContactNumbers = [...contactNumbers];
        newContactNumbers[index] = value;
        setContactNumbers(newContactNumbers);
    };

    const handleEmailAddressChange = (index: number, value: string) => {
        const newEmailAddresses = [...emailAddresses];
        newEmailAddresses[index] = value;
        setEmailAddresses(newEmailAddresses);
    };


    // Remove specific contact info
    const removeContactPerson = (index: number) => {
        const newContactPersons = contactPersons.filter((_, i) => i !== index);
        setContactPersons(newContactPersons);
    };

    const removeContactNumber = (index: number) => {
        const newContactNumbers = contactNumbers.filter((_, i) => i !== index);
        setContactNumbers(newContactNumbers);
    };

    const removeEmailAddress = (index: number) => {
        const newEmailAddresses = emailAddresses.filter((_, i) => i !== index);
        setEmailAddresses(newEmailAddresses);
    };

    const handleActivitySelection = (activity: string) => {
        console.log("Selected:", activity); // Debugging

        settypeactivity(activity);

        // Reset all fields
        setShowFields(false);
        setShowOutboundFields(false);
        setShowInboundFields(false);
        setShowQuotationField(false);
        setShowSOField(false);
        setShowDeliverField(false); // Reset the delivered field before checking

        const accountingActivities = [
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
            "Payment Follow-Up",
            "Quotation Follow-Up",
            "Logistic Concern: Shipping Cost Estimation",
            "Preparation: Bidding Preparation",
            "Preparation: Preparation of Report",
            "Preparation: Preparation of SPF",
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
        ];

        if (accountingActivities.includes(activity)) {
            setShowFields(true);
        } else if (activity === "Outbound Call") {
            setShowFields(true);
            setShowOutboundFields(true);
        } else if (activity === "Inbound Call") {
            setShowFields(true);
            setShowInboundFields(true);
        } else if (activity.includes("Preparation: Preparation of Quote")) {
            setShowFields(true);
            setShowQuotationField(true);
        } else if (activity.includes("Preparation: Sales Order Preparation")) {
            setShowFields(true);
            setShowSOField(true);
        } else if (activity.includes("Delivered")) {
            setShowFields(true);
            setShowDeliverField(true); // Trigger showing the delivered field when "Delivered" is selected
        }
    };

    useEffect(() => {
        if (dropdownRef.current) {
            dropdownRef.current.focus();
        }
    }, []);

    const getFormattedTimestamp = () => {
        const now = new Date();

        // Convert to YYYY-MM-DD HH:mm:ss format (MySQL TIMESTAMP)
        const formattedTimestamp = now
            .toLocaleString("en-US", { timeZone: "Asia/Manila" })
            .replace(",", ""); // Remove comma from formatted string

        return formattedTimestamp;
    };

    // Capture start date & time only once when the component mounts
    useEffect(() => {
        setstartdate(getFormattedTimestamp());
    }, []);

    // Continuously update end date & time in real-time
    useEffect(() => {
        const interval = setInterval(() => {
            setenddate(getFormattedTimestamp());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleCallbackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOption = e.target.value;

        if (selectedOption === "Select Callback") {
            setcallback("");
            setShowInput(false); // Hide input field
            return;
        }

        if (selectedOption === "Pick a DateTime") {
            setcallback(""); // Allow manual input
            setShowInput(true); // Show input field
            return;
        }

        setShowInput(false); // Hide input for predefined dates

        const today = new Date();
        let futureDate = new Date(today);

        switch (selectedOption) {
            case "Callback Tomorrow":
                futureDate.setDate(today.getDate() + 1);
                break;
            case "Callback After 3 Days":
                futureDate.setDate(today.getDate() + 3);
                break;
            case "Callback After a Week":
                futureDate.setDate(today.getDate() + 7);
                break;
            case "Callback After a Month":
                futureDate.setMonth(today.getMonth() + 1);
                break;
            case "Callback After a Year":
                futureDate.setFullYear(today.getFullYear() + 1);
                break;
            default:
                setcallback("");
                return;
        }

        // Set time to 08:00 AM
        futureDate.setHours(8, 0, 0, 0);

        // Convert to datetime-local format (YYYY-MM-DDTHH:MM)
        const formattedDate = futureDate.toISOString().slice(0, 16);

        setcallback(formattedDate);
    };

    return (
        <>
            <div className="flex flex-wrap -mx-4">
                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                    <input type="text" id="activitynumber" value={activitynumber ?? ""} onChange={() => { }} className="w-full px-3 py-2 border rounded text-xs capitalize" readOnly={!!editPost} />
                    <input type="hidden" id="referenceid" value={referenceid ?? ""} onChange={(e) => setreferenceid(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" />
                    <input type="hidden" id="manager" value={manager ?? ""} onChange={(e) => setmanager(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" />
                    <input type="hidden" id="tsm" value={tsm ?? ""} onChange={(e) => settsm(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" />
                    <input type="hidden" value={startdate ?? ""} onChange={(e) => setstartdate(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" required />
                    <input type="hidden" value={enddate ?? ""} onChange={(e) => setenddate(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" required />
                </div>
            </div>
            <div className="flex flex-wrap -mx-4">
                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                    <label className="block text-xs font-bold mb-2" htmlFor="companyname">Company Name</label>
                    {editPost ? (
                        // If editUser exists (edit mode), show a disabled text field
                        <input
                            type="text"
                            id="companyname"
                            value={editPost.companyname || ''}
                            disabled
                            className="text-xs capitalize w-full p-2 border border-gray-300 rounded-md"
                        />
                    ) : (
                        // If not in edit mode, show the Select dropdown
                        <Select
                            id="companyname"
                            options={companies}
                            onChange={handleCompanySelect}
                            isClearable
                            className="text-xs capitalize"
                        />
                    )}
                </div>

                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                    <label className="block text-xs font-bold mb-2">Contact Person</label>
                    {contactPersons.map((person, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <input type="text" value={person ?? ""} onChange={(e) => handleContactPersonChange(index, e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" />
                            {index > 0 && (
                                <button type="button" onClick={() => removeContactPerson(index)} className="p-2 bg-red-700 text-white rounded hover:bg-red-600" >
                                    <CiCircleMinus size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                    <label className="block text-xs font-bold mb-2">Contact Number</label>
                    {contactNumbers.map((number, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <input type="text" value={number ?? ""} onChange={(e) => handleContactNumberChange(index, e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" />
                            {index > 0 && (
                                <button type="button" onClick={() => removeContactNumber(index)} className="p-2 bg-red-700 text-white rounded hover:bg-red-600">
                                    <CiCircleMinus size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                    <label className="block text-xs font-bold mb-2">Email Address</label>
                    {emailAddresses.map((email, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <input type="text" value={email ?? ""} onChange={(e) => handleEmailAddressChange(index, e.target.value)} className="w-full px-3 py-2 border rounded text-xs" />
                            {index > 0 && (
                                <button type="button" onClick={() => removeEmailAddress(index)} className="p-2 bg-red-700 text-white rounded hover:bg-red-600">
                                    <CiCircleMinus size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                    <label className="block text-xs font-bold mb-2">Type Client</label>
                    <input type="text" id="typeclient" value={typeclient ?? ""} onChange={(e) => settypeclient(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" />
                </div>

                <div className="w-full sm:w-1/2 md:w-1/8 px-4 mb-4">
                    <label className="block text-xs font-bold mb-2">Address</label>
                    <input type="text" id="address" value={address ?? ""} onChange={(e) => setaddress(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" />
                </div>

                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                    <label className="block text-xs font-bold mb-2">Area</label>
                    <input type="text" id="area" value={area ?? ""} onChange={(e) => setarea(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" />
                </div>
            </div>
            <div>
                <div className="mb-4">
                    <div className="border rounded-lg shadow-sm">
                        {/* Accordion Header */}
                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex justify-between items-center px-4 py-3 bg-gray-100 cursor-pointer transition"
                        >
                            <span className="text-xs text-dark">Project Information</span>
                            {isOpen ? <CiSquareMinus className="text-xl text-white" /> : <CiSquarePlus className="text-xl text-white" />}
                        </div>

                        {/* Accordion Content */}
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "p-4" : "max-h-0 p-0"}`}>
                            <div className="flex flex-wrap -mx-4 rounded">
                                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                    <label className="block text-xs font-bold mb-2">Project Name ( Optional )</label>
                                    <input type="text" id="projectname" value={projectname ?? ""} onChange={(e) => setprojectname(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" />
                                </div>
                                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                    <label className="block text-xs font-bold mb-2">Project Category</label>
                                    <select value={projectcategory ?? ""} onChange={(e) => setprojectcategory(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize">
                                        <option value="">Select Category</option>
                                        <option value="Bollard Light">Bollard Light</option>
                                        <option value="Bulb Light">Bulb Light</option>
                                        <option value="Canopy Light">Canopy Light</option>
                                    </select>
                                </div>
                                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                    <label className="block text-xs font-bold mb-2">Type</label>
                                    <select value={projecttype ?? ""} onChange={(e) => setprojecttype(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize">
                                        <option value="">Select Category</option>
                                        <option value="B2B">B2B</option>
                                        <option value="B2C">B2C</option>
                                    </select>
                                </div>
                                <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                    <label className="block text-xs font-bold mb-2">Source</label>
                                    <select value={source ?? ""} onChange={(e) => setsource(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize">
                                        <option value="">Select Category</option>
                                        <option value="Existing">Existing</option>
                                        <option value="Referral">Referral</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4 border rounded-lg shadow-sm p-4">
                <div className="flex flex-wrap -mx-4 rounded">
                    {/* Activity Dropdown */}
                    <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                        <label className="block text-xs font-bold mb-2">Type of Activity</label>
                        <select
                            value={typeactivity ?? ""}
                            onChange={(e) => handleActivitySelection(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-xs capitalize bg-white shadow-sm"
                        >
                            <option value="" disabled>Select an activity</option>
                            {[
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
                                "Delivered",
                            ].map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Conditional Fields */}
                    {showInboundFields && (
                        <>
                            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                <label className="block text-xs font-bold mb-2">Callback</label>
                                <select className="w-full px-3 py-2 border rounded text-xs" onChange={handleCallbackChange}>
                                    <option>Select Callback</option>
                                    <option>Callback Tomorrow</option>
                                    <option>Callback After 3 Days</option>
                                    <option>Callback After a Week</option>
                                    <option>Callback After a Month</option>
                                    <option>Callback After a Year</option>
                                    <option>Pick a DateTime</option>
                                </select>

                                {/* Show input field ONLY when "Pick a DateTime" is selected */}
                                {showInput && (
                                    <input
                                        type="datetime-local"
                                        value={callback}
                                        onChange={(e) => setcallback(e.target.value)}
                                        className="w-full px-3 py-2 border rounded text-xs mt-2"
                                    />
                                )}
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                <label className="block text-xs font-bold mb-2">Type of Call</label>
                                <select value={typecall ?? ""} onChange={(e) => settypecall(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" required>
                                    <option value="">Select Status</option>
                                    <option value="Cannot Be Reached">Cannot Be Reached</option>
                                    <option value="Follow Up Pending">Follow Up Pending</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Requirements">No Requirements</option>
                                    <option value="Not Connected with the Company">Not Connected with the Company</option>
                                    <option value="Request for Quotation">Request for Quotation</option>
                                    <option value="Ringing Only">Ringing Only</option>
                                    <option value="Sent Quotation - Standard">Sent Quotation - Standard</option>
                                    <option value="Sent Quotation - With Special Price">Sent Quotation - With Special Price</option>
                                    <option value="Sent Quotation - With SPF">Sent Quotation - With SPF</option>
                                    <option value="Touch Base">Touch Base</option>
                                    <option value="Waiting for Future Projects">Waiting for Future Projects</option>
                                    <option value="With SPFS">With SPFS</option>
                                </select>
                            </div>
                        </>
                    )}

                    {showQuotationField && (
                        <>
                            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                <label className="block text-xs font-bold mb-2">Quotation Number</label>
                                <input type="text" value={quotationnumber ?? ""} onChange={(e) => setquotationnumber(e.target.value)} className="w-full px-3 py-2 border rounded text-xs uppercase" />
                            </div>

                            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                <label className="block text-xs font-bold mb-2">Quotation Amount</label>
                                <input type="number" value={quotationamount ?? ""} onChange={(e) => setquotationamount(e.target.value)} className="w-full px-3 py-2 border rounded text-xs" />
                            </div>

                            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                <label className="block text-xs font-bold mb-2">Type of Call</label>
                                <select value={typecall ?? ""} onChange={(e) => settypecall(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" required>
                                    <option value="">Select Status</option>
                                    <option value="Cannot Be Reached">Cannot Be Reached</option>
                                    <option value="Follow Up Pending">Follow Up Pending</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Requirements">No Requirements</option>
                                    <option value="Not Connected with the Company">Not Connected with the Company</option>
                                    <option value="Request for Quotation">Request for Quotation</option>
                                    <option value="Ringing Only">Ringing Only</option>
                                    <option value="Sent Quotation - Standard">Sent Quotation - Standard</option>
                                    <option value="Sent Quotation - With Special Price">Sent Quotation - With Special Price</option>
                                    <option value="Sent Quotation - With SPF">Sent Quotation - With SPF</option>
                                    <option value="Touch Base">Touch Base</option>
                                    <option value="Waiting for Future Projects">Waiting for Future Projects</option>
                                    <option value="With SPFS">With SPFS</option>
                                </select>
                            </div>
                        </>
                    )}

                    {showSOField && (
                        <>
                            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                <label className="block text-xs font-bold mb-2">SO Number</label>
                                <input type="text" value={sonumber ?? ""} onChange={(e) => setsonumber(e.target.value)} className="w-full px-3 py-2 border rounded text-xs uppercase" />
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                <label className="block text-xs font-bold mb-2">SO Amount</label>
                                <input type="number" value={soamount ?? ""} onChange={(e) => setsoamount(e.target.value)} className="w-full px-3 py-2 border rounded text-xs" />
                            </div>
                        </>
                    )}

                    {showDeliverField && (
                        <>
                            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                <label className="block text-xs font-bold mb-2">SO to DR Amount (Actual Sales)</label>
                                <input
                                    type="number"
                                    value={actualsales ?? ""}
                                    onChange={(e) => setactualsales(e.target.value)}
                                    className="w-full px-3 py-2 border rounded text-xs uppercase"
                                />
                            </div>

                            <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4 flex items-center space-x-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold mb-2">Send Email Survey</label>
                                    <select
                                        value={emailaddress} // Bind to selected email
                                        onChange={(e) => setemailaddress(e.target.value)} // Update the selected email
                                        className="w-full px-3 py-2 border rounded text-xs"
                                    >
                                        <option value="">Select Email</option>
                                        {emailAddresses.map((email, index) => (
                                            <option key={index} value={email}>
                                                {email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleEmailSubmit}
                                    className="bg-green-800 text-white p-2 rounded mt-6 flex items-center space-x-2"
                                >
                                    <CiPaperplane size={15} /> <span>Send</span>
                                </button>

                            </div>

                        </>
                    )}

                    {showOutboundFields && (
                        <>
                            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                <label className="block text-xs font-bold mb-2">Callback</label>
                                <select className="w-full px-3 py-2 border rounded text-xs" onChange={handleCallbackChange}>
                                    <option>Select Callback</option>
                                    <option>Callback Tomorrow</option>
                                    <option>Callback After 3 Days</option>
                                    <option>Callback After a Week</option>
                                    <option>Callback After a Month</option>
                                    <option>Callback After a Year</option>
                                    <option>Pick a DateTime</option>
                                </select>

                                {/* Show input field ONLY when "Pick a DateTime" is selected */}
                                {showInput && (
                                    <input
                                        type="datetime-local"
                                        value={callback}
                                        onChange={(e) => setcallback(e.target.value)}
                                        className="w-full px-3 py-2 border rounded text-xs mt-2"
                                    />
                                )}
                            </div>

                            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                <label className="block text-xs font-bold mb-2">Call Status</label>
                                <select value={callstatus ?? ""} onChange={(e) => setcallstatus(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize">
                                    <option value="">Select Status</option>
                                    <option value="Successful">Successful</option>
                                    <option value="Unsuccessful">Unsuccessful</option>
                                </select>
                            </div>

                            <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
                                <label className="block text-xs font-bold mb-2">Type of Call</label>
                                <select value={typecall ?? ""} onChange={(e) => settypecall(e.target.value)} className="w-full px-3 py-2 border rounded text-xs capitalize" required>
                                    <option value="">Select Status</option>
                                    <option value="Cannot Be Reached">Cannot Be Reached</option>
                                    <option value="Follow Up Pending">Follow Up Pending</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Requirements">No Requirements</option>
                                    <option value="Not Connected with the Company">Not Connected with the Company</option>
                                    <option value="Request for Quotation">Request for Quotation</option>
                                    <option value="Ringing Only">Ringing Only</option>
                                    <option value="Sent Quotation - Standard">Sent Quotation - Standard</option>
                                    <option value="Sent Quotation - With Special Price">Sent Quotation - With Special Price</option>
                                    <option value="Sent Quotation - With SPF">Sent Quotation - With SPF</option>
                                    <option value="Touch Base">Touch Base</option>
                                    <option value="Waiting for Future Projects">Waiting for Future Projects</option>
                                    <option value="With SPFS">With SPFS</option>
                                </select>
                            </div>
                        </>
                    )}

                </div>
                <div className="flex flex-wrap -mx-4">
                    <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4">
                        <label className="block text-xs font-bold mb-2">Remarks</label>
                        <textarea
                            value={remarks ?? ""}
                            onChange={(e) => setremarks(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-xs capitalize"
                            rows={5} required
                        ></textarea>
                    </div>

                    <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4">
                        <label className="block text-xs font-bold mb-2">Status</label>
                        <select
                            value={activitystatus || ""}
                            onChange={(e) => setactivitystatus(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-xs capitalize bg-gray-100"
                        >
                            <option value="">Select Status</option>
                            <option
                                value="Cold"
                                disabled={activitystatus === "Warm" || activitystatus === "Hot" || activitystatus === "Done"}
                            >
                                Cold (Progress 20% to 30%) Touchbase
                            </option>
                            <option
                                value="Warm"
                                disabled={
                                    !(quotationnumber && quotationamount) ||
                                    activitystatus === "Hot" ||
                                    activitystatus === "Done" ||
                                    activitystatus === "Cancelled"
                                }
                            >
                                Warm (Progress 50% to 60%) With Quotation
                            </option>
                            <option
                                value="Hot"
                                disabled={
                                    !(sonumber && soamount) ||
                                    activitystatus === "Done" ||
                                    activitystatus === "Warm" ||
                                    activitystatus === "Cancelled"
                                }
                            >
                                Hot (Progress 80% to 90%) Quotation with Confirmation W/PO
                            </option>
                            <option
                                value="Done"
                                disabled={activitystatus === "Done" || activitystatus === "Cancelled" || activitystatus === "Warm"}
                            >
                                Done (Progress 100%) Delivered
                            </option>
                            <option value="Loss" disabled={activitystatus === "Done" || activitystatus === "Cancelled"}>
                                Loss
                            </option>
                            <option value="Cancelled" disabled={activitystatus === "Done"}>
                                Cancelled
                            </option>
                        </select>
                    </div>
                </div>

            </div>
        </>
    );
};

export default UserFormFields;
