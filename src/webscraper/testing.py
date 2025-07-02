
import psycopg2

DB_HOST = "test-database-jdb.c8v60oyuezl3.us-east-1.rds.amazonaws.com"
DB_NAME = "postgres"
DB_USER = "username123"
DB_PASSWORD = "password123"
DB_PORT = 5432 

conn = psycopg2.connect(
    host=DB_HOST,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    port=DB_PORT
)

cur = conn.cursor()
# cur.execute("SELECT * FROM url_hashes;")
cur.execute("DELETE FROM url_hashes;")
conn.commit()
# print(cur.fetchall())
