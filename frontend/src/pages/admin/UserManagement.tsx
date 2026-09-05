import React from 'react';


export const UserManagement: React.FC = () => {
    const users = [
        { name: 'Dawit Bekele', role: 'Farmer', region: 'SNNPR', status: 'Verified' },
        { name: 'Alemayehu Tadesse', role: 'Buyer (Wholesaler)', region: 'Addis Ababa', status: 'Verified' },
        { name: 'Lemlem Haile', role: 'Farmer', region: 'Tigray', status: 'Verified' },
        { name: 'Sheraton Addis', role: 'Buyer (Hotel)', region: 'Addis Ababa', status: 'Verified' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[24px] font-bold text-[#1E2328]">User Management</h1>
                <p className="text-[13px] text-[#5A6270]">Manage verified farmers and business buyers</p>
            </div>

            <div className="bg-white border border-[#E2E4E7] rounded-xl shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8F9FA] border-b border-[#E2E4E7] text-[12px] font-bold text-[#5A6270]">
                            <th className="py-3 px-4">User Name</th>
                            <th className="py-3 px-4">Role</th>
                            <th className="py-3 px-4">Region</th>
                            <th className="py-3 px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4E7] text-[13px]">
                        {users.map((u, i) => (
                            <tr key={i} className="hover:bg-[#F8F9FA]">
                                <td className="py-3.5 px-4 font-bold text-[#1E2328]">{u.name}</td>
                                <td className="py-3.5 px-4 text-[#5A6270]">{u.role}</td>
                                <td className="py-3.5 px-4 text-[#5A6270]">{u.region}</td>
                                <td className="py-3.5 px-4">
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EDFAF2] text-[#0F5C2A]">
                                        {u.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
