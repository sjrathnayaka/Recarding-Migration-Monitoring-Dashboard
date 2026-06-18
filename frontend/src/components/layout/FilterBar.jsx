import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import { MGR_FLAG_OPTIONS, REASON_OPTIONS } from '../../constants/flags'

export default function FilterBar({ filters, onChange, productTypes }) {
  const handleChange = (field) => (event) => {
    onChange({ ...filters, [field]: event.target.value })
  }

  const handleDateChange = (field) => (value) => {
    onChange({ ...filters, [field]: value })
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <FilterAltOutlinedIcon color="primary" fontSize="small" />
        <Typography variant="subtitle2" color="text.secondary">
          Filters
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <DatePicker
            label="From Date"
            value={filters.fromDate}
            onChange={handleDateChange('fromDate')}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <DatePicker
            label="To Date"
            value={filters.toDate}
            onChange={handleDateChange('toDate')}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Product Type</InputLabel>
            <Select
              label="Product Type"
              value={filters.productType}
              onChange={handleChange('productType')}
            >
              <MenuItem value="">All Products</MenuItem>
              {productTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Recarding Reason</InputLabel>
            <Select
              label="Recarding Reason"
              value={filters.reason}
              onChange={handleChange('reason')}
            >
              {REASON_OPTIONS.map((opt) => (
                <MenuItem key={opt.label} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Migration Flag</InputLabel>
            <Select
              label="Migration Flag"
              value={filters.mgrFlag}
              onChange={handleChange('mgrFlag')}
            >
              {MGR_FLAG_OPTIONS.map((opt) => (
                <MenuItem key={opt.label} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  )
}
