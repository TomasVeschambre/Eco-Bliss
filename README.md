<div align="center">

# OpenClassrooms - Eco-Bliss-Bath
</div>

<p align="center">
    <img src="https://img.shields.io/badge/MariaDB-v11.7.2-blue">
    <img src="https://img.shields.io/badge/Symfony-v6.2-blue">
    <img src="https://img.shields.io/badge/Angular-v13.3.0-blue">
    <img src="https://img.shields.io/badge/docker--build-passing-brightgreen">
  <br><br><br>
</p>

# Prérequis
Pour démarrer cet applicatif web vous devez avoir les outils suivants:
- Docker
- NodeJs

# Installation et démarrage
Clonez le projet pour le récupérer
``` 
git clone https://github.com/OpenClassrooms-Student-Center/Eco-Bliss-Bath-V2.git
cd Eco-Bliss-Bath-V2
```
Pour démarrer l'API avec ça base de données.
```
docker compose up -d
```
# Pour démarrer le frontend de l'applicatif
Rendez-vous dans le dossier frontend
```
cd ./frontend
```
Installez les dépendances du projet
```
npm i
ou
npm install (si vous préférez)
puis
npm start (pour demarrer le front)
```

## Résultats de tests
Les tests automatisés mis en place couvrent les principaux parcours de l'application Eco-Bliss Bath :
- tests smoke pour vérifier la présence des éléments essentiels de navigation et de la fiche produit ;
- tests fonctionnels pour valider l'affichage des produits, l'ajout au panier et la mise à jour du stock ;
- tests API pour contrôler les réponses des endpoints d'authentification, de produits, de panier et d'avis ;
- tests de sécurité pour vérifier que les entrées de type XSS sont bien neutralisées.

Les scénarios principaux attendus sont donc couverts par la suite de tests. En cas d'anomalie, le point de vigilance prioritaire concerne la cohérence du stock après des ajouts répétés au panier, afin de vérifier qu'aucune valeur négative ne peut apparaître.

### Si anomalie, rapport d'incident
Lors des vérifications, il faut indiquer précisément le comportement observé, le résultat attendu, les étapes pour reproduire le problème et, si possible, une capture d'écran ou une trace réseau/API pour documenter l'écart.

