import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./diagram-burn-down.css";

const DiagramBurnDown = () => {
  const options = {
    title: {
      text: "Sprint Burn-Down Chart",
    },
    xAxis: {
      categories: [
        "Day 1",
        "Day 2",
        "Day 3",
        "Day 4",
        "Day 5",
        "Day 6",
        "Day 7",
      ],
    },
    yAxis: {
      title: {
        text: "Remaining Effort",
      },
    },
    series: [
      {
        name: "Ideal Burn",
        data: [100, 85, 70, 55, 40, 25, 10],
        dashStyle: "Dash",
      },
      {
        name: "Actual Burn",
        data: [100, 90, 80, 65, 55, 45, 30],
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
