import { createBrowserRouter } from "react-router-dom";
import IndividualLogin from "./pages/IndividualLogin";
import TeacherLogin from "./pages/TeacherLogin";
import InstitutionLogin from "./pages/InstitutionLogin";
import Dashboard from "./pages/Dashboard"; // ensure this matches the actual filename

export const router = createBrowserRouter([
  {
    path: "/",
    element: <IndividualLogin />,
  },
  {
    path: "/teacher",
    element: <TeacherLogin />,
  },
  {
    path: "/institution",
    element: <InstitutionLogin />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  }
]);