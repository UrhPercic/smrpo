import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { getData } from "../../db/realtimeDatabase";
import { useParams } from "react-router-dom";
import "./diagram-burn-down.css";

const DiagramBurnDown = () => {
  const { projectId } = useParams();
  const [chartData, setChartData] = useState({
    planned: [],
    actual: [],
    userStories: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const [userStoriesData, tasksData, timeLogsData] = await Promise.all([
        getData("/userStory"),
        getData("/tasks"),
        getData("/time_log"),
      ]);

      if (!userStoriesData || !tasksData || !timeLogsData) {
        console.error("Failed to fetch data");
        return;
      }

      const userStories = Object.entries(userStoriesData)
        .map(([id, userStory]) => ({ id, ...userStory }))
        .filter((userStory) => userStory.projectId === projectId);

      const userStoriesWithTasks = userStories.map((userStory) => ({
        ...userStory,
        tasks: Object.entries(tasksData)
          .map(([taskId, task]) => ({ id: taskId, ...task }))
          .filter((task) => task.user_story_id === userStory.id),
      }));

      const chartData = userStoriesWithTasks.map((userStory) => {
        const plannedTime = userStory.tasks.reduce((total, task) => {
          return total + (parseInt(task.projected_time) || 0);
        }, 0);

        const actualTime = userStory.tasks.reduce((total, task) => {
          const taskLogs = Object.values(timeLogsData).filter(
            (log) => log.task_id === task.id
          );
          return (
            total +
            taskLogs.reduce((taskTotal, log) => {
              const parts = log.time_spent.split(":");
              return (
                taskTotal +
                (parseInt(parts[0]) * 3600 +
                  parseInt(parts[1]) * 60 +
                  parseInt(parts[2]))
              );
            }, 0)
          );
        }, 0);

        return {
          userStoryId: userStory.id,
          name: userStory.userStoryName,
          planned: plannedTime,
          actual: actualTime / 3600,
        };
      });

      setChartData({
        planned: chartData.map((data) => data.planned),
        actual: chartData.map((data) => Math.round(data.actual * 100) / 100),
        userStories: chartData.map((data) => data.name),
      });
    };

    fetchData();
  }, [projectId]);

  console.log(chartData);
  const options = {
    title: { text: "User Story Task Burn-Down Chart" },
    xAxis: { categories: chartData.userStories },
    yAxis: { title: { text: "Hours of Effort" } },
    series: [
      {
        name: "Planned Time",
        data: chartData.planned,
      },
      {
        name: "Actual Time Spent",
        data: chartData.actual,
      },
    ],
  };

  return (
    <div className="container">
      <div className="content">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

export default DiagramBurnDown;
