import { createBrowserRouter } from "react-router";
import { SplashScreen } from "@/app/components/splash-screen";
import { LoginScreen } from "@/app/components/login-screen";
import { SituationSelectorScreen } from "@/app/components/situation-selector-screen";
import { LikertQuestionsScreen } from "@/app/components/likert-questions-screen";
import { EmotionSelectionScreen } from "@/app/components/emotion-selection-screen";
import { ContentScreen } from "@/app/components/content-screen";
import { ResultsScreen } from "@/app/components/results-screen";
import { ForgotPasswordScreen } from "@/app/components/forgot-password-screen";
import { CheckEmailScreen } from "@/app/components/check-email-screen";
import { ResetPasswordScreen } from "@/app/components/reset-password-screen";
import { PasswordResetSuccessScreen } from "@/app/components/password-reset-success-screen";
import { AssessmentIntroScreen } from "@/app/components/assessment-intro-screen";
import { ArchetypeRevealScreen } from "@/app/components/archetype-reveal-screen";
import { AboutScreen } from "@/app/components/about-screen";
import { RequireAuth } from "@/app/components/require-auth";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: SplashScreen,
  },
  {
    path: "/login",
    Component: LoginScreen,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordScreen,
  },
  {
    path: "/forgot-password/check-email",
    Component: CheckEmailScreen,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordScreen,
  },
  {
    path: "/reset-password/success",
    Component: PasswordResetSuccessScreen,
  },
  {
    path: "/assessment-intro",
    element: <RequireAuth><AssessmentIntroScreen /></RequireAuth>,
  },
  {
    path: "/situation",
    element: <RequireAuth><SituationSelectorScreen /></RequireAuth>,
  },
  {
    path: "/questions",
    element: <RequireAuth><LikertQuestionsScreen /></RequireAuth>,
  },
  {
    path: "/archetype-reveal",
    element: <RequireAuth><ArchetypeRevealScreen /></RequireAuth>,
  },
  {
    path: "/emotions",
    element: <RequireAuth><EmotionSelectionScreen /></RequireAuth>,
  },
  {
    path: "/content",
    element: <RequireAuth><ContentScreen /></RequireAuth>,
  },
  {
    path: "/results",
    element: <RequireAuth><ResultsScreen /></RequireAuth>,
  },
  {
    path: "/about",
    element: <RequireAuth><AboutScreen /></RequireAuth>,
  },
]);