import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getData, addData } from "../../db/realtimeDatabase";
import "./edit-task.css";

const EditTask = () => {
  const navigate = useNavigate();

  useEffect(() => {});

  const handleSubmit = async (event) => {};

  return (
    <div className="container">
      <div className="content"></div>
    </div>
  );
};

export default EditTask;
