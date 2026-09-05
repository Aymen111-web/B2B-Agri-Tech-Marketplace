import React from 'react';
import { OrderStatus } from '@/types';
import { Check } from 'lucide-react';

interface OrderTimelineProps {
    status: OrderStatus;
    className?: string;
}

const steps = [
    { key: 'placed', label: 'Ordered' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'in_transit', label: 'In transit' },
    { key: 'delivered', label: 'Delivered' },
];

const statusStepMap: Record<OrderStatus, number> = {
    placed: 0,
    confirmed: 0,
    dispatched: 1,
    in_transit: 2,
    delivered: 3,
    completed: 3,
    disputed: 1,
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, className = '' }) => {
    const activeStepIndex = statusStepMap[status] ?? 0;

    return (
        <div className={`w-full py-2 ${className}`}>
            <div className="flex items-center justify-between relative">
                {/* Connecting background line */}
                <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-[#E2E4E7] -z-0" />

                {steps.map((step, idx) => {
                    const isDone = idx < activeStepIndex || status === 'completed';
                    const isActive = idx === activeStepIndex && status !== 'completed';
                    const isPassedLine = idx < activeStepIndex;

                    return (
                        <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                            {/* Connector line segment overlay */}
                            {idx > 0 && (
                                <div
                                    className={`absolute top-3.5 right-1/2 left-[-50%] h-0.5 -z-10 ${isPassedLine ? 'bg-[#1E9444]' : 'bg-[#E2E4E7]'
                                        }`}
                                />
                            )}

                            {/* Node Indicator */}
                            {isDone ? (
                                <div className="w-7 h-7 rounded-full bg-[#1E9444] text-white flex items-center justify-center shadow-sm">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                            ) : isActive ? (
                                <div className="w-7 h-7 rounded-full border-2 border-[#1E9444] bg-white flex items-center justify-center relative">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#1E9444] animate-pulse" />
                                </div>
                            ) : (
                                <div className="w-7 h-7 rounded-full border-2 border-[#E2E4E7] bg-white flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[#9BA1AA]" />
                                </div>
                            )}

                            <span
                                className={`text-[11px] mt-1.5 font-medium ${isDone || isActive ? 'text-[#1E2328] font-semibold' : 'text-[#9BA1AA]'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
