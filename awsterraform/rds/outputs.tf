output "db_instance_endpoint" {
  value = aws_db_instance.this.endpoint
}

output "db_security_group_id" {
  value = aws_security_group.this.id
}

output "db_endpoint" {
  value = aws_db_instance.this.address
}
