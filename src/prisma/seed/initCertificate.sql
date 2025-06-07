-- Script d'initialisation des modèles de certificats médicaux (Français)
-- Ces modèles sont partagés entre toutes les organisations (organisation_id = NULL)

-- Suppression des templates existants pour éviter les doublons
DELETE FROM "CertificateTemplate" WHERE "organisationId" IS NULL;

-- Insertion des nouveaux templates
INSERT INTO "CertificateTemplate" (
  "code",
  "name",
  "description",
  "category",
  "contentTemplate",
  "variablesSchema",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES
-- Certificat médical simple
(
  'CERT_MED_SIMPLE',
  'Certificat médical simple',
  'Certificat attestant d''une consultation médicale',
  'Consultation',
  'Je soussigné(e), Dr {{doctor.name}}, médecin, certifie avoir examiné ce jour {{patient.name}}, né(e) le {{patient.birthdate}}.\n\nÀ cette date, je constate que l''état de santé de ce/cette patient(e) {{medicalObservation}}.\n\nCe certificat est établi à la demande de l''intéressé(e) pour faire valoir ce que de droit.\n\nFait à {{organisation.name}}, le {{date}}.\n\nSignature :\n\n___________________________\nDr {{doctor.name}}',
  '{
    "type": "object",
    "properties": {
      "medicalObservation": {
        "type": "string",
        "description": "Constations médicales"
      },
      "date": {
        "type": "string",
        "format": "date",
        "default": "aujourd''hui"
      }
    },
    "required": ["medicalObservation"]
  }',
  true,
  NOW(),
  NOW()
),

-- Certificat d''aptitude sportive
(
  'CERT_APT_SPORT',
  'Certificat d''aptitude sportive',
  'Certificat attestant de l''aptitude à la pratique sportive',
  'Aptitude',
  'Je soussigné(e), Dr {{doctor.name}}, médecin, certifie avoir examiné ce jour {{patient.name}}, né(e) le {{patient.birthdate}} en vue de la pratique du sport suivant : {{sport}}.\n\nAprès examen clinique, il ressort que :\n\n- Rien ne s''oppose à la pratique du sport mentionné ci-dessus (aptitude totale)\n- OU : Aptitude avec réserves : {{restrictions}}\n- OU : Inaptitude temporaire pour {{duration}} (motif : {{reason}})\n\nCe certificat est valable jusqu''au {{validUntil}}.\n\nFait à {{organisation.name}}, le {{date}}.\n\nSignature :\n\n___________________________\nDr {{doctor.name}}',
  '{
    "type": "object",
    "properties": {
      "sport": {
        "type": "string",
        "description": "Sport concerné"
      },
      "aptitudeType": {
        "type": "string",
        "enum": ["totale", "avec_reserves", "temporaire"],
        "default": "totale"
      },
      "restrictions": {
        "type": "string",
        "description": "Restrictions éventuelles",
        "default": ""
      },
      "duration": {
        "type": "string",
        "description": "Durée d''inaptitude",
        "default": ""
      },
      "reason": {
        "type": "string",
        "description": "Motif d''inaptitude",
        "default": ""
      },
      "validUntil": {
        "type": "string",
        "format": "date",
        "description": "Date de fin de validité"
      },
      "date": {
        "type": "string",
        "format": "date",
        "default": "aujourd''hui"
      }
    },
    "required": ["sport", "aptitudeType"]
  }',
  true,
  NOW(),
  NOW()
),

-- Certificat d''arrêt de travail
(
  'CERT_ARRET_TRAVAIL',
  'Certificat d''arrêt de travail',
  'Certificat médical pour arrêt de travail',
  'Travail',
  'Je soussigné(e), Dr {{doctor.name}}, médecin, certifie avoir examiné ce jour {{patient.name}}, né(e) le {{patient.birthdate}}, employé(e) comme {{profession}}.\n\nDiagnostic : {{diagnosis}}\n\nJe prescris un arrêt de travail de {{duration}} jours à compter du {{startDate}}.\n\nReprise du travail prévue le {{endDate}}.\n\nExonération de ticket modérateur : {{exoneration}}\n\nCe certificat est établi en triple exemplaire pour l''assuré, la caisse et le médecin.\n\nFait à {{organisation.name}}, le {{date}}.\n\nSignature :\n\n___________________________\nDr {{doctor.name}}',
  '{
    "type": "object",
    "properties": {
      "profession": {
        "type": "string",
        "description": "Profession du patient"
      },
      "diagnosis": {
        "type": "string",
        "description": "Diagnostic"
      },
      "duration": {
        "type": "number",
        "description": "Durée en jours"
      },
      "startDate": {
        "type": "string",
        "format": "date",
        "default": "aujourd''hui"
      },
      "endDate": {
        "type": "string",
        "format": "date",
        "description": "Date de reprise"
      },
      "exoneration": {
        "type": "string",
        "enum": ["oui", "non"],
        "default": "non"
      },
      "date": {
        "type": "string",
        "format": "date",
        "default": "aujourd''hui"
      }
    },
    "required": ["profession", "diagnosis", "duration"]
  }',
  true,
  NOW(),
  NOW()
),

