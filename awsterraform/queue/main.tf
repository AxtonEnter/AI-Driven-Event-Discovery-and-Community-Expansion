provider "aws" {
  region = "us-east-1"  
}

resource "aws_sqs_queue" "event_page_queue" {
  name                      = "page-data"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 20
}

resource "aws_sqs_queue" "front_to_scrape_queue" {
  name                      = "scrape-request"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 20
}
