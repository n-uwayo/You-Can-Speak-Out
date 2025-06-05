// import React from "react";
// import "./App.css";
// import backgroundImage from "./assets/public_speaking_bg.png";

// function App() {
//     return ( <
//         div className = "app"
//         style = {
//             {
//                 backgroundImage: `url(${backgroundImage})`,
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//                 height: "100vh",
//                 color: "white",
//                 textAlign: "center",
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "center",
//                 alignItems: "center",
//             }
//         } >
//         <
//         nav style = {
//             { position: "absolute", top: 0, width: "100%", padding: "1rem", backgroundColor: "rgba(0,0,0,0.6)" }
//         } >
//         <
//         ul style = {
//             { listStyle: "none", display: "flex", justifyContent: "space-around", color: "white", margin: 0 }
//         } >
//         <
//         li > Home < /li> <
//         li > About < /li> <
//         li > Sign In < /li> <
//         li > Sign Up < /li> < /
//         ul > <
//         /nav> <
//         h1 > Welcome to YCSpout < /h1> <
//         p > Your path to mastering public speaking starts here. < /p> < /
//         div >
//     );
// }


// export default App;import React, { useState } from "react";
import React, { useState } from "react";
import "./App.css";
import backgroundImage from "./assets/public_speaking_bg.png";

function App() {
    const [page, setPage] = useState("home");

    // Shared form input styles
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
        YCSpout is a platform created to empower youth in rural and urban areas with the ability to speak confidently in public.We provide structured training, resources, and a community to help you become a skilled speaker. <
        /p> < / >
    );

    const SignIn = () => ( <
        >
        <
        h1 > Sign In < /h1> <
        form style = { formStyle }
        onSubmit = {
            (e) => e.preventDefault()
        } >
        <
        input type = "email"
        placeholder = "Email"
        required style = { inputStyle }
        /> <
        input type = "password"
        placeholder = "Password"
        required style = { inputStyle }
        /> <
        button type = "submit"
        disabled style = {
            {
                ...inputStyle,
                backgroundColor: "#00ffff",
                    color: "black",
                    fontWeight: "bold",
                    cursor: "pointer",
            }
        } >
        Sign In(Disabled) <
        /button> <
        p >
        Don 't have an account? <
        button onClick = {
            () => setPage("signup")
        }
        style = { linkButtonStyle } >
        Sign Up <
        /button> < /
        p > <
        /form> < / >
    );

    const SignUp = () => ( <
        >
        <
        h1 > Sign Up < /h1> <
        form style = { formStyle }
        onSubmit = {
            (e) => e.preventDefault()
        } >
        <
        input type = "text"
        placeholder = "Full Name"
        required style = { inputStyle }
        /> <
        input type = "email"
        placeholder = "Email"
        required style = { inputStyle }
        /> <
        input type = "password"
        placeholder = "Password"
        required style = { inputStyle }
        /> <
        button type = "submit"
        disabled style = {
            {
                ...inputStyle,
                backgroundColor: "#00ffff",
                    color: "black",
                    fontWeight: "bold",
                    cursor: "pointer",
            }
        } >
        Sign Up(Disabled) <
        /button> <
        p >
        Already have an account ?
        <
        button onClick = {
            () => setPage("signin")
        }
        style = { linkButtonStyle } >
        Sign In <
        /button> < /
        p > <
        /form> < / >
    );

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
                backgroundColor: "rgba(0,0,0,0.6)",
            }
        } >
        <
        ul style = {
            {
                listStyle: "none",
                display: "flex",
                justifyContent: "space-around",
                color: "white",
                margin: 0,
                padding: 0,
            }
        } >
        <
        li onClick = {
            () => setPage("home")
        }
        style = {
            {
                cursor: "pointer",
                borderBottom: page === "home" ? "2px solid cyan" : "none",
            }
        } >
        Home <
        /li> <
        li onClick = {
            () => setPage("about")
        }
        style = {
            {
                cursor: "pointer",
                borderBottom: page === "about" ? "2px solid cyan" : "none",
            }
        } >
        About <
        /li> <
        li onClick = {
            () => setPage("signin")
        }
        style = {
            {
                cursor: "pointer",
                borderBottom: page === "signin" ? "2px solid cyan" : "none",
            }
        } >
        Sign In <
        /li> <
        li onClick = {
            () => setPage("signup")
        }
        style = {
            {
                cursor: "pointer",
                borderBottom: page === "signup" ? "2px solid cyan" : "none",
            }
        } >
        Sign Up <
        /li> < /
        ul > <
        /nav>

        { /* Main Content */ } <
        main style = {
            {
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                paddingTop: "5rem",
            }
        } > { page === "home" && < Home / > } { page === "about" && < About / > } { page === "signin" && < SignIn / > } { page === "signup" && < SignUp / > } <
        /main>

        { /* Footer */ } <
        footer style = {
            {
                backgroundColor: "rgba(0,0,0,0.6)",
                padding: "1rem",
                color: "white",
            }
        } >
        <
        p > ©2025 YCSpout.All rights reserved. < /p> < /
        footer > <
        /div>
    );
}

export default App;