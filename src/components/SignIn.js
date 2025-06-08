// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const SignIn = ({ setRole }) => {
//         const [formData, setFormData] = useState({ username: "", password: "" });
//         const [error, setError] = useState("");
//         const navigate = useNavigate();

//         const handleSubmit = async(e) => {
//             e.preventDefault();
//             setError(""); // reset error on submit

//             try {
//                 const res = await fetch("http://localhost:5000/api/auth/signin", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(formData),
//                 });

//                 const data = await res.json();

//                 if (res.ok) {
//                     setRole(data.role);
//                     // optionally save token: localStorage.setItem('token', data.token);
//                     navigate("/dashboard");
//                 } else {
//                     setError(data.message || "Login failed");
//                 }
//             } catch (err) {
//                 setError("Sign in failed. Please try again.");
//             }
//         };

//         return ( <
//             div >
//             <
//             h2 > Sign In < /h2> {
//                 error && < p style = {
//                         { color: "red" } } > { error } < /p>} <
//                     form onSubmit = { handleSubmit } >
//                     <
//                     input
//                 type = "text"
//                 placeholder = "Username"
//                 required
//                 value = { formData.username }
//                 onChange = {
//                     (e) =>
//                     setFormData({...formData, username: e.target.value })
//                 }
//                 /> <
//                 input
//                 type = "password"
//                 placeholder = "Password"
//                 required
//                 value = { formData.password }
//                 onChange = {
//                     (e) =>
//                     setFormData({...formData, password: e.target.value })
//                 }
//                 /> <
//                 button type = "submit" > Login < /button> <
//                     /form> <
//                     /div>
//             );
//         };

//         export default SignIn;