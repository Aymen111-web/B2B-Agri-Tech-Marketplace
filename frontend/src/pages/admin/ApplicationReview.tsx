import React, { useState } from 'react';
import { Check, X, FileText, Mail, Phone, MapPin, ShieldCheck, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ApplicationItem {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'farmer' | 'buyer';
    businessName: string;
    region: string;
    submittedAt: Date;
    documents: { name: string; type: 'pdf' | 'image' }[];
    status: 'pending' | 'approved' | 'rejected';
}

const APPS: ApplicationItem[] = [
    {
        id: 'app-01',
        name: 'Kassa Tsegaye',
        email: 'kassa@sidamafarm.et',
        phone: '+251 912 111 222',
        role: 'farmer',
        businessName: 'Tsegaye Coffee Farm (12 Hectares)',
        region: 'SNNPR',
        submittedAt: new Date('2024-03-01T10:00:00'),
        documents: [
            { name: 'land_certificate_sidama.pdf', type: 'pdf' },
            { name: 'kebele_id_card.png', type: 'image' },
        ],
        status: 'pending',
    },
    {
        id: 'app-02',
        name: 'Nile Food Processors PLC',
        email: 'contact@nilefood.et',
        phone: '+251 911 333 444',
        role: 'buyer',
        businessName: 'Nile Food Processing Ltd.',
        region: 'Addis Ababa',
        submittedAt: new Date('2024-03-02T14:30:00'),
        documents: [
            { name: 'trade_license_2024.pdf', type: 'pdf' },
            { name: 'tin_registration_cert.pdf', type: 'pdf' },
        ],
        status: 'pending',
    },
    {
        id: 'app-03',
        name: 'Mulugeta Worku',
        email: 'mulugeta@oromiagrains.et',
        phone: '+251 918 555 666',
        role: 'farmer',
        businessName: 'Bale Grain Cooperative',
        region: 'Oromia',
        submittedAt: new Date('2024-03-03T09:15:00'),
        documents: [{ name: 'cooperative_registration.pdf', type: 'pdf' }],
        status: 'pending',
    },
];

export const ApplicationReview: React.FC = () => {
    const [applications, setApplications] = useState<ApplicationItem[]>(APPS);
    const [selectedId, setSelectedId] = useState<string>(APPS[0].id);
    const [reviewNote, setReviewNote] = useState('');

    const selectedApp = applications.find((a) => a.id === selectedId) || applications[0];

    const handleDecision = (status: 'approved' | 'rejected') => {
        setApplications((prev) =>
            prev.map((app) => (app.id === selectedId ? { ...app, status } : app))
        );
        setReviewNote('');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[24px] font-bold text-[#1E2328]">Capability Application Review</h1>
                <p className="text-[13px] text-[#5A6270]">
                    Verify legal documents and farmer/buyer business eligibility.
                </p>
            </div>

            {/* Split Panel Layout */}
            <div className="grid grid-cols-12 gap-6 min-h-[600px]">
                {/* Left Panel (List: 4 columns) */}
                <div className="col-span-4 bg-white border border-[#E2E4E7] rounded-xl shadow-xs overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[#E2E4E7] bg-[#F8F9FA]">
                        <h3 className="text-[14px] font-bold text-[#1E2328]">
                            Applications ({applications.filter((a) => a.status === 'pending').length} Pending)
                        </h3>
                    </div>

                    <div className="divide-y divide-[#E2E4E7] overflow-y-auto flex-1">
                        {applications.map((app) => {
                            const isSelected = app.id === selectedId;
                            return (
                                <div
                                    key={app.id}
                                    onClick={() => setSelectedId(app.id)}
                                    className={`p-4 cursor-pointer transition-colors ${isSelected ? 'bg-[#EDFAF2] border-l-4 border-l-[#1E9444]' : 'hover:bg-[#F8F9FA]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[14px] font-bold text-[#1E2328]">{app.name}</h4>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${app.role === 'farmer'
                                                ? 'bg-[#1E9444]/15 text-[#1E9444]'
                                                : 'bg-blue-50 text-blue-700'
                                                }`}
                                        >
                                            {app.role}
                                        </span>
                                    </div>
                                    <p className="text-[12px] text-[#5A6270] mt-1">{app.businessName}</p>
                                    <div className="flex items-center justify-between mt-2 text-[11px] text-[#9BA1AA]">
                                        <span>{app.region}</span>
                                        <span>{formatDate(app.submittedAt)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel (Detail: 8 columns) */}
                <div className="col-span-8 bg-white border border-[#E2E4E7] rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-6">
                    {selectedApp ? (
                        <div className="space-y-6">
                            {/* Header card */}
                            <div className="flex items-center justify-between border-b border-[#E2E4E7] pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[20px] font-bold text-[#1E2328]">{selectedApp.name}</h2>
                                        <span
                                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${selectedApp.role === 'farmer'
                                                ? 'bg-[#EDFAF2] text-[#0F5C2A]'
                                                : 'bg-blue-50 text-blue-700'
                                                }`}
                                        >
                                            Requested Role: {selectedApp.role}
                                        </span>
                                    </div>
                                    <p className="text-[13px] text-[#5A6270] mt-0.5 font-medium">
                                        {selectedApp.businessName}
                                    </p>
                                </div>

                                <span
                                    className={`px-3 py-1.5 rounded-full text-[12px] font-bold capitalize ${selectedApp.status === 'pending'
                                        ? 'bg-[#FFF8EC] text-[#D88C0A] border border-[#FFE5A5]'
                                        : selectedApp.status === 'approved'
                                            ? 'bg-[#EDFAF2] text-[#0F5C2A]'
                                            : 'bg-red-50 text-red-600'
                                        }`}
                                >
                                    Status: {selectedApp.status}
                                </span>
                            </div>

                            {/* User info card */}
                            <div className="grid grid-cols-2 gap-4 bg-[#F8F9FA] p-4 rounded-xl border border-[#E2E4E7]/60">
                                <div className="flex items-center gap-2.5 text-[13px] text-[#5A6270]">
                                    <Mail className="w-4 h-4 text-[#9BA1AA]" />
                                    <span>{selectedApp.email}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[13px] text-[#5A6270]">
                                    <Phone className="w-4 h-4 text-[#9BA1AA]" />
                                    <span>{selectedApp.phone}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[13px] text-[#5A6270]">
                                    <MapPin className="w-4 h-4 text-[#9BA1AA]" />
                                    <span>Region: {selectedApp.region}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[13px] text-[#5A6270]">
                                    <ShieldCheck className="w-4 h-4 text-[#9BA1AA]" />
                                    <span>Submitted: {formatDate(selectedApp.submittedAt)}</span>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div>
                                <h4 className="text-[14px] font-bold text-[#1E2328] mb-3">
                                    Uploaded Verification Documents ({selectedApp.documents.length})
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedApp.documents.map((doc, idx) => (
                                        <div
                                            key={idx}
                                            className="border border-[#E2E4E7] rounded-xl p-3.5 flex items-center justify-between bg-white hover:border-[#1E9444] transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <FileText className="w-5 h-5 text-[#1E9444]" />
                                                <span className="text-[12px] font-bold text-[#1E2328] truncate max-w-[180px]">
                                                    {doc.name}
                                                </span>
                                            </div>
                                            <Download className="w-4 h-4 text-[#9BA1AA]" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Review notes textarea */}
                            {selectedApp.status === 'pending' && (
                                <div>
                                    <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                                        Review Note / Verification Reason
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={reviewNote}
                                        onChange={(e) => setReviewNote(e.target.value)}
                                        placeholder="Enter review notes for approval or rejection..."
                                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]"
                                    />
                                </div>
                            )}

                            {/* Decision Action buttons */}
                            {selectedApp.status === 'pending' ? (
                                <div className="flex items-center gap-4 pt-2">
                                    <button
                                        onClick={() => handleDecision('approved')}
                                        className="flex-1 py-3 rounded-full bg-[#1E9444] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md hover:bg-[#0F5C2A] btn-hover"
                                    >
                                        <Check className="w-4 h-4 stroke-[3]" />
                                        <span>Approve capability application</span>
                                    </button>

                                    <button
                                        onClick={() => handleDecision('rejected')}
                                        className="py-3 px-6 rounded-full border border-red-500 text-red-600 font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                                    >
                                        <X className="w-4 h-4 stroke-[3]" />
                                        <span>Reject</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 bg-[#EDFAF2] border border-[#C3EFCF] rounded-xl text-center">
                                    <span className="text-[14px] font-bold text-[#0F5C2A]">
                                        Application was {selectedApp.status}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">Select an application to review</div>
                    )}
                </div>
            </div>
        </div>
    );
};
