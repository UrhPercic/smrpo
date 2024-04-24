import React, {useState, useEffect, Suspense} from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import "./handle-sprint-stories.css";
import { updateData } from "../../../db/realtimeDatabase";


const HandleSprintStories = () => {
    const { projectId, sprintId } = useParams();
    const [storyArray, setStoryArray] = useState([]);
    const [selectedStories, setSelectedStories] = useState([]);
    const [allStories, setAllStories] = useState([]);
    const [unselectedStories, setUnselectedStories] = useState([]);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        comment: ""
    })



    useEffect(() => {
        const fetchStories = async () => {
            //setIsLoading(true); // Start loading
            fetch(
                `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/userStory.json`
            )
                .then((response) => response.json())
                .then((data) => {
                    const storiesArray = Object.keys(data || {})
                        .map((key) => ({
                            ...data[key],
                            id: key,
                        }))
                        .filter((story) => story.projectId === projectId)
                        .filter((story) => story.status === "Unrealised_Active");
                    setStoryArray(storiesArray);
                    setAllStories(storiesArray.map((story) => story.id));
                    //setIsLoading(false); // Data loaded
                })
                .catch((error) => {
                    console.error("Failed to fetch stories:", error);
                    setStoryArray([]); // Fallback in case of error
                    //setIsLoading(false); // Data loading failed
                });
        };

        fetchStories();

    })

    const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
        });
      };

    const handleToggle = (storyId, isChecked) => {
        if (isChecked) {
          setSelectedStories([...selectedStories, storyId]);
        } else {
          setSelectedStories(selectedStories.filter((id) => id !== storyId));
        }
      };

    const handleSubmit = async () =>  {

        const temp = allStories.filter(n => !selectedStories.includes(n));

        console.log("Selected Stories:", selectedStories);
        console.log("Unselected Stories:", temp);

        const updateSelectedDataSet = {
            status: "Realised",
        };

        const updateUnselectedDataSet = {
            status: "Unrealised",
            commentOnReturn: formData.comment
        };

        await Promise.all(selectedStories.map(async (element) => {
            try{
                updateData(`/userStory/${element}`, updateSelectedDataSet);
            }catch (error){
                console.error("Error submitting update to selected user stories:", error);
                alert("An error occurred. Please try again.");
            }
        }))

        await Promise.all(temp.map(async (element) => {
            try{
                updateData(`/userStory/${element}`, updateUnselectedDataSet);
            }catch (error){
                console.error("Error submitting update to selected user stories:", error);
                alert("An error occurred. Please try again.");
            }
        }))


        const updateSprintDataSet = {
            storiesHandled: true,
        };
        await updateData(`/sprints/${sprintId}`, updateSprintDataSet);

        navigate(`/project/${projectId}`)


        // Here you can perform further actions with the selected and unselected stories
    };

    return (
        <div className="story-list">
          {storyArray.map((storyItem) => (
            <div key={storyItem.id} className="story-card">
              <h4>{storyItem.userStoryName}</h4>
                <div className="description-preview">
                    <p>{storyItem.description}</p>
                </div>

                <div className="test">
                    {storyItem.test.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
                <p>
                    Priority: <span className="priority">{storyItem.priority}</span>
                    Business Value: <span
                    className="businessValue">{storyItem.businessValue}</span>
                </p>
            <div className="switchbox">
                <hr/>
                <p><b>Was the story realised?</b></p>
                <label className="switch">
                    <input type="checkbox"
                    onChange={(e) => handleToggle(storyItem.id, e.target.checked)}
                    />
                    <span className="slider round"></span>
                </label>
                {!selectedStories.includes(storyItem.id) &&
                    <input
                        className="comment-input"
                        type="text"
                        name="comment"
                        onChange={handleChange}
                    ></input>
                }
            </div>
            
            </div>
          ))}
          <button onClick={handleSubmit} className="button">Submit</button>
        </div>
      );
}



export default HandleSprintStories;