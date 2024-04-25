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
    dates: [],
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

      let totalPlanned = 0;
      let totalActual = 0;

      const userStories = Object.entries(userStoriesData)
        .map(([id, userStory]) => ({ id, ...userStory }))
        .filter((userStory) => userStory.projectId === projectId);

      userStories.forEach((userStory) => {
        const tasks = Object.entries(tasksData)
          .map(([taskId, task]) => ({ id: taskId, ...task }))
          .filter((task) => task.user_story_id === userStory.id);

        userStory.tasks = tasks;

        userStory.planned = tasks.reduce(
          (sum, task) => sum + (parseInt(task.projected_time) || 0),
          0
        );
        userStory.actual =
          tasks.reduce((sum, task) => {
            const logs = Object.values(timeLogsData).filter(
              (log) => log.task_id === task.id
            );
            const time = logs.reduce((sum, log) => {
              const parts = log.time_spent.split(":");
              return (
                sum +
                (parseInt(parts[0]) * 3600 +
                  parseInt(parts[1]) * 60 +
                  parseInt(parts[2]))
              );
            }, 0);
            return sum + time;
          }, 0) / 3600; // Convert to hours

        totalPlanned += userStory.planned;
        totalActual += userStory.actual;
      });

      // Generate 15 random dates within the current month
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      let dates = new Set();
      while (dates.size < 15) {
        const day =
          Math.floor(
            Math.random() * new Date(currentYear, currentMonth + 1, 0).getDate()
          ) + 1;
        dates.add(
          new Date(currentYear, currentMonth, day).toISOString().slice(0, 10)
        );
      }
      const sortedDates = Array.from(dates).sort();

      // Distribute total times across the dates
      const plannedPerDate = totalPlanned / 15;
      const actualPerDate = totalActual / 15;
      const planned = sortedDates.map(
        (_, index) => totalPlanned - plannedPerDate * index
      );
      // Calculate the remaining actual work for each date
      const actualRemaining = sortedDates.map((_, index) => {
        // Total actual work done until this date
        const actualWorkDone = actualPerDate * index;
        // Remaining work is the initial total planned minus the actual work done
        return totalPlanned - actualWorkDone;
      });

      setChartData({
        planned: planned.map(Math.round),
        actual: actualRemaining.map((value) => Math.round(value * 100) / 100),
        dates: sortedDates,
      });
    };

    fetchData();
  }, [projectId]);

  const options = {
    title: { text: "Project Burn-Down Chart" },
    xAxis: { categories: chartData.dates },
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
