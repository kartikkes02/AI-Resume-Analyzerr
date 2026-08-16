import {Link} from "react-router";
import {usePuterStore} from "~/lib/puter";

const Navbar = () => {
    const { auth } = usePuterStore();

    return (
        <nav className="navbar">
            <Link to="/" className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gradient">RESUMIND</p>
            </Link>
            <div className="flex items-center gap-4">
                {auth.isAuthenticated ? (
                    <>
                        <Link to="/upload" className="primary-button w-fit text-sm font-semibold">
                            Upload Resume
                        </Link>
                        {auth.user?.username && (
                            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full hidden sm:inline-block">
                                @{auth.user.username}
                            </span>
                        )}
                        <button
                            onClick={() => auth.signOut()}
                            className="text-sm font-semibold text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 transition cursor-pointer"
                        >
                            Log Out
                        </button>
                    </>
                ) : (
                    <Link
                        to="/auth"
                        className="primary-button w-fit text-sm font-semibold"
                    >
                        Sign In / Sign Up
                    </Link>
                )}
            </div>
        </nav>
    )
}
export default Navbar
