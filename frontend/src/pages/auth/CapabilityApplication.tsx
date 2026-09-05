import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, ArrowLeft, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export const CapabilityApplication: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleUpload = () => {
        const docName = role === 'farmer'
            ? `land_certificate_${Date.now().toString().slice(-4)}.pdf`
            : `business_license_${Date.now().toString().slice(-4)}.pdf`;
        setUploadedFiles((prev) => [...prev, docName]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (uploadedFiles.length === 0) {
            setSubmitError('Please attach at least one supporting verification document.');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.submitCapabilityApplication({
                capability_type: role,
                supporting_documents: uploadedFiles,
            });
            setIsSubmitting(false);
            setIsComplete(true);
        } catch (err: any) {
            setIsSubmitting(false);
            setSubmitError(err.message || 'Failed to submit application. You may already have an active capability or pending application.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
            <div className="w-full max-w-[480px] bg-white border border-[#E2E4E7] rounded-2xl p-6 shadow-md space-y-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0F1F2]"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#1E2328]" />
                    </button>
                    <div>
                        <h2 className="text-[18px] font-bold text-[#1E2328]">Capability Application</h2>
                        <p className="text-[12px] text-[#5A6270]">Legal document verification upload & role upgrade</p>
                    </div>
                </div>

                {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-700">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block">Application Alert</span>
                            <span>{submitError}</span>
                        </div>
                    </div>
                )}

                {!isComplete ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-[12px] font-bold text-[#1E2328] block mb-1.5">
                                Applying for Capability
                            </label>
                            <div className="grid grid-cols-2 gap-2 text-[13px] font-bold">
                                <button
                                    type="button"
                                    onClick={() => setRole('farmer')}
                                    className={`py-2.5 rounded-xl border transition-all ${role === 'farmer'
                                        ? 'bg-[#EDFAF2] border-[#1E9444] text-[#1E9444]'
                                        : 'bg-white border-[#E2E4E7] text-[#5A6270]'
                                        }`}
                                >
                                    Farmer Producer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('buyer')}
                                    className={`py-2.5 rounded-xl border transition-all ${role === 'buyer'
                                        ? 'bg-[#EDFAF2] border-[#1E9444] text-[#1E9444]'
                                        : 'bg-white border-[#E2E4E7] text-[#5A6270]'
                                        }`}
                                >
                                    Commercial Buyer
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-[12px] font-bold text-[#1E2328] block mb-1.5">
                                {role === 'farmer'
                                    ? 'Land Ownership Certificate / Kebele ID'
                                    : 'Trade License / TIN Registration Certificate'}
                            </label>

                            <div
                                onClick={handleUpload}
                                className="border-2 border-dashed border-[#E2E4E7] rounded-xl p-6 text-center cursor-pointer hover:border-[#1E9444] transition-colors bg-[#F8F9FA]"
                            >
                                <Upload className="w-8 h-8 text-[#1E9444] mx-auto mb-2" />
                                <span className="text-[13px] font-bold text-[#1E9444] block">
                                    Tap to attach document (PDF, PNG, JPG)
                                </span>
                                <span className="text-[11px] text-[#5A6270]">Max file size 15MB</span>
                            </div>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-[12px] font-bold text-[#1E2328]">Uploaded Documents:</span>
                                {uploadedFiles.map((file, i) => (
                                    <div
                                        key={i}
                                        className="p-3 bg-[#EDFAF2] border border-[#C3EFCF] rounded-xl flex items-center justify-between text-[12px]"
                                    >
                                        <div className="flex items-center gap-2 text-[#0F5C2A] font-bold">
                                            <FileText className="w-4 h-4" />
                                            <span>{file}</span>
                                        </div>
                                        <span className="text-[#1E9444] font-bold">Attached</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={uploadedFiles.length === 0 || isSubmitting}
                            className="w-full py-3.5 rounded-full bg-[#1E9444] text-white font-bold text-[15px] shadow-md hover:bg-[#0F5C2A] disabled:opacity-50 btn-hover flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Submitting Application to REST API...</span>
                                </>
                            ) : (
                                <span>Submit Verification Application</span>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-6 space-y-4">
                        <div className="w-14 h-14 rounded-full bg-[#EDFAF2] text-[#1E9444] flex items-center justify-center mx-auto border-2 border-[#1E9444]">
                            <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
                        </div>
                        <h3 className="text-[18px] font-bold text-[#1E2328]">Application Submitted!</h3>
                        <p className="text-[13px] text-[#5A6270]">
                            Your request for <strong>{role === 'farmer' ? 'Farmer Producer' : 'Commercial Buyer'}</strong> capability has been submitted to our moderation queue. You will receive authorization once approved by an admin.
                        </p>
                        <button
                            onClick={() => navigate(user?.role === 'farmer' ? '/farmer' : '/buyer')}
                            className="w-full py-3 rounded-full bg-[#1E9444] text-white font-bold text-[14px]"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
