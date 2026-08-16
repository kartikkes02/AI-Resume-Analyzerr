import {usePuterStore} from "~/lib/puter";
import {useEffect, useState} from "react";
import {useLocation, useNavigate, Link} from "react-router";

export const meta = () => ([
    { title: 'Resumind | Auth' },
    { name: 'description', content: 'Log into your account to continue your job journey' },
])

const GoogleIcon = () => (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
);

const MicrosoftIcon = () => (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 21 21">
        <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
        <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
        <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
        <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
);

const AppleIcon = () => (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.08 1.74-.94 2.78 1.02.08 2.05-.53 2.66-1.28z"/>
    </svg>
);

const MailIcon = () => (
    <svg className="w-5 h-5 flex-shrink-0 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
);

const PuterCloudIcon = () => (
    <div className="w-14 h-14 bg-[#0019FF] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto">
        <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
            <path
                d="M10 18.5C8.62 18.5 7.5 17.38 7.5 16C7.5 14.72 8.46 13.66 9.71 13.52C10.09 11.37 11.96 9.75 14.24 9.75C16.35 9.75 18.11 11.14 18.64 13.09C18.96 12.95 19.31 12.87 19.69 12.87C21.25 12.87 22.5 14.12 22.5 15.68C22.5 17.24 21.25 18.5 19.69 18.5H10Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="11.5" cy="22.5" r="1.5" fill="white" />
            <circle cx="16" cy="22.5" r="1.5" fill="white" />
            <circle cx="20.5" cy="22.5" r="1.5" fill="white" />
            <path d="M11.5 18.5V21M16 18.5V21M20.5 18.5V21" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
    </div>
);

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const target = new URLSearchParams(location.search).get('next') || '/';
    const navigate = useNavigate();
    const [showPuterModal, setShowPuterModal] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    useEffect(() => {
        if(auth.isAuthenticated) {
            navigate(target);
        }
    }, [auth.isAuthenticated, target, navigate]);

    const handleProviderClick = async () => {
        await auth.signIn(true);
    };

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center p-4">
            {/* Step 1: Welcome Card (Matches Image 2) */}
            {!showPuterModal ? (
                <div className="gradient-border shadow-2xl max-w-xl w-full animate-in fade-in zoom-in-95 duration-300">
                    <section className="flex flex-col items-center gap-8 bg-white rounded-3xl p-10 sm:p-14 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <h1 className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8E7980] via-[#111827] to-[#718096]">
                                Welcome
                            </h1>
                            <h2 className="text-2xl sm:text-3xl text-gray-600 font-normal mt-1">
                                Log In to Continue Your Job Journey
                            </h2>
                        </div>

                        <div className="w-full">
                            {isLoading ? (
                                <button disabled className="auth-button opacity-75 w-full py-4 text-2xl font-semibold cursor-wait">
                                    Checking status...
                                </button>
                            ) : auth.isAuthenticated ? (
                                <div className="flex flex-col gap-4">
                                    <p className="text-base font-semibold text-green-700 bg-green-50 py-2.5 px-4 rounded-full">
                                        Signed in as @{auth.user?.username}
                                    </p>
                                    <button
                                        onClick={() => navigate(target)}
                                        className="auth-button w-full py-4 text-2xl font-semibold cursor-pointer"
                                    >
                                        Continue to Resumind
                                    </button>
                                    <button
                                        onClick={auth.signOut}
                                        className="text-sm text-gray-500 hover:text-red-600 underline cursor-pointer"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                                    <button
                                        onClick={() => {
                                            setIsSignUp(false);
                                            setShowPuterModal(true);
                                        }}
                                        className="auth-button w-full sm:w-1/2 py-4 text-xl font-semibold cursor-pointer hover:opacity-95 transition shadow-lg"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsSignUp(true);
                                            setShowPuterModal(true);
                                        }}
                                        className="w-full sm:w-1/2 py-4 px-6 text-xl font-semibold rounded-full border-2 border-[#6875f5] text-[#6875f5] bg-white hover:bg-indigo-50 transition cursor-pointer shadow-md"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            ) : (
                /* Step 2: Puter Social Sign-in Modal (Matches Image 1) */
                <div className="relative w-full max-w-[420px] bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
                    {/* Back Button */}
                    <button
                        onClick={() => setShowPuterModal(false)}
                        className="absolute top-5 left-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
                        title="Back"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Puter Cloud Icon */}
                    <div className="mb-6">
                        <PuterCloudIcon />
                    </div>

                    {/* Providers List */}
                    <div className="w-full flex flex-col gap-3">
                        <button
                            onClick={handleProviderClick}
                            className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-xl border border-gray-300 flex items-center justify-center gap-3 transition shadow-sm cursor-pointer"
                        >
                            <GoogleIcon />
                            <span>{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
                        </button>

                        <button
                            onClick={handleProviderClick}
                            className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-xl border border-gray-300 flex items-center justify-center gap-3 transition shadow-sm cursor-pointer"
                        >
                            <MicrosoftIcon />
                            <span>{isSignUp ? 'Sign up with Microsoft' : 'Sign in with Microsoft'}</span>
                        </button>

                        <button
                            onClick={handleProviderClick}
                            className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-xl border border-gray-300 flex items-center justify-center gap-3 transition shadow-sm cursor-pointer"
                        >
                            <AppleIcon />
                            <span>{isSignUp ? 'Sign up with Apple' : 'Sign in with Apple'}</span>
                        </button>

                        <button
                            onClick={handleProviderClick}
                            className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-xl border border-gray-300 flex items-center justify-center gap-3 transition shadow-sm cursor-pointer"
                        >
                            <MailIcon />
                            <span>{isSignUp ? 'Sign up using email' : 'Sign in using email'}</span>
                        </button>
                    </div>

                    {/* Terms of Service & Privacy Policy */}
                    <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                        By {isSignUp ? 'signing up' : 'logging in'}, you agree to Puter's{' '}
                        <a
                            href="https://puter.com/terms"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                            href="https://puter.com/privacy"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Privacy Policy
                        </a>.
                    </p>

                    {/* Toggle between Sign Up and Log In */}
                    <div className="mt-8 pt-6 border-t border-gray-100 w-full">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-base font-semibold text-gray-900 hover:text-blue-600 transition cursor-pointer"
                        >
                            {isSignUp ? 'Log In' : 'Sign Up for Puter'}
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Auth
