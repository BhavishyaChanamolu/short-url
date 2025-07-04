import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./login" 
import LandingPage from "./Landingpage";

const Main = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login mode="login" />} />
        <Route path="/signup" element={<Login mode="signup" />} />
        <Route path="/home" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Main;