-- Certificat de non contre-indication au travail
(
  'CERT_APT_TRAVAIL',
  'Certificat de non contre-indication au travail',
  'Certificat attestant de l''aptitude au travail',
  'Travail',
  'Je soussigné(e), Dr {{doctor.name}}, médecin, certifie avoir examiné ce jour {{patient.name}}, né(e) le {{patient.birthdate}}.\n\nJe déclare que l''état de santé de ce/cette patient(e) ne présente pas de contre-indication à l''exercice de sa profession de {{profession}}.\n\nFait à {{organisation.name}}, le {{date}}.\n\nSignature :\n\n___________________________\nDr {{doctor.name}}',
  '{
    "type": "object",
    "properties": {
      "profession": {
        "type": "string",
        "description": "Profession du patient"
      },
      "date": {
        "type": "string",
        "format": "date",
        "default": "aujourd''hui"
      }
    },
    "required": ["profession"]
  }',
  true,
  NOW(),
  NOW()
),

-- Certificat médical scolaire
(
  'CERT_SCOLAIRE',
  'Certificat médical scolaire',
  'Certificat pour absence ou inaptitude scolaire',
  'Scolaire',
  'Je soussigné(e), Dr {{doctor.name}}, médecin, certifie avoir examiné ce jour {{patient.name}}, né(e) le {{patient.birthdate}}, élève à l''établissement {{school}}.\n\nMotif : {{reason}}\n\nPériode concernée : du {{startDate}} au {{endDate}}.\n\nInaptitude partielle ou totale : {{inaptitude}}\n\nObservations : {{observations}}\n\nFait à {{organisation.name}}, le {{date}}.\n\nSignature :\n\n___________________________\nDr {{doctor.name}}',
  '{
    "type": "object",
    "properties": {
      "school": {
        "type": "string",
        "description": "Établissement scolaire"
      },
      "reason": {
        "type": "string",
        "description": "Motif médical"
      },
      "startDate": {
        "type": "string",
        "format": "date",
        "default": "aujourd''hui"
      },
      "endDate": {
        "type": "string",
        "format": "date",
        "description": "Date de fin"
      },
      "inaptitude": {
        "type": "string",
        "enum": ["totale", "partielle", "EPS_seulement"],
        "default": "totale"
      },
      "observations": {
        "type": "string",
        "description": "Observations complémentaires",
        "default": ""
      },
      "date": {
        "type": "string",
        "format": "date",
        "default": "aujourd''hui"
      }
    },
    "required": ["school", "reason"]
  }',
  true,
  NOW(),
  NOW()
),

-- Certificat de maladie chronique
(
  'CERT_MALADIE_CHRONIQUE',
  'Certificat de maladie chronique',
  'Certificat pour maladie chronique ou ALD',
  'Chronique',
  'Je soussigné(e), Dr {{doctor.name}}, médecin, certifie avoir examiné ce jour {{patient.name}}, né(e) le {{patient.birthdate}}.\n\nDiagnostic : {{diagnosis}}\n\nCe patient est atteint d''une affection de longue durée (ALD) reconnue par la sécurité sociale : {{ald}}.\n\nTraitement en cours : {{treatment}}\n\nRecommandations : {{recommendations}}\n\nProchain rendez-vous : {{nextAppointment}}\n\nFait à {{organisation.name}}, le {{date}}.\n\nSignature :\n\n___________________________\nDr {{doctor.name}}',
  '{
    "type": "object",
    "properties": {
      "diagnosis": {
        "type": "string",
        "description": "Diagnostic médical"
      },
      "ald": {
        "type": "string",
        "enum": ["oui", "non", "en_cours"],
        "default": "non"
      },
      "treatment": {
        "type": "string",
        "description": "Traitement en cours"
      },
      "recommendations": {
        "type": "string",
        "description": "Recommandations médicales"
      },
      "nextAppointment": {
        "type": "string",
        "format": "date",
        "description": "Date du prochain rendez-vous"
      },
      "date": {
        "type": "string",
        "format": "date",
        "default": "aujourd''hui"
      }
    },
    "required": ["diagnosis"]
  }',
  true,
  NOW(),
  NOW()
),

