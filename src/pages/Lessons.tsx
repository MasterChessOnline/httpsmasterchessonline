import { Navigate } from "react-router-dom";

// 1-on-1 marketplace was removed — all coaching is now inside Master Courses.
const Lessons = () => <Navigate to="/learn" replace />;

export default Lessons;
