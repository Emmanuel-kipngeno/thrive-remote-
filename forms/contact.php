<?php
$receiving_email_address = 'admin@thrive-remote.com';

// Check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  
  $name = strip_tags(trim($_POST["name"]));
  $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
  $subject = strip_tags(trim($_POST["subject"]));
  $message = trim($_POST["message"]);

  // Validate fields
  if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($message)) {
    http_response_code(400);
    echo "Please complete the form and provide a valid email.";
    exit;
  }

  // Email content
  $email_content = "Name: $name\n";
  $email_content .= "Email: $email\n";
  $email_content .= "Subject: $subject\n\n";
  $email_content .= "Message:\n$message\n";

  // Email headers
  $email_headers = "From: $name <$email>";

  // Send the email
  if (mail($receiving_email_address, $subject, $email_content, $email_headers)) {
    http_response_code(200);
    echo "Thank you! Your message has been sent.";
  } else {
    http_response_code(500);
    echo "Oops! Something went wrong and we couldn’t send your message.";
  }

} else {
  // Not a POST request
  http_response_code(405);
  echo "Method Not Allowed";
}
?>
