import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export const DisputeCenter: React.FC = () => {
    const [resolved, setResolved] = useState(false);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[24px] font-bold text-[#1E2328]">Escrow Dispute Center</h1>
                <p className="text-[13px] text-[#5A6270]">
                    Admin escrow mediation and force release override tools.
                </p>
            </div>

            <div className="bg-white border border-[#E2E4E7] rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-orange-600" />
                        <div>
                            <h3 className="text-[15px] font-bold text-[#1E2328]">
                                Dispute #DSP-402: Moisture Content Mismatch
                            </h3>
                            <p className="text-[12px] text-[#5A6270]">
                                Buyer: Addis Supply Co. · Farmer: Solomon Tefera (Yirgacheffe Coffee)
                            </p>
                        </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[11px] font-bold">
                        Escrow Held: ETB 184,000
                    </span>
                </div>

                <div className="bg-[#F8F9FA] p-3.5 rounded-lg text-[13px] text-[#5A6270] space-y-1">
                    <p>
                        <strong>Buyer claim:</strong> Coffee batch arrived with 14.2% moisture content vs 11%
                        specification.
                    </p>
                    <p>
                        <strong>Farmer evidence:</strong> Inspection certificate from Hawassa lab attached.
                    </p>
                </div>

                {!resolved ? (
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setResolved(true)}
                            className="px-4 py-2 bg-[#1E9444] text-white rounded-lg font-bold text-[12px]"
                        >
                            Release Escrow to Farmer
                        </button>
                        <button
                            onClick={() => setResolved(true)}
                            className="px-4 py-2 border border-red-500 text-red-600 rounded-lg font-bold text-[12px]"
                        >
                            Refund Buyer in Full
                        </button>
                    </div>
                ) : (
                    <div className="p-3 bg-[#EDFAF2] border border-[#C3EFCF] text-[#0F5C2A] text-[13px] font-bold rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Dispute mediated and resolved by Admin override.</span>
                    </div>
                )}
            </div>
        </div>
    );
};
