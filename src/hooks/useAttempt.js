import { useEffect } from "react";
import { startAttempt } from "../api/api";

export function useAttempt() {
  useEffect(() => {
    async function initAttempt() {
      const data = await startAttempt();
      localStorage.setItem("attemptId", data.attemptId);
      console.log("Attempt started:", data.attemptId);
    }

    initAttempt();
  }, []);
}
