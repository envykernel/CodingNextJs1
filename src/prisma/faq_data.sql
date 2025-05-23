-- Clear existing FAQs
TRUNCATE TABLE "FAQ" CASCADE;

-- Insert FAQs about User Management
INSERT INTO "FAQ" (question, answer, category, "order", "isActive", created_at, updated_at) VALUES
-- Patient Management
('Comment accéder à la liste des patients ?', 
'Pour accéder à la liste des patients, cliquez sur "Patients" dans le menu de navigation principal. Vous verrez une liste complète de tous les patients de votre organisation. Vous pouvez utiliser la barre de recherche pour filtrer les patients par nom, numéro de téléphone ou email.',
'Gestion des Patients',
1,
true,
NOW(),
NOW()),

('Comment créer un nouveau patient ?',
'Pour créer un nouveau patient :\n1. Cliquez sur le bouton "Ajouter un patient" dans la liste des patients\n2. Remplissez le formulaire avec les informations requises (nom, date de naissance, genre)\n3. Ajoutez les informations de contact (téléphone, email, adresse)\n4. Renseignez les coordonnées d''urgence si nécessaire\n5. Cliquez sur "Enregistrer" pour créer le patient',
'Gestion des Patients',
2,
true,
NOW(),
NOW()),

('Comment modifier les informations d''un patient ?',
'Pour modifier les informations d''un patient :\n1. Accédez à la liste des patients\n2. Cliquez sur l''icône de modification (crayon) à côté du patient\n3. Modifiez les informations nécessaires dans le formulaire\n4. Cliquez sur "Enregistrer" pour valider les modifications\nNote : Certaines informations sensibles peuvent nécessiter des autorisations spéciales pour être modifiées.',
'Gestion des Patients',
3,
true,
NOW(),
NOW()),

-- User Roles and Permissions
('Quels sont les différents rôles utilisateurs disponibles ?',
'Le système propose les rôles suivants :\n- Administrateur : Accès complet à toutes les fonctionnalités\n- Médecin : Gestion des patients, prescriptions, examens cliniques\n- Infirmier(ère) : Suivi des patients, mesures vitales\n- Réceptionniste : Gestion des rendez-vous, accueil des patients\n- Comptable : Gestion des factures et paiements\n- Technicien de laboratoire : Gestion des analyses médicales\n- Pharmacien : Gestion des prescriptions et médicaments\n- Utilisateur : Accès limité aux fonctionnalités de base',
'Rôles et Permissions',
4,
true,
NOW(),
NOW()),

('Comment gérer les permissions des utilisateurs ?',
'La gestion des permissions est réservée aux administrateurs :\n1. Accédez à "Gestion des utilisateurs" dans le menu\n2. Sélectionnez l''utilisateur à modifier\n3. Choisissez le rôle approprié dans la liste déroulante\n4. Activez/désactivez les permissions spécifiques si nécessaire\n5. Enregistrez les modifications\nNote : Les modifications de rôle peuvent nécessiter une déconnexion/reconnexion pour prendre effet.',
'Rôles et Permissions',
5,
true,
NOW(),
NOW()),

-- Common Actions
('Comment rechercher un patient ?',
'Pour rechercher un patient, vous pouvez :\n1. Utiliser la barre de recherche en haut de la liste des patients\n2. Filtrer par :\n   - Nom du patient\n   - Numéro de téléphone\n   - Email\n   - Date de rendez-vous\n   - Médecin traitant\nLes résultats se mettent à jour en temps réel pendant la saisie.',
'Actions Courantes',
6,
true,
NOW(),
NOW()),

('Comment consulter l''historique médical d''un patient ?',
'Pour consulter l''historique médical :\n1. Accédez au profil du patient\n2. Cliquez sur l''onglet "Données médicales"\n3. Vous trouverez :\n   - Historique des consultations\n   - Prescriptions\n   - Résultats d''analyses\n   - Mesures vitales\n   - Notes médicales\nVous pouvez filtrer par date ou type d''information.',
'Actions Courantes',
7,
true,
NOW(),
NOW()),

-- Security and Access
('Comment sécuriser mon compte utilisateur ?',
'Pour sécuriser votre compte :\n1. Utilisez un mot de passe fort et unique\n2. Activez l''authentification à deux facteurs si disponible\n3. Déconnectez-vous après chaque session\n4. Ne partagez jamais vos identifiants\n5. Signalez immédiatement toute activité suspecte\n6. Mettez régulièrement à jour votre mot de passe',
'Sécurité et Accès',
8,
true,
NOW(),
NOW()),

('Que faire en cas d''oubli de mot de passe ?',
'En cas d''oubli de mot de passe :\n1. Cliquez sur "Mot de passe oublié" sur la page de connexion\n2. Entrez votre adresse email\n3. Suivez les instructions reçues par email\n4. Créez un nouveau mot de passe sécurisé\n5. Connectez-vous avec vos nouveaux identifiants\nNote : Le lien de réinitialisation est valable pendant 24 heures.',
'Sécurité et Accès',
9,
true,
NOW(),
NOW()),

-- Best Practices
('Quelles sont les bonnes pratiques pour la gestion des patients ?',
'Bonnes pratiques recommandées :\n1. Vérifiez toujours l''identité du patient\n2. Mettez à jour régulièrement les informations de contact\n3. Documentez toutes les interactions importantes\n4. Respectez la confidentialité des données\n5. Utilisez les templates prédéfinis pour la cohérence\n6. Effectuez des sauvegardes régulières des données\n7. Suivez les protocoles de votre organisation',
'Bonnes Pratiques',
10,
true,
NOW(),
NOW()),

('Comment gérer efficacement les rendez-vous ?',
'Pour une gestion efficace des rendez-vous :\n1. Vérifiez la disponibilité du médecin\n2. Prévoyez un temps suffisant selon le type de consultation\n3. Envoyez des rappels automatiques aux patients\n4. Gérez les annulations et reports\n5. Tenez compte des urgences\n6. Utilisez le système de file d''attente si nécessaire\n7. Documentez les motifs d''annulation',
'Bonnes Pratiques',
11,
true,
NOW(),
NOW()); 
