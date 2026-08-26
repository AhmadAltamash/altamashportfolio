import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldAlert, LogIn } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ADMIN_EMAIL } from "../../config/admin";
import SEO from "../../components/SEO";

const AdminLogin = () => {
  const { user, isAdmin, signInWithGoogle, signOutAdmin } = useAdminAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const handleSignIn = async () => {
    setError("");
    try {
      const signedInUser = await signInWithGoogle();
      if (signedInUser.email === ADMIN_EMAIL) {
        navigate(from, { replace: true });
      } else {
        setError(`"${signedInUser.email}" is not authorized for admin access.`);
      }
    } catch (err) {
      console.error(err);
      setError("Sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
      <SEO title="Admin | Altamash Ahmad" noindex />
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-6 backdrop-blur-xl">
        <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Admin Access</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in with your Google account to continue.</p>
        </div>

        {user && !isAdmin && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            Signed in as {user.email}, which isn&apos;t authorized.{" "}
            <button onClick={signOutAdmin} className="underline hover:text-red-300">
              Sign out
            </button>{" "}
            and try a different account.
          </div>
        )}

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            {error}
          </div>
        )}

        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white font-medium hover:scale-[1.02] transition-transform"
        >
          <LogIn className="w-4 h-4" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
