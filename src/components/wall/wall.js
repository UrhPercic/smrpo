import React, {useState, useEffect} from "react";
import {addData, getData} from "../../db/realtimeDatabase";
import "./wall.css";

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
                {activeTab === 'DailyScrum' && <DailyScrum addPost={addPost} posts={posts} />}
                {activeTab === 'Documentation' && <Documentation />}
            </div>
        </div>
    );
};
const DailyScrum = ({ addPost, posts }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState({

    });
    const [postContent, setPostContent] = useState('');

    const handleChange = (e) => {
        setMessage(e.target.value);
    };
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const fetchedMessages = await getData("/dailyScrumMessages");
                const formattedMessages = Object.keys(fetchedMessages).map((key) => {
                    return {
                        message: fetchedMessages[key].message,
                        username: fetchedMessages[key].username,
                    };
                });
                setMessages(formattedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newMessage = {
            username: currentUser.username || 'testUser',
            message: message,
            timestamp: new Date().toISOString()
        };

        try {
            const messageRef = await addData("/dailyScrumMessages", newMessage);
            setMessages([...messages, { ...newMessage, id: messageRef.name }]);
            setMessage('');
        } catch (error) {
            console.error("Error adding new message:", error);
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
                            Post
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
const Documentation = () => (
    <div>
        <h3>Documentation</h3>
    </div>
);

export default Wall;

