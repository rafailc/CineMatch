import "../styles/login.css";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Film } from "lucide-react";

import LightRays from "../components/LightRays";

export default function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("➡️ Login.jsx calling signIn() now...");
        console.log("SIGN IN ATTEMPT", email);

        const { error } = await signIn(email, password);

        if (error) {
            console.log("Login failed:", error.message);
            return;
        }

        const { data: userData } = await supabase.auth.getUser();
        console.log("USER AFTER LOGIN:", userData);

        if (userData?.user) {
            navigate("/");
        } else {
            setTimeout(async () => {
                const retry = await supabase.auth.getUser();
                if (retry.data.user) navigate("/");
            }, 300);
        }
    };



    async function handleRegister(e) {
        e.preventDefault();
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            console.error(error.message);
            return;
        }

        alert("Account created! Check your email.");
        setIsRegistering(false);
    }

    return (
        <div className="login-wrapper">
            {/* BACKGROUND */}
            <LightRays
                className="login-bg"
                raysOrigin="top-center"
                raysColor="#ffffff"
                raysSpeed={1.2}
                lightSpread={1.4}
                rayLength={1.8}
                fadeDistance={1.2}
                saturation={1.1}
                distortion={0.2}
                noiseAmount={0.05}
                followMouse={true}
            />

            {!isRegistering ? (

                // ******************* LOGIN FORM *******************

                <form className="form_container" onSubmit={handleSubmit}>
                    <div className="login-logo">
                        <div className="logo-bg">
                            <Film className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    <div className="title_container">
                        <p className="title">Login to your Account</p>
                        <span className="subtitle">
                        Get started with our app, just create an account and enjoy the experience.
                    </span>
                    </div>

                    {/* EMAIL FIELD */}
                    <div className="input_container">
                        <label className="input_label" htmlFor="email_field">Email</label>

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            className="icon"
                            viewBox="0 0 24 24"
                        >
                            <path stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m7 8.5 2.942 1.74c1.715 1.014 2.4 1.014 4.116 0L17 8.5"/>
                            <path stroke="#141B34" strokeLinejoin="round" strokeWidth="1.5" d="M2.016 13.476c.065 3.065.098 4.598 1.229 5.733 1.131 1.136 2.705 1.175 5.854 1.254 1.94.05 3.862.05 5.802 0 3.149-.079 4.723-.118 5.854-1.254 1.131-1.135 1.164-2.668 1.23-5.733.02-.986.02-1.966 0-2.952-.066-3.065-.099-4.598-1.23-5.733-1.131-1.136-2.705-1.175-5.854-1.254a115 115 0 0 0-5.802 0c-3.149.079-4.723.118-5.854 1.254-1.131 1.135-1.164 2.668-1.23 5.733a69 69 0 0 0 0 2.952Z"/>
                        </svg>

                        <input
                            id="email_field"
                            type="email"
                            className="input_field"
                            placeholder="name@mail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* PASSWORD FIELD */}
                    <div className="input_container">
                        <label className="input_label" htmlFor="password_field">Password</label>

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            className="icon"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="#141B34"
                                strokeLinecap="round"
                                strokeWidth="1.5"
                                d="M18 11.004A3.65 3.65 0 0 0 14.952 9.1 103 103 0 0 0 10.329 9c-1.65 0-3.148.034-4.623.1-1.753.077-3.193 1.388-3.427 3.062C2.126 13.254 2 14.373 2 15.513s.126 2.26.279 3.352c.234 1.674 1.674 2.985 3.427 3.063.714.031 1.554.055 2.294.072"
                            ></path>
                            <path
                                stroke="#141B34"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M6 9V6.5a4.5 4.5 0 0 1 9 0V9"
                            ></path>
                            <path
                                fill="#141B34"
                                d="m21.205 15.105-.58.59zm.215 1.372a.829.829 0 0 0 1.16-1.183zm-3.397-1.373-.58-.59zm.215 2.935a.828.828 0 1 0 1.16-1.183zm-3.978 2.723a1.45 1.45 0 0 1-2.02 0l-1.161 1.182a3.11 3.11 0 0 0 4.342 0zm-2.02 0a1.35 1.35 0 0 1 0-1.942l-1.161-1.182a3.01 3.01 0 0 0 0 4.306zm0-1.942a1.45 1.45 0 0 1 2.02 0l1.161-1.182a3.11 3.11 0 0 0-4.342 0zm2.02 0a1.353 1.353 0 0 1 0 1.942l1.161 1.182a3.01 3.01 0 0 0 0-4.306zm6.364-3.124.796.78 1.16-1.181-.795-.782zm-5.203 3.124 2.387-2.343-1.161-1.183-2.387 2.344zm2.387-2.343.795-.781-1.16-1.183-.796.781zm-1.161 0 1.59 1.562 1.162-1.183-1.591-1.562zm5.138-1.964c-.358-.351-.685-.675-.986-.9-.32-.24-.703-.441-1.185-.441v1.656s.005 0 .026.008c.026.01.078.037.166.103.19.143.427.372.818.757zm-3.182 1.183c.392-.385.627-.614.819-.757a.8.8 0 0 1 .166-.103c.02-.009.025-.008.026-.008v-1.656c-.483 0-.866.201-1.186.441-.3.225-.627.549-.986.9z"
                            ></path>
                        </svg>

                        <input
                            id="password_field"
                            type="password"
                            className="input_field"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* LOGIN BUTTON */}
                    <button type="submit" className="sign-in_btn">
                        <span>Sign In</span>
                    </button>

                    <div className="separator">
                        <hr className="line" />
                        <span>Or</span>
                        <hr className="line" />
                    </div>


                    {/* ALA3E SE REGISTER */}
                    <p className="note">
                        New here?{" "}
                        <span
                            onClick={() => setIsRegistering(true)}
                            className="cursor-pointer underline text-blue-500"
                        >
                        Create Account
                    </span>
                    </p>
                </form>

            ) : (

                //  REGISTER FORM

                <div className="login-wrapper">
                    <div className="form_container signup-form">


                        <div className="login-logo">
                            <div className="logo-bg">
                                <Film className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        <div className="header">
                            <label className="title">Create an Account</label>
                            <p className="description">
                                Create your account in no time and enjoy the experience.
                            </p>
                        </div>

                        {/* EMAIL */}
                        <div className="input_container">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                className="icon"
                                viewBox="0 0 24 24"
                            >
                                <path stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m7 8.5 2.942 1.74c1.715 1.014 2.4 1.014 4.116 0L17 8.5"/>
                                <path stroke="#141B34" strokeLinejoin="round" strokeWidth="1.5" d="M2.016 13.476c.065 3.065.098 4.598 1.229 5.733 1.131 1.136 2.705 1.175 5.854 1.254 1.94.05 3.862.05 5.802 0 3.149-.079 4.723-.118 5.854-1.254 1.131-1.135 1.164-2.668 1.23-5.733.02-.986.02-1.966 0-2.952-.066-3.065-.099-4.598-1.23-5.733-1.131-1.136-2.705-1.175-5.854-1.254a115 115 0 0 0-5.802 0c-3.149.079-4.723.118-5.854 1.254-1.131 1.135-1.164 2.668-1.23 5.733a69 69 0 0 0 0 2.952Z"/>
                            </svg>

                            <input
                                type="email"
                                placeholder="name@mail.com"
                                className="input_field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className="input_container">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                className="icon"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="#141B34"
                                    strokeLinecap="round"
                                    strokeWidth="1.5"
                                    d="M18 11.004A3.65 3.65 0 0 0 14.952 9.1 103 103 0 0 0 10.329 9c-1.65 0-3.148.034-4.623.1-1.753.077-3.193 1.388-3.427 3.062C2.126 13.254 2 14.373 2 15.513s.126 2.26.279 3.352c.234 1.674 1.674 2.985 3.427 3.063.714.031 1.554.055 2.294.072"
                                ></path>
                                <path
                                    stroke="#141B34"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M6 9V6.5a4.5 4.5 0 0 1 9 0V9"
                                ></path>
                                <path
                                    fill="#141B34"
                                    d="m21.205 15.105-.58.59zm.215 1.372a.829.829 0 0 0 1.16-1.183zm-3.397-1.373-.58-.59zm.215 2.935a.828.828 0 1 0 1.16-1.183zm-3.978 2.723a1.45 1.45 0 0 1-2.02 0l-1.161 1.182a3.11 3.11 0 0 0 4.342 0zm-2.02 0a1.35 1.35 0 0 1 0-1.942l-1.161-1.182a3.01 3.01 0 0 0 0 4.306zm0-1.942a1.45 1.45 0 0 1 2.02 0l1.161-1.182a3.11 3.11 0 0 0-4.342 0zm2.02 0a1.353 1.353 0 0 1 0 1.942l1.161 1.182a3.01 3.01 0 0 0 0-4.306zm6.364-3.124.796.78 1.16-1.181-.795-.782zm-5.203 3.124 2.387-2.343-1.161-1.183-2.387 2.344zm2.387-2.343.795-.781-1.16-1.183-.796.781zm-1.161 0 1.59 1.562 1.162-1.183-1.591-1.562zm5.138-1.964c-.358-.351-.685-.675-.986-.9-.32-.24-.703-.441-1.185-.441v1.656s.005 0 .026.008c.026.01.078.037.166.103.19.143.427.372.818.757zm-3.182 1.183c.392-.385.627-.614.819-.757a.8.8 0 0 1 .166-.103c.02-.009.025-.008.026-.008v-1.656c-.483 0-.866.201-1.186.441-.3.225-.627.549-.986.9z"
                                ></path>
                            </svg>

                            <input
                                type="password"
                                placeholder="Password"
                                className="input_field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button className="sign-in_btn" onClick={handleRegister}>
                            <span>Create Account</span>
                        </button>

                        <p className="note">
                            Already have an account?{" "}
                            <span
                                onClick={() => setIsRegistering(false)}
                                className="cursor-pointer underline text-blue-500"
                            >
                            Login
                        </span>
                        </p>

                    </div>
                </div>
            )}
        </div>
    );
}