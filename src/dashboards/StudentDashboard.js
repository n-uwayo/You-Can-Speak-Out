import React, { useEffect, useState } from "react";

function StudentDashboard() {
    const [tutorials, setTutorials] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        fetch("/api/student/tutorials").then(res => res.json()).then(setTutorials);
        fetch("/api/student/assignments").then(res => res.json()).then(setAssignments);
        fetch("/api/student/feedbacks").then(res => res.json()).then(setFeedbacks);
    }, []);

    const handleSubmit = (assignmentId, file) => {
        // Handle assignment submission 
        const formData = new FormData();
        formData.append("file", file);

        fetch(`/api/student/submit/${assignmentId}`, {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(alert)
            .catch(console.error);
    };

    return ( <
            div >
            <
            h1 > Student Dashboard < /h1> <
            p > Welcome to your Public Speaking learning journey. < /p>

            <
            h2 > Assigned Tutorials < /h2> <
            ul > {
                tutorials.map(t => < li key = { t.id } > { t.title } < /li>)}</ul >

                    <
                    h2 > Your Assignments < /h2> {
                    assignments.map(a => ( <
                        div key = { a.id } >
                        <
                        p > < strong > { a.title } < /strong></p >
                        <
                        input type = "file"
                        onChange = { e => handleSubmit(a.id, e.target.files[0]) }
                        /> < /
                        div >
                    ))
                }

                <
                h2 > Your Feedback < /h2> <
                ul > {
                    feedbacks.map(f => < li key = { f.id } > { f.comment } < /li>)}</ul >
                        <
                        /div>
                    );
                }

                export default StudentDashboard;