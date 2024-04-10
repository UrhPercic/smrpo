import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getData, addData } from "../../db/realtimeDatabase";
import bcrypt from "bcryptjs";
import "./diagram-burn-down.css";

const DiagramBurnDown = () => {
  return (
    <div className="container">
      <div className="content"></div>
    </div>
  );
};

export default DiagramBurnDown;
