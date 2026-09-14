"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  FilePlus2,
  Orbit,
  Paperclip,
  Rocket,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type {
  ConversationTurn,
  DeliverableSpecification,
  MissionTurnResult,
  VoiceTranscriptMetadata,
} from "@/lib/mission-control/contracts";
import { VoiceControl } from "./VoiceControl";

const STORAGE_KEY = "apollo:mission-control:v1";
const opening: ConversationTurn = {
  id: "opening",
  role: "apollo",
  content:
    "Tell me what you need to accomplish. Speak naturally, type, or add the files you already have. I will identify the right deliverable, surface consequential gaps, and prepare the mission brief.",
  createdAt: "",
};

export function MissionControl() {
  const [turns, setTurns] = useState<ConversationTurn[]>([opening]);
  const [specification, setSpecification] =
    useState<DeliverableSpecification | null>(null);
  const [draft, setDraft] = useState("");
  const [voiceMetadata, setVoiceMetadata] = useState<VoiceTranscriptMetadata | null>(null);
  const [readiness, setReadiness] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [specificationVersion, setSpecificationVersion] = useState(0);
  const [working, setWorking] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<number | null>(null);
  const [artifactUrl, setArtifactUrl] = useState<string | null>(null);
  const [revision, setRevision] = useState("");
  const [decisionAnswers, setDecisionAnswers] = useState<
    Record<string, string>
  >({});
  const [operatorInvolvement, setOperatorInvolvement] = useState(50);
  const [launchCountdown, setLaunchCountdown] = useState<number | "LIFTOFF" | null>(null);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [regenerateCountdown, setRegenerateCountdown] = useState<number | "LIFTOFF" | null>(null);
  const [launchPromptDismissed, setLaunchPromptDismissed] = useState(false);
  const [reviewAcknowledged, setReviewAcknowledged] = useState(false);
  const [reviewScrolled, setReviewScrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const notificationRequestedRef = useRef<string | null>(null);

  const restoreConversation = useCallback(async (id: string) => {
    const response = await fetch(
      `/api/mission-control/conversation?id=${encodeURIComponent(id)}`,
    );
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(
        body?.error ?? "The durable mission record could not be restored.",
      );
    }
    const restored = (await response.json()) as {
      turns: ConversationTurn[];
      specification: DeliverableSpecification;
      readiness: number;
      specification_version: number;
      job?: {
        id: string;
        state: string;
        progress_percent?: number;
        artifact_url: string | null;
      } | null;
    };
    setConversationId(id);
    setTurns(restored.turns.length ? restored.turns : [opening]);
    setSpecification(restored.specification);
    setOperatorInvolvement(
      restored.specification.aura.operator_involvement ?? 50,
    );
    setReadiness(restored.readiness);
    setSpecificationVersion(restored.specification_version);
    setJobId(restored.job?.id ?? null);
    setJobState(restored.job?.state ?? null);
    setJobProgress(restored.job?.progress_percent ?? null);
    setArtifactUrl(restored.job?.artifact_url ?? null);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requestedMission = new URLSearchParams(window.location.search).get(
        "mission",
      );
      const saved = window.localStorage.getItem(STORAGE_KEY);
      let cached: {
        turns: ConversationTurn[];
        specification: DeliverableSpecification | null;
        readiness: number;
        conversationId?: string | null;
        specificationVersion?: number;
        jobId?: string | null;
        jobState?: string | null;
        jobProgress?: number | null;
        artifactUrl?: string | null;
        decisionAnswers?: Record<string, string>;
      } | null = null;
      if (saved) {
        try {
          cached = JSON.parse(saved);
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      const applyCached = () => {
        if (!cached) return;
        setTurns(cached.turns.length ? cached.turns : [opening]);
        setSpecification(cached.specification);
        setOperatorInvolvement(
          cached.specification?.aura.operator_involvement ?? 50,
        );
        setReadiness(cached.readiness);
        setConversationId(cached.conversationId ?? null);
        setSpecificationVersion(cached.specificationVersion ?? 0);
        setJobId(cached.jobId ?? null);
        setJobState(cached.jobState ?? null);
        setJobProgress(cached.jobProgress ?? null);
        setArtifactUrl(cached.artifactUrl ?? null);
        setDecisionAnswers(cached.decisionAnswers ?? {});
      };
      if (requestedMission) {
        void restoreConversation(requestedMission)
          .catch((cause) => {
            applyCached();
            setError(
              cause instanceof Error
                ? `${cause.message} ${cached ? "Your locally cached mission remains available." : ""}`.trim()
                : "The durable mission record could not be restored.",
            );
          })
          .finally(() => setHydrated(true));
        return;
      }
      applyCached();
      if (cached?.conversationId) {
        void restoreConversation(cached.conversationId)
          .catch(() =>
            setError(
              "APOLLO could not refresh the durable record. The locally cached mission remains available.",
            ),
          )
          .finally(() => setHydrated(true));
      } else setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [restoreConversation]);

  useEffect(() => {
    if (!hydrated || !conversationId) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("mission") === conversationId) return;
    url.searchParams.set("mission", conversationId);
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [hydrated, conversationId]);

  useEffect(() => {
    setReviewAcknowledged(false);
    setReviewScrolled(false);
  }, [specificationVersion]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        turns,
        specification,
        readiness,
        conversationId,
        specificationVersion,
        jobId,
        jobState,
        jobProgress,
        artifactUrl,
        decisionAnswers,
      }),
    );
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [
    hydrated,
    turns,
    specification,
    readiness,
    conversationId,
    specificationVersion,
    jobId,
    jobState,
    jobProgress,
    artifactUrl,
    decisionAnswers,
  ]);

  useEffect(() => {
    if (
      !jobId ||
      ["delivered", "failed", "blocked", "cancelled"].includes(jobState ?? "")
    )
      return;
    const timer = window.setInterval(async () => {
      const response = await fetch(
        `/api/mission-control/job?id=${encodeURIComponent(jobId)}`,
      );
      if (!response.ok) return;
      const result = (await response.json()) as {
        state?: string;
        progress_percent?: number;
        artifacts?: Array<{ web_view_url?: string }>;
      };
      setJobState(result.state ?? null);
      setJobProgress(result.progress_percent ?? null);
      setArtifactUrl(result.artifacts?.[0]?.web_view_url ?? null);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [jobId, jobState]);

  useEffect(() => {
    if (!jobId || !["delivered", "failed"].includes(jobState ?? "")) return;
    if (notificationRequestedRef.current === jobId) return;
    notificationRequestedRef.current = jobId;
    void fetch("/api/mission-control/notify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ job_id: jobId }),
    });
  }, [jobId, jobState]);

  useEffect(() => {
    const editingMission = new URLSearchParams(window.location.search).get("edit") === "1";
    if (editingMission || jobState !== "delivered" || !conversationId || window.location.pathname !== "/new-mission") return;
    window.location.replace(`/telemetry?mission=${encodeURIComponent(conversationId)}`);
  }, [conversationId, jobState]);

  const readinessLabel = jobState === "delivered"
    ? "Mission complete"
    : jobState && !["failed", "blocked", "cancelled"].includes(jobState)
      ? "Mission executing"
      : readiness >= 75
      ? "Brief ready"
      : readiness >= 50
        ? "Calibrating"
        : readiness
          ? "Discovery"
          : "Awaiting intent";
  const displayedProgress = jobState === "delivered"
    ? 100
    : jobState && !["failed", "blocked", "cancelled"].includes(jobState)
      ? (jobProgress ?? readiness)
      : readiness;
  const facts = specification?.content.facts ?? [];
  const questions = specification?.content.open_questions ?? [];
  const title =
    specification?.artifact.recommended_type.replace(/-/g, " ") ??
    "Mission strategy pending";
  const audience =
    specification?.audience.primary.join(", ") || "Not yet confirmed";
  const formats =
    specification?.artifact.required_formats.join(", ").toUpperCase() ||
    "Not yet confirmed";
  const aura = useMemo(
    () =>
      specification
        ? (Object.entries(specification.aura).filter(
            ([key, value]) =>
              key !== "operator_involvement" && typeof value === "number",
          ) as Array<[string, number]>)
        : [],
    [specification],
  );
  const driveConnectHref = `/api/integrations/google-drive?action=connect&returnTo=${encodeURIComponent(conversationId ? `/new-mission?mission=${conversationId}` : "/new-mission")}`;
  function correctDeliverableType() {
    setDraft(`The intended deliverable is not ${title}. The intended deliverable is `);
    window.setTimeout(() => composerRef.current?.focus(), 0);
  }

  async function submit(override?: string) {
    const message = (typeof override === "string" ? override : draft).trim();
    if (!message || working) return;
    const submittedVoiceMetadata = typeof override === "string" ? null : voiceMetadata;
    if (submittedVoiceMetadata?.criticalReviewRequired && !submittedVoiceMetadata.criticalReviewConfirmed) {
      setError("Review and confirm the voice transcript before sending critical names, dates, amounts, addresses, or obligations.");
      return;
    }
    setWorking(true);
    setError(null);
    setDraft("");
    setTurns((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        createdAt: new Date().toISOString(),
        inputChannel: submittedVoiceMetadata?.inputChannel ?? "text",
        transcriptionConfidence: submittedVoiceMetadata?.confidence ?? null,
        criticalReviewRequired: submittedVoiceMetadata?.criticalReviewRequired ?? false,
        criticalReviewConfirmed: submittedVoiceMetadata?.criticalReviewConfirmed ?? false,
      },
    ]);
    try {
      const response = await fetch("/api/mission-control/interpret", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          specification,
          conversation_id: conversationId,
          voice_transcript: submittedVoiceMetadata,
        }),
      });
      if (!response.ok)
        throw new Error(
          response.status === 401
            ? "Your session has expired. Sign in again to continue."
            : "Mission interpretation is temporarily unavailable.",
        );
      const result = (await response.json()) as MissionTurnResult;
      const content = [result.acknowledgement, result.question]
        .filter(Boolean)
        .join("\n\n");
      setTurns((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "apollo",
          content,
          reason: result.question_reason,
          createdAt: new Date().toISOString(),
        },
      ]);
      setSpecification(result.specification);
      setVoiceMetadata(null);
      if (result.readiness >= 75 && result.specification.content.open_questions.length === 0)
        setLaunchPromptDismissed(false);
      setOperatorInvolvement(
        result.specification.aura.operator_involvement ?? 50,
      );
      setReadiness(result.readiness);
      setConversationId(result.conversation_id ?? conversationId);
      setSpecificationVersion(
        result.specification_version ?? specificationVersion + 1,
      );
      if (jobState === "delivered") {
        setJobId(null);
        setJobState(null);
        setJobProgress(null);
        setArtifactUrl(null);
      }
      setDecisionAnswers((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([question]) =>
            result.specification.content.open_questions.includes(question),
          ),
        ),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to continue the mission.",
      );
      setDraft(message);
    } finally {
      setWorking(false);
    }
  }

  function acceptVoiceTranscript(text: string, metadata: VoiceTranscriptMetadata) {
    setDraft((current) => [current.trim(), text].filter(Boolean).join(" "));
    setVoiceMetadata((current) => current ? {
      inputChannel: "voice",
      confidence: current.confidence === null ? metadata.confidence : metadata.confidence === null ? current.confidence : Math.min(current.confidence, metadata.confidence),
      criticalReviewRequired: current.criticalReviewRequired || metadata.criticalReviewRequired,
      criticalReviewConfirmed: !metadata.criticalReviewRequired && current.criticalReviewConfirmed && metadata.criticalReviewConfirmed,
    } : metadata);
  }

  function resetMission() {
    setTurns([opening]);
    setVoiceMetadata(null);
    setSpecification(null);
    setReadiness(0);
    setConversationId(null);
    setSpecificationVersion(0);
    setJobId(null);
    setJobState(null);
    setJobProgress(null);
    setArtifactUrl(null);
    setDraft("");
    setDecisionAnswers({});
    setOperatorInvolvement(50);
    setLaunchPromptDismissed(false);
    setReviewAcknowledged(false);
    setReviewScrolled(false);
    setError(null);
    window.localStorage.removeItem(STORAGE_KEY);
    window.history.replaceState(window.history.state, "", "/new-mission");
  }

  function submitDecisionAnswers(useRecommendations: boolean) {
    const answered = questions.flatMap((question, index) =>
      decisionAnswers[question]?.trim()
        ? [
            `${index + 1}. ${question}\nAnswer: ${decisionAnswers[question].trim()}`,
          ]
        : [],
    );
    const remaining = questions.filter(
      (question) => !decisionAnswers[question]?.trim(),
    );
    if (!answered.length && !useRecommendations) return;
    const recommendationDirective = useRecommendations
      ? `Use your expert recommendations for the ${remaining.length ? "remaining" : "answered"} decisions wherever they can be responsibly inferred. Clearly mark recommendations as assumptions. Do not invent names, credentials, evidence, prices, dates, legal terms, or client-specific facts. Leave only decisions that genuinely require my input unresolved.${remaining.length ? `\n\nRemaining decisions:\n${remaining.map((question, index) => `${index + 1}. ${question}`).join("\n")}` : ""}`
      : "";
    void submit(
      [
        answered.length
          ? `My answers to the mission checkpoint:\n\n${answered.join("\n\n")}`
          : "",
        recommendationDirective,
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
  }

  async function applyOperatorInvolvement() {
    if (
      !specification ||
      working ||
      operatorInvolvement === (specification.aura.operator_involvement ?? 50)
    )
      return;
    const mode =
      operatorInvolvement <= 33
        ? "Fully Autonomous"
        : operatorInvolvement <= 66
          ? "Collaborative"
          : "Directed";
    const message = `Operator involvement override: ${operatorInvolvement}% (${mode}). Apply this control policy to the active mission without treating it as an answer to any unresolved factual question.`;
    setWorking(true);
    setError(null);
    setTurns((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: `Set mission control to ${mode} · ${operatorInvolvement}% operator involvement.`,
        createdAt: new Date().toISOString(),
      },
    ]);
    try {
      const response = await fetch("/api/mission-control/interpret", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          specification,
          conversation_id: conversationId,
          aura: { operator_involvement: operatorInvolvement },
        }),
      });
      const result = (await response.json()) as MissionTurnResult & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(
          result.error ?? "Mission control policy could not be updated.",
        );
      setTurns((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "apollo",
          content: [result.acknowledgement, result.question]
            .filter(Boolean)
            .join("\n\n"),
          reason: result.question_reason,
          createdAt: new Date().toISOString(),
        },
      ]);
      setSpecification(result.specification);
      setOperatorInvolvement(
        result.specification.aura.operator_involvement ?? 50,
      );
      setReadiness(result.readiness);
      setConversationId(result.conversation_id ?? conversationId);
      setSpecificationVersion(
        result.specification_version ?? specificationVersion + 1,
      );
      setDecisionAnswers((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([question]) =>
            result.specification.content.open_questions.includes(question),
          ),
        ),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Mission control policy could not be updated.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function attachEvidence(files: FileList | null) {
    if (!files?.length) return;
    if (!conversationId || !specification) {
      setError(
        "Describe the mission first, then attach evidence to its durable record.",
      );
      return;
    }
    setWorking(true);
    setError(null);
    const additions: Array<{
      id: string;
      name: string;
      status: "pending" | "verified" | "conflict" | "failed";
    }> = [];
    const rejected: string[] = [];
    let finalSpecification = specification;
    let finalVersion = specificationVersion;
    let finalReadiness = readiness;
    try {
      for (const file of [...files]) {
        try {
          const form = new FormData();
          form.set("conversation_id", conversationId);
          form.set("file", file);
          const response = await fetch("/api/mission-control/evidence", {
            method: "POST",
            body: form,
          });
          const uploaded = (await response.json()) as {
            id?: string;
            name?: string;
            status?: "pending" | "verified" | "conflict" | "failed";
            facts?: DeliverableSpecification["content"]["facts"];
            specification?: DeliverableSpecification;
            specification_version?: number;
            readiness?: number;
            error?: string;
          };
          if (
            !response.ok ||
            !uploaded.id ||
            !uploaded.name ||
            !uploaded.status
          )
            throw new Error(uploaded.error ?? "upload rejected");
          additions.push({
            id: uploaded.id,
            name: uploaded.name,
            status: uploaded.status,
          });
          if (uploaded.specification)
            finalSpecification = uploaded.specification;
          if (uploaded.specification_version)
            finalVersion = uploaded.specification_version;
          if (typeof uploaded.readiness === "number")
            finalReadiness = uploaded.readiness;
        } catch (cause) {
          rejected.push(
            `${file.name}: ${cause instanceof Error ? cause.message : "upload rejected"}`,
          );
        }
      }
      if (additions.length) {
        setSpecification(finalSpecification);
        setOperatorInvolvement(
          finalSpecification.aura.operator_involvement ?? 50,
        );
        setSpecificationVersion(finalVersion);
        setReadiness(finalReadiness);
      }
      const nonExecutable = additions.filter(
        (item) => item.status !== "verified",
      );
      const summary = [
        `${additions.length} evidence file${additions.length === 1 ? "" : "s"} secured in the durable record.`,
      ];
      if (nonExecutable.length)
        summary.push(
          `${nonExecutable.length} require resolution before execution.`,
        );
      if (rejected.length)
        summary.push(`${rejected.length} rejected: ${rejected.join("; ")}.`);
      setTurns((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "apollo",
          content: summary.join(" "),
          createdAt: new Date().toISOString(),
        },
      ]);
      if (rejected.length)
        setError(
          "Some files were rejected. Secured evidence and specification progress were preserved.",
        );
    } finally {
      setWorking(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function approveBrief() {
    const alreadyApproved = specification?.approval.status === "approved";
    if (
      !specification ||
      readiness < 75 ||
      (!alreadyApproved && questions.length > 0)
    )
      return;
    setWorking(true);
    setError(null);
    try {
      if (conversationId) {
        const acceptedItems = alreadyApproved
          ? (specification.approval.unresolved_items_accepted ?? [])
          : [];
        const response = await fetch("/api/mission-control/approve", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversationId,
            version: specificationVersion,
            unresolved_items_accepted: acceptedItems,
          }),
        });
        const result = (await response.json()) as {
          execution?: {
            state?: string;
            missing?: Array<{ label?: string } | string>;
            job_id?: string;
          };
          error?: string;
        };
        if (!response.ok)
          throw new Error(
            result.error ??
              "The mission brief could not be locked. Refresh and try again.",
          );
        if (result.execution?.state === "blocked") {
          const gaps = (result.execution.missing ?? [])
            .map((item) => (typeof item === "string" ? item : item.label))
            .filter(Boolean);
          setTurns((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              role: "apollo",
              content: `Brief locked. Execution is paused without inventing missing inputs: ${gaps.join(", ")}. Resolve the listed dependency, then use Start approved execution to retry the same immutable brief.`,
              createdAt: new Date().toISOString(),
            },
          ]);
        } else {
          setJobId(result.execution?.job_id ?? null);
          setJobState(result.execution?.state ?? "queued");
          setTurns((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              role: "apollo",
              content: `Mission brief approved and submitted to controlled execution${result.execution?.job_id ? ` as job ${result.execution.job_id}` : ""}.`,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } else {
        setTurns((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "apollo",
            content:
              "Preview brief approved. Sign in to persist and execute this mission.",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      setSpecification({
        ...specification,
        approval: {
          ...specification.approval,
          status: "approved",
          approved_by: specification.approval.approved_by ?? "current-user",
          approved_at:
            specification.approval.approved_at ?? new Date().toISOString(),
          unresolved_items_accepted: alreadyApproved
            ? (specification.approval.unresolved_items_accepted ?? [])
            : [],
        },
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Specification approval failed.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function launchApprovedExecution() {
    if (launchCountdown !== null || working) return;
    for (let count = 5; count >= 1; count -= 1) {
      setLaunchCountdown(count);
      await new Promise((resolve) => window.setTimeout(resolve, 850));
    }
    setLaunchCountdown("LIFTOFF");
    await new Promise((resolve) => window.setTimeout(resolve, 1200));
    await approveBrief();
    setLaunchCountdown(null);
  }

  async function requestRevision(instructionOverride?: string) {
    const instruction = instructionOverride?.trim() || revision.trim();
    if (!jobId || !instruction || working) return;
    setWorking(true);
    setError(null);
    try {
      const response = await fetch("/api/mission-control/revise", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ job_id: jobId, instruction }),
      });
      const result = (await response.json()) as {
        job_id?: string;
        state?: string;
        error?: string;
      };
      if (!response.ok || !result.job_id)
        throw new Error(result.error ?? "Revision could not be started.");
      setTurns((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: instruction,
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          role: "apollo",
          content:
            "Revision instruction accepted. I am rebuilding a new controlled draft while preserving the prior version.",
          createdAt: new Date().toISOString(),
        },
      ]);
      setJobId(result.job_id);
      setJobState(result.state ?? "queued");
      setJobProgress(1);
      setArtifactUrl(null);
      setRevision("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Revision failed.");
    } finally {
      setWorking(false);
    }
  }

  async function regenerateDeliverable() {
    if (regenerateCountdown !== null || working) return;
    for (let count = 5; count >= 1; count -= 1) {
      setRegenerateCountdown(count);
      await new Promise((resolve) => window.setTimeout(resolve, 850));
    }
    setRegenerateCountdown("LIFTOFF");
    await new Promise((resolve) => window.setTimeout(resolve, 1200));
    await requestRevision("Regenerate this deliverable using the current approved evidence and publication standards. Preserve all verified facts and create a new immutable draft version.");
    setRegenerateCountdown(null);
    setRegenerateOpen(false);
  }

  function editMissionData() {
    setRegenerateOpen(false);
    setDraft("Update the approved mission data: ");
    window.setTimeout(() => {
      composerRef.current?.focus();
      composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  async function retryExecution() {
    if (
      !jobId ||
      !["blocked", "failed"].includes(jobState ?? "") ||
      working
    )
      return;
    setWorking(true);
    setError(null);
    try {
      const response = await fetch("/api/mission-control/retry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
      });
      const result = (await response.json()) as {
        job_id?: string;
        state?: string;
        error?: string;
      };
      if (!response.ok || !result.job_id)
        throw new Error(
          result.error ?? "Execution retry could not be started.",
        );
      setJobId(result.job_id);
      setJobState(result.state ?? "queued");
      setJobProgress(1);
      setArtifactUrl(null);
      setTurns((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "apollo",
          content:
            "The resolved dependency was accepted. APOLLO started a new controlled execution job and preserved the blocked run for audit.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Execution retry failed.",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="mc-workspace">
      {regenerateOpen ? <div className="mc-regenerate-overlay" role="dialog" aria-modal="true" aria-labelledby="regenerate-title">
        <section className={regenerateCountdown !== null ? "launching" : ""}>
          <button className="mc-regenerate-close" type="button" aria-label="Close launch room" onClick={() => setRegenerateOpen(false)} disabled={regenerateCountdown !== null}>×</button>
          <div className="mc-regenerate-orbit"><Rocket size={34}/></div>
          <span>RETURN TO LAUNCH ROOM</span>
          <h2 id="regenerate-title">Command the next version.</h2>
          <p>Use the approved evidence exactly as-is, or return to Mission Control to update the mission data first. Every prior deliverable remains preserved.</p>
          <div className="mc-regenerate-choice"><button type="button" onClick={editMissionData} disabled={regenerateCountdown !== null}>Edit mission data</button><button type="button" className="selected" disabled>Approved evidence locked</button></div>
          <button className="mc-regenerate-launch" type="button" onClick={() => void regenerateDeliverable()} disabled={working || regenerateCountdown !== null}>
            <Rocket size={22}/><strong aria-live="assertive">{regenerateCountdown !== null ? regenerateCountdown : "INITIATE REGENERATION"}</strong>
          </button>
          <small>Creates a new immutable draft · prior versions remain available</small>
        </section>
      </div> : null}
      {specification && readiness >= 75 && questions.length === 0 && !jobId && !launchPromptDismissed ? (
        <div className="mc-launch-ready-overlay" role="dialog" aria-modal="true" aria-labelledby="launch-ready-title">
          <section>
            <div className="mc-launch-ready-orbit"><Rocket size={32} /></div>
            <span>MISSION CALIBRATION COMPLETE</span>
            <h2 id="launch-ready-title">Ready for launch.</h2>
            <p>Houston resolved every required field supported by your instructions and evidence. Review the complete brief before authorizing launch.</p>
            <div
              className="mc-launch-review-document"
              ref={reviewRef}
              tabIndex={0}
              onScroll={(event) => {
                const node = event.currentTarget;
                if (node.scrollTop + node.clientHeight >= node.scrollHeight - 12) setReviewScrolled(true);
              }}
            >
              <div className="mc-launch-review-heading"><span>INTENDED DELIVERABLE</span><strong>{title}</strong><small>{specification.artifact.recommended_family}</small></div>
              <dl>
                <div><dt>Objective</dt><dd>{specification.mission.objective}</dd></div>
                <div><dt>Primary audience</dt><dd>{audience}</dd></div>
                <div><dt>Output formats</dt><dd>{formats}</dd></div>
              </dl>
              <h3>Verified mission facts</h3>
              {facts.map((fact) => <div className="mc-launch-review-fact" key={fact.key}><span>{fact.label}</span><p>{fact.value}</p><small>{fact.source}</small></div>)}
              <h3>Planned document sections</h3>
              <ol>{specification.content.sections.map((section) => <li key={section}>{section}</li>)}</ol>
              <h3>Required quality checks</h3>
              <ul>{specification.specialist.required_checks.map((check) => <li key={check}>{check.replace(/-/g, " ")}</li>)}</ul>
              <div className="mc-launch-review-end"><Check size={16} /> End of controlled mission brief</div>
            </div>
            <small className={`mc-launch-scroll-status${reviewScrolled ? " complete" : ""}`}>{reviewScrolled ? "Review complete · acceptance unlocked" : "Scroll to the end to unlock acceptance"}</small>
            <label className="mc-launch-acknowledgement">
              <input type="checkbox" checked={reviewAcknowledged} disabled={!reviewScrolled} onChange={(event) => setReviewAcknowledged(event.target.checked)} />
              <span>I have reviewed the mission brief and approve it for execution.</span>
            </label>
            <button className={`mc-approve mc-launch-control${launchCountdown !== null ? " launching" : ""}`} onClick={launchApprovedExecution} disabled={working || launchCountdown !== null || !reviewAcknowledged}>
              <Rocket size={18} />
              <strong aria-live="polite">{launchCountdown !== null ? launchCountdown : "INITIATE LAUNCH"}</strong>
            </button>
            <button className="mc-launch-review" type="button" onClick={() => setLaunchPromptDismissed(true)} disabled={working || launchCountdown !== null}>Review mission brief first</button>
          </section>
        </div>
      ) : null}
      <header className="mc-header">
        <div>
          <div className="mc-kicker">
            <Orbit size={14} /> APOLLO MISSION CONTROL <span>ONLINE</span>
          </div>
          <h1>What are we building?</h1>
          <p>Begin with the outcome. APOLLO will engineer the deliverable.</p>
        </div>
        <button className="mc-secondary" onClick={resetMission}>
          New mission
        </button>
      </header>
      {jobState === "failed" ? (
        <section className="mc-failure-banner" role="alert" aria-live="assertive">
          <div>
            <span>MISSION LAUNCH FAILED</span>
            <strong>APOLLO stopped safely before delivery.</strong>
            <p>Check mission calibration and evidence, then retry the preserved execution. A failure alert is also queued for email delivery.</p>
          </div>
          <button type="button" onClick={() => void retryExecution()} disabled={working}>
            {working ? "Preparing retry…" : "Check calibration & retry"}
          </button>
        </section>
      ) : null}
      {jobId && jobState && !["failed", "blocked", "cancelled"].includes(jobState) ? (
        <section className={`mc-regenerate-banner ${jobState === "delivered" ? "ready" : "active"}`} aria-label="Deliverable regeneration control" aria-live="polite">
          <div className="mc-regenerate-icon"><RefreshCw size={22} className={jobState === "delivered" ? "" : "spin"} /></div>
          <div className="mc-regenerate-copy">
            <span>{jobState === "delivered" ? "VERSION CONTROL" : "DOCUMENT EXECUTION ACTIVE"}</span>
            <strong>{jobState === "delivered" ? "Create an improved version anytime." : `APOLLO is building the next controlled draft · ${jobProgress ?? 1}%`}</strong>
            <p>{jobState === "delivered" ? "Regenerate from the approved brief and verified evidence without replacing the prior deliverable." : "Your request was accepted. Progress and delivery will update here automatically."}</p>
            {jobState !== "delivered" ? <i><b style={{ width: `${jobProgress ?? 1}%` }} /></i> : null}
          </div>
          <div className="mc-regenerate-actions">
            {artifactUrl ? <a href={artifactUrl} target="_blank" rel="noreferrer">Open current draft</a> : null}
            {jobState === "delivered" ? <button type="button" onClick={() => setRegenerateOpen(true)} disabled={working}>{working ? "Preparing launch room…" : "Regenerate / edit mission"}</button> : <b>{jobProgress ?? 1}%</b>}
          </div>
        </section>
      ) : null}
      {specification ? <section className="mc-deliverable-gate" aria-label="Intended deliverable confirmation">
        <div><span>INTENDED DELIVERABLE</span><strong>{title}</strong><small>{specification.artifact.recommended_family}</small></div>
        <p>Confirm APOLLO interpreted the requested output correctly before calibrating its contents.</p>
        <div className="mc-deliverable-actions"><button type="button" onClick={()=>void submit(`I approve ${title} as the intended deliverable type. Continue calibrating this deliverable.`)} disabled={working}><Check size={15}/>Approve deliverable type</button><button type="button" onClick={correctDeliverableType} disabled={working}>Tell Houston what you need</button></div>
      </section>:null}
      {specification ? <ol className="mc-mission-sequence" aria-label="Mission launch sequence">
        <li className="complete"><b>1</b><span><strong>Confirm deliverable</strong><small>{title}</small></span></li>
        <li className={questions.length === 0 ? "complete" : "active"}><b>2</b><span><strong>Resolve required facts</strong><small>{questions.length ? `${questions.length} awaiting evidence or input` : "Calibration complete"}</small></span></li>
        <li className={questions.length === 0 ? "active" : "locked"}><b>3</b><span><strong>Review acknowledgment</strong><small>{questions.length === 0 ? "Review and check the approval box" : "Available after calibration"}</small></span></li>
        <li className={reviewAcknowledged && questions.length === 0 ? "active" : "locked"}><b>4</b><span><strong>Initiate launch</strong><small>{reviewAcknowledged && questions.length === 0 ? "Ready for liftoff" : "Locked until review"}</small></span></li>
      </ol> : null}
      <section className="mc-status" aria-label="Mission readiness">
        <div>
          <span>Mission readiness</span>
          <strong>{readinessLabel}</strong>
        </div>
        <div className="mc-progress">
          <i style={{ width: `${displayedProgress}%` }} />
        </div>
        <b>{displayedProgress}%</b>
      </section>
      <div className="mc-grid">
        <section className="mc-console" aria-label="Mission conversation">
          <div className="mc-transcript" ref={transcriptRef} aria-live="polite">
            {turns.map((turn) => {
              const asksForResponse =
                turn.role === "apollo" &&
                questions.some((question) => turn.content.includes(question));
              return (
                <article
                  key={turn.id}
                  className={`mc-turn ${turn.role}${asksForResponse ? " requires-response" : ""}`}
                >
                  <div className="mc-turn-role">
                    {turn.role === "apollo" ? (
                      <>
                        <Sparkles size={13} /> MISSION CONTROL · HOUSTON
                      </>
                    ) : (
                      "YOU"
                    )}
                  </div>
                  {turn.content.split("\n").map((line, index) =>
                    questions.includes(line) ? (
                      <p className="mc-response-required" key={index}>
                        <span>Response required</span>
                        {line}
                      </p>
                    ) : (
                      <p key={index}>{line || <br />}</p>
                    ),
                  )}
                  {turn.reason ? (
                    <small>
                      <ShieldCheck size={13} />
                      {turn.reason}
                    </small>
                  ) : null}
                  {turn.inputChannel === "voice" ? (
                    <small className="mc-voice-provenance">
                      <ShieldCheck size={13} />
                      Voice transcript
                      {turn.transcriptionConfidence !== null && turn.transcriptionConfidence !== undefined ? ` · ${Math.round(turn.transcriptionConfidence * 100)}% confidence` : ""}
                      {turn.criticalReviewRequired ? ` · ${turn.criticalReviewConfirmed ? "reviewed" : "review required"}` : ""}
                    </small>
                  ) : null}
                </article>
              );
            })}
            {working ? (
              <div className="mc-thinking">
                <i />
                <i />
                <i /> Engineering the next move
              </div>
            ) : null}
          </div>
          <div
            className={`mc-composer${questions.length ? " response-pending" : ""}`}
          >
            {questions.length ? (
              <section className="mc-question-batch">
                <header>
                  <div>
                    <span>Mission checkpoint</span>
                    <strong>Please answer the following together</strong>
                  </div>
                  <b>{questions.length} open</b>
                </header>
                <ol>
                  {questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={() =>
                    void submit(
                      `Use your expert recommendations for every unresolved decision that can be responsibly inferred from the mission. Clearly mark recommendations as assumptions. Do not invent names, credentials, evidence, prices, dates, legal terms, or client-specific facts. Leave only decisions that genuinely require my input unresolved.\n\nOpen decisions:\n${questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}`,
                    )
                  }
                  disabled={working}
                >
                  Use expert recommendations
                </button>
              </section>
            ) : null}
            <div className="mc-prompt-label">
              {questions.length
                ? "One response can answer every open item"
                : "Respond naturally—one answer can resolve several facts."}
            </div>
            <textarea
              ref={composerRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit();
                }
              }}
              placeholder={
                questions.length
                  ? "Answer the questions above in one response, or use expert recommendations…"
                  : "Describe what must be accomplished, who it is for, and what you already have…"
              }
              rows={4}
            />
            <div className="mc-composer-tools">
              <div className="mc-input-tools">
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  hidden
                  accept=".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
                  onChange={(event) => void attachEvidence(event.target.files)}
                />
                <button
                  type="button"
                  className="mc-icon-button"
                  onClick={() => fileRef.current?.click()}
                  disabled={working}
                >
                  <Paperclip size={18} />
                  <span>Add evidence</span>
                </button>
                <VoiceControl
                  disabled={working}
                  onTranscript={acceptVoiceTranscript}
                  onReviewConfirmed={() => setVoiceMetadata((current) => current ? { ...current, criticalReviewConfirmed:true } : current)}
                />
              </div>
              <button
                type="button"
                className="mc-send"
                onClick={() => void submit()}
                disabled={working}
              >
                <span>
                  {working ? "Interpreting" : "Answer all and continue"}
                </span>
                <ArrowUp size={18} />
              </button>
            </div>
            {error ? <p className="mc-error">{error}</p> : null}
          </div>
        </section>
        <aside className="mc-brief" aria-label="Live mission brief">
          <div className="mc-panel-heading">
            <div>
              <span>Live mission brief</span>
              <h2>{title}</h2>
            </div>
            <FilePlus2 size={20} />
          </div>
          {specification ? <nav className="mc-dossier-nav" aria-label="Mission dossier sections">
            <button type="button" onClick={() => document.getElementById("mission-overview")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Overview</button>
            <button type="button" onClick={() => document.getElementById("mission-facts")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Facts</button>
            <button type="button" onClick={() => document.getElementById("mission-decisions")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Decisions</button>
            <button type="button" onClick={() => document.getElementById("mission-calibration")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Calibration</button>
          </nav> : null}
          {specification ? (
            <>
              <div className="mc-recommendation">
                <span>Recommended strategy</span>
                <p>{specification.artifact.rationale}</p>
                <em>
                  {specification.specialist.playbook_id.replace(/-/g, " ")} · v
                  {specification.specialist.playbook_version}
                </em>
              </div>
              <div className="mc-brief-section mc-active-control">
                <h3>Operator involvement <b>{operatorInvolvement}%</b></h3>
                <strong>{operatorInvolvement <= 33 ? "Fully Autonomous" : operatorInvolvement <= 66 ? "Collaborative" : "Directed"}</strong>
                <input aria-label="Active mission operator involvement" type="range" min="0" max="100" value={operatorInvolvement} onChange={(event) => setOperatorInvolvement(Number(event.target.value))} />
                <div><small>APOLLO leads</small><small>You direct</small></div>
                <button type="button" onClick={() => void applyOperatorInvolvement()} disabled={working || operatorInvolvement === (specification.aura.operator_involvement ?? 50)}>Apply to active mission</button>
              </div>
              <div className="mc-brief-section mc-brief-overview" id="mission-overview">
                <h3>Mission definition</h3>
                <dl>
                  <div>
                    <dt>Objective</dt>
                    <dd>{specification.mission.objective}</dd>
                  </div>
                  <div>
                    <dt>Desired action</dt>
                    <dd>{specification.mission.desired_decision_or_action}</dd>
                  </div>
                  <div>
                    <dt>Primary audience</dt>
                    <dd>{audience}</dd>
                  </div>
                  <div>
                    <dt>Output</dt>
                    <dd>
                      {formats} ·{" "}
                      {specification.presentation.layout_genre.replace(
                        /-/g,
                        " ",
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              {jobId ? (
                <div className="mc-job">
                  <span>Document execution</span>
                  <strong>{jobState?.replace(/-/g, " ")}</strong>
                  {artifactUrl ? (
                    <a href={artifactUrl} target="_blank" rel="noreferrer">
                      Open controlled draft
                    </a>
                  ) : (
                    <small>APOLLO is preserving checkpoints and custody.</small>
                  )}
                    {jobState === "blocked" || jobState === "failed" ? (
                      <button
                        onClick={() => void retryExecution()}
                        disabled={working}
                      >
                        {jobState === "failed" ? "Retry failed execution" : "Retry resolved execution"}
                      </button>
                  ) : null}
                  {jobState === "delivered" ? (
                    <>
                      <textarea
                        value={revision}
                        onChange={(event) => setRevision(event.target.value)}
                        placeholder="Tell APOLLO what to change in this draft…"
                        rows={3}
                      />
                      <button
                        onClick={() => void requestRevision()}
                        disabled={!revision.trim() || working}
                      >
                        Issue revision instruction
                      </button>
                    </>
                  ) : null}
                </div>
              ) : null}
              <div className="mc-brief-section" id="mission-facts">
                <h3>
                  Mission facts <b>{facts.length}</b>
                </h3>
                {facts.length ? (
                  facts.map((fact) => (
                    <div
                      className={`mc-fact ${fact.verification_state === "conflict" ? "conflict" : ""}`}
                      key={fact.key}
                    >
                      <Check size={14} />
                      <div>
                        <span>{fact.label}</span>
                        <strong>{fact.value}</strong>
                        {fact.conflicts?.map((candidate) => (
                          <em
                            key={`${candidate.source}-${candidate.source_reference}-${candidate.value}`}
                          >
                            {candidate.source}: {candidate.value}
                          </em>
                        ))}
                      </div>
                      <small>
                        {fact.verification_state === "conflict"
                          ? "conflict"
                          : fact.source}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="mc-empty">Confirmed facts will appear here.</p>
                )}
              </div>
              <div className="mc-brief-section" id="mission-evidence">
                <h3>
                  Evidence record <b>{specification.sources.length}</b>
                </h3>
                {specification.sources.length ? (
                  specification.sources.map((source) => (
                    <div className="mc-source" key={source.id}>
                      <span>{source.name}</span>
                      <em>{source.status}</em>
                    </div>
                  ))
                ) : (
                  <p className="mc-empty">
                    No evidence has been attached. APOLLO will not treat
                    unsupported material as verified.
                  </p>
                )}
              </div>
              <div className="mc-brief-section" id="mission-decisions">
                <h3>
                  Assumptions and obligations{" "}
                  <b>
                    {specification.content.assumptions.length +
                      specification.content.obligations.length}
                  </b>
                </h3>
                {specification.content.assumptions.map((item) => (
                  <p className="mc-question" key={`assumption-${item}`}>
                    <strong>Assumption</strong>
                    {item}
                  </p>
                ))}
                {specification.content.obligations.map((item) => (
                  <p className="mc-question" key={`obligation-${item}`}>
                    <strong>Obligation</strong>
                    {item}
                  </p>
                ))}
                {!specification.content.assumptions.length &&
                !specification.content.obligations.length ? (
                  <p className="mc-empty">
                    No unresolved assumptions or obligations are recorded.
                  </p>
                ) : null}
              </div>
              {questions.length ? (
                <div className="mc-brief-section mc-decision-workbench">
                  <h3>
                    Answer open decisions <b>{questions.length}</b>
                  </h3>
                  <p>
                    Complete what you know. Houston can recommend the rest
                    without inventing client facts.
                  </p>
                  {questions.map((question, index) => (
                    <label key={question}>
                      <span>
                        {index + 1}. {question}
                      </span>
                      <textarea
                        rows={3}
                        value={decisionAnswers[question] ?? ""}
                        onChange={(event) =>
                          setDecisionAnswers((current) => ({
                            ...current,
                            [question]: event.target.value,
                          }))
                        }
                        placeholder="Your answer (optional)"
                      />
                    </label>
                  ))}
                  <div>
                    <button
                      type="button"
                      onClick={() => submitDecisionAnswers(false)}
                      disabled={
                        working ||
                        !questions.some((question) =>
                          decisionAnswers[question]?.trim(),
                        )
                      }
                    >
                      Submit answered fields
                    </button>
                    <button
                      type="button"
                      onClick={() => submitDecisionAnswers(true)}
                      disabled={working}
                    >
                      Use recommendations for remaining
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="mc-brief-section">
                <h3>Output strategy</h3>
                <p className="mc-strategy">
                  {specification.artifact.recommended_family} ·{" "}
                  {specification.content.sections.length} planned sections ·{" "}
                  {specification.specialist.required_checks.length} required
                  checks
                </p>
                {specification.artifact.alternatives_considered.length ? (
                  <p className="mc-alternatives">
                    <strong>Alternatives considered</strong>
                    {specification.artifact.alternatives_considered.join(", ")}
                  </p>
                ) : null}
              </div>
              <div className="mc-brief-section">
                <h3>
                  Open decisions <b>{questions.length}</b>
                </h3>
                {questions.slice(0, 4).map((question) => (
                  <p className="mc-question" key={question}>
                    {question}
                  </p>
                ))}
              </div>
              <div className="mc-brief-section" id="mission-calibration">
                <h3>Aura calibration</h3>
                {aura.map(([key, value]) => (
                  <div className="mc-aura" key={key}>
                    <span>{key.replace(/_/g, " ")}</span>
                    <i>
                      <b style={{ width: `${value}%` }} />
                    </i>
                    <em>{value}</em>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mc-empty-state">
              <Orbit size={34} />
              <h3>Standing by</h3>
              <p>
                Your objective, audience, evidence, aura, assumptions, and
                recommended strategy will assemble here.
              </p>
            </div>
          )}
          {specification?.approval.status === "approved" &&
          (!jobId || jobState === "blocked") ? (
            <a className="mc-approve" href={driveConnectHref}>
              Connect Google Drive custody
            </a>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
