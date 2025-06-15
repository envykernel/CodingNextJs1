// MUI Imports
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Styles Imports
import tableStyles from '@core/styles/table.module.css'
import styles from '@views/front-pages/commercial/styles.module.css'
import frontCommonStyles from '@views/front-pages/styles.module.css'

// Types
type FeatureType = {
  feature: string
  standard: boolean
  ultimate: boolean
}

// Data
const features: FeatureType[] = [
  {
    feature: 'Gestion des rendez-vous illimitée',
    standard: true,
    ultimate: true
  },
  {
    feature: 'Dossiers patients complets',
    standard: true,
    ultimate: true
  },
  {
    feature: 'Historique médical détaillé',
    standard: true,
    ultimate: true
  },
  {
    feature: 'Ordonnances médicales électroniques',
    standard: true,
    ultimate: true
  },
  {
    feature: "Prescriptions d'analyses et d'imagerie médicale",
    standard: true,
    ultimate: true
  },
  {
    feature: 'Tableau de bord organisationnel',
    standard: true,
    ultimate: true
  },
  {
    feature: 'Support par email',
    standard: true,
    ultimate: true
  },
  {
    feature: 'Utilisateurs illimités',
    standard: true,
    ultimate: true
  },
  {
    feature: 'Patients illimités',
    standard: true,
    ultimate: true
  },
  {
    feature: 'Tableau de bord organisationnel avancé',
    standard: false,
    ultimate: true
  },
  {
    feature: 'Tableau de bord financier complet',
    standard: false,
    ultimate: true
  },
  {
    feature: 'Gestion des factures et paiements',
    standard: false,
    ultimate: true
  },
  {
    feature: 'Suivi des recettes et dépenses',
    standard: false,
    ultimate: true
  },
  {
    feature: 'Rapports financiers détaillés',
    standard: false,
    ultimate: true
  },
  {
    feature: 'Impression de rapports médicaux complets',
    standard: false,
    ultimate: true
  }
]

const Plans = () => {
  return (
    <section className='md:plb-[100px] plb-[50px] bg-backgroundPaper'>
      <div className={frontCommonStyles.layoutSpacing}>
        <div className='flex flex-col text-center gap-2 mbe-6'>
          <Typography variant='h3'>Choisissez la formule adaptée à votre cabinet</Typography>
          <Typography>Des solutions complètes pour une gestion médicale optimale</Typography>
        </div>
        <div className='overflow-x-auto border-x border-be rounded'>
          <table className={tableStyles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className='text-start'>
                  <>FONCTIONNALITÉS</>
                  <Typography variant='body2' className='capitalize'>
                    Fonctionnalités incluses
                  </Typography>
                </th>
                <th className='text-center'>
                  <>STANDARD</>
                  <Typography variant='body2' className='capitalize'>
                    200 MAD/mois
                  </Typography>
                </th>
                <th className='text-center'>
                  <div className='flex justify-center gap-x-2'>
                    <>ULTIMATE</>
                    <CustomAvatar size={20} color='primary'>
                      <i className='tabler-star text-[14px]' />
                    </CustomAvatar>
                  </div>
                  <Typography variant='body2' className='capitalize'>
                    300 MAD/mois
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody className={classnames('border-be', styles.tableBody)}>
              {features.map((feature, index) => (
                <tr key={index}>
                  <td className='text-start'>
                    <Typography color='text.primary'>{feature.feature}</Typography>
                  </td>
                  <td className='text-center'>
                    <div className='flex justify-center'>
                      {feature.standard ? (
                        <CustomAvatar skin='light' color='primary' size={20}>
                          <i className='tabler-check text-primary text-[14px]' />
                        </CustomAvatar>
                      ) : (
                        <CustomAvatar skin='light' color='secondary' size={20}>
                          <i className='tabler-x text-[14px]' />
                        </CustomAvatar>
                      )}
                    </div>
                  </td>
                  <td className='text-center'>
                    <div className='flex justify-center'>
                      {feature.ultimate ? (
                        <CustomAvatar skin='light' color='primary' size={20}>
                          <i className='tabler-check text-primary text-[14px]' />
                        </CustomAvatar>
                      ) : (
                        <CustomAvatar skin='light' color='secondary' size={20}>
                          <i className='tabler-x text-[14px]' />
                        </CustomAvatar>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Plans
