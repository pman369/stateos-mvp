import { create } from "zustand";
import { DriftEvent } from "../components/utils/db";

// Active Onboarding Flow Store
interface OnboardingDraft {
  step: number;
  baselineAudit: {
    energy: number;
    clarity: number;
    emotional_stability: number;
    identity_alignment: number;
    environmental_match: number;
  };
  recoveryEstimate: string; // single-select option
  identityAnchor: string;
}

// Active Protocol Timer Session Store
interface ActiveProtocolSession {
  protocolSlug: string | null;
  currentStepIndex: number;
  timeRemaining: number;
  isPlaying: boolean;
  preRating: number | null;
  postRating: number | null;
  activeDriftEvent: DriftEvent | null;
  completedSteps: number[];
}

// Active Diagnostic Flow Store
interface ActiveDiagnosticFlow {
  step: number; // 0 to 5
  answers: { question: string; answer: "yes" | "no" }[];
  currentDriftEvent: DriftEvent | null;
}

interface StateOSStore {
  // Onboarding
  onboarding: OnboardingDraft;
  setOnboardingStep: (step: number) => void;
  updateOnboardingAudit: (fields: Partial<OnboardingDraft["baselineAudit"]>) => void;
  setOnboardingRecoveryEstimate: (estimate: string) => void;
  setOnboardingIdentityAnchor: (anchor: string) => void;
  resetOnboarding: () => void;

  // Active Protocol Session
  activeSession: ActiveProtocolSession;
  startSession: (slug: string, preRating: number | null, driftEvent: DriftEvent | null) => void;
  setPlaying: (isPlaying: boolean) => void;
  tickTimer: () => void;
  setTimeRemaining: (seconds: number) => void;
  nextStep: (stepDuration: number) => void;
  prevStep: (stepDuration: number) => void;
  setStep: (index: number, stepDuration: number) => void;
  setPostRating: (rating: number) => void;
  endSession: () => void;

  // Diagnostic
  diagnostic: ActiveDiagnosticFlow;
  startDiagnostic: (driftEvent: DriftEvent | null) => void;
  answerQuestion: (question: string, answer: "yes" | "no") => void;
  setDiagnosticStep: (step: number) => void;
  resetDiagnostic: () => void;
}

const initialOnboarding: OnboardingDraft = {
  step: 0,
  baselineAudit: {
    energy: 3,
    clarity: 3,
    emotional_stability: 3,
    identity_alignment: 3,
    environmental_match: 3,
  },
  recoveryEstimate: "",
  identityAnchor: "",
};

const initialSession: ActiveProtocolSession = {
  protocolSlug: null,
  currentStepIndex: 0,
  timeRemaining: 0,
  isPlaying: false,
  preRating: null,
  postRating: null,
  activeDriftEvent: null,
  completedSteps: [],
};

const initialDiagnostic: ActiveDiagnosticFlow = {
  step: 0,
  answers: [],
  currentDriftEvent: null,
};

export const useStore = create<StateOSStore>((set, get) => ({
  // Onboarding Actions
  onboarding: initialOnboarding,
  setOnboardingStep: (step) =>
    set((state) => ({ onboarding: { ...state.onboarding, step } })),
  updateOnboardingAudit: (fields) =>
    set((state) => ({
      onboarding: {
        ...state.onboarding,
        baselineAudit: { ...state.onboarding.baselineAudit, ...fields },
      },
    })),
  setOnboardingRecoveryEstimate: (recoveryEstimate) =>
    set((state) => ({ onboarding: { ...state.onboarding, recoveryEstimate } })),
  setOnboardingIdentityAnchor: (identityAnchor) =>
    set((state) => ({ onboarding: { ...state.onboarding, identityAnchor } })),
  resetOnboarding: () => set({ onboarding: initialOnboarding }),

  // Active Protocol Actions
  activeSession: initialSession,
  startSession: (slug, preRating, driftEvent) =>
    set({
      activeSession: {
        protocolSlug: slug,
        currentStepIndex: 0,
        timeRemaining: 0, // Will be set by component on start
        isPlaying: true,
        preRating,
        postRating: null,
        activeDriftEvent: driftEvent,
        completedSteps: [],
      },
    }),
  setPlaying: (isPlaying) =>
    set((state) => ({
      activeSession: { ...state.activeSession, isPlaying },
    })),
  tickTimer: () =>
    set((state) => {
      const nextTime = Math.max(0, state.activeSession.timeRemaining - 1);
      return {
        activeSession: { ...state.activeSession, timeRemaining: nextTime },
      };
    }),
  setTimeRemaining: (timeRemaining) =>
    set((state) => ({
      activeSession: { ...state.activeSession, timeRemaining },
    })),
  nextStep: (stepDuration) =>
    set((state) => {
      const nextIndex = state.activeSession.currentStepIndex + 1;
      return {
        activeSession: {
          ...state.activeSession,
          currentStepIndex: nextIndex,
          timeRemaining: stepDuration,
          completedSteps: [...state.activeSession.completedSteps, state.activeSession.currentStepIndex],
        },
      };
    }),
  prevStep: (stepDuration) =>
    set((state) => {
      const prevIndex = Math.max(0, state.activeSession.currentStepIndex - 1);
      return {
        activeSession: {
          ...state.activeSession,
          currentStepIndex: prevIndex,
          timeRemaining: stepDuration,
          completedSteps: state.activeSession.completedSteps.filter(
            (idx) => idx !== prevIndex
          ),
        },
      };
    }),
  setStep: (index, stepDuration) =>
    set((state) => ({
      activeSession: {
        ...state.activeSession,
        currentStepIndex: index,
        timeRemaining: stepDuration,
      },
    })),
  setPostRating: (postRating) =>
    set((state) => ({
      activeSession: { ...state.activeSession, postRating },
    })),
  endSession: () => set({ activeSession: initialSession }),

  // Diagnostic Actions
  diagnostic: initialDiagnostic,
  startDiagnostic: (driftEvent) =>
    set({
      diagnostic: {
        step: 0,
        answers: [],
        currentDriftEvent: driftEvent,
      },
    }),
  answerQuestion: (question, answer) =>
    set((state) => {
      const updatedAnswers = [...state.diagnostic.answers, { question, answer }];
      const nextStep = state.diagnostic.step + 1;
      return {
        diagnostic: {
          ...state.diagnostic,
          step: nextStep,
          answers: updatedAnswers,
        },
      };
    }),
  setDiagnosticStep: (step) =>
    set((state) => ({ diagnostic: { ...state.diagnostic, step } })),
  resetDiagnostic: () => set({ diagnostic: initialDiagnostic }),
}));
