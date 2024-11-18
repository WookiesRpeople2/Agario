import { createBrowserRouter } from "react-router-dom";
import { SignIn } from "@/pages/sign-in/sign-in";
import ProtectedRoute from "@/pages/protectedRoute";
import { SignUp } from "./pages/sign-up/sign-up";
import { Root } from "./pages/root/root";

export const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Root />,
      },
    ],
  },
]);
