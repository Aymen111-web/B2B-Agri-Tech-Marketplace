import React from 'react';
import { Lock } from 'lucide-react';

interface EscrowBannerProps {
    className?: string;
}

export const EscrowBanner: React.FC<EscrowBannerProps> = ({ className = '' }) => {
    return (
        <div
            className={`w-full bg-[#FFF8EC] border border-[#FFE5A5] rounded-xl p-3.5 flex items-start gap-3 text-left ${className}`}
        >
            <div className="w-8 h-8 rounded-full bg-[#F5B73A]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#D88C0A]">
                <Lock className="w-4 h-4" />
            </div>
            <div>
                <h4 className="text-[13px] font-bold text-[#1E2328]">Chapa escrow protection</h4>
                <p className="text-[12px] text-[#5A6270] mt-0.5">
                    Payment held securely until you confirm delivery.
                </p>
            </div>
        </div>
    );
};
