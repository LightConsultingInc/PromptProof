import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  Box,
  Container,
  Typography,
  Paper,
  Select,
  MenuItem,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import {
  Providers,
  AnthropicModels,
  OpenAIModels,
} from "../../langchain/langchain.types";

interface TestResult {
  description: string;
  status: "completed" | "failed";
  score: number;
  feedback: string;
  actualOutput: string;
  expectedOutput: string;
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
    [key: string]: any;
  };
}

export const TestDashboard: React.FC = () => {
  const [provider, setProvider] = useState<Providers>(Providers.ANTHROPIC);
  const [model, setModel] = useState<string>(AnthropicModels.CLAUDE_3_SONNET);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [availableTests, setAvailableTests] = useState<
    Array<{ description: string; metadata: any }>
  >([]);

  const models =
    provider === Providers.ANTHROPIC ? AnthropicModels : OpenAIModels;

  useEffect(() => {
    // Load available tests when component mounts
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

    const socket = io("http://localhost:3001");

    socket.on("testResult", (result: TestResult) => {
      console.log("Received test result:", result);
      setResults((prev) => [...prev, result]);
    });

    socket.on("connect", () => {
      console.log("Connected to test server");
      setError(null);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
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
      setError(error?.message as string);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.100",
        pt: 3,
        pb: 6,
      }}
    >
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
            LLM Test Dashboard
          </Typography>
          <Typography variant="subtitle1">
            Real-time evaluation and testing of Language Models
          </Typography>
        </Paper>

        {/* Error Display */}
        {error && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              bgcolor: "error.light",
              borderLeft: 6,
              borderColor: "error.main",
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <ErrorIcon color="error" />
              <Typography color="error.dark">{error}</Typography>
            </Box>
          </Paper>
        )}

        {/* Available Tests Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6">
              Available Tests ({availableTests.length})
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {availableTests.map((test, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {test.description}
                    </Typography>
                    {test.metadata?.category && (
                      <Chip
                        icon={<CategoryIcon />}
                        label={test.metadata.category}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    )}
                    {test.metadata?.difficulty && (
                      <Chip
                        icon={<SpeedIcon />}
                        label={test.metadata.difficulty}
                        size="small"
                        color={
                          test.metadata.difficulty === "easy"
                            ? "success"
                            : test.metadata.difficulty === "medium"
                              ? "warning"
                              : "error"
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Controls Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={3}>
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

        {/* Results Section */}
        {results.map((result, index) => (
          <Accordion
            key={index}
            defaultExpanded={index === results.length - 1}
            sx={{
              mb: 2,
              borderRadius: "8px !important",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={2} width="100%">
                {result.status === "completed" ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <ErrorIcon color="error" />
                )}
                <Typography variant="h6" sx={{ flex: 1 }}>
                  {result.description}
                </Typography>
                <Typography
                  variant="h6"
                  color={result.score >= 0.8 ? "success.main" : "error.main"}
                  sx={{ minWidth: 100, textAlign: "right" }}
                >
                  {(result.score * 100).toFixed(1)}%
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* Metrics Section */}
                {result.metadata?.metricResults && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      {result.metadata.metricResults.map((metric, idx) => (
                        <Grid item xs={12} md={4} key={idx}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {metric.metric}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={metric.score * 100}
                              sx={{ mb: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {metric.explanation}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                )}

                {/* Response Comparison */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Response Comparison
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, bgcolor: "grey.50", height: "100%" }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Expected Output
                        </Typography>
                        <Typography variant="body2">
                          {result.expectedOutput}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, bgcolor: "grey.50", height: "100%" }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Actual Output
                        </Typography>
                        <Typography variant="body2">
                          {result.actualOutput}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Analysis Section */}
                {(result.metadata?.reasoning || result.metadata?.summary) && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Analysis
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                      {result.metadata.reasoning && (
                        <>
                          <Typography variant="subtitle2" gutterBottom>
                            Reasoning
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {result.metadata.reasoning}
                          </Typography>
                        </>
                      )}
                      {result.metadata.summary && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle2" gutterBottom>
                            Summary
                          </Typography>
                          <Typography variant="body2">
                            {result.metadata.summary}
                          </Typography>
                        </>
                      )}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
};
