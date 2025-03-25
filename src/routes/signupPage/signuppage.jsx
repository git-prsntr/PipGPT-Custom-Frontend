import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./signuppage.css";

const Signuppage = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [company, setCompany] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, password, company }),
            });

            const data = await response.json();
            if (response.ok) {
                navigate("/sign-in");
            } else {
                setError(data.message || "Sign-up failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }
    };

    const handleSocialSignUp = (provider) => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/${provider}`;
    };

    return (
        <div className="signuppage">
            <div className="left">
                <h1>Create an Account</h1>
                <h2>Join PipGPT and start using AI to streamline your workflow.</h2>
                
                <div className="social-auth">
                    <button className="google-auth" onClick={() => handleSocialSignUp("google")}>
                        <i className="fa-brands fa-google"></i> Sign Up with Google
                    </button>
                    <button className="microsoft-auth" onClick={() => handleSocialSignUp("microsoft")}>
                        <i className="fa-brands fa-microsoft"></i> Sign Up with Microsoft
                    </button>
                </div>

                <div className="divider">
                    <span>OR</span>
                </div>

                <form onSubmit={handleSignUp}>
                    {error && <p className="error-message">{error}</p>}
                    <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
                    <button type="submit">Sign Up</button>
                </form>
                <p>Already have an account? <Link to="/sign-in">Sign In</Link></p>
            </div>

            <div className="right">
                <div className="imgContainer">
                    <img src="/amphomeimagefinal.png" alt="" className="amplogo" />
                </div>
            </div>
        </div>
    );
};

export default Signuppage;
