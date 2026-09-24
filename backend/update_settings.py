import re

with open("backend/settings.py", "r", encoding="utf-8") as f:
    content = f.read()

# Add dj_database_url
if "import dj_database_url" not in content:
    content = content.replace("import os", "import os\nimport dj_database_url")

# Update DATABASES
db_pattern = r"DATABASES = {\n    'default': {\n        'ENGINE': 'django\.db\.backends\.sqlite3',\n        'NAME': BASE_DIR / 'db\.sqlite3',\n    }\n}"
new_db = """DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# If DATABASE_URL is set in environment, use it instead (useful for Render PostgreSQL)
db_from_env = dj_database_url.config(conn_max_age=600)
if db_from_env:
    DATABASES['default'].update(db_from_env)"""

content = re.sub(db_pattern, new_db, content)

# Update MEDIA_ROOT
media_pattern = r"MEDIA_ROOT = BASE_DIR\.parent / 'frontend' / 'public' / 'media'"
new_media = "MEDIA_ROOT = BASE_DIR / 'media' # Local storage. For production, consider AWS S3."
content = re.sub(media_pattern, new_media, content)

with open("backend/settings.py", "w", encoding="utf-8") as f:
    f.write(content)

with open("requirements.txt", "a", encoding="utf-8") as f:
    f.write("\ndj-database-url==2.2.0\npsycopg2-binary==2.9.9\n")
