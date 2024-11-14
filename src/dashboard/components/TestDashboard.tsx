import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  Box,
  Container,
  Paper,
  Select,
  MenuItem,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Alert,
  Typography,
  Divider,
} from "@mui/material";
import {
  Providers,
  AnthropicModels,
  OpenAIModels,
} from "../../langchain/langchain.types";
import { TestSummary } from "./TestSummary";
import { TestFilters } from "./TestFilters";
import { TestCard } from "./TestCard";

interface TestResult {
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  score: number;
  feedback: string;
  actualOutput: string;
  expectedOutput: string;
  startTime?: number;
  endTime?: number;
  metadata?: {
    metricResults?: Array<{
      metric: string;
      score: number;
      explanation: string;
    }>;
    category?: string;
    difficulty?: string;
    requiredElements?: string[];
    requiredConcepts?: string[];
    reasoning?: string;
    summary?: string;
    timestamp?: string;
  };
}

export const TestDashboard: React.FC = () => {
  // Core state
  const [provider, setProvider] = useState<Providers>(Providers.ANTHROPIC);
  const [model, setModel] = useState<string>(AnthropicModels.CLAUDE_3_SONNET);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Test results and metadata
  const [results, setResults] = useState<TestResult[]>([]);
  const [availableTests, setAvailableTests] = useState<
    Array<{ description: string; metadata: any }>
  >([]);
  const [startTime, setStartTime] = useState<number | undefined>();
  const [endTime, setEndTime] = useState<number | undefined>();

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Derived state
  const models =
    provider === Providers.ANTHROPIC ? AnthropicModels : OpenAIModels;
  const categories = [
    ...new Set(
      availableTests.map((test) => test.metadata?.category).filter(Boolean)
    ),
  ];
  const difficulties = [
    ...new Set(
      availableTests.map((test) => test.metadata?.difficulty).filter(Boolean)
    ),
  ];

  const completedTests = results.filter(
    (r) => r.status === "completed" || r.status === "failed"
  );
  const passedTests = results.filter(
    (r) => r.status === "completed" && r.score >= 0.8
  );
  const failedTests = results.filter(
    (r) => r.status === "failed" || (r.status === "completed" && r.score < 0.8)
  );
  const averageScore =
    completedTests.length > 0
      ? completedTests.reduce((acc, curr) => acc + curr.score, 0) /
        completedTests.length
      : 0;

  // Filter results
  const filteredResults = results.filter((result) => {
    const matchesCategory =
      !selectedCategory || result.metadata?.category === selectedCategory;
    const matchesDifficulty =
      !selectedDifficulty || result.metadata?.difficulty === selectedDifficulty;
    const matchesSearch =
      !searchQuery ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // Add new state for tracking test progress
  const [testProgress, setTestProgress] = useState<Map<string, TestResult>>(
    new Map()
  );
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load available tests
    fetch("/api/tests")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAvailableTests(data.tests);
        }
      })
      .catch((err) => {
        console.error("Error loading tests:", err);
        setError("Failed to load available tests");
      });

    // Set up socket connection
    const socket = io("http://localhost:3001");

    socket.on("testResult", (result: TestResult) => {
      setTestProgress((prev) => {
        const newProgress = new Map(prev);
        newProgress.set(result.description, result);
        return newProgress;
      });

      // Update running tests set
      setRunningTests((prev) => {
        const newRunning = new Set(prev);
        if (result.status === "running") {
          newRunning.add(result.description);
        } else {
          newRunning.delete(result.description);
        }
        return newRunning;
      });

      // Update results array when a test completes
      if (result.status === "completed" || result.status === "failed") {
        setResults((prev) => {
          const existing = prev.findIndex(
            (r) => r.description === result.description
          );
          if (existing >= 0) {
            const newResults = [...prev];
            newResults[existing] = result;
            return newResults;
          }
          return [...prev, result];
        });
      }
    });

    socket.on("connect", () => {
      setError(null);
    });

    socket.on("connect_error", (err) => {
      setError("Failed to connect to test server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setError(null);
    setStartTime(Date.now());
    setEndTime(undefined);

    try {
      const response = await fetch("/api/run-tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          model,
          apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to run tests");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error: any) {
      console.error("Error running tests:", error);
      setError(error?.message || "An error occurred");
    } finally {
      setIsRunning(false);
      setEndTime(Date.now());
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", pt: 3, pb: 6 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            background: "linear-gradient(45deg, #1a237e 30%, #283593 90%)",
            color: "white",
          }}
        >
          <Typography variant="h3" gutterBottom fontWeight="bold">
            PromptProof Dashboard
          </Typography>
          <Typography variant="subtitle1">
            Real-time evaluation and testing of Language Models
          </Typography>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Test Summary */}
        <TestSummary
          total={availableTests.length}
          completed={completedTests.length}
          passed={passedTests.length}
          failed={failedTests.length}
          isRunning={isRunning}
          startTime={startTime}
          endTime={endTime}
          categories={Object.fromEntries(
            categories.map((cat) => [
              cat,
              availableTests.filter((t) => t.metadata?.category === cat).length,
            ])
          )}
          difficulties={Object.fromEntries(
            difficulties.map((diff) => [
              diff,
              availableTests.filter((t) => t.metadata?.difficulty === diff)
                .length,
            ])
          )}
          averageScore={averageScore}
        />

        {/* Controls */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Provider
              </Typography>
              <Select
                fullWidth
                value={provider}
                onChange={(e) => setProvider(e.target.value as Providers)}
                sx={{ bgcolor: "background.paper" }}
              >
                {Object.values(Providers).map((p) => (
                  <MenuItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Model
              </Typography>
              <Select
                fullWidth
                value={model}
                onChange={(e) => setModel(e.target.value)}
                sx={{ bgcolor: "background.paper" }}
              >
                {Object.values(models).map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                API Key
              </Typography>
              <TextField
                fullWidth
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                sx={{ bgcolor: "background.paper" }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={runTests}
                disabled={isRunning || !apiKey}
                sx={{
                  height: 56,
                  background: isRunning
                    ? undefined
                    : "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  boxShadow: isRunning
                    ? undefined
                    : "0 3px 5px 2px rgba(33, 203, 243, .3)",
                }}
                startIcon={
                  isRunning ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : undefined
                }
              >
                {isRunning ? "Running Tests..." : "Run Tests"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Filters */}
        <TestFilters
          categories={categories}
          difficulties={difficulties}
          selectedCategory={selectedCategory}
          selectedDifficulty={selectedDifficulty}
          searchQuery={searchQuery}
          onCategoryChange={setSelectedCategory}
          onDifficultyChange={setSelectedDifficulty}
          onSearchChange={setSearchQuery}
        />

        {/* Active Tests Section */}
        {Array.from(testProgress.values())
          .filter(
            (result) =>
              result.status === "pending" || result.status === "running"
          )
          .map((result) => (
            <TestCard
              key={result.description}
              result={result}
              isRunning={runningTests.has(result.description)}
            />
          ))}

        {/* Divider between active and completed tests */}
        {testProgress.size > 0 && filteredResults.length > 0 && (
          <Box sx={{ my: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Completed Tests
            </Typography>
            <Divider />
          </Box>
        )}

        {/* Completed Tests Section */}
        {filteredResults
          .filter(
            (result) =>
              result.status === "completed" || result.status === "failed"
          )
          .map((result) => (
            <TestCard
              key={result.description}
              result={result}
              isRunning={runningTests.has(result.description)}
            />
          ))}
      </Container>
    </Box>
  );
};
