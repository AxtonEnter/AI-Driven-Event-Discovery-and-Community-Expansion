import psycopg2
import boto3
import os

def lambda_handler(event, context):
    s3 = boto3.client('s3')
    bucket = os.environ['SCHEMA_BUCKET']
    key = os.environ['SCHEMA_KEY']
    
    rds_host = os.environ['RDS_HOST']
    db_name = os.environ['DB_NAME']
    username = os.environ['DB_USER']
    password = os.environ['DB_PASS']

    schema_file = '/tmp/schema.sql'
    s3.download_file(bucket, key, schema_file)

    conn = psycopg2.connect(
        host=rds_host,
        database=db_name,
        user=username,
        password=password
    )
    cur = conn.cursor()
    with open(schema_file, 'r') as f:
        cur.execute(f.read())
    conn.commit()
    cur.close()
    conn.close()

    return {"status": "Schema applied successfully"}