-- Lettre d''orientation
(
  'LETTRE_ORIENTATION',
  'Lettre d''orientation',
  'Lettre pour orientation vers un confrère',
  'Correspondance',
  'À l''attention du Dr {{recipient.name}},\n\nSpécialité : {{recipient.specialty}}\n\nJe vous adresse ce jour {{patient.name}}, né(e) le {{patient.birthdate}}, pour {{reason}}.\n\nMotif de la consultation : {{consultationReason}}\n\nBilan déjà réalisé : {{testsDone}}\n\nHypothèse diagnostique : {{diagnosticHypothesis}}\n\nQuestions spécifiques : {{specificQuestions}}\n\nDans l''attente de votre retour, je vous prie d''agréer, Docteur, mes salutations distinguées.\n\nFait à {{organisation.name}}, le {{date}}.\n\nSignature :\n\n___________________________\nDr {{doctor.name}}',
  '{
    "type": "object",
    "properties": {
      "recipient": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Nom du médecin destinataire"
          },
          "specialty": {
            "type": "string",
            "description": "Spécialité du médecin"
          }
        },
        "required": ["name", "specialty"]
      },
      "reason": {
        "type": "string",
        "description": "Raison de l''orientation"
      },
      "consultationReason": {
        "type": "string",
        "description": "Motif détaillé"
      },
      "testsDone": {
        "type": "string",
        "description": "Examens déjà réalisés"
      },
      "diagnosticHypothesis": {
        "type": "string",
        "description": "Hypothèse diagnostique"
      },
      "specificQuestions": {
        "type": "string",
        "description": "Questions au confrère"
      },
      "date": {
        "type": "string",
        "format": "date",
        "default": "aujourd''hui"
      }
    },
    "required": ["recipient", "reason"]
  }',
  true,
  NOW(),
  NOW()
),

-- Certificat de décès
(
  'CERT_DECES',
  'Certificat de décès',
  'Certificat médical de constatation de décès',
  'Administratif',
  'Je soussigné(e), Dr {{doctor.name}}, médecin, certifie avoir constaté le décès de {{patient.name}}, né(e) le {{patient.birthdate}}.\n\nDate et heure du décès : {{deathDate}} à {{deathTime}}.\n\nLieu du décès : {{deathPlace}}.\n\nCause apparente du décès : {{apparentCause}}.\n\nCirconstances : {{circumstances}}.\n\nLe corps ne présente pas de signe suspect (ou précisez : {{suspiciousSigns}}).\n\nFait à {{organisation.name}}, le {{date}}.\n\nSignature et cachet :\n\n___________________________\nDr {{doctor.name}}',
  '{
    "type": "object",
    "properties": {
      "deathDate": {
        "type": "string",
        "format": "date",
        "description": "Date du décès"
      },
      "deathTime": {
        "type": "string",
        "description": "Heure du décès"
      },
      "deathPlace": {
        "type": "string",
        "description": "Lieu du décès"
      },
      "apparentCause": {
        "type": "string",
        "description": "Cause apparente"
      },
      "circumstances": {
        "type": "string",
        "description": "Circonstances"
      },
      "suspiciousSigns": {
        "type": "string",
        "description": "Signes suspects le cas échéant",
        "default": "aucun"
      },
      "date": {
        "type": "string",
        "format": "date",
        "default": "aujourd''hui"
      }
    },
    "required": ["deathDate", "deathTime", "deathPlace", "apparentCause"]
  }',
  true,
  NOW(),
  NOW()
),

-- Certificat de vaccination
(
  'CERT_VACCINATION',
  'Certificat de vaccination',
  'Certificat attestant de la réalisation d''une vaccination',
  'Vaccination',
  'Je soussigné(e), Dr {{doctor.name}}, médecin, certifie avoir vacciné ce jour {{patient.name}}, né(e) le {{patient.birthdate}}.\n\nVaccin administré : {{vaccineName}} (lot n°{{lotNumber}})\n\nDate d''administration : {{administrationDate}}\n\nDose : {{doseNumber}} (schéma vaccinal : {{schedule}})\n\nProchaine dose prévue le : {{nextDoseDate}}\n\nEffets indésirables constatés : {{sideEffects}}\n\nFait à {{organisation.name}}, le {{date}}.\n\nSignature :\n\n___________________________\nDr {{doctor.name}}',
  '{
    "type": "object",
    "properties": {
      "vaccineName": {
        "type": "string",
        "description": "Nom du vaccin"
      },
      "lotNumber": {
        "type": "string",
        "description": "Numéro de lot"
      },
      "administrationDate": {
        "type": "string",
        "format": "date",
        "default": "aujourd''hui"
      },
      "doseNumber": {
        "type": "string",
        "description": "Numéro de dose"
      },
      "schedule": {
        "type": "string",
        "description": "Schéma vaccinal"
      },
      "nextDoseDate": {
        "type": "string",
        "format": "date",
        "description": "Date de la prochaine dose"
      },
      "sideEffects": {
        "type": "string",
        "description": "Effets indésirables",
        "default": "aucun"
      },
      "date": {
        "type": "string",
        "format": "date",
        "default": "aujourd''hui"
      }
    },
    "required": ["vaccineName", "lotNumber", "doseNumber"]
  }',
  true,
  NOW(),
  NOW()
); 
