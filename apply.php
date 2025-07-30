<?php
// Set the receiver email
$to = "youremail@example.com";

// Collect form data
$name     = $_POST['name'];
$email    = $_POST['email'];
$phone    = $_POST['phone'];
$position = $_POST['position'];
$message  = $_POST['message'];

// File upload handling
$resumeFile = $_FILES['resume'];
$uploadDir = 'uploads/';
$uploadFile = $uploadDir . basename($resumeFile['name']);

// Ensure upload directory exists
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (move_uploaded_file($resumeFile['tmp_name'], $uploadFile)) {
    $resumePath = $uploadFile;
} else {
    echo "Failed to upload resume.";
    exit;
}

// Email content
$subject = "New Job Application: $position";
$body = "Name: $name\nEmail: $email\nPhone: $phone\nPosition: $position\n\nCover Letter:\n$message";

// Email headers
$headers = "From: $email";

// Send email
$mailSent = mail($to, $subject, $body, $headers);

if ($mailSent) {
    echo "Application submitted successfully!";
} else {
    echo "Failed to send application. Please try again.";
}
?>
