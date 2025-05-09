import Grid from '@mui/material/Grid2'

import VisitDetails from './VisitDetails'

const VisitLeftOverview = ({ visitData }) => (
  <Grid container spacing={6}>
    <Grid size={{ xs: 12 }}>
      <VisitDetails visitData={visitData} />
    </Grid>
  </Grid>
)

export default VisitLeftOverview
