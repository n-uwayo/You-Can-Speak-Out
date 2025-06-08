import React, { useState } from "react";
import "./App.css";

import backgroundImage from "./assets/public_speaking_bg.png";

// Dashboards
const AdminDashboard = () => ( <
    >
    <
    h1 > Admin Dashboard < /h1> <
    p > Welcome, Admin.Here you can manage users and content. < /p> < / >
);

const FacilitatorDashboard = () => ( <
    >
    <
    h1 > Facilitator Dashboard < /h1> <
    p > Welcome, Facilitator.Here you can upload tutorials and manage sessions. < /p> < / >
);

const StudentDashboard = () => ( <
    >
    <
    h1 > Student Dashboard < /h1> <
    p > Welcome to your learning journey.Here are your tasks and progress. < /p> < / >
);

function App() {
    const [page, setPage] = useState("home");
    const [userRole, setUserRole] = useState(null); // "admin" | "facilitator" | "student"
    const [loading, setLoading] = useState(false);

    const inputStyle = {
        padding: "10px",
        margin: "10px 0",
        borderRadius: "8px",
        border: "none",
        width: "250px",
        fontSize: "1rem",
    };

    const formStyle = {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: "30px",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "white",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
    };

    const linkButtonStyle = {
        color: "#00ffff",
        background: "none",
        border: "none",
        cursor: "pointer",
        textDecoration: "underline",
        marginTop: "10px",
    };

    const API_BASE_URL = "http://localhost:5000/api/auth"; // Update if backend URL differs

    // --- Sign In Component ---
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
                console.log("SignIn success:", data);

                localStorage.setItem("authToken", data.token);

                // 👇 Redirect logic based on username
                if (username === "@admin") {
                    setUserRole("admin");
                } else if (username.endsWith("@facilitator")) {
                    setUserRole("facilitator");
                } else {
                    setUserRole("student");
                }

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
            form style = { formStyle }
            onSubmit = { handleSignIn } >
            <
            input type = "text"
            placeholder = "Username"
            required style = { inputStyle }
            value = { username }
            onChange = {
                (e) => setUsername(e.target.value)
            }
            /> <
            input type = "password"
            placeholder = "Password"
            required style = { inputStyle }
            value = { password }
            onChange = {
                (e) => setPassword(e.target.value)
            }
            /> <
            button type = "submit"
            style = {
                {
                    ...inputStyle,
                    backgroundColor: "#00ffff",
                        color: "black",
                        fontWeight: "bold",
                        cursor: "pointer",
                }
            }
            disabled = { loading } > { loading ? "Signing In..." : "Sign In" } <
            /button> <
            p >
            Don 't have an account?{" "} <
            button onClick = {
                () => setPage("signup")
            }
            style = { linkButtonStyle }
            type = "button" >
            Sign Up <
            /button> < /
            p > <
            /form> < / >
        );
    };

    // --- Sign Up Component ---
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
            form style = { formStyle }
            onSubmit = { handleSignUp } >
            <
            input type = "text"
            placeholder = "Full Name"
            required style = { inputStyle }
            value = { name }
            onChange = {
                (e) => setName(e.target.value)
            }
            /> <
            input type = "text"
            placeholder = "Username"
            required style = { inputStyle }
            value = { username }
            onChange = {
                (e) => setUsername(e.target.value)
            }
            /> <
            input type = "password"
            placeholder = "Password"
            required style = { inputStyle }
            value = { password }
            onChange = {
                (e) => setPassword(e.target.value)
            }
            /> <
            input type = "password"
            placeholder = "Confirm Password"
            required style = { inputStyle }
            value = { confirmPassword }
            onChange = {
                (e) => setConfirmPassword(e.target.value)
            }
            /> <
            button type = "submit"
            style = {
                {
                    ...inputStyle,
                    backgroundColor: "#00ffff",
                        color: "black",
                        fontWeight: "bold",
                        cursor: "pointer",
                }
            }
            disabled = { loading } > { loading ? "Signing Up..." : "Sign Up" } <
            /button> <
            p >
            Already have an account ? { " " } <
            button onClick = {
                () => setPage("signin")
            }
            style = { linkButtonStyle }
            type = "button" >
            Sign In <
            /button> < /
            p > <
            /form> < / >
        );
    };

    // --- Home & About ---
    const Home = () => ( <
        >
        <
        h1 > Welcome to YCSpout < /h1> <
        p > Your path to mastering public speaking starts here. < /p> < / >
    );

    const About = () => ( <
        >
        <
        h1 > About YCSpout < /h1> <
        p style = {
            { maxWidth: "600px" }
        } >
        YCSpout empowers youth in rural and urban areas with the ability to speak confidently.We provide structured training, resources, and community support. <
        /p> < / >
    );

    // --- Logout Function ---
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setUserRole(null);
        setPage("home");
    };

    // Render dashboard or app based on user role
    if (userRole === "admin")
        return ( <
            >
            <
            AdminDashboard / >
            <
            button onClick = { handleLogout }
            style = {
                {
                    marginTop: 20,
                    padding: "10px 20px",
                    cursor: "pointer",
                    borderRadius: 8,
                }
            } >
            Logout <
            /button> < / >
        );

    if (userRole === "facilitator")
        return ( <
            >
            <
            FacilitatorDashboard / >
            <
            button onClick = { handleLogout }
            style = {
                {
                    marginTop: 20,
                    padding: "10px 20px",
                    cursor: "pointer",
                    borderRadius: 8,
                }
            } >
            Logout <
            /button> < / >
        );

    if (userRole === "student")
        return ( <
            >
            <
            StudentDashboard / >
            <
            button onClick = { handleLogout }
            style = {
                {
                    marginTop: 20,
                    padding: "10px 20px",
                    cursor: "pointer",
                    borderRadius: 8,
                }
            } >
            Logout <
            /button> < / >
        );

    // Default public pages
    return ( <
        div className = "app"
        style = {
            {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100vh",
                color: "white",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }
        } > { /* Navigation */ } <
        nav style = {
            {
                position: "absolute",
                top: 0,
                width: "100%",
                padding: "1rem",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                gap: "2rem",
                fontWeight: "bold",
                fontSize: "1.2rem",
            }
        } >
        <
        button onClick = {
            () => setPage("home")
        }
        style = {
            { background: "none", border: "none", color: "white", cursor: "pointer" }
        } >
        Home <
        /button> <
        button onClick = {
            () => setPage("about")
        }
        style = {
            { background: "none", border: "none", color: "white", cursor: "pointer" }
        } >
        About <
        /button> <
        button onClick = {
            () => setPage("signin")
        }
        style = {
            { background: "none", border: "none", color: "white", cursor: "pointer" }
        } >
        Sign In <
        /button> <
        button onClick = {
            () => setPage("signup")
        }
        style = {
            { background: "none", border: "none", color: "white", cursor: "pointer" }
        } >
        Sign Up <
        /button> < /
        nav >

        <
        main style = {
            {
                marginTop: "5rem",
                padding: "2rem",
                display: "flex",
                justifyContent: "center",
                flexGrow: 1,
            }
        } > { page === "home" && < Home / > } { page === "about" && < About / > } { page === "signin" && < SignIn / > } { page === "signup" && < SignUp / > } <
        /main>

        <
        footer style = {
            {
                padding: "1rem",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                fontSize: "0.9rem",
            }
        } > ©2024 YCSpout.All rights reserved. <
        /footer> < /
        div >
    );
}

export default App;