<?php
include 'database.php';

// Recibe los datos del puntaje desde el cliente
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['playerName']) && isset($data['score'])) {
    $playerName = $data['playerName'];
    $score = $data['score'];

    // Inserta el puntaje en la base de datos
    $sql = "INSERT INTO tetris (name, score) VALUES ('$playerName', $score)";
    
    if ($conn->query($sql) === TRUE) {
        echo "Puntaje guardado correctamente";
    } else {
        echo "Error al guardar el puntaje: " . $conn->error;
    }
} else {
    echo "Datos de puntaje no recibidos correctamente";
}

$conn->close();
?>