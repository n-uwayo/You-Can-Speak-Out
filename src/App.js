import React, { useState } from "react";
import "./App.css";
import backgroundImage from "./assets/public_speaking_bg.png";

// Dashboards
import AdminDashboard from "./dashboards/AdminDashboard";
import FacilitatorDashboard from "./dashboards/FacilitatorDashboard";
import StudentDashboard from "./dashboards/StudentDashboard";

function App() {
    const [page, setPage] = useState("home");
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = "http://localhost:5000/api/auth";

    // --- SignIn Component ---
    const SignIn = () => {
        const [username, setUsername] = useState("");
        const [password, setPassword] = useState("");

        const handleSignIn = async(e) => {
            e.preventDefault();
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/signin`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || "Invalid credentials");
                }

                const data = await response.json();
                localStorage.setItem("authToken", data.token);

                // Role detection
                if (username === "@admin") setUserRole("admin");
                else if (username.endsWith("@facilitator")) setUserRole("facilitator");
                else setUserRole("student");

                setPage("home");
            } catch (error) {
                alert(error.message);
            } finally {
                setLoading(false);
            }
        };

        return ( <
            >
            <
            h1 > Sign In < /h1> <
            form className = "form"
            onSubmit = { handleSignIn } >
            <
            input type = "text"
            placeholder = "Username"
            required className = "input"
            value = { username }
            onChange = {
                (e) => setUsername(e.target.value)
            }
            /> <
            input type = "password"
            placeholder = "Password"
            required className = "input"
            value = { password }
            onChange = {
                (e) => setPassword(e.target.value)
            }
            /> <
            button type = "submit"
            className = "submit-button"
            disabled = { loading } > { loading ? "Signing In..." : "Sign In" } <
            /button> <
            p >
            Don’ t have an account ? { " " } <
            button onClick = {
                () => setPage("signup")
            }
            className = "link-button"
            type = "button" >
            Sign Up <
            /button> < /
            p > <
            /form> < / >
        );
    };

    // --- SignUp Component ---
    const SignUp = () => {
        const [name, setName] = useState("");
        const [username, setUsername] = useState("");
        const [password, setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");

        const handleSignUp = async(e) => {
            e.preventDefault();
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, username, password }),
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || "Registration failed");
                }

                alert("Registration successful! Please sign in.");
                setPage("signin");
            } catch (error) {
                alert(error.message);
            } finally {
                setLoading(false);
            }
        };

        return ( <
            >
            <
            h1 > Sign Up < /h1> <
            form className = "form"
            onSubmit = { handleSignUp } >
            <
            input type = "text"
            placeholder = "Full Name"
            required className = "input"
            value = { name }
            onChange = {
                (e) => setName(e.target.value)
            }
            /> <
            input type = "text"
            placeholder = "Username"
            required className = "input"
            value = { username }
            onChange = {
                (e) => setUsername(e.target.value)
            }
            /> <
            input type = "password"
            placeholder = "Password"
            required className = "input"
            value = { password }
            onChange = {
                (e) => setPassword(e.target.value)
            }
            /> <
            input type = "password"
            placeholder = "Confirm Password"
            required className = "input"
            value = { confirmPassword }
            onChange = {
                (e) => setConfirmPassword(e.target.value)
            }
            /> <
            button type = "submit"
            className = "submit-button"
            disabled = { loading } > { loading ? "Signing Up..." : "Sign Up" } <
            /button> <
            p >
            Already have an account ? { " " } <
            button onClick = {
                () => setPage("signin")
            }
            className = "link-button"
            type = "button" >
            Sign In <
            /button> < /
            p > <
            /form> < / >
        );
    };

    // --- Pages ---
    const Home = () => ( <
        section className = "home-main" >
        <
        h1 > Welcome to YCSpout < /h1> <
        p > Your path to mastering public speaking. < /p> < /
        section >
    );

    const About = () => ( <
        >
        <
        h1 > About YCSpout < /h1> <
        p className = "about-text" >
        YCSpout empowers youth in rural areas with the ability to speak confidently.We provide structured training, resources, and community support. <
        /p> < / >
    );

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setUserRole(null);
        setPage("home");
    };


    if (userRole === "admin") return < > < AdminDashboard / > < button onClick = { handleLogout }
    className = "logout-button" > Logout < /button></ > ;
    if (userRole === "facilitator") return < > < FacilitatorDashboard / > < button onClick = { handleLogout }
    className = "logout-button" > Logout < /button></ > ;
    if (userRole === "student") return < > < StudentDashboard / > < button onClick = { handleLogout }
    className = "logout-button" > Logout < /button></ > ;

    // --- Public Pages ---
    return ( <
        div className = "app-container"
        style = {
            { backgroundImage: `url(${backgroundImage})` }
        } >
        <
        nav className = "navbar" >
        <
        button onClick = {
            () => setPage("home")
        } > Home < /button> <
        button onClick = {
            () => setPage("about")
        } > About < /button> <
        button onClick = {
            () => setPage("signin")
        } > Sign In < /button> <
        button onClick = {
            () => setPage("signup")
        } > Sign Up < /button> < /
        nav >

        { /* Sidebar */ } <
        aside className = "know-sidebar" >
        <
        h3 > Did you know ? < /h3> <
        p >
        Great speakers weren’ t born that way.With training and practice, you can become confident and clear just like them!
        <
        /p> < /
        aside >


        <
        main className = "main-content" > { page === "home" && < Home / > } { page === "about" && < About / > } { page === "signin" && < SignIn / > } { page === "signup" && < SignUp / > } <
        /main>

        <
        footer className = "footer" > ©2025 YCSpout.All rights reserved. < /footer> < /
        div >
    );
}

export default App;