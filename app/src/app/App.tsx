import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import { GlobalSettingsProvider } from "@/lib/GlobalSettingsContext";

export default function App() {
  return (
    <GlobalSettingsProvider>
      <RouterProvider router={router} />
    </GlobalSettingsProvider>
  );
}
