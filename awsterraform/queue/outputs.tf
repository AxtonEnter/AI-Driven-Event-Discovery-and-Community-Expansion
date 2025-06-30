output "model_scrape_sqs_queue_url" {
  description = "The URL of the created SQS queue"
  value       = aws_sqs_queue.event_page_queue.url
}

output "front_to_scrape_sqs_queue_url" {
  description = "The URL of the created SQS queue"
  value       = aws_sqs_queue.front_to_scrape_queue.url
}
