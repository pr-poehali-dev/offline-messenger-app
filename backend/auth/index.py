'''
Business: Авторизация пользователей, регистрация, обновление профиля
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: HTTP ответ с statusCode, headers, body
'''

import json
import os
from typing import Dict, Any, Optional
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'login':
                phone = body.get('phone')
                password = body.get('password')
                
                cur.execute(
                    "SELECT id, phone, name, bio, avatar, is_admin, is_blocked, is_profile_completed FROM users WHERE phone = %s AND password = %s",
                    (phone, password)
                )
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный логин или пароль'}),
                        'isBase64Encoded': False
                    }
                
                if user['is_blocked']:
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь заблокирован'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(user)),
                    'isBase64Encoded': False
                }
            
            elif action == 'register':
                phone = body.get('phone')
                password = body.get('password')
                
                cur.execute(
                    "INSERT INTO users (phone, password) VALUES (%s, %s) RETURNING id, phone, is_profile_completed",
                    (phone, password)
                )
                user = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(user)),
                    'isBase64Encoded': False
                }
            
            elif action == 'complete_profile':
                user_id = body.get('user_id')
                name = body.get('name')
                bio = body.get('bio', '')
                phone_contact = body.get('phone_contact')
                avatar = body.get('avatar', '')
                
                cur.execute(
                    "UPDATE users SET name = %s, bio = %s, avatar = %s, is_profile_completed = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING id, phone, name, bio, avatar, is_admin, is_profile_completed",
                    (name, bio, avatar, user_id)
                )
                user = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(user)),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            name = body.get('name')
            bio = body.get('bio')
            avatar = body.get('avatar')
            
            cur.execute(
                "UPDATE users SET name = %s, bio = %s, avatar = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING id, phone, name, bio, avatar, is_admin, is_profile_completed",
                (name, bio, avatar, user_id)
            )
            user = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(user)),
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
