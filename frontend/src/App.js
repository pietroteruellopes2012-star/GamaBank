import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Benefits from "@/pages/Benefits";
import Activities from "@/pages/Activities";
import Classes from "@/pages/Classes";
import StudentDetail from "@/pages/StudentDetail";
import AdminPanel from "@/pages/AdminPanel";

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="benefits" element={<Benefits />} />
            <Route path="activities" element={<Activities />} />
            <Route path="classes" element={<Classes />} />
            <Route path="student/:studentId" element={<StudentDetail />} />
          </Route>
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;