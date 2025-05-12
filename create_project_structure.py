import os

def create_directory_structure():
    # Base directory
    base_dir = "pdf-api"
    os.makedirs(base_dir, exist_ok=True)

    # cmd directory
    os.makedirs(os.path.join(base_dir, "cmd/api"), exist_ok=True)
    create_empty_file(os.path.join(base_dir, "cmd/api/main.go"))

    # internal directory
    internal_dirs = [
        "api/pdf",
        "config",
        "middleware",
        "models",
        "service"
    ]
    
    for dir_path in internal_dirs:
        os.makedirs(os.path.join(base_dir, "internal", dir_path), exist_ok=True)

    # api files
    api_files = [
        "file.go",
        "ocr.go",
        "pdf/annotate.go",
        "pdf/chat.go",
        "pdf/compress.go",
        "pdf/convert.go",
        "pdf/edit.go",
        "pdf/extract.go",
        "pdf/info.go",
        "pdf/merge.go",
        "pdf/organize.go",
        "pdf/pagenumber.go",
        "pdf/process.go",
        "pdf/protect.go",
        "pdf/redact.go",
        "pdf/remove.go",
        "pdf/repair.go",
        "pdf/rotate.go",
        "pdf/save.go",
        "pdf/sign.go",
        "pdf/split.go",
        "pdf/unlock.go",
        "pdf/watermark.go"
    ]
    
    for file_path in api_files:
        create_empty_file(os.path.join(base_dir, "internal/api", file_path))

    # other internal files
    create_empty_file(os.path.join(base_dir, "internal/config/config.go"))
    
    middleware_files = ["apikey.go", "logger.go", "ratelimit.go"]
    for file_path in middleware_files:
        create_empty_file(os.path.join(base_dir, "internal/middleware", file_path))
    
    create_empty_file(os.path.join(base_dir, "internal/models/response.go"))
    
    service_files = ["file.go", "ocr.go", "pdf.go"]
    for file_path in service_files:
        create_empty_file(os.path.join(base_dir, "internal/service", file_path))

    # pkg directory
    os.makedirs(os.path.join(base_dir, "pkg/pdfutil"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "pkg/fileutil"), exist_ok=True)
    
    create_empty_file(os.path.join(base_dir, "pkg/pdfutil/pdfutil.go"))
    create_empty_file(os.path.join(base_dir, "pkg/fileutil/fileutil.go"))

    # root files
    root_files = [
        ".dockerignore",
        ".gitignore",
        "Dockerfile",
        "go.mod",
        "go.sum",
        "README.md"
    ]
    
    for file_path in root_files:
        create_empty_file(os.path.join(base_dir, file_path))

def create_empty_file(file_path):
    """Creates an empty file with the specified path if it doesn't exist."""
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            pass

if __name__ == "__main__":
    create_directory_structure()
    print("Project structure created successfully!")