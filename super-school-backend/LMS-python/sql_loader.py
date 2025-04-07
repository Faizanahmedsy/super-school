import os
import django
import psycopg
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'LMS.settings')  # Replace 'your_project' with your Django project name
django.setup()

# Path to the SQL file
SQL_FILE_PATH = "nest_db_app/sql_migrations/set_default_values.sql"

def get_db_config():
    """Extract database configuration from Django settings."""
    db_settings = settings.DATABASES['default']
    return {
        'dbname': db_settings['NAME'],
        'user': db_settings['USER'],
        'password': db_settings['PASSWORD'],
        'host': db_settings['HOST'],
        'port': db_settings['PORT'] or 5432,  # Use default PostgreSQL port if not provided
    }

def run_sql_file(file_path, db_config):
    """Run SQL queries from a file."""
    try:
        # Connect to the database
        conn_str = f"dbname={db_config['dbname']} user={db_config['user']} password={db_config['password']} host={db_config['host']} port={db_config['port']}"
        with psycopg.connect(conn_str) as conn:
            with conn.cursor() as cursor:
                # Read the SQL file
                with open(file_path, 'r') as sql_file:
                    sql_queries = sql_file.read()

                # Execute each query
                for query in sql_queries.split(';'):
                    query = query.strip()
                    if query:
                        cursor.execute(query)
                        print(f"Executed: {query}")

                # Commit changes
                conn.commit()
                print("All queries executed successfully!")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    db_config = get_db_config()
    run_sql_file(SQL_FILE_PATH, db_config)
