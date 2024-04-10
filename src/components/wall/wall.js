import React, {useState, useEffect} from "react";
import {addData, getData} from "../../db/realtimeDatabase";
import "./wall.css";
import {useParams} from "react-router-dom";

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

    const handleChange = (e) => {
        setMessage(e.target.value);
    };
    useEffect(() => {
        const loggedInUserId = localStorage.getItem("userId");
        if (loggedInUserId) {
            const fetchUserDetails = async () => {
                try {
                    const user = await getData(`/users/${loggedInUserId}`);
                    setCurrentUser({username: user.username});
                } catch (error) {
                    console.error("Error fetching user details:", error);
                }
            };
            fetchUserDetails();
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
                            <strong>{post.username}</strong>: {post.message}
                            <div className="comment-section">
                                <input
                                    type="text"
                                    value={commentTexts[post.id] || ''}
                                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                    placeholder="Write a comment..."
                                />
                                <button onClick={() => handleSubmitComment(post.id)}>Comment</button>
                                {/* Displaying comments here */}
                                <div className="comments-display">
                                    {post.comments && Object.entries(post.comments).map(([commentId, comment]) => (
                                        <div key={commentId} className="comment">
                                            <strong>{comment.username}</strong>: {comment.text}
                                        </div>
                                    ))}

                                </div>
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
    const [docContent, setDocContent] = useState("");
    const [documentations, setDocumentations] = useState([]);

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

    useEffect(() => {
        fetchDocumentation();
    }, [projectId]);

    const handleDocChange = (e) => {
        setDocContent(e.target.value);
    };

    const handleSave = async () => {
        await addData(`/projects/${projectId}/documentation`, { content: docContent });
        alert("Documentation saved.");
        setDocContent("");
        await fetchDocumentation();
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                setDocContent(e.target.result);
            };
            reader.readAsText(file);
        }
    };

    const handleExport = () => {
        const element = document.createElement("a");
        const file = new Blob([docContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "projectDocumentation.txt";
        document.body.appendChild(element); // Required for this to work in Firefox
        element.click();
    };

    return (
        <div>
            <h3>Documentation</h3>
            <div className="documentation-list">
                {documentations.map(doc => (
                    <div key={doc.id} className="documentation-entry">
                        <p>{doc.content}</p>
                    </div>
                ))}
            </div>
            <h4>Add New Documentation</h4>
            <textarea value={docContent} onChange={handleDocChange} rows="5" cols="50"></textarea>
            <div>
                <button onClick={handleSave}>Save New Documentation</button>
                <input type="file" onChange={handleImport} />
                <button onClick={handleExport}>Export</button>
            </div>
        </div>
    );
};




export default Wall;

