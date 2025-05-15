import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Typography from '@mui/material/Typography'

import { useTranslation } from '@/contexts/translationContext'

interface ClinicalExamBlockProps {
  exam: any
}

function isFilled(val: any) {
  return val !== null && val !== undefined && String(val).trim() !== ''
}

const ClinicalExamBlock: React.FC<ClinicalExamBlockProps> = ({ exam }) => {
  const t = useTranslation()
  const tForm = t.clinicalExamForm

  if (!exam) return null

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className='flex items-center gap-3'>
          <i className='tabler-clipboard-text text-xl text-primary' />
          <Typography variant='subtitle1'>{tForm.title}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className='flex flex-col gap-3'>
          {/* Chief Complaint */}
          {isFilled(exam.chief_complaint) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.chiefComplaint}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.chief_complaint}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
          {/* History of Illness */}
          {isFilled(exam.history_illness) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.historyIllness}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.history_illness}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
          {/* Medical History */}
          {isFilled(exam.medical_history) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.medicalHistory}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.medical_history}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
          {/* General Appearance */}
          {isFilled(exam.general_appearance) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.generalAppearance}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.general_appearance}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
          {/* Cardiovascular */}
          {isFilled(exam.cardiovascular) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.cardiovascular}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.cardiovascular}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
          {/* Respiratory */}
          {isFilled(exam.respiratory) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.respiratory}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.respiratory}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
          {/* Gastrointestinal */}
          {isFilled(exam.gastrointestinal) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.gastrointestinal}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.gastrointestinal}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
          {/* Neurological */}
          {isFilled(exam.neurological) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.neurological}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.neurological}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
          {/* Musculoskeletal */}
          {isFilled(exam.musculoskeletal) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.musculoskeletal}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.musculoskeletal}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
          {/* Skin */}
          {isFilled(exam.skin) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.skin}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.skin}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
          {/* ENT */}
          {isFilled(exam.ent) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.ent}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.ent}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
          {/* Assessment */}
          {isFilled(exam.assessment) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.assessment}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.assessment}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
          {/* Plan */}
          {isFilled(exam.plan) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle2' className='font-semibold text-primary'>
                  {tForm.plan}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{exam.plan}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default ClinicalExamBlock
