import React from "react";
import {
  Paper,
  Box,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";

interface TestSummaryProps {
  total: number;
  completed: number;
  passed: number;
  failed: number;
  isRunning: boolean;
  startTime?: number;
  endTime?: number;
  categories: { [key: string]: number };
  difficulties: { [key: string]: number };
  averageScore: number;
}

export const TestSummary: React.FC<TestSummaryProps> = ({
  total,
  completed,
  passed,
  failed,
  isRunning,
  startTime,
  endTime,
  categories,
  difficulties,
  averageScore,
}) => {
  const progress = (completed / total) * 100;
  const duration =
    startTime && endTime ? ((endTime - startTime) / 1000).toFixed(1) : null;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">Test Summary</Typography>
        <Box display="flex" gap={2}>
          {duration && (
            <Tooltip title="Total Duration">
              <Chip
                icon={<TimerIcon />}
                label={`${duration}s`}
                color="primary"
                variant="outlined"
              />
            </Tooltip>
          )}
          <Tooltip title="Average Score">
            <Chip
              icon={<SpeedIcon />}
              label={`${(averageScore * 100).toFixed(1)}%`}
              color={averageScore >= 0.8 ? "success" : "error"}
              variant="outlined"
            />
          </Tooltip>
        </Box>
      </Box>

      <Stack spacing={3}>
        {/* Progress Bar */}
        <Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {completed} / {total}
            </Typography>
          </Box>
          <LinearProgress
            variant={isRunning ? "indeterminate" : "determinate"}
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                bgcolor: passed > failed ? "success.main" : "error.main",
              },
            }}
          />
        </Box>

        {/* Statistics Grid */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "primary.light",
                color: "primary.contrastText",
                textAlign: "center",
                borderRadius: 2,
              }}
            >
              <Typography variant="h4">{total}</Typography>
              <Typography variant="body2">Total Tests</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "success.light",
                color: "success.contrastText",
                textAlign: "center",
                borderRadius: 2,
              }}
            >
              <Typography variant="h4">{passed}</Typography>
              <Typography variant="body2">Passed</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "error.light",
                color: "error.contrastText",
                textAlign: "center",
                borderRadius: 2,
              }}
            >
              <Typography variant="h4">{failed}</Typography>
              <Typography variant="body2">Failed</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "warning.light",
                color: "warning.contrastText",
                textAlign: "center",
                borderRadius: 2,
              }}
            >
              <Typography variant="h4">{total - completed}</Typography>
              <Typography variant="body2">Remaining</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Categories and Difficulties */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Categories
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {Object.entries(categories).map(([category, count]) => (
                <Chip
                  key={category}
                  icon={<CategoryIcon />}
                  label={`${category} (${count})`}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Difficulties
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {Object.entries(difficulties).map(([difficulty, count]) => (
                <Chip
                  key={difficulty}
                  icon={<SpeedIcon />}
                  label={`${difficulty} (${count})`}
                  color={
                    difficulty === "easy"
                      ? "success"
                      : difficulty === "medium"
                        ? "warning"
                        : "error"
                  }
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
};
