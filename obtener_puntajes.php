<?php
include 'database.php';

// Consulta SQL para obtener los 20 puntajes más altos
$sql = "SELECT name, score FROM tetris ORDER BY score DESC LIMIT 20";
$result = $conn->query($sql);

// Verifica si hay resultados
if ($result->num_rows > 0) {
    $puntajes = array();

    // Itera sobre los resultados y almacena los puntajes en un array
    while ($row = $result->fetch_assoc()) {
        $puntajes[] = array('name' => $row['name'], 'score' => $row['score']);
    }

    // Devuelve los puntajes como JSON
    echo json_encode($puntajes);
} else {
    echo "No se encontraron puntajes.";
}

$conn->close();
?>