<?php
session_start();

// --- CONFIGURATION DE TA BDD ---
$host = 'localhost';
$dbname = 'votre_nom_de_bdd'; // Remplace par le nom de ta base
$user = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion à la base de données : " . $e->getMessage());
}

// --- TRAITEMENT DU FORMULAIRE ---
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    if (!empty($email) && !empty($password)) {
        
        // On cherche l'utilisateur
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // Vérification du mot de passe
        if ($user && password_verify($password, $user['password'])) {
            
            // Création de la session
            $_SESSION['user_id'] = $user['id'];
            
            // REDIRECTION VERS NICE.HTML
            header("Location: nice.html");
            exit();
            
        } else {
            // Message d'erreur si ça échoue
            echo "<script>alert('Identifiants incorrects'); window.location.href='login.html';</script>";
        }
    } else {
        header("Location: login.html");
    }
}
?>