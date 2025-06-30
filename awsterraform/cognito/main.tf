resource "aws_cognito_user_pool" "this" {
  name = var.user_pool_name

  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
  }
  
  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}

resource "aws_cognito_user_pool_client" "this" {
  name         = var.client_name
  user_pool_id = aws_cognito_user_pool.this.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  generate_secret = false
  callback_urls   = var.callback_urls
  logout_urls     = var.logout_urls

  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = ["email", "openid", "profile"]
  supported_identity_providers = ["COGNITO"]
  allowed_oauth_flows_user_pool_client = true
}
