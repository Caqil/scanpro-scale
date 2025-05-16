import os
import uuid

def create_file(path, content=""):
    """Create a file with optional content and ensure directories exist."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

def create_project_structure():
    """Generate the project structure for megapdf-api."""
    base_dir = "megapdf-api"
    os.makedirs(base_dir, exist_ok=True)

    # cmd directory
    create_file(f"{base_dir}/cmd/server/main.go", "// Application entry point\n")

    # internal directory
    create_file(f"{base_dir}/internal/config/config.go", "// Configuration structure\n")
    create_file(f"{base_dir}/internal/config/loader.go", "// Config loading\n")

    # handlers directory
    create_file(f"{base_dir}/internal/handlers/setup.go", "// Setup all routes\n")
    handlers_auth = ["login.go", "register.go", "reset_password.go", "verify.go"]
    for file in handlers_auth:
        create_file(f"{base_dir}/internal/handlers/auth/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')} handlers\n")
    
    handlers_pdf = ["convert.go", "compress.go", "merge.go", "split.go", "watermark.go", 
                    "protect.go", "unlock.go", "rotate.go", "remove_pages.go", "sign.go", 
                    "pagenumber.go", "repair.go", "info.go"]
    for file in handlers_pdf:
        create_file(f"{base_dir}/internal/handlers/pdf/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')}\n")

    handlers_ocr = ["ocr.go", "extract.go"]
    for file in handlers_ocr:
        create_file(f"{base_dir}/internal/handlers/ocr/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')} processing\n")

    handlers_user = ["profile.go", "password.go", "balance.go", "deposit.go"]
    for file in handlers_user:
        create_file(f"{base_dir}/internal/handlers/user/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')}\n")

    handlers_keys = ["list.go", "create.go", "delete.go", "validate.go"]
    for file in handlers_keys:
        create_file(f"{base_dir}/internal/handlers/keys/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')} API key\n")

    handlers_admin = ["dashboard.go", "users.go", "transactions.go", "usage.go", "activity.go", "cleanup.go"]
    for file in handlers_admin:
        create_file(f"{base_dir}/internal/handlers/admin/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')}\n")

    handlers_utils = ["contact.go", "file.go", "webhooks.go"]
    for file in handlers_utils:
        create_file(f"{base_dir}/internal/handlers/utils/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')}\n")

    # middleware directory
    middleware_files = ["auth.go", "admin.go", "api_key.go", "logger.go", "error.go"]
    for file in middleware_files:
        create_file(f"{base_dir}/internal/middleware/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')} middleware\n")

    # models directory
    models_files = ["user.go", "api_key.go", "transaction.go", "usage_stats.go", "password_reset.go", "activity_log.go"]
    for file in models_files:
        create_file(f"{base_dir}/internal/models/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')} model\n")

    # repositories directory
    repo_files = ["database.go", "user_repository.go", "api_key_repository.go", 
                  "transaction_repository.go", "usage_stats_repository.go", "password_reset_repository.go"]
    for file in repo_files:
        create_file(f"{base_dir}/internal/repositories/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')}\n")

    # services directory
    services_auth = ["auth_service.go", "email_verification.go", "password_reset.go"]
    for file in services_auth:
        create_file(f"{base_dir}/internal/services/auth/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')}\n")

    services_pdf = ["convert_service.go", "compress_service.go", "merge_service.go", "split_service.go",
                    "watermark_service.go", "protect_service.go", "unlock_service.go", "rotate_service.go",
                    "remove_service.go", "sign_service.go", "repair_service.go", "util_service.go"]
    for file in services_pdf:
        create_file(f"{base_dir}/internal/services/pdf/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')}\n")

    services_ocr = ["ocr_service.go", "extract_service.go"]
    for file in services_ocr:
        create_file(f"{base_dir}/internal/services/ocr/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')}\n")

    create_file(f"{base_dir}/internal/services/user/user_service.go", "// User management\n")
    
    services_payment = ["billing_service.go", "usage_tracker.go", "paypal_service.go"]
    for file in services_payment:
        create_file(f"{base_dir}/internal/services/payment/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')}\n")

    create_file(f"{base_dir}/internal/services/api_key/api_key_service.go", "// API key management\n")

    # utils directory
    utils_files = ["security.go", "validator.go", "command.go", "email.go"]
    for file in utils_files:
        create_file(f"{base_dir}/internal/utils/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')} utilities\n")

    # pkg directory
    pkg_pdf = ["pdfcpu.go", "ghostscript.go", "pdf_lib.go", "common.go"]
    for file in pkg_pdf:
        create_file(f"{base_dir}/pkg/pdf/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')} wrapper\n")

    pkg_storage = ["storage.go", "local_storage.go", "s3_storage.go", "cleanup.go"]
    for file in pkg_storage:
        create_file(f"{base_dir}/pkg/storage/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')}\n")

    pkg_email = ["email.go", "smtp.go", "sendgrid.go", "templates.go"]
    for file in pkg_email:
        create_file(f"{base_dir}/pkg/email/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')}\n")

    pkg_token = ["token.go", "jwt.go", "validation.go"]
    for file in pkg_token:
        create_file(f"{base_dir}/pkg/token/{file}", f"// {file.replace('_', ' ').title().replace('.go', '')}\n")

    # api directory
    create_file(f"{base_dir}/api/swagger/swagger.json", "// OpenAPI specification\n")
    create_file(f"{base_dir}/api/swagger/swagger.yaml", "# YAML version\n")

    # web directory
    os.makedirs(f"{base_dir}/web/templates", exist_ok=True)
    os.makedirs(f"{base_dir}/web/static", exist_ok=True)

    # scripts directory
    scripts = ["setup.sh", "cleanup.sh", "install_dependencies.sh"]
    for file in scripts:
        create_file(f"{base_dir}/scripts/{file}", f"#!/bin/bash\n# {file.replace('_', ' ').title().replace('.sh', '')} script\n")
        os.chmod(f"{base_dir}/scripts/{file}", 0o755)

    # migrations directory
    create_file(f"{base_dir}/migrations/001_create_users_table.up.sql", "-- User table migration\n")
    create_file(f"{base_dir}/migrations/001_create_users_table.down.sql", "-- User table rollback\n")

    # configs directory
    create_file(f"{base_dir}/configs/config.yaml", "# Default configuration\n")
    create_file(f"{base_dir}/configs/config.development.yaml", "# Development config\n")

    # test directory
    os.makedirs(f"{base_dir}/test/integration", exist_ok=True)
    os.makedirs(f"{base_dir}/test/unit", exist_ok=True)

    # root files
    create_file(f"{base_dir}/.gitignore", "# Git ignore file\n")
    create_file(f"{base_dir}/go.mod", "// Go module file\n")
    create_file(f"{base_dir}/go.sum", "// Go sum file\n")
    create_file(f"{base_dir}/Dockerfile", "# Dockerfile\n")
    create_file(f"{base_dir}/README.md", "# Megapdf-API\n")

if __name__ == "__main__":
    create_project_structure()
    print("Project structure for megapdf-api created successfully.")