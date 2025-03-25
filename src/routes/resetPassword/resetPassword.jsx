import { useState } from "react";
import "./resetPassword.css";

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1);
    const [error, setError] = useState(null);

    const handleSendCode = (e) => {
        e.preventDefault();
        setError(null);
        setStep(2);
        // TODO: Trigger send-code email API
    };

    const handleReset = (e) => {
        e.preventDefault();
        setError(null);
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        // TODO: Reset password API call
        alert("Password reset successful!");
    };

    return (
        <div className="resetPassword">
            <div className="left">
                <h1>Reset Password</h1>
                <h2>If the email is registered, you will receive a 6 digit code.</h2>
                <form onSubmit={step === 1 ? handleSendCode : handleReset}>
                    {error && <p className="error-message">{error}</p>}

                    {step === 1 && (
                        <>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit">Send Code</button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                required
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button type="submit">Reset Password</button>
                        </>
                    )}
                </form>
            </div>

            <div className="right">
                <div className="imgContainer">
                    <img src="/amphomeimagefinal.png" alt="Reset" />
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
