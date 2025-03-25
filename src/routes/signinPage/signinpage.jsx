import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./signinpage.css";

const Signinpage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                navigate("/dashboard");
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }
    };

    const handleSocialLogin = (provider) => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/${provider}`;
    };

    return (
        <div className="signinpage">
            <div className="left">
                <h1>Welcome Back!</h1>
                <h2>Log in to access your personalised AI assistant.</h2>
                
                <div className="social-auth">
                    <button className="google-auth" onClick={() => handleSocialLogin("google")}>
                        <i className="fa-brands fa-google"></i> Sign In with Google
                    </button>
                    <button className="microsoft-auth" onClick={() => handleSocialLogin("microsoft")}>
                        <i className="fa-brands fa-microsoft"></i> Sign In with Microsoft
                    </button>
                </div>

                <div className="divider">
                    <span>OR</span>
                </div>

                <form onSubmit={handleSignIn}>
                    {error && <p className="error-message">{error}</p>}
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit">Sign In</button>
                </form>
                <p><Link to="/reset-password">Forgot Password?</Link></p>
                <p>Don't have an account? <Link to="/sign-up">Sign Up</Link></p>
            </div>

            <div className="right">
                <div className="imgContainer">
                    <img src="/amphomeimagefinal.png" alt="" className="amplogo" />
                </div>
            </div>
        </div>
    );
};

export default Signinpage;
