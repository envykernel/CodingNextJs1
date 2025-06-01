-- Suppression des données existantes pour éviter les doublons
TRUNCATE TABLE "Notification" CASCADE;

-- Notifications globales (pour toutes les organisations)
INSERT INTO "Notification" (title, message, type, priority, "isGlobal", "organisationId", created_at, updated_at)
VALUES 
    ('Mise à jour système', 'Une nouvelle version de l''application est disponible. Veuillez mettre à jour.', 'system', 'medium', true, NULL, now(), now()),
    ('Maintenance prévue', 'Une maintenance est prévue ce weekend. Le système sera indisponible de 2h à 4h.', 'system', 'high', true, NULL, now(), now()),
    ('Nouvelle fonctionnalité', 'La gestion des prescriptions électroniques est maintenant disponible!', 'system', 'low', true, NULL, now(), now());

-- Notifications spécifiques à l'organisation 1
INSERT INTO "Notification" (title, message, type, priority, "isGlobal", "organisationId", created_at, updated_at)
VALUES 
    ('Réunion mensuelle', 'La réunion du personnel est prévue demain à 10h dans la salle de conférence.', 'system', 'medium', false, 1, now(), now()),
    ('Inventaire terminé', 'L''inventaire du stock a été complété avec succès.', 'system', 'low', false, 1, now(), now()),
    ('Paiement en retard', 'Attention! Un paiement de fournisseur est en retard. Veuillez régulariser.', 'payment', 'high', false, 1, now(), now());

-- Notifications pour l'utilisateur 1
WITH user1_notifs AS (
    INSERT INTO "Notification" (title, message, type, priority, "isGlobal", "organisationId", created_at, updated_at)
    VALUES 
        ('Rendez-vous annulé', 'Le patient Dupont a annulé son rendez-vous de demain.', 'appointment', 'medium', false, 1, now(), now()),
        ('Message du Dr. Martin', 'Vous avez reçu un message concernant le patient XYZ.', 'system', 'high', false, 1, now(), now())
    RETURNING id
)
INSERT INTO "NotificationRead" ("notificationId", "userId")
SELECT id, 1 FROM user1_notifs;

-- Notifications pour l'utilisateur 2
WITH user2_notifs AS (
    INSERT INTO "Notification" (title, message, type, priority, "isGlobal", "organisationId", created_at, updated_at)
    VALUES 
        ('Formation disponible', 'Une nouvelle formation sur les bonnes pratiques est disponible.', 'system', 'low', false, 1, now(), now()),
        ('Rappel: Congés', 'N''oubliez pas de soumettre vos demandes de congés pour le trimestre prochain.', 'system', 'medium', false, 1, now(), now())
    RETURNING id
)
INSERT INTO "NotificationRead" ("notificationId", "userId")
SELECT id, 2 FROM user2_notifs;

-- Notification mixte pour les utilisateurs 1 et 2
WITH mixed_notif AS (
    INSERT INTO "Notification" (title, message, type, priority, "isGlobal", "organisationId", created_at, updated_at)
    VALUES 
        ('Changement d''horaire', 'Les heures d''ouverture du cabinet seront modifiées à partir de lundi.', 'system', 'medium', false, 1, now(), now())
    RETURNING id
)
INSERT INTO "NotificationRead" ("notificationId", "userId")
SELECT id, 1 FROM mixed_notif
UNION ALL
SELECT id, 2 FROM mixed_notif; 
