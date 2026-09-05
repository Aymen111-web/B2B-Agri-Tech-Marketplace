import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { QelemMedaLogo } from '@/components/common/QelemMedaLogo';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { loginWithCredentials } = useAuth();

    const [phoneOrEmail, setPhoneOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        setIsLoading(true);

        try {
            const user = await loginWithCredentials(phoneOrEmail.trim(), password);
            setIsLoading(false);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'farmer') navigate('/farmer');
            else navigate('/buyer');
        } catch (err: any) {
            setIsLoading(false);
            setAuthError(
                err.message || 'Invalid phone or password. Please try again.'
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#EEF2F6] flex items-center justify-center p-4">
            {/* Main Floating Card matching Image 1 & 2 */}
            <div className="w-full max-w-[430px] bg-white rounded-[24px] shadow-xl overflow-hidden border border-[#E2E8F0] relative">

                {/* Top Border Gradient (Royal Blue to Golden Yellow) */}
                <div className="h-[5px] w-full bg-gradient-to-r from-[#0B57D0] via-[#F3A712] to-[#E69500]" />

                <div className="p-6 md:p-8 space-y-6">
                    {/* Top Right Decorative Color Accent Dots */}
                    <div className="absolute top-5 right-6 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0B57D0]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F3A712]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E65100]" />
                    </div>

                    {/* Header: Official QMT-AgriGate Logo Lockup */}
                    <div className="pt-1">
                        <QelemMedaLogo size={58} variant="full" showTagline={true} />
                    </div>

                    {/* Section Title with Vertical Accent Bar */}
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                        <div className="w-[5px] h-6 bg-[#E69500] rounded-full" />
                        <h1 className="text-[18px] font-extrabold text-[#0B57D0]">
                            Sign In to Q M T - A G R I G A T E
                        </h1>
                    </div>

                    {/* Failure Alert */}
                    {authError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-xs text-red-700">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <span>{authError}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                                Mobile Phone Number
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="0911234567 or +251..."
                                value={phoneOrEmail}
                                onChange={(e) => setPhoneOrEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-medium text-[#1E2328] placeholder-[#9BA1AA] focus:outline-none focus:bg-white focus:border-[#0B57D0] transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-4 pr-11 py-3 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-medium text-[#1E2328] placeholder-[#9BA1AA] focus:outline-none focus:bg-white focus:border-[#0B57D0] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-3.5 text-[#0B57D0] hover:opacity-80"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl bg-[#0B57D0] text-white font-bold text-[15px] shadow-md hover:bg-[#0842A0] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer Navigation */}
                    <div className="text-center pt-2 space-y-1 text-[13px]">
                        <p className="text-[#5A6270]">
                            Don’t have an account?{' '}
                            <Link to="/register" className="text-[#0B57D0] font-bold hover:underline">
                                Register New Account
                            </Link>
                        </p>
                        <p>
                            <Link to="/apply" className="text-[#E69500] hover:underline font-bold text-[12px]">
                                Apply for Partner Verification
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
