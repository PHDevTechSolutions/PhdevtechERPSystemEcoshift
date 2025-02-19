"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

const Register: React.FC = () => {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [department, setDepartment] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        // Check if all fields are filled
        if (!userName || !email || !password || !department) {
            toast.error("All fields are required!");
            return;
        }
    
        setLoading(true);
    
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    userName, 
                    Email: email, 
                    Password: password, 
                    Department: department 
                }), 
            });
    
            const result = await response.json();
    
            if (response.ok) {
                toast.success("Registration successful!");
                setTimeout(() => {
                    router.push("/Login");
                }, 1500);
            } else {
                toast.error(result.message || "Registration failed!");
            }
        } catch (error) {
            toast.error("An error occurred while registering!");
        } finally {
            setLoading(false);
        }
    };    

    return (
        <div
            className="flex min-h-screen items-center justify-center bg-cover bg-center relative p-4"
            style={{ backgroundImage: "url('/building.jpg')" }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50 shadow-lg"></div>

            <ToastContainer className="text-xs" />

            <div className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-xl text-center">
                <h2 className="text-2xl font-bold text-white mb-6">Ecoshift Corporation</h2>
                <form onSubmit={handleSubmit} className="text-left">
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-white mb-1">Username</label>
                        <input type="text" placeholder="Enter your username" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-white mb-1">Email</label>
                        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-white mb-1">Password</label>
                        <input type="password" placeholder="6+ Characters, 1 Capital letter" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-white mb-1">Department</label>
                        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Department</option>
                            <option value="CSR">CSR</option>
                            <option value="Sales">Sales</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <button type="submit" className="w-full text-xs py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shadow-lg" disabled={loading}>
                            {loading ? "Signing Up..." : "Sign Up"}
                        </button>
                    </div>
                </form>
                <p className="text-xs text-white">
                    Don’t have an account? <Link href="/Login" className="text-white-600 underline">Sign In</Link>
                </p>
                <footer className="mt-4 text-center text-xs text-white">
                    <p>Enterprise Resource Planning - Developed By IT Department</p>
                </footer>
            </div>
        </div>
    );
};

export default Register;