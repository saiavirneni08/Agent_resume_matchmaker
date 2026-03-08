import type { MatchResponse } from "@/components/MatchResult";

type ScanSession = {
  resumeFile: File | null;
  jobDescription: string;
  result: MatchResponse | null;
};

const scanSession: ScanSession = {
  resumeFile: null,
  jobDescription: "",
  result: null,
};

export function setScanInput(resumeFile: File, jobDescription: string) {
  scanSession.resumeFile = resumeFile;
  scanSession.jobDescription = jobDescription;
}

export function getScanInput() {
  return {
    resumeFile: scanSession.resumeFile,
    jobDescription: scanSession.jobDescription,
  };
}

export function setScanResult(result: MatchResponse) {
  scanSession.result = result;
}

export function getScanResult() {
  return scanSession.result;
}
