// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { register } from "../api";

// const SignUp = () => {
//         const [formData, setFormData] = useState({ name: "", username: "", password: "" });
//         const [error, setError] = useState("");
//         const navigate = useNavigate();

//         const handleSubmit = async(e) => {
//             e.preventDefault();
//             try {
//                 await register(formData);
//                 navigate("/signin");
//             } catch (err) {
//                 if (err.response && err.response.data && err.response.data.error) {
//                     setError(err.response.data.error);
//                 } else {
//                     setError("Registration failed");
//                 }
//             }
//         };

//         return ( <
//             div >
//             <
//             h2 > Sign Up < /h2> {
//                 error && < p style = {
//                         { color: "red" } } > { error } < /p>} <
//                     form onSubmit = { handleSubmit } >
//                     <
//                     input
//                 type = "text"
//                 placeholder = "Name"
//                 required
//                 onChange = {
//                     (e) => setFormData({...formData, name: e.target.value }) }
//                 /> <
//                 input
//                 type = "text"
//                 placeholder = "Username (e.g., you@admin)"
//                 required
//                 onChange = {
//                     (e) => setFormData({...formData, username: e.target.value }) }
//                 /> <
//                 input
//                 type = "password"
//                 placeholder = "Password"
//                 required
//                 onChange = {
//                     (e) => setFormData({...formData, password: e.target.value }) }
//                 /> <
//                 button type = "submit" > Register < /button> <
//                     /form> <
//                     /div>
//             );
//         };

//         export default SignUp;