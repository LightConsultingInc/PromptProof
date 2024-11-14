import React from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Category as CategoryIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";

interface TestFiltersProps {
  categories: string[];
  difficulties: string[];
  selectedCategory: string;
  selectedDifficulty: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onSearchChange: (query: string) => void;
}

export const TestFilters: React.FC<TestFiltersProps> = ({
  categories,
  difficulties,
  selectedCategory,
  selectedDifficulty,
  searchQuery,
  onCategoryChange,
  onDifficultyChange,
  onSearchChange,
}) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <FilterIcon color="primary" />
        <Typography variant="h6">Test Filters</Typography>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <TextField
          fullWidth
          label="Search Tests"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by test description..."
          size="small"
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CategoryIcon fontSize="small" />
                  {category}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            label="Difficulty"
          >
            <MenuItem value="">All Difficulties</MenuItem>
            {difficulties.map((difficulty) => (
              <MenuItem key={difficulty} value={difficulty}>
                <Box display="flex" alignItems="center" gap={1}>
                  <SpeedIcon
                    fontSize="small"
                    color={
                      difficulty === "easy"
                        ? "success"
                        : difficulty === "medium"
                          ? "warning"
                          : "error"
                    }
                  />
                  {difficulty}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Active Filters */}
      <Box display="flex" gap={1} mt={2}>
        {selectedCategory && (
          <Chip
            icon={<CategoryIcon />}
            label={selectedCategory}
            onDelete={() => onCategoryChange("")}
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
        {selectedDifficulty && (
          <Chip
            icon={<SpeedIcon />}
            label={selectedDifficulty}
            onDelete={() => onDifficultyChange("")}
            color={
              selectedDifficulty === "easy"
                ? "success"
                : selectedDifficulty === "medium"
                  ? "warning"
                  : "error"
            }
            variant="outlined"
            size="small"
          />
        )}
        {searchQuery && (
          <Chip
            label={`Search: ${searchQuery}`}
            onDelete={() => onSearchChange("")}
            color="default"
            variant="outlined"
            size="small"
          />
        )}
      </Box>
    </Paper>
  );
};
