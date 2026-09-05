import React from 'react';

interface QelemMedaLogoProps {
    size?: number;
    variant?: 'icon' | 'full' | 'stacked';
    className?: string;
    showTagline?: boolean;
}

export const QelemMedaLogo: React.FC<QelemMedaLogoProps> = ({
    size = 48,
    variant = 'full',
    className = '',
    showTagline = true,
}) => {
    if (variant === 'icon') {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
            >
                {/* Outer Blue Arc Accent */}
                <path
                    d="M 40 160 A 84 84 0 1 1 182 85"
                    stroke="#0B57D0"
                    strokeWidth="14"
                    strokeLinecap="round"
                />

                {/* Golden Yellow Q Ring & Tail */}
                <path
                    d="M 175 105 A 72 72 0 1 0 52 162"
                    stroke="#E69500"
                    strokeWidth="14"
                    strokeLinecap="round"
                />
                <path
                    d="M 125 130 C 135 142 165 178 190 184 C 172 192 148 186 132 168 Z"
                    fill="#E69500"
                />

                {/* Inner Bold Royal Blue 'M' */}
                <path
                    d="M 64 140 V 70 L 100 115 L 136 70 V 140"
                    stroke="#0B57D0"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />

                {/* Golden Gate Dual-Peak 'M' Emblem */}
                <path
                    d="M 80 144 L 100 128 L 120 144"
                    stroke="#E69500"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>
        );
    }

    if (variant === 'stacked') {
        return (
            <div className={`flex flex-col items-center text-center ${className}`}>
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M 40 160 A 84 84 0 1 1 182 85"
                        stroke="#0B57D0"
                        strokeWidth="14"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 175 105 A 72 72 0 1 0 52 162"
                        stroke="#E69500"
                        strokeWidth="14"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 125 130 C 135 142 165 178 190 184 C 172 192 148 186 132 168 Z"
                        fill="#E69500"
                    />
                    <path
                        d="M 64 140 V 70 L 100 115 L 136 70 V 140"
                        stroke="#0B57D0"
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    <path
                        d="M 80 144 L 100 128 L 120 144"
                        stroke="#E69500"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>

                <div className="mt-2">
                    <div className="flex items-center justify-center text-[22px] font-extrabold leading-tight">
                        <span className="text-[#0B57D0]">Agri</span>
                        <span className="text-[#E69500]">Gate</span>
                    </div>
                    {showTagline && (
                        <div className="text-[10px] font-bold block mt-0.5 tracking-tight">
                            <span className="text-[#5F6368]">by </span>
                            <span className="text-[#0B57D0]">Qelem Meda </span>
                            <span className="text-[#E69500]">Technologies</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default: Full Horizontal Lockup
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
            >
                {/* Outer Blue Arc Accent */}
                <path
                    d="M 40 160 A 84 84 0 1 1 182 85"
                    stroke="#0B57D0"
                    strokeWidth="14"
                    strokeLinecap="round"
                />

                {/* Golden Yellow Q Ring & Tail */}
                <path
                    d="M 175 105 A 72 72 0 1 0 52 162"
                    stroke="#E69500"
                    strokeWidth="14"
                    strokeLinecap="round"
                />
                <path
                    d="M 125 130 C 135 142 165 178 190 184 C 172 192 148 186 132 168 Z"
                    fill="#E69500"
                />

                {/* Inner Bold Royal Blue 'M' */}
                <path
                    d="M 64 140 V 70 L 100 115 L 136 70 V 140"
                    stroke="#0B57D0"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />

                {/* Golden Gate Dual-Peak 'M' Emblem */}
                <path
                    d="M 80 144 L 100 128 L 120 144"
                    stroke="#E69500"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>

            <div className="flex flex-col justify-center">
                <div className="flex items-center text-[24px] font-black leading-none tracking-tight">
                    <span className="text-[#0B57D0]">Agri</span>
                    <span className="text-[#E69500] ml-1">Gate</span>
                </div>
                {showTagline && (
                    <div className="text-[11px] font-bold block mt-1 tracking-tight">
                        <span className="text-[#5F6368]">by </span>
                        <span className="text-[#0B57D0]">Qelem Meda </span>
                        <span className="text-[#E69500]">Technologies</span>
                    </div>
                )}
            </div>
        </div>
    );
};
