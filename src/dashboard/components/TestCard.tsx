import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
  Grid,
  Paper,
  Tooltip,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  Category as CategoryIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";

interface TestCardProps {
  result: {
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
      reasoning?: string;
      summary?: string;
    };
  };
  isRunning: boolean;
}

export const TestCard: React.FC<TestCardProps> = ({ result, isRunning }) => {
  const [expanded, setExpanded] = React.useState(false);
  const duration =
    result.endTime && result.startTime
      ? ((result.endTime - result.startTime) / 1000).toFixed(2)
      : null;

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: 6,
        borderColor:
          result.status === "completed"
            ? "success.main"
            : result.status === "failed"
              ? "error.main"
              : "warning.main",
        opacity: result.status === "pending" ? 0.7 : 1,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {result.status === "completed" ? (
              <CheckCircleIcon color="success" />
            ) : result.status === "failed" ? (
              <ErrorIcon color="error" />
            ) : (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={20} />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {result.status === "pending" ? "Waiting..." : "Running..."}
                </Typography>
              </Box>
            )}
            <Typography variant="h6">{result.description}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {duration && (
              <Tooltip title="Test Duration">
                <Chip
                  icon={<TimerIcon />}
                  label={`${duration}s`}
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
            )}
            <Chip
              label={`${(result.score * 100).toFixed(1)}%`}
              color={result.score >= 0.8 ? "success" : "error"}
              variant="outlined"
            />
            <IconButton
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s",
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Metadata Chips */}
        <Box display="flex" gap={1} mb={2}>
          {result.metadata?.category && (
            <Chip
              icon={<CategoryIcon />}
              label={result.metadata.category}
              size="small"
              variant="outlined"
            />
          )}
          {result.metadata?.difficulty && (
            <Chip
              icon={<SpeedIcon />}
              label={result.metadata.difficulty}
              size="small"
              color={
                result.metadata.difficulty === "easy"
                  ? "success"
                  : result.metadata.difficulty === "medium"
                    ? "warning"
                    : "error"
              }
              variant="outlined"
            />
          )}
        </Box>

        {/* Expanded Content */}
        <Collapse in={expanded}>
          <Grid container spacing={3}>
            {/* Metrics */}
            {result.metadata?.metricResults && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
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
                          sx={{
                            mb: 1,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "grey.200",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor:
                                metric.score >= 0.8
                                  ? "success.main"
                                  : "error.main",
                            },
                          }}
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

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Output Comparison */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Output Comparison
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Expected Output
                    </Typography>
                    <Typography variant="body2">
                      {result.expectedOutput}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
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

            {/* Analysis */}
            {(result.metadata?.reasoning || result.metadata?.summary) && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
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
        </Collapse>
      </CardContent>
    </Card>
  );
};
