import React, { useEffect, useState, useCallback, useRef } from "react";
import io from "socket.io-client";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Menu } from "@headlessui/react";

const socketURL = "http://localhost:3001";

interface UsersCardProps {
  posts: any[];
  handleEdit: (post: any) => void;
}

const UsersCard: React.FC<UsersCardProps> = ({ posts, handleEdit }) => {
  const socketRef = useRef(io(socketURL));
  const [updatedUser, setUpdatedUser] = useState(posts);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkTransferMode, setBulkTransferMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [tsmList, setTsmList] = useState<any[]>([]);
  const [selectedTsm, setSelectedTsm] = useState("");
  const [newTypeClient, setNewTypeClient] = useState("");

  useEffect(() => {
    setUpdatedUser(posts);
  }, [posts]);

  useEffect(() => {
    if (bulkTransferMode) {
      fetch("/api/tsm?Role=Territory Sales Manager")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setTsmList(data);
          } else {
            console.error("Invalid TSM list format:", data);
            setTsmList([]);
          }
        })
        .catch((err) => console.error("Error fetching TSM list:", err));
    }
  }, [bulkTransferMode]);

  const toggleBulkDeleteMode = useCallback(() => {
    setBulkDeleteMode((prev) => !prev);
    setSelectedUsers(new Set());
  }, []);

  const toggleBulkEditMode = useCallback(() => {
    setBulkEditMode((prev) => !prev);
    setSelectedUsers(new Set());
    setNewTypeClient("");
  }, []);

  const toggleBulkTransferMode = useCallback(() => {
    setBulkTransferMode((prev) => !prev);
    setSelectedUsers(new Set());
    setSelectedTsm("");
  }, []);

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUsers((prev) => {
      const newSelection = new Set(prev);
      newSelection.has(userId) ? newSelection.delete(userId) : newSelection.add(userId);
      return newSelection;
    });
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedUsers.size === 0) return;
    const confirmDelete = window.confirm("Are you sure you want to delete the selected users?");
    if (!confirmDelete) return;
    try {
      const response = await fetch(`/api/ModuleSales/UserManagement/CompanyAccounts/Bulk-Delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selectedUsers) }),
      });
      if (response.ok) {
        setUpdatedUser((prev) => prev.filter((user) => !selectedUsers.has(user.id)));
        setSelectedUsers(new Set());
        setBulkDeleteMode(false);
      } else {
        console.error("Failed to delete users");
      }
    } catch (error) {
      console.error("Error deleting users:", error);
    }
  }, [selectedUsers]);

  const handleBulkEdit = useCallback(async () => {
    if (selectedUsers.size === 0 || !newTypeClient) return;
    try {
      const response = await fetch(`/api/ModuleSales/UserManagement/CompanyAccounts/Bulk-Edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selectedUsers), typeclient: newTypeClient }),
      });
      if (response.ok) {
        setUpdatedUser((prev) => prev.map((user) =>
          selectedUsers.has(user.id) ? { ...user, typeclient: newTypeClient } : user
        ));
        setSelectedUsers(new Set());
        setBulkEditMode(false);
      } else {
        console.error("Failed to update users");
      }
    } catch (error) {
      console.error("Error updating users:", error);
    }
  }, [selectedUsers, newTypeClient]);

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.size === updatedUser.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(updatedUser.map((user) => user.id)));
    }
  }, [selectedUsers, updatedUser]);

  const handleBulkTransfer = useCallback(async () => {
    if (selectedUsers.size === 0 || !selectedTsm) return;
    try {
      const response = await fetch(`/api/ModuleSales/UserManagement/CompanyAccounts/Bulk-Transfer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selectedUsers), tsmReferenceID: selectedTsm }),
      });
      if (response.ok) {
        setSelectedUsers(new Set());
        setBulkTransferMode(false);
      } else {
        console.error("Failed to transfer users");
      }
    } catch (error) {
      console.error("Error transferring users:", error);
    }
  }, [selectedUsers, selectedTsm]);

  return (
    <div className="mb-4">
      {/* Bulk Action Buttons */}
      <div className="flex gap-2 mb-3">
        <button onClick={toggleBulkDeleteMode} className="px-4 py-2 border border-gray-200 text-dark text-xs shadow-sm rounded-md hover:bg-green-900 hover:text-white">
          {bulkDeleteMode ? "Cancel Bulk Delete" : "Bulk Delete"}
        </button>
        <button onClick={toggleBulkEditMode} className="px-4 py-2 border border-gray-200 text-dark text-xs shadow-sm rounded-md hover:bg-blue-900 hover:text-white">
          {bulkEditMode ? "Cancel Bulk Edit" : "Bulk Edit"}
        </button>
        <button onClick={toggleBulkTransferMode} className="px-4 py-2 border border-gray-200 text-dark text-xs shadow-sm rounded-md hover:bg-purple-900 hover:text-white">
          {bulkTransferMode ? "Cancel Bulk Transfer" : "Bulk Transfer"}
        </button>
      </div>

      {/* Bulk Action Panel */}
      {(bulkDeleteMode || bulkEditMode || bulkTransferMode) && (
        <div className="mb-4 p-3 bg-gray-100 rounded-md text-xs">
          {/* Select All Checkbox */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" checked={selectedUsers.size === updatedUser.length && updatedUser.length > 0} onChange={handleSelectAll} className="w-4 h-4"/>
              <span className="ml-2">Select All</span>
              <span className="ml-4 font-semibold text-gray-700">Selected: {selectedUsers.size} / {updatedUser.length}</span>
            </div>

            {/* Bulk Transfer */}
            {bulkTransferMode && (
              <div className="flex items-center gap-2">
                <select value={selectedTsm} onChange={(e) => setSelectedTsm(e.target.value)} className="px-2 py-1 border rounded-md capitalize">
                  <option value="">Select Territory Sales Manager</option>
                  {tsmList.map((tsm) => (
                    <option key={tsm._id || tsm.ReferenceID} value={tsm.ReferenceID}>
                      {tsm.Firstname} {tsm.Lastname}
                    </option>
                  ))}
                </select>
                <button onClick={handleBulkTransfer} className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs" disabled={!selectedTsm}>Transfer</button>
              </div>
            )}

            {/* Bulk Delete */}
            {bulkDeleteMode && (
              <button onClick={handleBulkDelete} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs" disabled={selectedUsers.size === 0}>Bulk Delete</button>
            )}

            {/* Bulk Edit */}
            {bulkEditMode && (
              <div className="flex items-center gap-2">
                <select value={newTypeClient} onChange={(e) => setNewTypeClient(e.target.value)} className="px-2 py-1 border rounded-md">
                  <option value="">Select Type of Client</option>
                  <option value="Top 50">Top 50</option>
                  <option value="Next 30">Next 30</option>
                  <option value="Below 20">Below 20</option>
                  <option value="Revive Account - Existing">Revive Account - Existing</option>
                  <option value="Revive Account - Resigned Agent">Revive Account - Resigned Agent</option>
                  <option value="New Account - CSR">New Account - CSR</option>
                  <option value="New Account - Client Development">New Account - Client Development</option>
                  <option value="Transfer Account">Transfer Account</option>
                  <option value="CSR Inquiries">CSR Inquiries</option>
                </select>
                <button onClick={handleBulkEdit} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs" disabled={!newTypeClient}>Apply Changes</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {updatedUser.length > 0 ? (
          updatedUser.map((post) => (
            <div key={post.id} className="relative border rounded-md shadow-md p-4 flex flex-col bg-white">
              <div className="flex items-center gap-2">
                {/* Checkbox will show if any bulk mode is active */}
                {bulkDeleteMode && (
                  <input type="checkbox" checked={selectedUsers.has(post.id)} onChange={() => handleSelectUser(post.id)} className="w-4 h-4 text-red-600"/>
                )}
                {bulkEditMode && (
                  <input type="checkbox" checked={selectedUsers.has(post.id)} onChange={() => handleSelectUser(post.id)} className="w-4 h-4 text-blue-600"/>
                )}
                {bulkTransferMode && (
                  <input type="checkbox" checked={selectedUsers.has(post.id)} onChange={() => handleSelectUser(post.id)} className="w-4 h-4 text-purple-600"/>
                )}
                <h3 className="text-xs font-semibold uppercase">{post.companyname}</h3>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="mt-4 mb-4 text-xs">
                  <p><strong>Contact Person:</strong> <span className="capitalize">{post.contactperson}</span></p>
                  <p><strong>Contact Number:</strong> {post.contactnumber}</p>
                  <p><strong>Email Address:</strong> {post.emailaddress}</p>
                  <div className="border-t border-gray-800 pb-4 mt-4"></div>
                  <p className="mt-2"><strong>Address:</strong><span className="capitalize">{post.address}</span></p>
                  <p><strong>Area:</strong><span className="capitalize">{post.area}</span></p>
                  <p className="mt-2"><strong>Type of Client:</strong><span className="uppercase"> {post.typeclient}</span></p>
                </div>
                <Menu as="div" className="relative inline-block text-left">
                  <div><Menu.Button><BsThreeDotsVertical /></Menu.Button></div>
                  <Menu.Items className="absolute right-0 mt-2 w-29 bg-white shadow-md rounded-md z-10">
                    <button className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left" onClick={() => handleEdit(post)}>Edit</button>
                  </Menu.Items>
                </Menu>
              </div>
              <div className="mt-auto border-t pt-2 text-xs text-gray-900">
                <p><strong>TSA:</strong> {post.referenceid} | <strong>TSM:</strong> {post.tsm}</p>
              </div>
            </div>
            ))
          ) : (
          <div className="col-span-full text-center py-4 text-xs">No accounts available</div>
        )}
      </div>
    </div>
  );
};

export default UsersCard;
