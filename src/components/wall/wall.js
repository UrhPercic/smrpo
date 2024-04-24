import React, {useState, useEffect} from "react";
import { getData, addData, updateData, deleteData } from "../../db/realtimeDatabase";
import "./wall.css";
import {useParams} from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import SimpleMDE from "react-simplemde-editor";
import "simplemde/dist/simplemde.min.css";

const Wall = () => {
    const [activeTab, setActiveTab] = useState('DailyScrum');
    const [posts, setPosts] = useState([]);

    const addPost = (post) => {
        setPosts([...posts, post]);
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="App">
            <h3>Project Wall</h3>
            <div className="tab">
                <button
                    className={`tablink ${activeTab === 'DailyScrum' ? 'active' : ''}`}
                    onClick={() => handleTabClick('DailyScrum')}
                >
                    Discussion
                </button>
                <button
                    className={`tablink ${activeTab === 'Documentation' ? 'active' : ''}`}
                    onClick={() => handleTabClick('Documentation')}
                >
                    Documentation
                </button>
            </div>

            <div className="tabcontent">
                {activeTab === 'DailyScrum' && <DailyScrum addPost={addPost} posts={posts}/>}
                {activeTab === 'Documentation' && <Documentation/>}
            </div>
        </div>
    );
};
const DailyScrum = ({addPost, posts}) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState({});
    const [commentTexts, setCommentTexts] = useState({});
    const {projectId} = useParams();
    const [currentUserRole, setCurrentUserRole] = useState('');

    const handleChange = (e) => {
        setMessage(e.target.value);
    };
    useEffect(() => {
        const loggedInUserId = localStorage.getItem("userId");
        if (loggedInUserId) {
            const fetchUserDetails = async () => {
                try {
                    const user = await getData(`/users/${loggedInUserId}`);
                    setCurrentUser({username: user.username, userId: user.id});

                    const project = await getData(`/projects/${projectId}`);
                    if (project && project.users) {
                        const userRoles = project.users[loggedInUserId];
                        if (userRoles && userRoles.includes("Scrum Master")) {
                            // User has "Scrum Master" role
                            setCurrentUserRole("Scrum Master");
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user details or project details:", error);
                }
            };
            if (loggedInUserId) {
                fetchUserDetails();
            }
        }
        const fetchMessages = async () => {
            try {
                const fetchedMessages = await getData("/dailyScrumMessages");
                const formattedMessages = Object.keys(fetchedMessages).filter((key) =>
                    fetchedMessages[key].projectId === projectId
                ).map((key) => {
                    return {
                        id: key,
                        message: fetchedMessages[key].message,
                        username: fetchedMessages[key].username,
                        projectId: fetchedMessages[key].projectId,
                        comments: fetchedMessages[key].comments || {},
                    };
                });
                setMessages(formattedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchMessages();
    }, [projectId]);
    const handleCommentChange = (postId, text) => {
        setCommentTexts(prev => ({...prev, [postId]: text}));
    };

    const handleSubmitComment = async (postId) => {
        const commentText = commentTexts[postId];
        if (!commentText) return; // Ignore empty comments

        await addCommentToPost(postId, commentText);
        handleCommentChange(postId, '');
    };
    const deletePostAndComments = async (postId) => {
        try {
            const url = `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/dailyScrumMessages/${postId}.json`;
            const response = await fetch(url, { method: 'DELETE' });

            if (!response.ok) {
                throw new Error(`Error deleting post: ${response.statusText}`);
            }

            setMessages(messages.filter(message => message.id !== postId));

            console.log(`Post ${postId} and its comments have been deleted.`);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteComment = async (postId, commentId) => {
        try {
            const url = `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/dailyScrumMessages/${postId}/comments/${commentId}.json`;
            const response = await fetch(url, { method: 'DELETE' });

            if (!response.ok) {
                throw new Error(`Error deleting comment: ${response.statusText}`);
            }

            setMessages(messages.map(message => {
                if (message.id === postId) {
                    const updatedComments = {...message.comments};
                    delete updatedComments[commentId];
                    return {...message, comments: updatedComments};
                }
                return message;
            }));

            console.log(`Comment ${commentId} from post ${postId} has been deleted.`);
        } catch (error) {
            console.error('Error:', error);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Current user before submitting:", currentUser); // Log current user for debugging

        const newMessage = {
            username: currentUser.username || 'testUser',
            message: message,
            projectId: projectId,
            timestamp: new Date().toISOString(),
            comment: []
        };

        console.log("New message being submitted:", newMessage); // Log new message for debugging

        try {
            const messageRef = await addData("/dailyScrumMessages", newMessage);
            setMessages([...messages, {...newMessage, id: messageRef.name}]);
            setMessage('');
        } catch (error) {
            console.error("Error adding new message:", error);
        }
    };


    const addCommentToPost = async (postId, commentText) => {
        const comment = {
            text: commentText,
            username: currentUser.username,
            timestamp: new Date().toISOString(),
        };

        try {
            const commentRef = await addData(`/dailyScrumMessages/${postId}/comments`, comment);
            console.log('Comment added with reference:', commentRef);

              const updatedMessages = messages.map((message) => {
                if (message.id === postId) {
                    const updatedComments = {
                        ...message.comments,
                        [commentRef]: { ...comment } // Use the comment reference ID as key
                    };
                    return { ...message, comments: updatedComments };
                }
                return message;
            });

            setMessages(updatedMessages);
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };


    return (
        <div className="container">
            <div className="card">
                <h4 className="card-title">Discussion</h4>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="message">Write a post</label>
                        <textarea
                            className="form-control"
                            id="message"
                            value={message}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                    <div className="button-wrapper">
                        <button type="submit" className="btn btn-primary">
                            Post to a wall
                        </button>
                    </div>
                </form>
                <div className="messages-list">
                    {messages.map((post) => (
                        <div key={post.id} className="message-item">
                            <strong>{post.username}</strong>: {post.message.split("\n").map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                            <div className="comment-section">
                                <input
                                    type="text"
                                    value={commentTexts[post.id] || ''}
                                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                    placeholder="Write a comment..."
                                />
                                <button className= "comment-post" onClick={() => handleSubmitComment(post.id)}>Comment</button>
                                {/* Displaying comments here */}
                                <div className="comments-display">
                                    {post.comments && Object.entries(post.comments).map(([commentId, comment]) => (
                                        <div key={commentId} className="comment">
                                            <strong>{comment.username}</strong>: {comment.text}
                                            {currentUserRole === 'Scrum Master' && (
                                                <button className= "delete" onClick={() => deleteComment(post.id, commentId)}>Delete Comment</button>
                                            )}
                                        </div>

                                    ))}
                                </div>
                            </div>
                            <div>
                                {currentUserRole === 'Scrum Master' && (
                                    <button className= "delete" onClick={() => deletePostAndComments(post.id)}>Delete Post</button>
                                )}
                            </div>
                        </div>

                    ))}
                </div>
            </div>
        </div>
    );
}


const Documentation = () => {
    const { projectId } = useParams();
    const [documentations, setDocumentations] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [newDocContent, setNewDocContent] = useState("");

    useEffect(() => {
        fetchDocumentation();
    }, [projectId]);

    const fetchDocumentation = async () => {
        const docs = await getData(`/projects/${projectId}/documentation`);
        if (docs) {
            const docsArray = Object.entries(docs).map(([key, value]) => ({
                id: key,
                content: value.content
            }));
            setDocumentations(docsArray);
        } else {
            setDocumentations([]);
        }
    };

    const handleDocChange = (id, value) => {
        const newDocs = documentations.map(doc => {
            if (doc.id === id) {
                return { ...doc, content: value };
            }
            return doc;
        });
        setDocumentations(newDocs);
    };

    const handleSaveAll = async () => {
        for (const doc of documentations) {
            await updateData(`/projects/${projectId}/documentation/${doc.id}`, { content: doc.content });
        }
        if (newDocContent.trim()) {
            await addData(`/projects/${projectId}/documentation`, { content: newDocContent });
            setNewDocContent("");
        }
        alert("All changes saved.");
        setEditMode(false);
        await fetchDocumentation();
    };

    const handleDelete = async (id) => {
        await deleteData(`/projects/${projectId}/documentation/${id}`);
        alert("Documentation deleted.");
        await fetchDocumentation();
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                setNewDocContent(e.target.result);
            };
            reader.readAsText(file);
        }
    };

    const handleExportAll = () => {
        const allDocsContent = documentations.map(doc => `## ${doc.id}\n${doc.content}`).join('\n\n');
        const element = document.createElement("a");
        const file = new Blob([allDocsContent], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = "AllProjectDocumentation.md";
        document.body.appendChild(element);
        element.click();
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    return (
        <div>
            <h3>Documentation</h3>
            <button onClick={toggleEditMode}>{editMode ? "View Mode" : "Edit Mode"}</button>
            <button onClick={handleExportAll}>Export All Documentation</button>
            <div className="documentation-list">
                {documentations.map(doc => (
                    <div key={doc.id} className="documentation-entry">
                        {editMode ? (
                            <>
                                <SimpleMDE value={doc.content} onChange={(value) => handleDocChange(doc.id, value)} />
                                <button onClick={() => handleDelete(doc.id)}>Delete</button>
                            </>
                        ) : (
                            <ReactMarkdown>{doc.content}</ReactMarkdown>
                        )}
                    </div>
                ))}
            </div>
            {editMode && (
                <>
                    <div className="new-documentation-entry">
                        <h4>Add New Documentation</h4>
                        <SimpleMDE value={newDocContent} onChange={setNewDocContent} />
                        <input type="file" onChange={handleImport} />
                    </div>
                    <button onClick={handleSaveAll}>Save All Changes</button>
                </>
            )}
        </div>
    );
};





export default Wall;

