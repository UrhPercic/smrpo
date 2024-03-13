import React from "react";
import { Outlet } from "react-router-dom";
import TabBar from "./components/tab-bar/tab-bar";

const Layout = () => {
  return (
    <>
      <TabBar />
      <Outlet />
    </>
  );
};

export default Layout;
