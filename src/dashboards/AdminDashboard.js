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
            .then(() => {
                alert("Role updated!");
                setUsers(users.map(user =>
                    user.id === id ? {...user, role: newRole } : user
                ));
            });
    };

    return ( <
            div className = "p-6 max-w-5xl mx-auto" >
            <
            h1 className = "text-3xl font-bold mb-4" > Admin Dashboard < /h1> <
            p className = "mb-6 text-gray-600" > Welcome, Admin.. < /p>

            <
            section className = "mb-8" >
            <
            h2 className = "text-2xl font-semibold mb-2" > Manage Users < /h2> {
            users.map(user => ( <
                div key = { user.id }
                className = "flex items-center justify-between p-4 border rounded-lg mb-2 shadow-sm" >
                <
                div >
                <
                strong > { user.username } < /strong> <span className="text-sm text-gray-500">({user.role})</span >
                <
                /div> <
                div className = "flex items-center gap-2" >
                <
                button className = "bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick = {
                    () => deleteUser(user.id)
                } >
                Delete <
                /button> <
                select value = { user.role }
                onChange = {
                    (e) => changeRole(user.id, e.target.value)
                }
                className = "px-2 py-1 border rounded" >
                <
                option value = "student" > Student < /option> <
                option value = "facilitator" > Facilitator < /option> <
                option value = "admin" > Admin < /option> < /
                select > <
                /div> < /
                div >
            ))
        } <
        /section>

    <
    section className = "mb-8" >
        <
        h2 className = "text-2xl font-semibold mb-2" > Tutorials < /h2> <
    ul className = "list-disc ml-6" > {
            tutorials.map(t => < li key = { t.id } > { t.title } < /li>)} < /
                ul > <
                /section>

                <
                section className = "mb-8" >
                <
                h2 className = "text-2xl font-semibold mb-2" > Assignments Submitted < /h2> <
                ul className = "list-disc ml-6" > {
                    assignments.map(a => < li key = { a.id } > { a.title } < /li>)} < /
                        ul > <
                        /section>

                        <
                        section className = "mb-8" >
                        <
                        h2 className = "text-2xl font-semibold mb-2" > Feedback Provided < /h2> <
                        ul className = "list-disc ml-6" > {
                            feedbacks.map(f => < li key = { f.id } > { f.comment } < /li>)} < /
                                ul > <
                                /section> < /
                                div >
                            );
                        }

                        export default AdminDashboard;