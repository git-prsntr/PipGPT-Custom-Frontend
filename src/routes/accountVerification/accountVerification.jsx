import { useState } from "react";
import "./accountVerification.css";

const AccountVerification = () => {
    const [code, setCode] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleVerify = (e) => {
        e.preventDefault();
        setError(null);
        setSuccess("Verification successful! Redirecting...");
        // TODO: Send verification code to backend
    };

    return (
        <div className="accountVerification">
            <div className="left">
                <h1>Account Verification</h1>
                <h2>Enter the 6-digit code sent to your email</h2>

                <form onSubmit={handleVerify}>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        maxLength={6}
                        required
                    />
                    <button type="submit">Verify</button>
                </form>
            </div>

            <div className="right">
                <div className="imgContainer">
                    <img src="/sportsnethomeimage.png" alt="Verify" />
                </div>
            </div>
        </div>
    );
};

export default AccountVerification;
