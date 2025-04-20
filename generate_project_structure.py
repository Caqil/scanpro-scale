import os

def create_directory_structure():
    # Define the project structure
    project_structure = {
        'scanpro-api': {
            'app': {
                'api': {
                    '__init__.py': '',
                    'convert.py': '',
                    'compress.py': '',
                    'merge.py': '',
                    'split.py': '',
                    'pdf': {
                        '__init__.py': '',
                        'info.py': '',
                        'process.py': '',
                        'repair.py': '',
                        'unlock.py': '',
                        'watermark.py': '',
                        'sign.py': '',
                        'rotate.py': '',
                        'protect.py': '',
                        'pagenumber.py': '',
                        'chat.py': ''
                    },
                    'keys': {
                        '__init__.py': '',
                        'routes.py': ''
                    }
                },
                'core': {
                    '__init__.py': '',
                    'config.py': '',
                    'security.py': '',
                    'middleware.py': ''
                },
                'services': {
                    '__init__.py': '',
                    'file_storage.py': '',
                    'pdf_service.py': '',
                    'extract_service.py': '',
                    'chat_service.py': '',
                    'cleanup_service.py': ''
                },
                'utils': {
                    '__init__.py': '',
                    'content_types.py': '',
                    'pdf_utils.py': '',
                    'sanitize.py': '',
                    'rate_limit.py': ''
                },
                'models': {
                    '__init__.py': '',
                    'schemas.py': ''
                },
                'db': {
                    '__init__.py': '',
                    'database.py': '',
                    'models.py': ''
                },
                '__init__.py': ''
            },
            'uploads': {},
            'public': {
                'conversions': {},
                'compressions': {},
                'merges': {},
                'splits': {},
                'watermarks': {},
                'rotations': {},
                'protected': {},
                'unlocked': {},
                'edited': {},
                'pagenumbers': {}
            },
            'temp': {},
            'chatsessions': {},
            'main.py': '',
            'requirements.txt': '',
            'README.md': ''
        }
    }

    def create_structure(base_path, structure):
        for name, content in structure.items():
            path = os.path.join(base_path, name)
            
            if isinstance(content, dict):
                # Create directory
                os.makedirs(path, exist_ok=True)
                # Recursively create subdirectory structure
                create_structure(path, content)
            else:
                # Create file
                with open(path, 'w') as f:
                    f.write(content)

    # Create the project structure
    create_structure('.', project_structure)
    print("Project structure created successfully!")

if __name__ == '__main__':
    create_directory_structure()