// Type Imports
import type { PricingPlanType } from '@/types/pages/pricingTypes'

export const db: PricingPlanType[] = [
  {
    monthlyPrice: 200,
    title: 'Standard',
    popularPlan: false,
    currentPlan: false,
    subtitle: 'Pour les cabinets médicaux de taille moyenne',
    imgSrc: '/images/illustrations/objects/pricing-standard.png',
    imgHeight: 120,
    yearlyPlan: {
      monthly: 180,
      annually: 2160
    },
    planBenefits: [
      'Gestion des rendez-vous illimitée',
      'Dossiers patients complets',
      'Historique médical détaillé',
      'Ordonnances médicales électroniques',
      "Prescriptions d'analyses et d'imagerie médicale",
      'Tableau de bord organisationnel',
      'Support par email',
      "Jusqu'à 3 utilisateurs",
      "Jusqu'à 500 patients"
    ]
  },
  {
    monthlyPrice: 300,
    popularPlan: true,
    currentPlan: false,
    title: 'Ultimate',
    subtitle: 'Solution complète pour les cabinets médicaux exigeants',
    imgSrc: '/images/illustrations/objects/pricing-enterprise.png',
    imgHeight: 120,
    yearlyPlan: {
      monthly: 270,
      annually: 3240
    },
    planBenefits: [
      'Toutes les fonctionnalités Standard',
      "Nombre illimité d'utilisateurs",
      'Nombre illimité de patients',
      'Tableau de bord organisationnel avancé',
      'Tableau de bord financier complet',
      'Gestion des factures et paiements',
      'Suivi des recettes et dépenses',
      'Rapports financiers détaillés',
      'Impression de rapports médicaux complets'
    ]
  }
]
