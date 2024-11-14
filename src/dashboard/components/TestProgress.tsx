import React from "react";
import {
  Box,
  LinearProgress,
  Typography,
  Paper,
  Grid,
  Chip,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";

interface TestProgressProps {
  total: number;
  completed: number;
  passed: number;
  failed: number;
  isRunning: boolean;
}

export const TestProgress: React.FC<TestProgressProps> = ({
  total,
  completed,
  passed,
  failed,
  isRunning,
}) => {
  const progress = (completed / total) * 100;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Test Progress
      </Typography>
      <Box sx={{ width: "100%", mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: "grey.200",
            "& .MuiLinearProgress-bar": {
              backgroundColor: passed > failed ? "success.main" : "error.main",
            },
          }}
        />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Chip
            icon={<PendingIcon />}
            label={`Total: ${total}`}
            color="primary"
            variant="outlined"
            sx={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={3}>
          <Chip
            icon={<CheckCircleIcon />}
            label={`Passed: ${passed}`}
            color="success"
            variant="outlined"
            sx={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={3}>
          <Chip
            icon={<ErrorIcon />}
            label={`Failed: ${failed}`}
            color="error"
            variant="outlined"
            sx={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={3}>
          <Chip
            icon={<PendingIcon />}
            label={`Remaining: ${total - completed}`}
            color="warning"
            variant="outlined"
            sx={{ width: "100%" }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
