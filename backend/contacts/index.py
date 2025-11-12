'''
Business: Управление контактами пользователя (добавление, получение списка)
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: HTTP ответ со списком контактов или результатом добавления
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('user_id')
            
            cur.execute(
                """
                SELECT u.id, u.phone, u.name, u.bio, u.avatar,
                       (SELECT content FROM messages 
                        WHERE (sender_id = u.id AND receiver_id = %s) 
                           OR (sender_id = %s AND receiver_id = u.id)
                        ORDER BY created_at DESC LIMIT 1) as last_message,
                       (SELECT created_at FROM messages 
                        WHERE (sender_id = u.id AND receiver_id = %s) 
                           OR (sender_id = %s AND receiver_id = u.id)
                        ORDER BY created_at DESC LIMIT 1) as last_message_time
                FROM contacts c
                JOIN users u ON c.contact_id = u.id
                WHERE c.user_id = %s
                ORDER BY last_message_time DESC NULLS LAST
                """,
                (user_id, user_id, user_id, user_id, user_id)
            )
            contacts = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(c) for c in contacts], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            contact_id = body.get('contact_id')
            
            cur.execute(
                "INSERT INTO contacts (user_id, contact_id) VALUES (%s, %s) ON CONFLICT DO NOTHING RETURNING id",
                (user_id, contact_id)
            )
            contact = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
