import React, { useEffect, useState } from "react";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [tutorials, setTutorials] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        fetch("/api/admin/users").then(res => res.json()).then(setUsers);
        fetch("/api/admin/tutorials").then(res => res.json()).then(setTutorials);
        fetch("/api/admin/assignments").then(res => res.json()).then(setAssignments);
        fetch("/api/admin/feedbacks").then(res => res.json()).then(setFeedbacks);
    }, []);

    const deleteUser = (id) => {
        fetch(`/api/admin/users/${id}`, { method: "DELETE" })
            .then(res => res.json())
            .then(() => setUsers(users.filter(user => user.id !== id)));
    };

    const changeRole = (id, newRole) => {
        fetch(`/api/admin/users/${id}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            })
            .then(res => res.json())
            .then(alert);
    };

    return ( <
            div >
            <
            h1 > Admin Dashboard < /h1> <
            p > Welcome, Admin.Here you can manage users and content. < /p>

            <
            h2 > Manage Users < /h2> {
                users.map(user => ( <
                    div key = { user.id } > { user.username }({ user.role }) <
                    button onClick = {
                        () => deleteUser(user.id) } > Delete < /button> <
                    select onChange = {
                        (e) => changeRole(user.id, e.target.value) }
                    value = { user.role } >
                    <
                    option value = "student" > Student < /option> <
                    option value = "facilitator" > Facilitator < /option> <
                    option value = "admin" > Admin < /option> <
                    /select> <
                    /div>
                ))
            }

            <
            h2 > Tutorials < /h2> <
            ul > {
                tutorials.map(t => < li key = { t.id } > { t.title } < /li>)}</ul >

                    <
                    h2 > Assignments Submitted < /h2> <
                    ul > {
                        assignments.map(a => < li key = { a.id } > { a.title } < /li>)}</ul >

                            <
                            h2 > Feedback Provided < /h2> <
                            ul > {
                                feedbacks.map(f => < li key = { f.id } > { f.comment } < /li>)}</ul >
                                    <
                                    /div>
                                );
                            }

                            export default AdminDashboard;