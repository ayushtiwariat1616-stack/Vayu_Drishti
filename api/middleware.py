from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from channels.middleware import BaseMiddleware

@database_sync_to_async
def get_user(token_key):
    try:
        # Check if the token exists and return the user
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Extract the query string from the WebSocket connection
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token')

        # If a token was sent, authenticate the user
        if token:
            scope['user'] = await get_user(token[0])
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)