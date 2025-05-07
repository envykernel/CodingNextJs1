import Grid from '@mui/material/Grid2'

import UserDetails from './UserDetails'

const VisitLeftOverview = ({ visitData }) => (
  <Grid container spacing={6}>
    <Grid size={{ xs: 12 }}>
      <UserDetails visitData={visitData} />
    </Grid>
  </Grid>
)

export default VisitLeftOverview
