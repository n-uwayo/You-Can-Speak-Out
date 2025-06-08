import React, { useEffect, useState } from "react";

function FacilitatorDashboard() {
    const [tutorialTitle, setTutorialTitle] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        fetch("/api/facilitator/assignments").then(res => res.json()).then(setAssignments);
        fetch("/api/facilitator/submissions").then(res => res.json()).then(setSubmissions);
    }, []);

    const uploadTutorial = () => {
        fetch("/api/facilitator/tutorials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: tutorialTitle }),
            })
            .then(res => res.json())
            .then(alert)
            .catch(console.error);
    };

    const createAssignment = (tutorialId, title) => {
        fetch("/api/facilitator/assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tutorialId, title }),
            })
            .then(res => res.json())
            .then(alert)
            .catch(console.error);
    };

    const giveFeedback = (submissionId, feedback) => {
        fetch(`/api/facilitator/feedback/${submissionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comment: feedback }),
            })
            .then(res => res.json())
            .then(alert)
            .catch(console.error);
    };

    return ( <
        div >
        <
        h1 > Facilitator Dashboard < /h1> <
        p > Welcome, Facilitator.Here you can upload tutorials and manage sessions. < /p>

        <
        h3 > Upload Tutorial < /h3> <
        input value = { tutorialTitle }
        onChange = {
            (e) => setTutorialTitle(e.target.value) }
        /> <
        button onClick = { uploadTutorial } > Upload < /button>

        <
        h3 > Create Assignment
        for Tutorial < /h3> {
            assignments.map(a => ( <
                div key = { a.id } >
                <
                p > Tutorial: { a.tutorialTitle } < /p> <
                input type = "text"
                placeholder = "Assignment Title"
                onBlur = {
                    (e) => createAssignment(a.tutorialId, e.target.value) }
                /> <
                /div>
            ))
        }

        <
        h3 > Review Student Submissions < /h3> {
            submissions.map(sub => ( <
                div key = { sub.id } >
                <
                p > Student: { sub.studentName }, Assignment: { sub.assignmentTitle } < /p> <
                textarea placeholder = "Write feedback"
                onBlur = {
                    (e) => giveFeedback(sub.id, e.target.value) }
                /> <
                /div>
            ))
        } <
        /div>
    );
}

export default FacilitatorDashboard;