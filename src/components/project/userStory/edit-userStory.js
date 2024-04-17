import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData, updateData } from '../../../db/realtimeDatabase';

const EditUserStory = () => {
    const { projectId, storyId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userStoryName: '',
        description: '',
        test: '',
        priority: '',
        businessValue: '',
        status: ''
    });

    useEffect(() => {
        const fetchStory = async () => {
            const storyData = await getData(`/userStory/${storyId}`);
            if (storyData) {
                setFormData({ ...storyData });
            }
        };
        fetchStory();
    }, [storyId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateData(`/userStory/${storyId}`, formData);
        alert('Story updated successfully');
        navigate(`/projects/${projectId}`);
    };

    return (
        <div className="container">
            <h1>Edit User Story</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Story Name:</label>
                    <input type="text" className="form-control" name="userStoryName" value={formData.userStoryName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} required></textarea>
                </div>
                <div className="form-group">
                    <label>Test:</label>
                    <input type="text" className="form-control" name="test" value={formData.test} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Priority:</label>
                    <select className="form-control" name="priority" value={formData.priority} onChange={handleChange} required>
                        <option>Must Have</option>
                        <option>Could Have</option>
                        <option>Should Have</option>
                        <option>Won't Have this time</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Business Value:</label>
                    <select className="form-control" name="businessValue" value={formData.businessValue} onChange={handleChange} required>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Status:</label>
                    <select className="form-control" name="status" value={formData.status} onChange={handleChange} required>
                        <option>Product Backlog</option>
                        <option>Sprint Backlog</option>
                        <option>In Progress</option>
                        <option>Testing</option>
                        <option>Done</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Update Story</button>
            </form>
        </div>
    );
};

export default EditUserStory;
